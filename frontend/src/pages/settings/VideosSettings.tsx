import { CollapsibleCard } from "../../components/ui/CollapsibleCard";

export function VideosSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "var(--text-primary)" }}>Video Settings</h1>

            <CollapsibleCard title="Playback" description="Settings for video playback and streaming.">
                <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
                    Video configuration options coming soon.
                </div>
            </CollapsibleCard>
        </div>
    );
}
