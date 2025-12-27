import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import shared from "../../styles/shared.module.css";

export function ImagesSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "var(--text-primary)" }}>Image Settings</h1>

            <CollapsibleCard title="Thumbnails" description="Configure generation settings for grid thumbnails.">
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className={shared.formGroup}>
                        <label className={shared.label}>Format</label>
                        <select className={shared.select} defaultValue="webp">
                            <option value="jpg">JPG</option>
                            <option value="webp">WebP (Recommended)</option>
                        </select>
                    </div>

                    <div className={shared.formGroup}>
                        <label className={shared.label}>Resolution</label>
                        <select className={shared.select} defaultValue="480p">
                            <option value="360p">360p (Low)</option>
                            <option value="480p">480p (Standard)</option>
                            <option value="720p">720p (High)</option>
                        </select>
                    </div>

                    <div className={shared.formGroup}>
                        <label className={shared.label}>Quality (60-100)</label>
                        <input type="number" min="60" max="100" defaultValue="80" className={shared.input} />
                    </div>
                </div>
            </CollapsibleCard>

            <CollapsibleCard title="Full Preview" description="Settings for high-quality single view previews.">
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className={shared.formGroup}>
                        <label className={shared.label}>Format</label>
                        <select className={shared.select} defaultValue="webp">
                            <option value="jpg">JPG</option>
                            <option value="webp">WebP (Recommended)</option>
                        </select>
                    </div>

                    <div className={shared.formGroup}>
                        <label className={shared.label}>Resolution</label>
                        <select className={shared.select} defaultValue="1080p">
                            <option value="720p">720p</option>
                            <option value="1080p">1080p (HD)</option>
                            <option value="1440p">1440p (QHD)</option>
                        </select>
                    </div>

                    <div className={shared.formGroup}>
                        <label className={shared.label}>Quality (60-100)</label>
                        <input type="number" min="60" max="100" defaultValue="90" className={shared.input} />
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
