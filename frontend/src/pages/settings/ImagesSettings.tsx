import { useState, useEffect } from "react";
import { Image, Monitor, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { useSettings } from "../../context/SettingsContext";

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
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Image Settings</h1>

            <CollapsibleCard
                title="Thumbnails"
                description="Configure generation settings for grid thumbnails."
                icon={<Image size={20} />}
            >
                <div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Format</label>
                        <select
                            className={formStyles.select}
                            value={thumbsConfig.format}
                            onChange={(e) => setThumbsConfig(p => ({ ...p, format: e.target.value }))}
                        >
                            <option value="jpg">JPG</option>
                            <option value="webp">WebP (Recommended)</option>
                        </select>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Resolution</label>
                        <select
                            className={formStyles.select}
                            value={thumbsConfig.resolution}
                            onChange={(e) => setThumbsConfig(p => ({ ...p, resolution: e.target.value }))}
                        >
                            <option value="360p">360p (Low)</option>
                            <option value="480p">480p (Standard)</option>
                            <option value="720p">720p (High)</option>
                        </select>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Quality (60-100)</label>
                        <input
                            type="number"
                            min="60"
                            max="100"
                            value={thumbsConfig.quality}
                            onChange={(e) => setThumbsConfig(p => ({ ...p, quality: parseInt(e.target.value) }))}
                            className={formStyles.input}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isThumbsDirty}
                            onClick={handleSaveThumbs}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>

            <CollapsibleCard
                title="Full Preview"
                description="Settings for high-quality single view previews."
                icon={<Monitor size={20} />}
            >
                <div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Format</label>
                        <select
                            className={formStyles.select}
                            value={previewConfig.format}
                            onChange={(e) => setPreviewConfig(p => ({ ...p, format: e.target.value }))}
                        >
                            <option value="jpg">JPG</option>
                            <option value="webp">WebP (Recommended)</option>
                        </select>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Resolution</label>
                        <select
                            className={formStyles.select}
                            value={previewConfig.resolution}
                            onChange={(e) => setPreviewConfig(p => ({ ...p, resolution: e.target.value }))}
                        >
                            <option value="720p">720p</option>
                            <option value="1080p">1080p (HD)</option>
                            <option value="1440p">1440p (QHD)</option>
                        </select>
                    </div>

                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Quality (60-100)</label>
                        <input
                            type="number"
                            min="60"
                            max="100"
                            value={previewConfig.quality}
                            onChange={(e) => setPreviewConfig(p => ({ ...p, quality: parseInt(e.target.value) }))}
                            className={formStyles.input}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isPreviewDirty}
                            onClick={handleSavePreview}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
