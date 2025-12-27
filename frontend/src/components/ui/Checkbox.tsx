import formStyles from "../../styles/Form.module.css";

interface CheckboxProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

export function Checkbox({ label, description, checked, onChange, className = "" }: CheckboxProps) {
    return (
        <label className={`${formStyles.checkboxWrapperRow} ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className={formStyles.checkbox}
                style={{ marginTop: "2px" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className={formStyles.checkboxLabel}>{label}</span>
                {description && <span className={formStyles.checkboxDescription}>{description}</span>}
            </div>
        </label>
    );
}
