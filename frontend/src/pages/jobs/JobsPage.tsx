
import { useJobs } from "../../context/JobContext";
import {
    Settings,
    RefreshCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./Jobs.module.css";
import shared from "../../styles/shared.module.css";
import { JobCard } from "../../components/JobCard";
export type { Job } from "../../components/JobCard";

export function JobsPage() {
    const { jobs, toggleJobStatus, restartJob } = useJobs();
    const navigate = useNavigate();

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

                    <div className={shared.pageHeaderActions} style={{ display: "flex", alignItems: "center" }}>
                        <button
                            onClick={() => navigate("/jobs/concurrency")}
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
                            job={job as any}
                            onToggle={() => toggleJobStatus(job.id)}
                            onRestart={() => restartJob(job.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
