import { FileCode, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";

const RAW_FORMATS = ["GPR", "NEF", "CR2", "CR3", "ARW", "RAF", "ORF", "DNG"];

export function RawSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Raw Conversion</h1>

            <CollapsibleCard
                title="Supported Formats"
                description="Select which RAW formats to process and index."
                icon={<FileCode size={20} />}
            >
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                        {RAW_FORMATS.map(fmt => (
                            <label key={fmt} className={formStyles.checkboxWrapper}>
                                <input type="checkbox" defaultChecked className={formStyles.checkbox} />
                                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{fmt}</span>
                            </label>
                        ))}
                    </div>

                    <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
                        <button className={formStyles.saveButton}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
