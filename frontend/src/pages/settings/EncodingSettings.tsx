import { useState, useEffect } from "react";
import { Image, Video, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { useSettings } from "../../context/SettingsContext";

export function EncodingSettings() {
    const { settings, updateSettings } = useSettings();

    const [imageEnc, setImageEnc] = useState(settings.imageEncoder);
    const [videoEnc, setVideoEnc] = useState(settings.videoEncoder);

    useEffect(() => {
        setImageEnc(settings.imageEncoder);
        setVideoEnc(settings.videoEncoder);
    }, [settings]);

    const imageDirty = imageEnc !== settings.imageEncoder;
    const videoDirty = videoEnc !== settings.videoEncoder;

    const handleSaveImage = () => {
        updateSettings({ imageEncoder: imageEnc });
    };

    const handleSaveVideo = () => {
        updateSettings({ videoEncoder: videoEnc });
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Encoding Settings</h1>

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
                        <button
                            className={formStyles.saveButton}
                            disabled={!imageDirty}
                            onClick={handleSaveImage}
                        >
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
                        <button
                            className={formStyles.saveButton}
                            disabled={!videoDirty}
                            onClick={handleSaveVideo}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
