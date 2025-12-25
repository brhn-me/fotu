// src/components/InlineEditableDateTime.tsx
import * as React from "react";

type InlineEditableDateTimeProps = {
    label?: string;
    value: Date;
    onSave: (next: Date) => void;
    className?: string;
};

function pad2(n: number): string {
    return String(n).padStart(2, "0");
}

/**
 * Convert Date -> "YYYY-MM-DDTHH:mm" in LOCAL time (for <input type="datetime-local">)
 */
function toLocalDateTimeInputValue(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const min = pad2(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * Convert "YYYY-MM-DDTHH:mm" (local) -> Date
 */
function fromLocalDateTimeInputValue(s: string): Date | null {
    // Expect: 2025-12-23T10:15
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(s);
    if (!m) return null;
    const yyyy = Number(m[1]);
    const mm = Number(m[2]);
    const dd = Number(m[3]);
    const hh = Number(m[4]);
    const min = Number(m[5]);

    const d = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
    if (Number.isNaN(d.getTime())) return null;
    return d;
}

export function InlineEditableDateTime({ label, value, onSave, className }: InlineEditableDateTimeProps) {
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState<string>(() => toLocalDateTimeInputValue(value));
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
        if (!editing) setDraft(toLocalDateTimeInputValue(value));
    }, [value, editing]);

    React.useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const commit = React.useCallback(() => {
        const parsed = fromLocalDateTimeInputValue(draft);
        if (parsed) onSave(parsed);
        setEditing(false);
    }, [draft, onSave]);

    const cancel = React.useCallback(() => {
        setDraft(toLocalDateTimeInputValue(value));
        setEditing(false);
    }, [value]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            cancel();
            return;
        }
        if (e.key === "Enter") {
            e.preventDefault();
            commit();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {label ? <label style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</label> : null}

            {!editing ? (
                <div
                    role="button"
                    tabIndex={0}
                    className={className}
                    onClick={() => setEditing(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setEditing(true);
                    }}
                    style={{
                        minHeight: 36,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid transparent",
                        cursor: "text",
                        color: "var(--text-primary)",
                        background: "transparent",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid var(--border-subtle)";
                        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-primary)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid transparent";
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                >
                    <div style={{ fontSize: 14 }}>{value.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{value.toISOString()}</div>
                </div>
            ) : (
                <input
                    ref={inputRef}
                    type="datetime-local"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={onKeyDown}
                    style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        outline: "none",
                        fontSize: 14,
                    }}
                />
            )}
        </div>
    );
}
