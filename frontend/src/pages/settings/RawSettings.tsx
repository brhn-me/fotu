import { useState, useEffect } from "react";
import { FileCode, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import { useSettings } from "../../context/SettingsContext";

const RAW_FORMATS = ["GPR", "NEF", "CR2", "CR3", "ARW", "RAF", "ORF", "DNG"];

const FORMAT_DESCRIPTIONS: Record<string, string> = {
    GPR: "GoPro Raw",
    NEF: "Nikon Electronic Format",
    CR2: "Canon Raw 2",
    CR3: "Canon Raw 3",
    ARW: "Sony Alpha Raw",
    RAF: "Fujifilm Raw",
    ORF: "Olympus Raw Format",
    DNG: "Digital Negative"
};

export function RawSettings() {
    const { settings, updateSettings } = useSettings();

    // State for Formats
    const [enabledFormats, setEnabledFormats] = useState<string[]>([]);
    const [formatsDirty, setFormatsDirty] = useState(false);

    // State for Darktable/Sidecar
    const [darktableEnabled, setDarktableEnabled] = useState(settings.darktableEnabled);
    const [useSidecar, setUseSidecar] = useState(settings.useSidecar);

    useEffect(() => {
        try {
            const parsed = JSON.parse(settings.rawFormats || '[]');
            setEnabledFormats(parsed);
            setFormatsDirty(false); // Reset dirty on source update
        } catch (e) {
            setEnabledFormats([]);
        }
    }, [settings.rawFormats]);

    useEffect(() => {
        setDarktableEnabled(settings.darktableEnabled);
        setUseSidecar(settings.useSidecar);
    }, [settings.darktableEnabled, settings.useSidecar]);

    const handleToggleFormat = (fmt: string) => {
        const newFormats = enabledFormats.includes(fmt)
            ? enabledFormats.filter(f => f !== fmt)
            : [...enabledFormats, fmt];
        setEnabledFormats(newFormats);
        setFormatsDirty(true);
    };

    const handleSaveFormats = async () => {
        await updateSettings({
            rawFormats: JSON.stringify(enabledFormats)
        });
        setFormatsDirty(false);
    };

    const handleSaveDarktable = async () => {
        await updateSettings({
            darktableEnabled: String(darktableEnabled) as any,
            useSidecar: String(useSidecar) as any
        });
    };

    const isDarktableDirty = darktableEnabled !== settings.darktableEnabled || useSidecar !== settings.useSidecar;

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Raw Conversion</h1>

            <CollapsibleCard
                title="Supported Formats"
                description="Select which RAW formats to process and index."
                icon={<FileCode size={20} />}
            >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                    {RAW_FORMATS.map(fmt => (
                        <label key={fmt} className={formStyles.checkboxWrapperRow}>
                            <input
                                type="checkbox"
                                checked={enabledFormats.includes(fmt)}
                                onChange={() => handleToggleFormat(fmt)}
                                className={formStyles.checkbox}
                                style={{ marginTop: "2px" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{fmt}</span>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{FORMAT_DESCRIPTIONS[fmt]}</span>
                            </div>
                        </label>
                    ))}
                </div>

                <div className={formStyles.cardFooter}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!formatsDirty}
                        onClick={handleSaveFormats}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>

            <div style={{ height: "24px" }} />

            <CollapsibleCard
                title="Darktable & Sidecar"
                description="Configure external raw processing based on Darktable."
                icon={<FileCode size={20} />}
            >
                <div className={formStyles.switchRow}>
                    <div className={formStyles.switchText}>
                        <div className={formStyles.switchLabel}>Enable Darktable CLI</div>
                        <div className={formStyles.switchDescription}>Uses local darktable-cli installation for high-quality raw conversion.</div>
                    </div>
                    <label>
                        <input
                            type="checkbox"
                            className={formStyles.switchInput}
                            checked={darktableEnabled}
                            onChange={(e) => setDarktableEnabled(e.target.checked)}
                        />
                        <span className={formStyles.switchToggle}></span>
                    </label>
                </div>

                <div style={{ height: "1px", background: "var(--border-subtle)", margin: "8px 0" }} />

                <div className={formStyles.switchRow}>
                    <div className={formStyles.switchText}>
                        <div className={formStyles.switchLabel}>Use Sidecar XMP Profiles</div>
                        <div className={formStyles.switchDescription}>If a .xmp file exists next to the raw file, use it for processing parameters.</div>
                    </div>
                    <label>
                        <input
                            type="checkbox"
                            className={formStyles.switchInput}
                            checked={useSidecar}
                            onChange={(e) => setUseSidecar(e.target.checked)}
                        />
                        <span className={formStyles.switchToggle}></span>
                    </label>
                </div>

                <div className={formStyles.cardFooter}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!isDarktableDirty}
                        onClick={handleSaveDarktable}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>
        </div>
    );
}
