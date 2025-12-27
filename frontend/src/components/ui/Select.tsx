import formStyles from "../../styles/Form.module.css";

interface Option {
    value: string;
    label: string;
}

interface SelectProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
}

export function Select({ label, value, options, onChange }: SelectProps) {
    return (
        <div className={formStyles.formGroup}>
            <label className={formStyles.label}>{label}</label>
            <select
                className={formStyles.select}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}
