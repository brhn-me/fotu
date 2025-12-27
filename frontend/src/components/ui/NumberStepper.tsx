interface NumberStepperProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (val: number) => void;
}

export function NumberStepper({ value, min = -Infinity, max = Infinity, onChange }: NumberStepperProps) {
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
        transition: "all 0.2s"
    } as const;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
                onClick={() => onChange(Math.max(min, value - 1))}
                style={btnStyle}
                disabled={value <= min}
            >−</button>
            <div style={{ width: 32, textAlign: "center", fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{value}</div>
            <button
                onClick={() => onChange(Math.min(max, value + 1))}
                style={btnStyle}
                disabled={value >= max}
            >+</button>
        </div>
    );
}
