import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import styles from "../pages/jobs/Jobs.module.css";
import { Button } from "./ui/Button";
import { Card, CardHeader, CardBody } from "./ui/Card";
import { JobStats } from "./ui/JobStats";
import { ProgressBar } from "./ui/ProgressBar";

export interface Job {
    id: string;
    title: string;
    description: string;
    status: "running" | "paused" | "completed";
    progress?: number;
    icon: React.ElementType;
    total: number;
    completed: number;
    failed: number;
    errors: number;
    concurrency?: number;
}

interface JobCardProps {
    job: Job;
    onOpen?: () => void;
    onToggle?: () => void;
    onRestart?: () => void;
    showActions?: boolean;
    children?: React.ReactNode;
    className?: string; // Optional string
}

export function JobCard({
    job,
    onToggle,
    onRestart,
    showActions = true,
    children,
    className
}: JobCardProps) {
    const progress = job.total > 0 && job.completed !== undefined ? (job.completed / job.total) * 100 : 0;
    const Icon = job.icon;

    return (
        <Card className={className || ""}>
            <CardHeader>
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
                        <div className={styles.jobTitle} style={{ cursor: "default", textDecoration: "none" }}>
                            {children ? children : job.title}
                        </div>
                        {!children && (
                            <p className={styles.jobDescription}>
                                {job.description}
                            </p>
                        )}
                    </div>
                </div>

                {showActions && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {job.status !== "completed" ? (
                            onToggle && (
                                <Button
                                    onClick={onToggle}
                                    title={job.status === "running" ? "Pause" : "Resume"}
                                    style={{ padding: 6, color: "var(--text-secondary)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                    {job.status === "running" ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                                </Button>
                            )
                        ) : (
                            onRestart && (
                                <Button
                                    onClick={onRestart}
                                    title="Restart"
                                    style={{ padding: 6, color: "var(--text-secondary)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                >
                                    <RotateCcw size={18} />
                                </Button>
                            )
                        )}
                    </div>
                )}
            </CardHeader>

            <CardBody>
                <div className={styles.progressContainer}>
                    <ProgressBar progress={progress} status={job.status} showPercentage={false} />
                </div>

                {/* Footer: Stats left, Progress right */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                    <JobStats total={job.total} completed={job.completed} failed={job.failed} />
                    <span className={styles.progressText}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </CardBody>
        </Card>
    );
}
