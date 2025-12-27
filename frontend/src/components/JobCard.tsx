import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import jobStyles from "../pages/jobs/Jobs.module.css";
import localStyles from "./JobCard.module.css";
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
                <div className={localStyles.headerInner}>
                    <div className={localStyles.iconContainer}>
                        <Icon size={24} />
                    </div>

                    <div className={localStyles.contentContainer}>
                        <div className={`${jobStyles.jobTitle} ${localStyles.clickableTitle}`}>
                            {children ? children : job.title}
                        </div>
                        {!children && (
                            <p className={jobStyles.jobDescription}>
                                {job.description}
                            </p>
                        )}
                    </div>
                </div>

                {showActions && (
                    <div className={localStyles.actionsContainer}>
                        {job.status !== "completed" ? (
                            onToggle && (
                                <Button
                                    onClick={onToggle}
                                    title={job.status === "running" ? "Pause" : "Resume"}
                                    className={localStyles.actionButton}
                                >
                                    {job.status === "running" ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                                </Button>
                            )
                        ) : (
                            onRestart && (
                                <Button
                                    onClick={onRestart}
                                    title="Restart"
                                    className={localStyles.actionButton}
                                >
                                    <RotateCcw size={18} />
                                </Button>
                            )
                        )}
                    </div>
                )}
            </CardHeader>

            <CardBody>
                <div className={jobStyles.progressContainer}>
                    <ProgressBar progress={progress} status={job.status} showPercentage={false} />
                </div>

                {/* Footer: Stats left, Progress right */}
                <div className={localStyles.footer}>
                    <JobStats total={job.total} completed={job.completed} failed={job.failed} />
                    <span className={jobStyles.progressText}>
                        {Math.round(progress)}%
                    </span>
                </div>
            </CardBody>
        </Card>
    );
}
