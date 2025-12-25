// src/components/InlineEditable.tsx
import * as React from "react";

type CommonProps = {
    label?: string;
    value: string;
    placeholder?: string;
    className?: string;
    onSave: (next: string) => void;
    // Optional: if you want to show something different in view mode (e.g., "No description")
    renderViewValue?: (value: string) => React.ReactNode;
};

type InlineEditableProps =
    | (CommonProps & {
        kind?: "text";
        multiline?: false;
    })
    | (CommonProps & {
        kind: "textarea";
        multiline: true;
        rows?: number;
    });

export function InlineEditable(props: InlineEditableProps) {
    const {
        label,
        value,
        placeholder,
        className,
        onSave,
        renderViewValue,
    } = props;

    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
        // If external state updates while not editing, keep in sync
        if (!editing) setDraft(value);
    }, [value, editing]);

    React.useEffect(() => {
        if (editing) {
            // focus + place cursor at end
            const el = inputRef.current;
            if (el) {
                el.focus();
                const len = el.value.length;
                // Works for both input and textarea
                (el as HTMLInputElement).setSelectionRange?.(len, len);
            }
        }
    }, [editing]);

    const commit = React.useCallback(() => {
        const next = draft.trim();
        onSave(next);
        setEditing(false);
    }, [draft, onSave]);

    const cancel = React.useCallback(() => {
        setDraft(value);
        setEditing(false);
    }, [value]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            cancel();
            return;
        }
        if (!props.multiline && e.key === "Enter") {
            e.preventDefault();
            commit();
        }
        // For textarea: Enter inserts newline; user can click away to save.
        // If you want Cmd/Ctrl+Enter to save, you can add it here.
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {label ? (
                <label style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</label>
            ) : null}

            {!editing ? (
                <div
                    role="button"
                    tabIndex={0}
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
                    }}
                    className={className}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid var(--border-subtle)";
                        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-primary)";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.border = "1px solid transparent";
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                >
                    {renderViewValue
                        ? renderViewValue(value)
                        : value?.length
                            ? value
                            : <span style={{ color: "var(--text-muted)" }}>{placeholder ?? "Click to edit"}</span>}
                </div>
            ) : props.multiline ? (
                <textarea
                    ref={(el) => {
                        inputRef.current = el;
                    }}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={onKeyDown}
                    rows={props.rows ?? 3}
                    style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-primary)",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        outline: "none",
                        resize: "none",
                        fontSize: 14,
                        fontFamily: "inherit",
                    }}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    ref={(el) => {
                        inputRef.current = el;
                    }}
                    type="text"
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
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}
