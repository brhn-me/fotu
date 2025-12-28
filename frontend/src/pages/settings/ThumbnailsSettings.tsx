import { useState, useEffect } from "react";
import { Image, Film, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useSettings } from "../../context/SettingsContext";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { Select } from "../../components/ui/Select";
import { RangeSlider } from "../../components/ui/RangeSlider";
import { Switch } from "../../components/ui/Switch";

export function ThumbnailsSettings() {
    const { settings, updateSettings } = useSettings();

    // Image Thumbs State
    const [imageThumbs, setImageThumbs] = useState({
        format: settings.thumbnailFormat,
        resolution: settings.thumbnailResolution,
        quality: settings.thumbnailQuality
    });

    // Video Previews State
    const [videoAutoplay, setVideoAutoplay] = useState(settings.videoAutoplay);
    const [videoDuration, setVideoDuration] = useState(settings.videoPreviewDuration);
    const [videoResolution, setVideoResolution] = useState(settings.videoResolution);

    useEffect(() => {
        setImageThumbs({
            format: settings.thumbnailFormat,
            resolution: settings.thumbnailResolution,
            quality: settings.thumbnailQuality
        });
        setVideoAutoplay(settings.videoAutoplay);
        setVideoDuration(settings.videoPreviewDuration || 3);
        setVideoResolution(settings.videoResolution || '240p');
    }, [settings]);

    const isImageDirty =
        imageThumbs.format !== settings.thumbnailFormat ||
        imageThumbs.resolution !== settings.thumbnailResolution ||
        imageThumbs.quality !== settings.thumbnailQuality;

    const isVideoDirty =
        videoAutoplay !== settings.videoAutoplay ||
        videoDuration !== settings.videoPreviewDuration ||
        videoResolution !== settings.videoResolution;

    const handleSaveImages = async () => {
        await updateSettings({
            thumbnailFormat: imageThumbs.format,
            thumbnailResolution: imageThumbs.resolution,
            thumbnailQuality: imageThumbs.quality
        }, "Thumbnail settings saved");
    };

    const handleSaveVideos = async () => {
        await updateSettings({
            videoAutoplay,
            videoPreviewDuration: videoDuration,
            videoResolution
        }, "Preview settings saved");
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Thumbnails & Previews</h1>

            <CollapsibleCard
                title="Thumbnails"
                description="Configure generation settings for grid thumbnails."
                icon={<Image size={20} />}
            >
                <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <Select
                            label="Format"
                            value={imageThumbs.format}
                            options={[
                                { value: "jpg", label: "JPG" },
                                { value: "webp", label: "WebP (Recommended)" }
                            ]}
                            onChange={(val) => setImageThumbs(p => ({ ...p, format: val }))}
                        />

                        <Select
                            label="Resolution"
                            value={imageThumbs.resolution}
                            options={[
                                { value: "120p", label: "120p" },
                                { value: "240p", label: "240p" },
                                { value: "360p", label: "360p" }
                            ]}
                            onChange={(val) => setImageThumbs(p => ({ ...p, resolution: val }))}
                        />

                        <RangeSlider
                            label="Quality"
                            value={imageThumbs.quality}
                            min={60}
                            max={100}
                            unit="%"
                            onChange={(val) => setImageThumbs(p => ({ ...p, quality: val }))}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isImageDirty}
                            onClick={handleSaveImages}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>

            <div className={formStyles.spacer} />

            <CollapsibleCard
                title="Previews"
                description="Configure how video previews are generated and behave."
                icon={<Film size={20} />}
            >
                <div>
                    <div className={formStyles.listItem} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <Select
                            label="Preview Resolution"
                            value={videoResolution}
                            options={[
                                { value: "120p", label: "120p" },
                                { value: "240p", label: "240p" },
                                { value: "360p", label: "360p" }
                            ]}
                            onChange={(val) => setVideoResolution(val)}
                        />

                        <RangeSlider
                            label="Preview Duration"
                            value={videoDuration}
                            min={2}
                            max={5}
                            step={1}
                            unit="s"
                            onChange={(val) => setVideoDuration(val)}
                        />
                    </div>

                    <div className={formStyles.listItem} style={{ borderBottom: "none" }}>
                        <Switch
                            label="Auto Play in Gallery"
                            description="Automatically play video previews on hover."
                            checked={videoAutoplay}
                            onChange={setVideoAutoplay}
                        />
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isVideoDirty}
                            onClick={handleSaveVideos}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
