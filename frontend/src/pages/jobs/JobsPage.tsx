import { useEffect, useState } from "react";
import {
    Activity,
    Settings,
    RefreshCcw,
    Database,
    Image,
    Film,
    FileImage,
    LayoutGrid,
    Search,
    Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Jobs.module.css";
import shared from "../../styles/shared.module.css";
import { JobCard, Job } from "../../components/JobCard";
import { Button } from "../../components/ui/Button";

// Map job IDs to icons
const JOB_ICONS: Record<string, any> = {
    scan: Database,
    hash: Zap,
    thumbs: Image,
    metadata: Search,
    preview: FileImage,
    raw: Film,
    encoding: Film,
    conversion: Activity,
    organize: LayoutGrid
};

export function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/jobs');
                const data = await res.json();

                const mappedJobs: Job[] = data.map((q: any) => {
                    const total = (q.counts.active || 0) + (q.counts.completed || 0) + (q.counts.failed || 0) + (q.counts.delayed || 0) + (q.counts.waiting || 0);
                    const completed = q.counts.completed || 0;
                    const failed = q.counts.failed || 0;
                    const active = q.counts.active || 0;

                    let status: Job['status'] = 'pending';
                    if (q.isPaused) status = 'paused';
                    else if (active > 0) status = 'running';
                    else if (total > 0 && total === completed) status = 'completed';
                    else if (failed > 0) status = 'failed';

                    return {
                        id: q.id,
                        title: q.title,
                        description: q.description,
                        status,
                        icon: JOB_ICONS[q.id] || Activity,
                        total,
                        completed,
                        failed,
                        errors: failed,
                        concurrency: 0
                    };
                });

                setJobs(mappedJobs);
            } catch (err) {
                console.error("Failed to poll jobs:", err);
            }
        };

        fetchJobs();
        const interval = setInterval(fetchJobs, 2000);
        return () => clearInterval(interval);
    }, []);

    const openBullBoard = () => {
        window.open('http://localhost:3000/jobs/queues', '_blank');
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
                                <h1 className={shared.pageTitle} style={{ margin: 0 }}>
                                    Jobs
                                </h1>
                                <p className={shared.pageSubtitle} style={{ margin: "4px 0 0 0", color: "var(--text-muted)" }}>
                                    Monitor and manage indexing and processing tasks.
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
                            showActions={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
