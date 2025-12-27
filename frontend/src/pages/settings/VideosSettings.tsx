import { useState, useEffect } from "react";
import { Play, Save, Film } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import { useSettings } from "../../context/SettingsContext";

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
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Video Settings</h1>

            {/* Playback Card */}
            <CollapsibleCard
                title="Playback"
                description="Manage how videos behave in the library."
                icon={<Play size={20} />}
            >
                <div className={formStyles.switchRow}>
                    <div className={formStyles.switchText}>
                        <div className={formStyles.switchLabel}>Auto Play in Gallery</div>
                        <div className={formStyles.switchDescription}>Automatically play videos on hover or when visible in the grid.</div>
                    </div>
                    <label>
                        <input
                            type="checkbox"
                            className={formStyles.switchInput}
                            checked={autoplay}
                            onChange={(e) => setAutoplay(e.target.checked)}
                        />
                        <span className={formStyles.switchToggle}></span>
                    </label>
                </div>

                <div className={formStyles.cardFooter}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!isPlaybackDirty}
                        onClick={handleSavePlayback}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>

            <div style={{ height: "24px" }} />

            {/* Transcoding Card */}
            <CollapsibleCard
                title="Transcoding"
                description="Configure quality and duration for generated video previews."
                icon={<Film size={20} />}
            >
                <div className={formStyles.formGroup}>
                    <label className={formStyles.label}>Video Resolution</label>
                    <select
                        className={formStyles.select}
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                    >
                        <option value="360p">360p</option>
                        <option value="480p">480p</option>
                        <option value="720p">720p</option>
                    </select>
                </div>

                <div className={formStyles.formGroup}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label className={formStyles.label}>Video Preview Duration</label>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--accent-primary)" }}>{previewDuration}s</span>
                    </div>
                    <input
                        type="range"
                        min="3"
                        max="10"
                        step="1"
                        value={previewDuration}
                        onChange={(e) => setPreviewDuration(Number(e.target.value))}
                        style={{ width: "100%", cursor: "pointer", accentColor: "var(--accent-primary)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                        <span>3s</span>
                        <span>10s</span>
                    </div>
                </div>

                <div className={formStyles.cardFooter}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!isTranscodingDirty}
                        onClick={handleSaveTranscoding}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>
        </div>
    );
}
