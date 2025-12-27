import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import shared from "../../styles/shared.module.css";

const RAW_FORMATS = ["GPR", "NEF", "CR2", "CR3", "ARW", "RAF", "ORF", "DNG"];

export function RawSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "var(--text-primary)" }}>Raw Conversion</h1>

            <CollapsibleCard title="Supported Formats" description="Select which RAW formats to process and index.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
                    {RAW_FORMATS.map(fmt => (
                        <label key={fmt} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--text-primary)", fontSize: "14px" }}>
                            <input type="checkbox" defaultChecked className={shared.checkbox} />
                            {fmt}
                        </label>
                    ))}
                </div>
            </CollapsibleCard>
        </div>
    );
}
