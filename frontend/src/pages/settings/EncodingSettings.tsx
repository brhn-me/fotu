import { useState, useEffect } from "react";
import { Image, Video, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";

const DEFAULT_IMAGE_ENC = "webp";
const DEFAULT_VIDEO_ENC = "h264";

export function EncodingSettings() {
    const [imageEnc, setImageEnc] = useState(DEFAULT_IMAGE_ENC);
    const [videoEnc, setVideoEnc] = useState(DEFAULT_VIDEO_ENC);

    const [imageDirty, setImageDirty] = useState(false);
    const [videoDirty, setVideoDirty] = useState(false);

    useEffect(() => {
        setImageDirty(imageEnc !== DEFAULT_IMAGE_ENC);
    }, [imageEnc]);

    useEffect(() => {
        setVideoDirty(videoEnc !== DEFAULT_VIDEO_ENC);
    }, [videoEnc]);

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Encoding Settings</h1>

            <CollapsibleCard
                title="Image Encoding"
                description="Codecs used for image conversion and previews."
                icon={<Image size={20} />}
            >
                <div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Encoder</label>
                        <select
                            className={formStyles.select}
                            value={imageEnc}
                            onChange={(e) => setImageEnc(e.target.value)}
                        >
                            <option value="avif">AVIF (Best Compression)</option>
                            <option value="webp">WebP (Balanced)</option>
                            <option value="jpg">JPG (Max Compatibility)</option>
                        </select>
                    </div>

                    <div className={cardStyles.footer}>
                        <button className={formStyles.saveButton} disabled={!imageDirty}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>

            <CollapsibleCard
                title="Video Encoding"
                description="Codecs used for video transcoding."
                icon={<Video size={20} />}
            >
                <div>
                    <div className={formStyles.formGroup}>
                        <label className={formStyles.label}>Encoder</label>
                        <select
                            className={formStyles.select}
                            value={videoEnc}
                            onChange={(e) => setVideoEnc(e.target.value)}
                        >
                            <option value="av1">AV1 (Efficient, Slow)</option>
                            <option value="h265">H.265 / HEVC</option>
                            <option value="h264">H.264 (Compatible)</option>
                        </select>
                    </div>

                    <div className={cardStyles.footer}>
                        <button className={formStyles.saveButton} disabled={!videoDirty}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
