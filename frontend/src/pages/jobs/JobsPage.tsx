// src/components/JobsPage.tsx
import type React from "react";
import {
    Play,
    Pause,
    Loader2,
    RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "../../context/JobContext";

export interface Job {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    total: number;
    completed: number;
    failed: number;
    errors: number;
    status: "running" | "paused" | "completed";
}


export function JobsPage() {
    const { jobs, toggleJobStatus, restartJob } = useJobs();
    const navigate = useNavigate();

    return (
        <div style={{ padding: "40px 24px", height: "100%", overflowY: "auto", backgroundColor: "var(--bg-primary)", scrollbarWidth: "none" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
                <header>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>Background Jobs</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Monitor and manage indexing and processing tasks.</p>
                </header>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "24px",
                    alignItems: "start"
                }}>
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

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1.4s linear infinite; }

        @keyframes progressShimmer {
          0% { transform: translateX(-70%); }
          100% { transform: translateX(170%); }
        }
        .progress-shimmer {
          position: absolute;
          top: 0; bottom: 0;
          width: 45%;
          opacity: 0.35;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent);
          animation: progressShimmer 1.15s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
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

    return (
        <div
            style={{
                backgroundColor: "var(--bg-surface)",
                borderRadius: "16px",
                padding: "22px 24px",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                            {/* Title is now a link-like button */}
                            <button
                                type="button"
                                onClick={onOpen}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    padding: 0,
                                    margin: 0,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    color: "var(--text-primary)",
                                    fontSize: "15px",
                                    fontWeight: 600,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                                title="View details"
                            >
                                {job.title}
                            </button>

                            {job.status === "running" ? (
                                <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent-primary)" }} />
                            ) : null}
                        </div>

                        <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "6px 0 0 0", lineHeight: "1.35" }}>
                            {job.description}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {job.status !== "completed" && (
                        <button
                            onClick={onToggle}
                            title={job.status === "running" ? "Pause" : "Resume"}
                            style={{
                                background: "transparent",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "var(--text-secondary)",
                                transition: "all 0.2s",
                                outline: "none",
                            }}
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
                            style={{
                                background: "transparent",
                                border: "none",
                                borderRadius: "8px",
                                padding: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "var(--accent-primary)",
                                transition: "all 0.2s",
                                outline: "none",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                            <RotateCcw size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: "8px", backgroundColor: "var(--bg-secondary)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                    <div
                        style={{
                            width: `${progress}%`,
                            height: "100%",
                            backgroundColor: job.status === "completed" ? "var(--status-success)" : "var(--accent-primary)",
                            borderRadius: "4px",
                            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    />
                    {job.status === "running" && progress > 0 && progress < 100 ? <div className="progress-shimmer" /> : null}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <StatItem label="Total" value={job.total} color="var(--text-muted)" />
                        <StatItem label="Done" value={job.completed} color="var(--status-success)" />
                        <StatItem label="Failed" value={job.failed} color="var(--status-error)" />
                        <StatItem label="Errors" value={job.errors} color="var(--status-warning)" />
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 500, marginLeft: 12 }}>
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
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {label}: <span style={{ fontWeight: 500 }}>{value}</span>
            </span>
        </div>
    );
}
