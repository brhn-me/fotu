import type React from "react";
import { useMemo, useState } from "react";
import {
    ClipboardList,
    AlertTriangle,
    XCircle,
    Cpu,
    CheckCircle2,
    Play,
    Loader2,
    TerminalSquare,
    Square,
    ChevronRight,
    RotateCcw,
} from "lucide-react";
import { Virtuoso, TableVirtuoso } from "react-virtuoso";
import { useJobs } from "../../context/JobContext";
import { useParams, Link } from "react-router-dom";
import styles from "./Jobs.module.css";
import shared from "../../styles/shared.module.css";

type TabKey = "queue" | "processing" | "done" | "failed" | "errors" | "logs";

type LogLevel = "info" | "warn" | "error";
type JobLog = { id: string; ts: string; level: LogLevel; message: string };

type JobItem = {
    id: string;
    label: string;
    ref?: string;
    updatedAt: string;
};

// ... utility functions
function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function makeItems(prefix: string, count: number): JobItem[] {
    const items: JobItem[] = [];
    const base = Date.now();
    for (let i = 0; i < count; i++) {
        const t = new Date(base - i * 45_000).toISOString();
        items.push({
            id: `${prefix}-${i + 1}`,
            label: `${prefix.toLowerCase()}_${i + 1}.jpg`,
            ref: `file://${prefix.toLowerCase()}/${i + 1}`,
            updatedAt: t,
        });
    }
    return items;
}

function makeLogs(jobTitle: string): JobLog[] {
    const ts = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();
    const logs: JobLog[] = [
        { id: "l1", ts: ts(38), level: "info", message: `${jobTitle}: worker started.` },
        { id: "l2", ts: ts(31), level: "info", message: `${jobTitle}: claimed 50 items from queue.` },
        { id: "l3", ts: ts(24), level: "warn", message: `${jobTitle}: slow item detected; retry scheduled.` },
        { id: "l4", ts: ts(14), level: "info", message: `${jobTitle}: processing item queue_12.jpg.` },
        { id: "l5", ts: ts(7), level: "error", message: `${jobTitle}: failed queue_7.jpg after max retries.` },
        { id: "l6", ts: ts(2), level: "info", message: `${jobTitle}: progress updated.` },
    ];
    return logs.sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

export function JobDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { jobs, toggleJobStatus, restartJob } = useJobs();

    const job = jobs.find(j => j.id === id);
    const [tab, setTab] = useState<TabKey>("queue");

    if (!job) {
        return <div className="p-8 text-center text-gray-500">Job not found</div>;
    }

    const progress = job.total > 0 ? (job.completed / job.total) * 100 : 0;
    // Mock concurrency
    const concurrency = (job as any).concurrency || 2;

    const model = useMemo(() => {
        const doneCount = clamp(job.completed, 0, job.total);
        const failedCount = clamp(job.failed, 0, job.total);
        const errorCount = clamp(job.errors, 0, job.total);

        const remaining = clamp(job.total - doneCount - failedCount, 0, job.total);
        const processingCount = job.status === "running" ? clamp(Math.min(5, remaining), 0, 5) : 0;
        const queuedCount = clamp(remaining - processingCount, 0, job.total);

        // In a real app, these items/logs would come from an API based on `job.id`
        // Here we mock them using helper functions for demonstration
        const processing = makeItems("Processing", Math.min(60, processingCount));
        const queued = makeItems("Queue", Math.min(120, queuedCount));
        const done = makeItems("Done", Math.min(120, doneCount));
        const failed = makeItems("Failed", Math.min(120, failedCount));
        const errors = makeItems("Error", Math.min(120, errorCount));
        const logs = makeLogs(job.title);

        return {
            queuedCount,
            processingCount,
            doneCount,
            failedCount,
            errorCount,
            queued,
            processing,
            done,
            failed,
            errors,
            logs,
        };
    }, [job]);

    const Icon = job.icon;

    return (
        <div className={shared.pageContainer}>
            <div className={shared.pageCentered} style={{ maxWidth: 1000 }}>
                {/* Header */}
                <div className={styles.detailsHeader}>
                    <div style={{ flex: 1 }}>
                        {/* Breadcrumb Row */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <div className={shared.breadcrumb}>
                                <Link to="/jobs" className={shared.breadcrumbLink}>Jobs</Link>
                                <ChevronRight size={16} className={shared.breadcrumbSeparator} />
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {job.title}
                                    {job.status === "running" && (
                                        <Loader2 size={16} className={shared.animateSpin} style={{ color: "var(--accent-primary)" }} />
                                    )}
                                </span>
                            </div>
                            <div style={{ flex: 1 }} />
                            {/* Action Buttons: Moved to top right */}
                            <div className={styles.detailsActions}>
                                {job.status === 'running' ? (
                                    <button
                                        onClick={() => toggleJobStatus(job.id)}
                                        className={`${shared.btn} ${shared.btnDanger}`}
                                    >
                                        <Square size={16} fill="currentColor" /> Pause
                                    </button>
                                ) : job.status === 'paused' ? (
                                    <button
                                        onClick={() => toggleJobStatus(job.id)}
                                        className={`${shared.btn} ${shared.btnPrimary}`}
                                    >
                                        <Play size={16} fill="currentColor" /> Resume
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => restartJob(job.id)}
                                        className={`${shared.btn} ${shared.btnPrimary}`}
                                    >
                                        <RotateCcw size={16} /> Restart
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Info Row: Icon, Description, Concurrency */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                backgroundColor: "var(--bg-secondary)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--accent-primary)", flexShrink: 0
                            }}>
                                <Icon size={24} />
                            </div>
                            <div style={{ paddingTop: 2 }}>
                                <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: 14 }}>{job.description}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div title="Concurrency workers" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 6 }}>
                                        <Cpu size={14} />
                                        <span style={{ fontWeight: 600 }}>{concurrency}x</span> workers
                                    </div>
                                    <div style={{ width: 1, height: 16, backgroundColor: "var(--border-subtle)" }} />
                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>ID: <span style={{ fontFamily: "monospace" }}>{job.id}</span></span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar: Bottom of header */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className={styles.progressContainer} style={{ flex: 1, marginBottom: 0, height: 8 }}>
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
                            <span className={styles.progressText} style={{ marginLeft: 0, minWidth: 40, textAlign: "right" }}>
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className={styles.statsGrid}>
                    <StatCard label="Queue" value={model.queuedCount} icon={<ClipboardList size={20} />} color="var(--text-secondary)" />
                    <StatCard label="Processing" value={model.processingCount} icon={<Cpu size={20} />} color="var(--accent-primary)" />
                    <StatCard label="Done" value={model.doneCount} icon={<CheckCircle2 size={20} />} color="var(--status-success)" />
                    <StatCard label="Failed" value={model.failedCount} icon={<XCircle size={20} />} color="var(--status-error)" />
                    <StatCard label="Errors" value={model.errorCount} icon={<AlertTriangle size={20} />} color="var(--status-warning)" />
                </div>

                {/* Integrated Tabs Section */}
                <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 16,
                    overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    height: 600
                }}>
                    <div className={styles.tabsContainer} style={{ padding: "0 16px", margin: 0, justifyContent: "flex-start", gap: 8, background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}>
                        <TabTrigger active={tab === "queue"} onClick={() => setTab("queue")} icon={<ClipboardList size={14} />} label="Queue" count={model.queuedCount} />
                        <TabTrigger active={tab === "processing"} onClick={() => setTab("processing")} icon={<Cpu size={14} />} label="Processing" count={model.processingCount} />
                        <TabTrigger active={tab === "done"} onClick={() => setTab("done")} icon={<CheckCircle2 size={14} />} label="Done" count={model.doneCount} />
                        <TabTrigger active={tab === "failed"} onClick={() => setTab("failed")} icon={<XCircle size={14} />} label="Failed" count={model.failedCount} />
                        <TabTrigger active={tab === "errors"} onClick={() => setTab("errors")} icon={<AlertTriangle size={14} />} label="Errors" count={model.errorCount} />
                        <div style={{ flex: 1 }} />
                        <TabTrigger active={tab === "logs"} onClick={() => setTab("logs")} icon={<TerminalSquare size={14} />} label="Logs" count={model.logs.length} />
                    </div>

                    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
                        {tab === "logs" ? (
                            <LogsView logs={model.logs} />
                        ) : (
                            <ItemsView items={
                                tab === "queue" ? model.queued :
                                    tab === "processing" ? model.processing :
                                        tab === "done" ? model.done :
                                            tab === "failed" ? model.failed :
                                                model.errors
                            } />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Subcomponents ---

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div className={styles.statCard} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: color, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    {icon}
                </div>
                <div className={styles.statLabel}>{label}</div>
            </div>
            <div className={styles.statValue} style={{ marginLeft: 4 }}>{value}</div>
        </div>
    );
}

function TabTrigger({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "16px 12px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s"
            }}
        >
            {icon}
            {label}
            {count !== undefined && (
                <span style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: active ? "var(--bg-secondary)" : "var(--bg-secondary)",
                    color: "var(--text-secondary)"
                }}>
                    {count}
                </span>
            )}
        </button>
    );
}

function ItemsView({ items }: { items: JobItem[] }) {
    if (items.length === 0) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", flexDirection: "column", gap: 12 }}>
                <ClipboardList size={40} strokeWidth={1} style={{ opacity: 0.5 }} />
                <span>No items in this list</span>
            </div>
        );
    }
    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <TableVirtuoso
                style={{ height: "100%", width: "100%" }}
                data={items}
                fixedHeaderContent={() => (
                    <tr style={{ background: "var(--bg-surface)", fontSize: 12, color: "var(--text-muted)", textAlign: "left" }}>
                        <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>ID</th>
                        <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>Filename</th>
                        <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>Path</th>
                        <th style={{ padding: "12px 24px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>Updated</th>
                    </tr>
                )}
                itemContent={(_index, item) => (
                    <>
                        <td style={{ padding: "12px 24px", color: "var(--text-secondary)", fontFamily: "monospace", borderBottom: "1px solid var(--border-subtle)" }}>{item.id}</td>
                        <td style={{ padding: "12px 24px", color: "var(--text-primary)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)" }}>{item.label}</td>
                        <td style={{ padding: "12px 24px", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>{item.ref}</td>
                        <td style={{ padding: "12px 24px", color: "var(--text-muted)", fontFamily: "monospace", borderBottom: "1px solid var(--border-subtle)" }}>{item.updatedAt.slice(11, 19)}</td>
                    </>
                )}
                components={{
                    Table: (props) => <table {...props} style={{ ...props.style, width: "100%", borderCollapse: "collapse", fontSize: 13 }} />,
                }}
            />
        </div>
    );
}

function LogsView({ logs }: { logs: JobLog[] }) {
    if (logs.length === 0) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                No activity logs
            </div>
        );
    }
    return (
        <div className={styles.logsContainer}>
            {/* Removed Logs Header per user request */}
            <div className={styles.logsContent}>
                <Virtuoso
                    style={{ height: "100%", width: "100%" }}
                    data={logs}
                    initialTopMostItemIndex={logs.length - 1}
                    followOutput="auto"
                    itemContent={(_index, log) => (
                        <div key={log.id} className={styles.logRow}>
                            <span className={styles.logTimestamp}>{log.ts.replace("T", " ").slice(0, 23)}</span>
                            <span className={`${styles.logLevel} ${log.level === "error" ? styles.levelError :
                                log.level === "warn" ? styles.levelWarn :
                                    styles.levelInfo
                                }`}>
                                {log.level.toUpperCase()}
                            </span>
                            <span className={styles.logMessage}>{log.message}</span>
                        </div>
                    )}
                />
            </div>
        </div>
    );
}