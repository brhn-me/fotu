import { Play, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";

export function VideosSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Video Settings</h1>

            <CollapsibleCard
                title="Playback"
                description="Settings for video playback and streaming."
                icon={<Play size={20} />}
            >
                <div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic", marginBottom: "20px" }}>
                        Video configuration options coming soon.
                    </div>

                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                        <button className={formStyles.saveButton} disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
