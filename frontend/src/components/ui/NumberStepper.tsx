interface NumberStepperProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (val: number) => void;
    disabled?: boolean;
    title?: string | undefined;
}

export function NumberStepper({ value, min = -Infinity, max = Infinity, onChange, disabled = false, title }: NumberStepperProps) {
    const btnStyle = {
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-primary)",
        fontSize: "16px",
        transition: "all 0.2s",
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : "auto"
    } as const;

    return (
        <div
            style={{ display: "flex", alignItems: "center", gap: "12px", opacity: disabled ? 0.6 : 1 }}
            title={title}
        >
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                style={btnStyle}
                disabled={disabled || value <= min}
            >−</button>
            <div style={{ width: 32, textAlign: "center", fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{value}</div>
            <button
                onClick={() => onChange(Math.min(max, value + 1))}
                style={btnStyle}
                disabled={disabled || value >= max}
            >+</button>
        </div>
    );
}
