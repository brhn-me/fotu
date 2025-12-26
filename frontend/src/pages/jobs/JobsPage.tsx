import type React from "react";
import { useJobs } from "../../context/JobContext";
import {
    Play,
    Pause,
    RotateCcw,
    Settings,
    Loader2,
    Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Jobs.module.css";
import shared from "../../styles/shared.module.css";

export interface Job {
    id: string;
    title: string;
    description: string;
    status: "running" | "paused" | "completed";
    progress: number;
    icon: React.ElementType;
    total: number;
    completed: number;
    failed: number;
    errors: number;
    concurrency?: number; // Added concurrency
}

export function JobsPage() {
    const { jobs, toggleJobStatus, restartJob } = useJobs();
    const navigate = useNavigate();

    return (
        <div className={shared.pageContainer}>
            <div className={shared.pageCentered}>
                <header className={shared.pageHeader}>
                    <div className={shared.pageHeaderContent}>
                        <h1 className={shared.pageTitle}>Jobs</h1>
                        <p className={shared.pageSubtitle}>Monitor and manage indexing and processing tasks.</p>
                    </div>

                    <div className={shared.pageHeaderActions}>
                        <button
                            onClick={() => navigate("/jobs/concurrency")}
                            className={shared.btn}
                            style={{
                                backgroundColor: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-secondary)",
                                height: "fit-content"
                            }}
                        >
                            <Settings size={16} />
                            Concurrency
                        </button>
                    </div>
                </header>

                <div className={styles.jobsGrid}>
                    {jobs.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onOpen={() => navigate(`/jobs/${job.id}`)}
                            onToggle={() => toggleJobStatus(job.id)}
                            onRestart={() => restartJob(job.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function JobCard({
    job,
    onOpen,
    onToggle,
    onRestart,
}: {
    job: Job;
    onOpen: () => void;
    onToggle: () => void;
    onRestart: () => void;
}) {
    const progress = job.total > 0 ? (job.completed / job.total) * 100 : 0;
    const Icon = job.icon;
    const concurrency = job.concurrency || 2; // Default mock concurrency

    return (
        <div className={shared.card}>
            {/* Header */}
            <div className={shared.cardHeader}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
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
                        <Icon size={24} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                                type="button"
                                onClick={onOpen}
                                className={styles.jobTitle}
                                title="View details"
                            >
                                {job.title}
                            </button>

                            {job.status === "running" ? (
                                <Loader2 size={14} className={shared.animateSpin} style={{ color: "var(--accent-primary)" }} />
                            ) : null}
                        </div>

                        <p className={styles.jobDescription}>
                            {job.description}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {job.status !== "completed" && (
                        <button
                            onClick={onToggle}
                            title={job.status === "running" ? "Pause" : "Resume"}
                            className={shared.btn}
                            style={{ padding: 6, color: "var(--text-secondary)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            {job.status === "running" ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                        </button>
                    )}

                    {job.status === "completed" && (
                        <button
                            onClick={onRestart}
                            title="Restart"
                            className={shared.btn}
                            style={{ padding: 6, color: "var(--accent-primary)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            <RotateCcw size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className={shared.cardBody}>
                <div className={styles.progressContainer}>
                    <div className={styles.progressBarTrack}>
                        <div
                            className={styles.progressBarFill}
                            style={{
                                width: `${progress}%`,
                                backgroundColor: job.status === "completed" ? "var(--status-success)" : "var(--accent-primary)",
                            }}
                        />
                        {job.status === "running" && progress > 0 && progress < 100 ? (
                            <div className={styles.progressShimmer} />
                        ) : null}
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <StatItem label="TOTAL" value={job.total} color="var(--text-muted)" />
                        <StatItem label="DONE" value={job.completed} color="var(--status-success)" />
                        <StatItem label="FAIL" value={job.failed} color="var(--status-error)" />
                    </div>
                    {/* Concurrency Indicator */}
                    <div title="Concurrency workers" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", padding: "2px 6px", borderRadius: 4 }}>
                        <Cpu size={12} />
                        <span style={{ fontWeight: 600 }}>{concurrency}x</span>
                    </div>
                    <span className={styles.progressText}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: color, opacity: 0.7 }} />
            <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: 0.5 }}>
                {label} <span style={{ color: "var(--text-primary)" }}>{value}</span>
            </span>
        </div>
    );
}
