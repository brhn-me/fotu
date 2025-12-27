import { useState, useEffect } from "react";
import { Save, Cpu } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
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
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const hasChanges = JSON.stringify(configs) !== JSON.stringify(INITIAL_CONFIG);
        setIsDirty(hasChanges);
    }, [configs]);

    const handleConcurrencyChange = (id: string, value: number) => {
        setConfigs(prev => prev.map(c =>
            c.id === id ? { ...c, concurrency: Math.max(1, Math.min(32, value)) } : c
        ));
    };

    const handleSave = () => {
        console.log("Saving job configs:", configs);
        // Simulate save
        setIsDirty(false);
    };

    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Jobs Settings</h1>

            <CollapsibleCard
                title="Concurrency"
                description="Adjust worker threads and parallel processing limits per job type."
                icon={<Cpu size={20} />}
            >
                <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {configs.map(config => (
                            <div key={config.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                <div style={{ flex: 1, paddingRight: "16px" }}>
                                    <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>{config.name}</div>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>{config.description}</div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <button
                                        onClick={() => handleConcurrencyChange(config.id, config.concurrency - 1)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)",
                                            background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "var(--text-primary)", fontSize: "16px", transition: "all 0.2s"
                                        }}
                                    >−</button>
                                    <div style={{ width: 32, textAlign: "center", fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{config.concurrency}</div>
                                    <button
                                        onClick={() => handleConcurrencyChange(config.id, config.concurrency + 1)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)",
                                            background: "var(--bg-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "var(--text-primary)", fontSize: "16px", transition: "all 0.2s"
                                        }}
                                    >+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={cardStyles.footer}>
                        <button onClick={handleSave} className={formStyles.saveButton} disabled={!isDirty}>
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
