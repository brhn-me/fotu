import { useState, useEffect } from "react";
import { Play, Film } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { useSettings } from "../../context/SettingsContext";
import formStyles from "../../styles/Form.module.css";
import { Switch } from "../../components/ui/Switch";
import { Select } from "../../components/ui/Select";
import { RangeSlider } from "../../components/ui/RangeSlider";
import { SaveButton } from "../../components/ui/SaveButton";

export function VideosSettings() {
    const { settings, updateSettings } = useSettings();

    // Playback State
    const [autoplay, setAutoplay] = useState(settings.videoAutoplay);
    // Transcoding State
    const [previewDuration, setPreviewDuration] = useState(settings.videoPreviewDuration);
    const [resolution, setResolution] = useState(settings.videoResolution);

    // Sync from settings
    useEffect(() => {
        setAutoplay(settings.videoAutoplay);
        setPreviewDuration(settings.videoPreviewDuration || 4);
        setResolution(settings.videoResolution || '720p');
    }, [settings]);

    const isPlaybackDirty = autoplay !== settings.videoAutoplay;
    const isTranscodingDirty = previewDuration !== settings.videoPreviewDuration || resolution !== settings.videoResolution;

    const handleSavePlayback = async () => {
        await updateSettings({ videoAutoplay: autoplay });
    };

    const handleSaveTranscoding = async () => {
        await updateSettings({
            videoPreviewDuration: previewDuration,
            videoResolution: resolution
        });
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Video Settings</h1>

            {/* Playback Card */}
            <CollapsibleCard
                title="Playback"
                description="Manage how videos behave in the library."
                icon={<Play size={20} />}
            >
                <Switch
                    label="Auto Play in Gallery"
                    description="Automatically play videos on hover or when visible in the grid."
                    checked={autoplay}
                    onChange={setAutoplay}
                />

                <SaveButton
                    onClick={handleSavePlayback}
                    disabled={!isPlaybackDirty}
                />
            </CollapsibleCard>

            <div className={formStyles.spacer} />

            {/* Transcoding Card */}
            <CollapsibleCard
                title="Transcoding"
                description="Configure quality and duration for generated video previews."
                icon={<Film size={20} />}
            >
                <Select
                    label="Video Resolution"
                    value={resolution}
                    options={[
                        { value: "360p", label: "360p" },
                        { value: "480p", label: "480p" },
                        { value: "720p", label: "720p" }
                    ]}
                    onChange={(val) => setResolution(val)}
                />

                <RangeSlider
                    label="Video Preview Duration"
                    value={previewDuration}
                    min={3}
                    max={10}
                    step={1}
                    unit="s"
                    onChange={(val) => setPreviewDuration(val)}
                />

                <SaveButton
                    onClick={handleSaveTranscoding}
                    disabled={!isTranscodingDirty}
                />
            </CollapsibleCard>
        </div>
    );
}
