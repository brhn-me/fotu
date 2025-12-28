import { useState, useEffect } from "react";
import { Monitor, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useSettings } from "../../context/SettingsContext";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { Select } from "../../components/ui/Select";
import { RangeSlider } from "../../components/ui/RangeSlider";

export function LightboxSettings() {
    const { settings, updateSettings } = useSettings();

    const [previewConfig, setPreviewConfig] = useState({
        format: settings.previewFormat,
        resolution: settings.previewResolution,
        quality: settings.previewQuality
    });

    useEffect(() => {
        setPreviewConfig({
            format: settings.previewFormat,
            resolution: settings.previewResolution,
            quality: settings.previewQuality
        });
    }, [settings]);

    const isPreviewDirty =
        previewConfig.format !== settings.previewFormat ||
        previewConfig.resolution !== settings.previewResolution ||
        previewConfig.quality !== settings.previewQuality;

    const handleSave = async () => {
        await updateSettings({
            previewFormat: previewConfig.format,
            previewResolution: previewConfig.resolution,
            previewQuality: previewConfig.quality
        }, "Lightbox settings saved");
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Lightbox Settings</h1>

            <CollapsibleCard
                title="Full Preview"
                description="Settings for high-quality single view previews (Lightbox)."
                icon={<Monitor size={20} />}
            >
                <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <Select
                            label="Format"
                            value={previewConfig.format}
                            options={[
                                { value: "jpg", label: "JPG" },
                                { value: "webp", label: "WebP (Recommended)" }
                            ]}
                            onChange={(val) => setPreviewConfig(p => ({ ...p, format: val }))}
                        />

                        <Select
                            label="Resolution"
                            value={previewConfig.resolution}
                            options={[
                                { value: "720p", label: "720p" },
                                { value: "1080p", label: "1080p (HD)" },
                                { value: "1440p", label: "1440p (QHD)" }
                            ]}
                            onChange={(val) => setPreviewConfig(p => ({ ...p, resolution: val }))}
                        />

                        <RangeSlider
                            label="Quality"
                            value={previewConfig.quality}
                            min={60}
                            max={100}
                            unit="%"
                            onChange={(val) => setPreviewConfig(p => ({ ...p, quality: val }))}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isPreviewDirty}
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
