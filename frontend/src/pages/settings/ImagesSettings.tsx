import { useState, useEffect } from "react";
import { Image, Monitor, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";

// Interface for settings state
interface ImageConfig {
    format: string;
    resolution: string;
    quality: number;
}

const DEFAULT_THUMBS: ImageConfig = { format: "webp", resolution: "480p", quality: 80 };
const DEFAULT_PREVIEW: ImageConfig = { format: "webp", resolution: "1080p", quality: 90 };

export function ImagesSettings() {
    // Thumbnails State
    const [thumbsConfig, setThumbsConfig] = useState<ImageConfig>(DEFAULT_THUMBS);
    const [thumbsDirty, setThumbsDirty] = useState(false);

    // Preview State
    const [previewConfig, setPreviewConfig] = useState<ImageConfig>(DEFAULT_PREVIEW);
    const [previewDirty, setPreviewDirty] = useState(false);

    // Check for changes
    useEffect(() => {
        const isThumbsChanged = JSON.stringify(thumbsConfig) !== JSON.stringify(DEFAULT_THUMBS);
        setThumbsDirty(isThumbsChanged);
    }, [thumbsConfig]);

    useEffect(() => {
        const isPreviewChanged = JSON.stringify(previewConfig) !== JSON.stringify(DEFAULT_PREVIEW);
        setPreviewDirty(isPreviewChanged);
    }, [previewConfig]);

    const handleThumbsChange = (field: keyof ImageConfig, value: string | number) => {
        setThumbsConfig(prev => ({ ...prev, [field]: value }));
    };

    const handlePreviewChange = (field: keyof ImageConfig, value: string | number) => {
        setPreviewConfig(prev => ({ ...prev, [field]: value }));
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
                            onChange={(e) => handleThumbsChange("format", e.target.value)}
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
                            onChange={(e) => handleThumbsChange("resolution", e.target.value)}
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
                            onChange={(e) => handleThumbsChange("quality", parseInt(e.target.value))}
                            className={formStyles.input}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button className={formStyles.saveButton} disabled={!thumbsDirty}>
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
                            onChange={(e) => handlePreviewChange("format", e.target.value)}
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
                            onChange={(e) => handlePreviewChange("resolution", e.target.value)}
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
                            onChange={(e) => handlePreviewChange("quality", parseInt(e.target.value))}
                            className={formStyles.input}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button className={formStyles.saveButton} disabled={!previewDirty}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
