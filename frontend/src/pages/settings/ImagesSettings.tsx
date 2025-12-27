import { useState, useEffect } from "react";
import { Image, Monitor } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useSettings } from "../../context/SettingsContext";
import formStyles from "../../styles/Form.module.css";
import { Select } from "../../components/ui/Select";
import { RangeSlider } from "../../components/ui/RangeSlider";
import { SaveButton } from "../../components/ui/SaveButton";

export function ImagesSettings() {
    const { settings, updateSettings } = useSettings();

    // Local state for form handling, initialized from settings
    const [thumbsConfig, setThumbsConfig] = useState({
        format: settings.thumbnailFormat,
        resolution: settings.thumbnailResolution,
        quality: settings.thumbnailQuality
    });

    const [previewConfig, setPreviewConfig] = useState({
        format: settings.previewFormat,
        resolution: settings.previewResolution,
        quality: settings.previewQuality
    });

    // Update local state when settings load
    useEffect(() => {
        setThumbsConfig({
            format: settings.thumbnailFormat,
            resolution: settings.thumbnailResolution,
            quality: settings.thumbnailQuality
        });
        setPreviewConfig({
            format: settings.previewFormat,
            resolution: settings.previewResolution,
            quality: settings.previewQuality
        });
    }, [settings]);

    const isThumbsDirty =
        thumbsConfig.format !== settings.thumbnailFormat ||
        thumbsConfig.resolution !== settings.thumbnailResolution ||
        thumbsConfig.quality !== settings.thumbnailQuality;

    const isPreviewDirty =
        previewConfig.format !== settings.previewFormat ||
        previewConfig.resolution !== settings.previewResolution ||
        previewConfig.quality !== settings.previewQuality;

    const handleSaveThumbs = async () => {
        await updateSettings({
            thumbnailFormat: thumbsConfig.format,
            thumbnailResolution: thumbsConfig.resolution,
            thumbnailQuality: thumbsConfig.quality
        });
    };

    const handleSavePreview = async () => {
        await updateSettings({
            previewFormat: previewConfig.format,
            previewResolution: previewConfig.resolution,
            previewQuality: previewConfig.quality
        });
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Image Settings</h1>

            <CollapsibleCard
                title="Thumbnails"
                description="Configure generation settings for grid thumbnails."
                icon={<Image size={20} />}
            >
                <div>
                    <Select
                        label="Format"
                        value={thumbsConfig.format}
                        options={[
                            { value: "jpg", label: "JPG" },
                            { value: "webp", label: "WebP (Recommended)" }
                        ]}
                        onChange={(val) => setThumbsConfig(p => ({ ...p, format: val }))}
                    />

                    <Select
                        label="Resolution"
                        value={thumbsConfig.resolution}
                        options={[
                            { value: "360p", label: "360p (Low)" },
                            { value: "480p", label: "480p (Standard)" },
                            { value: "720p", label: "720p (High)" }
                        ]}
                        onChange={(val) => setThumbsConfig(p => ({ ...p, resolution: val }))}
                    />

                    <RangeSlider
                        label="Quality"
                        value={thumbsConfig.quality}
                        min={60}
                        max={100}
                        unit="%"
                        onChange={(val) => setThumbsConfig(p => ({ ...p, quality: val }))}
                    />

                    <SaveButton
                        onClick={handleSaveThumbs}
                        disabled={!isThumbsDirty}
                    />
                </div>
            </CollapsibleCard>

            <div className={formStyles.spacer} />

            <CollapsibleCard
                title="Full Preview"
                description="Settings for high-quality single view previews."
                icon={<Monitor size={20} />}
            >
                <div>
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

                    <SaveButton
                        onClick={handleSavePreview}
                        disabled={!isPreviewDirty}
                    />
                </div>
            </CollapsibleCard>
        </div>
    );
}
