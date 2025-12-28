import { Save } from "lucide-react";
import formStyles from "../../styles/Form.module.css";

interface SaveButtonProps {
    onClick: () => void;
    disabled?: boolean;
    label?: string;
}

export function SaveButton({ onClick, disabled, label = "Save Changes" }: SaveButtonProps) {
    return (
        <div className={formStyles.cardFooter}>
            <button
                className={formStyles.saveButton}
                disabled={disabled}
                onClick={onClick}
            >
                <Save size={16} /> {label}
            </button>
        </div>
    );
}
