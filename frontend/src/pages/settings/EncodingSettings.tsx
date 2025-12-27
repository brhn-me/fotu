import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import shared from "../../styles/shared.module.css";

export function EncodingSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "var(--text-primary)" }}>Encoding Settings</h1>

            <CollapsibleCard title="Image Encoding" description="Codecs used for image conversion andPreviews.">
                <div className={shared.formGroup}>
                    <label className={shared.label}>Encoder</label>
                    <select className={shared.select} defaultValue="webp">
                        <option value="avif">AVIF (Best Compression)</option>
                        <option value="webp">WebP (Balanced)</option>
                        <option value="jpg">JPG (Max Compatibility)</option>
                    </select>
                </div>
            </CollapsibleCard>

            <CollapsibleCard title="Video Encoding" description="Codecs used for video transcoding.">
                <div className={shared.formGroup}>
                    <label className={shared.label}>Encoder</label>
                    <select className={shared.select} defaultValue="h264">
                        <option value="av1">AV1 (Efficient, Slow)</option>
                        <option value="h265">H.265 / HEVC</option>
                        <option value="h264">H.264 (Compatible)</option>
                    </select>
                </div>
            </CollapsibleCard>
        </div>
    );
}
