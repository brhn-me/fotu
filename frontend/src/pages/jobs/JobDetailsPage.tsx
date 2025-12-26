// src/components/JobDetailsPage.tsx
import type React from "react";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    ClipboardList,
    AlertTriangle,
    XCircle,
    Cpu,
    CheckCircle2,
    Pause,
    Play,
    RotateCcw,
    Loader2,
    TerminalSquare,
} from "lucide-react";
import { Virtuoso, TableVirtuoso } from "react-virtuoso";
import type { Job } from "./JobsPage";

type TabKey = "queue" | "processing" | "done" | "failed" | "errors" | "logs";

type LogLevel = "info" | "warn" | "error";
type JobLog = { id: string; ts: string; level: LogLevel; message: string };

type JobItem = {
    id: string;
    label: string;
    ref?: string;
    updatedAt: string;
};

// ... utility functions (clamp, makeItems, makeLogs, fmtTs) remain the same ...
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



export function JobDetailsPage({
    job,
    onBack,
    onPauseResume,
    onRestart,
}: {
    job: Job;
    onBack: () => void;
    onPauseResume: () => void;
    onRestart: () => void;
}) {
    const [tab, setTab] = useState<TabKey>("queue");

    const progress = job.total > 0 ? (job.completed / job.total) * 100 : 0;

    const model = useMemo(() => {
        const doneCount = clamp(job.completed, 0, job.total);
        const failedCount = clamp(job.failed, 0, job.total);
        const errorCount = clamp(job.errors, 0, job.total);

        const remaining = clamp(job.total - doneCount - failedCount, 0, job.total);
        const processingCount = job.status === "running" ? clamp(Math.min(5, remaining), 0, 5) : 0;
        const queuedCount = clamp(remaining - processingCount, 0, job.total);

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
        <div
            style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--bg-primary)",
            }}
        >
            {/* Header Section */}
            <div style={{
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-surface)",
            }}>
                <div style={{
                    maxWidth: 1000,
                    margin: "0 auto",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <button
                            onClick={onBack}
                            style={{
                                width: 36, height: 36,
                                borderRadius: 18,
                                border: "none",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div style={{
                            width: 48, height: 48,
                            borderRadius: 12,
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--accent-primary)",
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                            <Icon size={24} />
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                                    {job.title}
                                </h1>
                                <StatusBadge status={job.status} />
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                                {job.description}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {job.status !== "completed" && (
                            <ActionButton
                                onClick={onPauseResume}
                                icon={job.status === "running" ? <Pause size={18} /> : <Play size={18} />}
                                label={job.status === "running" ? "Pause" : "Resume"}
                            />
                        )}
                        <ActionButton
                            onClick={onRestart}
                            icon={<RotateCcw size={18} />}
                            label="Restart"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* Stats Overview */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 16
                    }}>
                        {/* Progress Card */}
                        <div style={{
                            gridColumn: "span 1",
                            background: "var(--bg-surface)",
                            padding: 20,
                            borderRadius: 16,
                            border: "1px solid var(--border-subtle)",
                            display: "flex", flexDirection: "column", justifyContent: "center"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Total Progress</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{Math.round(progress)}%</span>
                            </div>
                            <div style={{ height: 8, background: "var(--bg-secondary)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{
                                    width: `${progress}%`,
                                    height: "100%",
                                    background: job.status === "completed" ? "var(--status-success)" : "var(--accent-primary)",
                                    transition: "width 0.5s ease"
                                }} />
                            </div>
                        </div>

                        {/* Mini Stats */}
                        <StatCard label="Queue" value={model.queuedCount} icon={<ClipboardList size={16} />} color="var(--text-secondary)" />
                        <StatCard label="Processing" value={model.processingCount} icon={<Cpu size={16} />} color="var(--accent-primary)" />
                        <StatCard label="Done" value={model.doneCount} icon={<CheckCircle2 size={16} />} color="var(--status-success)" />
                        <StatCard label="Failed" value={model.failedCount} icon={<XCircle size={16} />} color="var(--status-error)" />
                        <StatCard label="Errors" value={model.errorCount} icon={<AlertTriangle size={16} />} color="var(--status-warning)" />
                    </div>

                    {/* Integrated Tabs Section */}
                    <div style={{
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 16,
                        overflow: "hidden",
                        display: "flex", flexDirection: "column",
                        height: 500 // Fixed height for virtualization to work
                    }}>
                        <div style={{
                            padding: "6px 8px",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex", gap: 4,
                            background: "var(--bg-surface)"
                        }}>
                            <TabTrigger active={tab === "queue"} onClick={() => setTab("queue")} icon={<ClipboardList size={14} />} label="Queue" count={model.queuedCount} />
                            <TabTrigger active={tab === "processing"} onClick={() => setTab("processing")} icon={<Cpu size={14} />} label="Processing" count={model.processingCount} />
                            <TabTrigger active={tab === "done"} onClick={() => setTab("done")} icon={<CheckCircle2 size={14} />} label="Done" count={model.doneCount} />
                            <TabTrigger active={tab === "failed"} onClick={() => setTab("failed")} icon={<XCircle size={14} />} label="Failed" count={model.failedCount} />
                            <TabTrigger active={tab === "errors"} onClick={() => setTab("errors")} icon={<AlertTriangle size={14} />} label="Errors" count={model.errorCount} />
                            <div style={{ flex: 1 }} />
                            <TabTrigger active={tab === "logs"} onClick={() => setTab("logs")} icon={<TerminalSquare size={14} />} label="Logs" count={model.logs.length} />
                        </div>

                        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
        </div>
    );
}

// --- Subcomponents ---

function StatusBadge({ status }: { status: Job["status"] }) {
    const color =
        status === "completed" ? "var(--status-success)" :
            "var(--accent-primary)";

    return (
        <div style={{
            padding: "4px 10px",
            borderRadius: 99,
            backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
            color: color,
            fontSize: 12,
            fontWeight: 600,
            display: "flex", alignItems: "center", gap: 6,
            border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`
        }}>
            {status === "running" && <Loader2 size={10} className="animate-spin" />}
            {status.toUpperCase()}
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <div style={{
            background: "var(--bg-surface)",
            padding: "16px",
            borderRadius: 16,
            border: "1px solid var(--border-subtle)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8
        }}>
            <div style={{ color: color, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                {icon}
                {label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
        </div>
    );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 10,
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                fontSize: 13, fontWeight: 500,
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer",
                transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--bg-surface)"}
        >
            {icon}
            {label}
        </button>
    );
}

function TabTrigger({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: active ? "var(--bg-secondary)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.2s"
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
            onMouseLeave={e => !active && (e.currentTarget.style.backgroundColor = "transparent")}
        >
            {icon}
            {label}
            {count !== undefined && (
                <span style={{
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 99,
                    background: active ? "var(--bg-surface)" : "var(--bg-secondary)",
                    color: "var(--text-muted)"
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
                        <th style={{ padding: "12px 20px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>ID</th>
                        <th style={{ padding: "12px 20px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>Filename</th>
                        <th style={{ padding: "12px 20px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>Path</th>
                        <th style={{ padding: "12px 20px", fontWeight: 600, borderBottom: "1px solid var(--border-subtle)" }}>Updated</th>
                    </tr>
                )}
                itemContent={(_index, item) => (
                    <>
                        <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontFamily: "monospace", borderBottom: "1px solid var(--border-subtle)" }}>{item.id}</td>
                        <td style={{ padding: "12px 20px", color: "var(--text-primary)", fontWeight: 500, borderBottom: "1px solid var(--border-subtle)" }}>{item.label}</td>
                        <td style={{ padding: "12px 20px", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>{item.ref}</td>
                        <td style={{ padding: "12px 20px", color: "var(--text-muted)", fontFamily: "monospace", borderBottom: "1px solid var(--border-subtle)" }}>{item.updatedAt.slice(11, 19)}</td>
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
        <div style={{
            flex: 1,
            background: "var(--terminal-bg, #000)",
            color: "var(--terminal-fg, #fff)",
            fontFamily: "monospace",
            fontSize: 12,
        }}>
            <Virtuoso
                style={{ height: "100%", width: "100%" }}
                data={logs}
                initialTopMostItemIndex={logs.length - 1}
                followOutput="auto"
                itemContent={(_index, log) => (
                    <div key={log.id} style={{ display: "flex", gap: 12, padding: "4px 20px", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--terminal-muted, #888)", minWidth: 140 }}>{log.ts.replace("T", " ").slice(0, 23)}</span>
                        <span style={{
                            fontWeight: 700,
                            width: 60,
                            color: log.level === "error" ? "var(--terminal-error, #ff4d4d)" :
                                log.level === "warn" ? "var(--terminal-warn, #ffcc00)" :
                                    "var(--terminal-info, #4d94ff)"
                        }}>
                            {log.level.toUpperCase()}
                        </span>
                        <span style={{ color: "var(--terminal-fg, #fff)" }}>{log.message}</span>
                    </div>
                )}
            />
        </div>
    );
}