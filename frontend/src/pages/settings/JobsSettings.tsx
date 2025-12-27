import { useState } from "react";
import { Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import shared from "../../styles/shared.module.css";
import { JOBS_DATA } from "../jobs/jobsData";

// Initial concurrency config based on available jobs
const INITIAL_CONFIG = JOBS_DATA.map(job => ({
    id: job.id,
    name: job.title,
    concurrency: 2, // Default
    description: job.description
}));

export function JobsSettings() {
    const [configs, setConfigs] = useState(INITIAL_CONFIG);

    const handleConcurrencyChange = (id: string, value: number) => {
        setConfigs(prev => prev.map(c =>
            c.id === id ? { ...c, concurrency: Math.max(1, Math.min(32, value)) } : c
        ));
    };

    const handleSave = () => {
        console.log("Saving job configs:", configs);
    };

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "var(--text-primary)" }}>Jobs Settings</h1>

            <CollapsibleCard title="Concurrency" description="Adjust worker threads and parallel processing limits per job type.">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {configs.map(config => (
                        <div key={config.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                            <div style={{ flex: 1, paddingRight: "16px" }}>
                                <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>{config.name}</div>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>{config.description}</div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <button
                                    onClick={() => handleConcurrencyChange(config.id, config.concurrency - 1)}
                                    style={{
                                        width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border-subtle)",
                                        background: "var(--bg-surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "var(--text-primary)"
                                    }}
                                >-</button>
                                <div style={{ width: 24, textAlign: "center", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{config.concurrency}</div>
                                <button
                                    onClick={() => handleConcurrencyChange(config.id, config.concurrency + 1)}
                                    style={{
                                        width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border-subtle)",
                                        background: "var(--bg-surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "var(--text-primary)"
                                    }}
                                >+</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={handleSave} className={`${shared.btn} ${shared.btnPrimary}`}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>
        </div>
    );
}
