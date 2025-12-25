import React, { useMemo, useState } from "react";
import { FolderPlus, RefreshCw, Trash2, Eye, EyeOff, HardDrive, CheckCircle2, AlertTriangle } from "lucide-react";

export type SourceMode = "scanOnce" | "watch";

export type Source = {
    id: string;
    path: string;
    mode: SourceMode;
    enabled: boolean; // for watch mode toggle
    lastScanAt: Date | null;
    status: "idle" | "scanning" | "ok" | "error";
    statusMessage?: string;
};

function now(): Date {
    return new Date();
}

function formatDateTime(d: Date): string {
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function isLikelyPath(input: string): boolean {
    const v = input.trim();
    if (v.length < 2) return false;
    // Accept typical unix/windows-ish patterns without being overly strict
    if (v.startsWith("/") || v.startsWith("~/") || /^[A-Za-z]:\\/.test(v)) return true;
    // allow relative but discourage
    return v.includes("/") || v.includes("\\");
}

export function SourcesPage(): React.ReactElement {
    const [sources, setSources] = useState<Source[]>([]);
    const [path, setPath] = useState<string>("");
    const [mode, setMode] = useState<SourceMode>("watch");

    const canAdd = useMemo(() => isLikelyPath(path) && path.trim().length > 0, [path]);

    const addSource = (): void => {
        const p = path.trim();
        if (!canAdd) return;

        const id = crypto.randomUUID();
        setSources((prev) => [
            {
                id,
                path: p,
                mode,
                enabled: mode === "watch",
                lastScanAt: null,
                status: "idle",
            },
            ...prev,
        ]);
        setPath("");
    };

    const removeSource = (id: string): void => {
        setSources((prev) => prev.filter((s) => s.id !== id));
    };

    const toggleWatchEnabled = (id: string): void => {
        setSources((prev) =>
            prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        );
    };

    const setSourceMode = (id: string, nextMode: SourceMode): void => {
        setSources((prev) =>
            prev.map((s) => {
                if (s.id !== id) return s;
                return {
                    ...s,
                    mode: nextMode,
                    enabled: nextMode === "watch" ? true : false,
                };
            })
        );
    };

    // UI-only simulated scan (replace with real backend call later)
    const rescan = async (id: string): Promise<void> => {
        setSources((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: "scanning", statusMessage: "Scanning…" } : s))
        );

        // simulate latency
        await new Promise((r) => setTimeout(r, 650));

        // simulate ok
        setSources((prev) =>
            prev.map((s) =>
                s.id === id
                    ? { ...s, status: "ok", statusMessage: "Up to date", lastScanAt: now() }
                    : s
            )
        );
    };

    return (
        <div
            style={{
                height: "100%",
                overflow: "auto",
                padding: "24px",
                scrollbarWidth: "none",
            }}
        >
            <div style={{ maxWidth: 980, margin: "0 auto" }}>
                {/* Page header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)" }}>Sources</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                            Add folders to scan for photos and videos. You can also watch folders for changes.
                        </div>
                    </div>
                </div>

                {/* Add source card */}
                <div
                    style={{
                        marginTop: 18,
                        borderRadius: 20,
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        padding: 16,
                        boxShadow: "var(--shadow-sm)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                backgroundColor: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--text-secondary)",
                            }}
                        >
                            <HardDrive size={18} />
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Add a folder</div>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            placeholder="e.g. /Users/burhan/Pictures or D:\Photos"
                            style={{
                                flex: "1 1 420px",
                                minWidth: 280,
                                height: 44,
                                padding: "0 14px",
                                borderRadius: 14,
                                border: "1px solid var(--border-subtle)",
                                backgroundColor: "var(--bg-primary)",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontSize: 14,
                            }}
                        />

                        {/* Mode pills */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: 6,
                                borderRadius: 999,
                                backgroundColor: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                            }}
                        >
                            <ModePill
                                label="Watch"
                                active={mode === "watch"}
                                onClick={() => setMode("watch")}
                            />
                            <ModePill
                                label="Scan once"
                                active={mode === "scanOnce"}
                                onClick={() => setMode("scanOnce")}
                            />
                        </div>

                        <button
                            onClick={addSource}
                            disabled={!canAdd}
                            style={{
                                height: 44,
                                padding: "0 16px",
                                borderRadius: 14,
                                border: "none",
                                backgroundColor: canAdd ? "var(--accent-primary)" : "var(--border-subtle)",
                                color: "white",
                                cursor: canAdd ? "pointer" : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                fontWeight: 600,
                                fontSize: 14,
                            }}
                        >
                            <FolderPlus size={18} />
                            Add
                        </button>
                    </div>

                    {!isLikelyPath(path) && path.trim().length > 0 && (
                        <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-secondary)" }}>
                            Tip: Use an absolute folder path (Linux/macOS: <code>/…</code> or <code>~/…</code>, Windows: <code>C:\…</code>).
                        </div>
                    )}
                </div>

                {/* Sources list */}
                <div style={{ marginTop: 16 }}>
                    {sources.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {sources.map((s) => (
                                <SourceRow
                                    key={s.id}
                                    source={s}
                                    onRescan={() => void rescan(s.id)}
                                    onRemove={() => removeSource(s.id)}
                                    onToggleWatch={() => toggleWatchEnabled(s.id)}
                                    onChangeMode={(m) => setSourceMode(s.id, m)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        div::-webkit-scrollbar { display: none; }
        code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      `}</style>
        </div>
    );
}

function ModePill({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}): React.ReactElement {
    return (
        <button
            onClick={onClick}
            style={{
                height: 30,
                padding: "0 12px",
                borderRadius: 999,
                border: active ? "1px solid var(--accent-primary)" : "1px solid transparent",
                backgroundColor: active ? "rgba(52, 168, 83, 0.12)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
            }}
        >
            {label}
        </button>
    );
}

function StatusBadge({ status, message }: { status: Source["status"]; message?: string }): React.ReactElement {
    const { icon, text } = (() => {
        if (status === "scanning") return { icon: <RefreshCw size={14} className="spin" />, text: message ?? "Scanning…" };
        if (status === "ok") return { icon: <CheckCircle2 size={14} />, text: message ?? "Up to date" };
        if (status === "error") return { icon: <AlertTriangle size={14} />, text: message ?? "Error" };
        return { icon: null, text: message ?? "Idle" };
    })();

    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                fontSize: 12,
                fontWeight: 600,
            }}
        >
            {icon}
            <span>{text}</span>
            <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

function SourceRow({
    source,
    onRescan,
    onRemove,
    onToggleWatch,
    onChangeMode,
}: {
    source: Source;
    onRescan: () => void;
    onRemove: () => void;
    onToggleWatch: () => void;
    onChangeMode: (m: SourceMode) => void;
}): React.ReactElement {
    const isWatch = source.mode === "watch";

    return (
        <div
            style={{
                borderRadius: 18,
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                padding: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
            }}
        >
            {/* Left: path + meta */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 14,
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-secondary)",
                        flexShrink: 0,
                    }}
                >
                    <HardDrive size={18} />
                </div>

                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                        title={source.path}
                    >
                        {source.path}
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                        <StatusBadge status={source.status} message={source.statusMessage} />

                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            {source.lastScanAt ? `Last scan: ${formatDateTime(source.lastScanAt)}` : "Not scanned yet"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {/* Mode pills (per-source) */}
                <div
                    style={{
                        display: "flex",
                        gap: 6,
                        padding: 6,
                        borderRadius: 999,
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-subtle)",
                    }}
                >
                    <ModePill label="Watch" active={source.mode === "watch"} onClick={() => onChangeMode("watch")} />
                    <ModePill label="Scan once" active={source.mode === "scanOnce"} onClick={() => onChangeMode("scanOnce")} />
                </div>

                {/* Watch enable/disable */}
                <button
                    onClick={onToggleWatch}
                    disabled={!isWatch}
                    title={isWatch ? (source.enabled ? "Disable watch" : "Enable watch") : "Watch is only available in Watch mode"}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: isWatch ? "var(--bg-secondary)" : "transparent",
                        color: isWatch ? "var(--text-secondary)" : "var(--border-subtle)",
                        cursor: isWatch ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                        if (isWatch) e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                    }}
                    onMouseLeave={(e) => {
                        if (isWatch) e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                    }}
                >
                    {source.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

                {/* Rescan */}
                <button
                    onClick={onRescan}
                    title="Rescan for changes"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")}
                >
                    <RefreshCw size={18} />
                </button>

                {/* Remove */}
                <button
                    onClick={onRemove}
                    title="Remove source"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: "transparent",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}

function EmptyState(): React.ReactElement {
    return (
        <div
            style={{
                marginTop: 14,
                borderRadius: 20,
                border: "1px dashed var(--border-subtle)",
                backgroundColor: "var(--bg-primary)",
                padding: 22,
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: 14,
            }}
        >
            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <FolderPlus size={20} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>No sources yet</div>
                <div style={{ fontSize: 13 }}>
                    Add a folder above to scan once or watch for changes.
                </div>
            </div>
        </div>
    );
}
