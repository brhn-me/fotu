import formStyles from "../../styles/Form.module.css";

interface SwitchProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function Switch({ label, description, checked, onChange }: SwitchProps) {
    return (
        <div className={formStyles.switchRow}>
            <div className={formStyles.switchText}>
                <div className={formStyles.switchLabel}>{label}</div>
                {description && <div className={formStyles.switchDescription}>{description}</div>}
            </div>
            <label>
                <input
                    type="checkbox"
                    className={formStyles.switchInput}
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className={formStyles.switchToggle}></span>
            </label>
        </div>
    );
}
