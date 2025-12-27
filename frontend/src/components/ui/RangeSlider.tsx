import formStyles from "../../styles/Form.module.css";

interface RangeSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
}

export function RangeSlider({ label, value, min, max, step = 1, unit = "", onChange }: RangeSliderProps) {
    return (
        <div className={formStyles.formGroup}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className={formStyles.label}>{label}</label>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent-primary)" }}>{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ width: "100%", cursor: "pointer", accentColor: "var(--accent-primary)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                <span>{min}{unit}</span>
                <span>{max}{unit}</span>
            </div>
        </div>
    );
}
