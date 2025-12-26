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

// ... utility functions remain default ...

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
                padding: "40px 24px",
                scrollbarWidth: "none",
                backgroundColor: "var(--bg-primary)"
            }}
        >
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
                {/* Page header */}
                <header>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>Sources</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Add folders to scan for photos and videos. You can also watch folders for changes.</p>
                </header>

                {/* Add source card */}
                <div
                    style={{
                        borderRadius: "16px",
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        padding: "24px",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: "var(--bg-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--accent-primary)",
                            }}
                        >
                            <FolderPlus size={20} />
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Add New Source</div>
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
                            <input
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                placeholder="e.g. /Users/burhan/Pictures"
                                style={{
                                    width: "100%",
                                    height: 48,
                                    padding: "0 16px",
                                    borderRadius: 12,
                                    border: "1px solid var(--border-subtle)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                    outline: "none",
                                    fontSize: 15,
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--border-subtle)"}
                            />
                        </div>

                        {/* Mode styling update */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                padding: 4,
                                borderRadius: 12,
                                backgroundColor: "var(--bg-primary)",
                                border: "1px solid var(--border-subtle)",
                                height: 48
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
                                height: 48,
                                padding: "0 24px",
                                borderRadius: 12,
                                border: "none",
                                backgroundColor: canAdd ? "var(--accent-primary)" : "var(--bg-secondary)",
                                color: canAdd ? "white" : "var(--text-muted)",
                                cursor: canAdd ? "pointer" : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontWeight: 600,
                                fontSize: 15,
                                transition: "all 0.2s"
                            }}
                        >
                            <FolderPlus size={18} />
                            Add Folder
                        </button>
                    </div>

                    {!isLikelyPath(path) && path.trim().length > 0 && (
                        <div style={{ marginTop: 12, fontSize: 13, color: "var(--status-warning)", display: "flex", alignItems: "center", gap: 6 }}>
                            <AlertTriangle size={14} />
                            <span>Please enter a valid absolute path</span>
                        </div>
                    )}
                </div>

                {/* Sources list */}
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Configured Sources</h2>
                    {sources.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                            {sources.map((s) => (
                                <SourceRow
                                    key={s.id}
                                    source={s}
                                    onRescan={() => void rescan(s.id)}
                                    onRemove={() => removeSource(s.id)}
                                    onToggleWatch={() => toggleWatchEnabled(s.id)}
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
                height: 40,
                padding: "0 16px",
                borderRadius: 8,
                border: "none",
                backgroundColor: active ? "var(--bg-surface)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s"
            }}
        >
            {label}
        </button>
    );
}

function StatusBadge({ status, message }: { status: Source["status"]; message?: string | undefined }): React.ReactElement {
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
                gap: 6,
                padding: "4px 10px",
                borderRadius: 6,
                backgroundColor: status === "ok" ? "rgba(16, 185, 129, 0.1)" : "var(--bg-secondary)",
                color: status === "ok" ? "var(--status-success)" : "var(--text-secondary)",
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
}: {
    source: Source;
    onRescan: () => void;
    onRemove: () => void;
    onToggleWatch: () => void;
}): React.ReactElement {
    const isWatch = source.mode === "watch";

    return (
        <div
            style={{
                borderRadius: 16,
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                padding: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
        >
            {/* Left: path + meta */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: 0 }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: "var(--bg-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--accent-primary)",
                        flexShrink: 0,
                    }}
                >
                    <HardDrive size={24} />
                </div>

                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                        title={source.path}
                    >
                        {source.path}
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <StatusBadge status={source.status} message={source.statusMessage} />

                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            {source.lastScanAt ? `Scanned ${formatDateTime(source.lastScanAt)}` : "Not scanned yet"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={onToggleWatch}
                        disabled={!isWatch}
                        title={isWatch ? (source.enabled ? "Disable watch" : "Enable watch") : "Watch is only available in Watch mode"}
                        style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: "none", background: isWatch && source.enabled ? "var(--bg-secondary)" : "transparent",
                            color: isWatch && source.enabled ? "var(--accent-primary)" : "var(--text-muted)",
                            cursor: isWatch ? "pointer" : "not-allowed",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        {source.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <button
                        onClick={onRescan}
                        title="Rescan"
                        style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: "none", background: "transparent",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <RefreshCw size={18} />
                    </button>

                    <button
                        onClick={onRemove}
                        title="Remove"
                        style={{
                            width: 36, height: 36, borderRadius: 8,
                            border: "none", background: "transparent",
                            color: "var(--status-error)",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmptyState(): React.ReactElement {
    return (
        <div
            style={{
                borderRadius: 16,
                border: "2px dashed var(--border-subtle)",
                backgroundColor: "transparent",
                padding: 40,
                color: "var(--text-muted)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center"
            }}
        >
            <div
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 20,
                    backgroundColor: "var(--bg-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-secondary)",
                    marginBottom: 8
                }}
            >
                <FolderPlus size={24} />
            </div>
            <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>No sources configured</div>
                <div style={{ fontSize: 14, maxWidth: 300, margin: "0 auto", lineHeight: 1.5 }}>
                    Add a folder above to start scanning your photo library.
                </div>
            </div>
        </div>
    );
}
