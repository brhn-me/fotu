import { useState, useEffect } from "react";
import { FileCode, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { useSettings } from "../../context/SettingsContext";
import { Switch } from "../../components/ui/Switch";
import { Checkbox } from "../../components/ui/Checkbox";

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
        }, "Raw format settings saved");
        setFormatsDirty(false);
    };

    const handleSaveDarktable = async () => {
        await updateSettings({
            darktableEnabled: String(darktableEnabled) as any,
            useSidecar: String(useSidecar) as any
        }, "Darktable settings saved");
    };

    const isDarktableDirty = darktableEnabled !== settings.darktableEnabled || useSidecar !== settings.useSidecar;

    return (
        <div className={formStyles.pageContainer}>
            <CollapsibleCard
                title="Supported Formats"
                description="Select which RAW formats to process and index."
                icon={<FileCode size={20} />}
            >
                <div className={formStyles.grid}>
                    {RAW_FORMATS.map(fmt => (
                        <Checkbox
                            key={fmt}
                            label={fmt}
                            description={FORMAT_DESCRIPTIONS[fmt]}
                            checked={enabledFormats.includes(fmt)}
                            onChange={() => handleToggleFormat(fmt)}
                        />
                    ))}
                </div>

                <div className={cardStyles.footer}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!formatsDirty}
                        onClick={handleSaveFormats}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>

            <div className={formStyles.spacer} />

            <CollapsibleCard
                title="Darktable & Sidecar"
                description="Configure external raw processing based on Darktable."
                icon={<FileCode size={20} />}
            >
                <Switch
                    label="Enable Darktable CLI"
                    description="Uses local darktable-cli installation for high-quality raw conversion."
                    checked={darktableEnabled}
                    onChange={setDarktableEnabled}
                />

                <div className={formStyles.divider} />

                <Switch
                    label="Use Sidecar XMP Profiles"
                    description="If a .xmp file exists next to the raw file, use it for processing parameters."
                    checked={useSidecar}
                    onChange={setUseSidecar}
                />

                <div className={cardStyles.footer}>
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
