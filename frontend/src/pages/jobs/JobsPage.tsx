import { useEffect, useState, useCallback } from "react";
import {
    Activity,
    Settings,
    RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Jobs.module.css";
import shared from "../../styles/shared.module.css";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button"; // Assuming Button exists based on usage
import { useSocket } from "../../hooks/useSocket";
import { Job, JOB_ICONS } from "./jobsIcons";
import { JobCard } from "../../components/JobCard";
import { api, BASE_URL } from "../../api/client";

export function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [restartJobId, setRestartJobId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();

    const fetchJobs = useCallback(async () => {
        try {
            // Get Config first
            const configData = await api.get<any>('/jobs/config');

            // Get Live Status
            const statusData = await api.get<any>('/jobs');

            // Merge
            // statusData is array of { id, counts, isPaused }
            // configData is object { [id]: { title, description } }

            const merged = Object.keys(configData).map(key => {
                const conf = configData[key];
                const stats = statusData.find((s: any) => s.id === key) || { counts: {}, isPaused: false };

                const active = stats.counts.active || 0;
                const completed = stats.counts.completed || 0;
                const failed = stats.counts.failed || 0;
                const total = active + completed + failed + (stats.counts.delayed || 0) + (stats.counts.waiting || 0) + (stats.counts.paused || 0);

                let status: Job['status'] = 'pending';
                if (stats.isPaused) status = 'paused';
                else if (active > 0) status = 'running';
                else if (total > 0 && total === completed) status = 'completed';
                else if (failed > 0) status = 'failed';

                return {
                    id: key,
                    title: conf.title,
                    description: conf.description,
                    status,
                    icon: JOB_ICONS[key] || Activity,
                    total,
                    completed,
                    failed,
                    errors: failed,
                };
            });

            setJobs(merged);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    }, []);

    useEffect(() => {
        fetchJobs();

        if (socket) {
            socket.on('jobs-updated', () => {
                fetchJobs(); // Simple strategy: re-fetch all on any update
            });
        }

        return () => {
            if (socket) {
                socket.off('jobs-updated');
            }
        };
    }, [fetchJobs, socket]);

    const handlePause = async (id: string) => {
        await api.post(`/jobs/${id}/pause`, {});
    };

    const handleResume = async (id: string) => {
        await api.post(`/jobs/${id}/resume`, {});
    };

    const handleRestartClick = (id: string) => {
        setRestartJobId(id);
    };

    const confirmRestart = async () => {
        if (restartJobId) {
            await api.post(`/jobs/${restartJobId}/restart`, {});
            setRestartJobId(null);
        }
    };

    const openBullBoard = () => {
        window.open(`${BASE_URL.replace('/api', '')}/jobs/queues`, '_blank');
    };

    return (
        <div className={shared.pageContainer}>
            <div className={shared.pageCentered}>
                <header className={shared.pageHeader}>
                    <div className={shared.pageHeaderContent}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    backgroundColor: "var(--bg-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--accent-primary)",
                                    flexShrink: 0,
                                }}
                            >
                                <RefreshCcw size={24} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h1 className={shared.pageTitle} style={{ margin: 0 }}>
                                        Jobs
                                    </h1>
                                    {isConnected ? (
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#10B981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            height: '24px'
                                        }}>
                                            <span style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                backgroundColor: 'currentColor',
                                                boxShadow: '0 0 8px currentColor'
                                            }} />
                                            Live
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>● Connecting...</span>
                                    )}
                                </div>
                                <p className={shared.pageSubtitle} style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                                    Monitor progress of all running background tasks
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={shared.pageHeaderActions} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Button
                            onClick={openBullBoard}
                            title="Open Bull Board"
                            className={shared.headerButton}
                            style={{
                                backgroundColor: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border-color)",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: 500
                            }}
                        >
                            <Activity size={16} style={{ marginRight: 8 }} />
                            Bull Board
                        </Button>
                        <button
                            onClick={() => navigate("/settings/jobs")}
                            title="Concurrency Settings"
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                padding: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                <div className={styles.jobsGrid}>
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            showActions={true}
                            onToggle={() => job.status === 'paused' ? handleResume(job.id) : handlePause(job.id)}
                            onRestart={() => handleRestartClick(job.id)}
                        />
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!restartJobId}
                onClose={() => setRestartJobId(null)}
                onConfirm={confirmRestart}
                title="Restart Job?"
                type="danger"
                confirmLabel="Restart"
            >
                <p>
                    Are you sure you want to restart the <strong>{restartJobId}</strong> job?
                </p>
                <br />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                    This will purge the current queue (clearing active, completed, and failed jobs) and re-queue all items from the beginning.
                </p>
            </Modal>
        </div>
    );
}
