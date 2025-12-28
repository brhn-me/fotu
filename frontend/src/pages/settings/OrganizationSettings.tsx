import { useState, useEffect } from "react";
import { FolderTree, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { useSettings } from "../../context/SettingsContext";
import { Input } from "../../components/ui/Input";

export function OrganizationSettings() {
    const { settings, updateSettings } = useSettings();
    const [albumStructure, setAlbumStructure] = useState(settings.albumStructure);

    useEffect(() => {
        setAlbumStructure(settings.albumStructure);
    }, [settings.albumStructure]);

    const isDirty = albumStructure !== settings.albumStructure;
    const [error, setError] = useState<string | null>(null);

    const validatePattern = (pattern: string) => {
        if (!pattern.trim()) return "Pattern cannot be empty.";
        if (pattern.includes("..")) return "Relative paths (..) are not allowed.";

        // Check for valid characters: Alphanumeric, spaces, underscores, dashes, slashes, and braces
        if (!/^[\w\s\-\/\{\}]+$/.test(pattern)) return "Contains invalid characters. Only letters, numbers, spaces, -, _, /, and {} are allowed.";

        // specific check for balanced braces and valid placeholders
        const placeholders = pattern.match(/\{[^}]+\}/g) || [];
        const validPlaceholders = ["{yyyy}", "{mm}", "{dd}", "{yyyy-mm-dd}"];

        for (const p of placeholders) {
            if (!validPlaceholders.includes(p)) {
                return `Invalid placeholder: ${p}`;
            }
        }

        // Check for unbalanced braces
        const openBraces = (pattern.match(/\{/g) || []).length;
        const closeBraces = (pattern.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) return "Unbalanced braces.";

        return null;
    };

    const handleSave = async () => {
        const validationError = validatePattern(albumStructure);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        await updateSettings({ albumStructure }, "Organization settings saved");
    };

    const handleChange = (val: string) => {
        setAlbumStructure(val);
        if (error) setError(null); // Clear error on change
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Organization</h1>

            <CollapsibleCard
                title="Album Structure"
                description="Define how imported photos are organized into folders."
                icon={<FolderTree size={20} />}
            >
                <div>
                    <Input
                        label="Directory Pattern"
                        value={albumStructure}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="{yyyy}/{yyyy-mm-dd}"
                        error={error || undefined}
                    />

                    <div className={formStyles.placeholderSection}>
                        <p className={formStyles.placeholderTitle}>
                            Available Placeholders
                        </p>
                        <div className={formStyles.placeholderGrid}>
                            <div className={formStyles.placeholderRow}>
                                <code className={formStyles.placeholderCode}>{"{yyyy}"}</code>
                                <span className={formStyles.placeholderDesc}>Year 2024</span>
                            </div>
                            <div className={formStyles.placeholderRow}>
                                <code className={formStyles.placeholderCode}>{"{mm}"}</code>
                                <span className={formStyles.placeholderDesc}>Month 01-12</span>
                            </div>
                            <div className={formStyles.placeholderRow}>
                                <code className={formStyles.placeholderCode}>{"{dd}"}</code>
                                <span className={formStyles.placeholderDesc}>Day 01-31</span>
                            </div>
                            <div className={formStyles.placeholderRow}>
                                <code className={formStyles.placeholderCode}>{"{yyyy-mm-dd}"}</code>
                                <span className={formStyles.placeholderDesc}>ISO Date 2024-01-25</span>
                            </div>
                        </div>
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isDirty || !!error}
                            onClick={handleSave}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
