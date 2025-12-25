// src/components/JobDetailsPage.tsx
import type React from "react";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    ClipboardList,
    ListChecks,
    AlertTriangle,
    XCircle,
    Cpu,
    RefreshCw,
    Pause,
    Play,
    RotateCcw,
    Loader2,
} from "lucide-react";
import type { Job } from "./JobsPage";

type TabKey = "queue" | "processing" | "done" | "failed" | "errors";

type LogLevel = "info" | "warn" | "error";
type JobLog = { id: string; ts: string; level: LogLevel; message: string };

type JobItem = {
    id: string;
    label: string;
    ref?: string;
    updatedAt: string;
};

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

function fmtTs(ts: string): string {
    return ts.slice(0, 19).replace("T", " ");
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

        const currentProcessing = processing[0] ?? null;
        const logs = makeLogs(job.title);

        return {
            queuedCount,
            processingCount,
            doneCount,
            failedCount,
            errorCount,
            currentProcessing,
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
                padding: "28px 24px",
                height: "100%",
                overflowY: "auto",
                backgroundColor: "var(--bg-primary)",
                scrollbarWidth: "none",
            }}
        >
            <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Top bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            type="button"
                            onClick={onBack}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            title="Back"
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-subtle)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--accent-primary)",
                            }}
                        >
                            <Icon size={22} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 650, color: "var(--text-primary)", lineHeight: 1.15 }}>{job.title}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{job.description}</div>
                            </div>

                            {job.status === "running" ? <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent-primary)" }} /> : null}
                        </div>
                    </div>

                    {/* Controls (match JobsPage: icon-only hoverable buttons) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {job.status !== "completed" ? (
                            <IconActionButton
                                onClick={onPauseResume}
                                title={job.status === "running" ? "Pause" : "Resume"}
                                icon={job.status === "running" ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                                accent={false}
                            />
                        ) : null}

                        <IconActionButton
                            onClick={onRestart}
                            title="Restart"
                            icon={<RotateCcw size={18} />}
                            accent={job.status === "completed"}
                        />

                        <IconActionButton onClick={() => { }} title="Refresh" icon={<RefreshCw size={18} />} accent={false} />
                    </div>
                </div>

                {/* Progress card */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 16, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 700 }}>Progress</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>{Math.round(progress)}%</div>
                    </div>

                    <div style={{ height: 10, background: "var(--bg-secondary)", borderRadius: 999, overflow: "hidden", position: "relative" }}>
                        <div
                            style={{
                                width: `${progress}%`,
                                height: "100%",
                                background: job.status === "completed" ? "var(--status-success)" : "var(--accent-primary)",
                                transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
                            }}
                        />
                        {job.status === "running" && progress > 0 && progress < 100 ? (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    width: "40%",
                                    opacity: 0.28,
                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                                    animation: "progressShimmer 1.15s ease-in-out infinite",
                                }}
                            />
                        ) : null}
                    </div>

                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 650 }}>
                            Processing:
                            <span style={{ color: "var(--text-primary)", fontWeight: 700, marginLeft: 6 }}>
                                {model.currentProcessing ? `${model.currentProcessing.label} (${model.currentProcessing.id})` : "—"}
                            </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Total: <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{job.total}</span>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginTop: 12 }}>
                        <MiniStat label="Queue" value={model.queuedCount} icon={<ClipboardList size={14} />} />
                        <MiniStat label="Processing" value={model.processingCount} icon={<Cpu size={14} />} />
                        <MiniStat label="Done" value={model.doneCount} icon={<ListChecks size={14} />} />
                        <MiniStat label="Failed" value={model.failedCount} icon={<XCircle size={14} />} />
                        <MiniStat label="Errors" value={model.errorCount} icon={<AlertTriangle size={14} />} />
                    </div>
                </div>

                {/* Logs card (theme-aware, scrollable) */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 16, overflow: "hidden" }}>
                    <div
                        style={{
                            padding: "10px 12px",
                            background: "var(--bg-secondary)",
                            borderBottom: "1px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 750 }}>Logs</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{model.logs.length} entries</div>
                    </div>

                    <div
                        style={{
                            padding: 12,
                            background: "var(--terminal-bg)",
                            color: "var(--terminal-fg)",
                            fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                            fontSize: 12,
                            lineHeight: 1.5,
                            maxHeight: 240,
                            overflowY: "auto", // scrollbar for logs
                        }}
                    >
                        {model.logs.length === 0 ? (
                            <div style={{ color: "var(--terminal-muted)" }}>No logs.</div>
                        ) : (
                            model.logs.slice(0, 400).map((l) => (
                                <div key={l.id} style={{ display: "flex", gap: 10 }}>
                                    <span style={{ color: "var(--terminal-muted)" }}>{fmtTs(l.ts)}</span>
                                    <span
                                        style={{
                                            color:
                                                l.level === "error" ? "var(--terminal-error)" : l.level === "warn" ? "var(--terminal-warn)" : "var(--terminal-info)",
                                        }}
                                    >
                                        {l.level.toUpperCase()}
                                    </span>
                                    <span>{l.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Queue card (tabs inside; no "Queue Items" label; list scrolls) */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 16, overflow: "hidden" }}>
                    <div
                        style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid var(--border-subtle)",
                            background: "var(--bg-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 8,
                            flexWrap: "wrap",
                        }}
                    >
                        <TabButton active={tab === "queue"} onClick={() => setTab("queue")}>Queue</TabButton>
                        <TabButton active={tab === "processing"} onClick={() => setTab("processing")}>Processing</TabButton>
                        <TabButton active={tab === "done"} onClick={() => setTab("done")}>Done</TabButton>
                        <TabButton active={tab === "failed"} onClick={() => setTab("failed")}>Failed</TabButton>
                        <TabButton active={tab === "errors"} onClick={() => setTab("errors")}>Errors</TabButton>
                    </div>

                    {/* Entire card body scrolls (independent scrollbar for queue/lists) */}
                    <div style={{ padding: 12, maxHeight: 460, overflowY: "auto" }}>
                        {tab === "queue" ? <ItemTable items={model.queued} /> : null}
                        {tab === "processing" ? <ItemTable items={model.processing} /> : null}
                        {tab === "done" ? <ItemTable items={model.done} /> : null}
                        {tab === "failed" ? <ItemTable items={model.failed} /> : null}
                        {tab === "errors" ? <ItemTable items={model.errors} /> : null}
                    </div>
                </div>

                <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .animate-spin { animation: spin 1.4s linear infinite; }
          @keyframes progressShimmer { 0% { transform: translateX(-70%); } 100% { transform: translateX(170%); } }

          /* Theme-aware terminal palette (works in light/dark via your vars) */
          :root {
            --terminal-bg: var(--bg-primary);
            --terminal-fg: var(--text-primary);
            --terminal-muted: var(--text-muted);
            --terminal-info: var(--status-success);
            --terminal-warn: var(--status-warning);
            --terminal-error: var(--status-error);
          }
        `}</style>
            </div>
        </div>
    );
}

function IconActionButton({
    onClick,
    title,
    icon,
    accent,
}: {
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    accent: boolean;
}) {
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                background: "transparent",
                border: "none",
                borderRadius: "8px",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: accent ? "var(--accent-primary)" : "var(--text-secondary)",
                transition: "all 0.2s",
                outline: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
            {icon}
        </button>
    );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                height: 30,
                padding: "0 10px",
                borderRadius: 999,
                border: "1px solid var(--border-subtle)",
                background: active ? "var(--bg-surface)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "var(--bg-surface)";
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
            }}
        >
            {children}
        </button>
    );
}

function MiniStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    return (
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 14, padding: "10px 10px", background: "var(--bg-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 750 }}>{label}</div>
                <div style={{ color: "var(--text-muted)" }}>{icon}</div>
            </div>
            <div style={{ marginTop: 6, fontSize: 16, fontWeight: 780, color: "var(--text-primary)" }}>{value}</div>
        </div>
    );
}

function ItemTable({ items }: { items: JobItem[] }) {
    return (
        <div style={{ border: "1px solid var(--border-subtle)", borderRadius: 14, overflow: "hidden" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr 190px",
                    padding: "10px 12px",
                    background: "var(--bg-surface)",
                    borderBottom: "1px solid var(--border-subtle)",
                }}
            >
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 750 }}>ID</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 750 }}>Item</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 750 }}>Updated</div>
            </div>

            {items.length === 0 ? (
                <div style={{ padding: 14, fontSize: 12, color: "var(--text-muted)" }}>No items.</div>
            ) : (
                items.map((it) => (
                    <div
                        key={it.id}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "160px 1fr 190px",
                            padding: "10px 12px",
                            borderBottom: "1px solid var(--border-subtle)",
                        }}
                    >
                        <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 700 }}>{it.id}</div>
                        <div style={{ fontSize: 12, color: "var(--text-primary)" }}>
                            <div style={{ fontWeight: 700 }}>{it.label}</div>
                            <div style={{ color: "var(--text-muted)", marginTop: 2 }}>{it.ref}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtTs(it.updatedAt)}</div>
                    </div>
                ))
            )}
        </div>
    );
}