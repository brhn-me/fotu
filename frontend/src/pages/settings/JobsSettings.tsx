import { useState, useEffect } from "react";
import { Cpu, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { JOBS_DATA } from "../jobs/jobsData";
import { useSettings } from "../../context/SettingsContext";
import { NumberStepper } from "../../components/ui/NumberStepper";

export function JobsSettings() {
    const { settings, updateSettings } = useSettings();
    const [configs, setConfigs] = useState<any[]>([]);

    // Initialize configs from settings or defaults
    useEffect(() => {
        let savedConfigs = [];
        try {
            savedConfigs = JSON.parse(settings.jobsConcurrency || '[]');
        } catch (e) {
            console.error("Failed to parse jobs config", e);
        }

        // Merge saved configs with JOBS_DATA to ensure all jobs exist
        const merged = JOBS_DATA.map(job => {
            const saved = savedConfigs.find((s: any) => s.id === job.id);
            return {
                id: job.id,
                name: job.title,
                concurrency: saved ? saved.concurrency : 2, // Default
                description: job.description
            };
        });

        setConfigs(merged);
    }, [settings.jobsConcurrency]);

    const isDirty = (() => {
        try {
            const currentSaved = JSON.parse(settings.jobsConcurrency || '[]');

            const serverEffective = JOBS_DATA.map(job => {
                const saved = currentSaved.find((s: any) => s.id === job.id);
                return { id: job.id, concurrency: saved ? saved.concurrency : 2 };
            });
            const serverEffectiveJson = JSON.stringify(serverEffective);

            const currentEffective = configs.map(c => ({ id: c.id, concurrency: c.concurrency }));
            const currentEffectiveJson = JSON.stringify(currentEffective);

            return serverEffectiveJson !== currentEffectiveJson;

        } catch (e) {
            return false;
        }
    })();

    const handleConcurrencyChange = (id: string, value: number) => {
        setConfigs(prev => prev.map(c =>
            c.id === id ? { ...c, concurrency: Math.max(1, Math.min(32, value)) } : c
        ));
    };

    const handleSave = () => {
        const toSave = configs.map(c => ({ id: c.id, concurrency: c.concurrency }));
        updateSettings({ jobsConcurrency: JSON.stringify(toSave) });
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Jobs Settings</h1>

            <CollapsibleCard
                title="Concurrency"
                description="Adjust worker threads and parallel processing limits per job type."
                icon={<Cpu size={20} />}
            >
                <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                        {configs.map((config) => (
                            <div key={config.id} className={formStyles.listItem}>
                                <div className={formStyles.itemHeader} style={{ marginBottom: 0 }}>
                                    <div style={{ paddingRight: "16px" }}>
                                        <div className={formStyles.itemTitle} style={{ fontSize: "15px" }}>{config.name}</div>
                                        <div className={formStyles.itemDesc} style={{ fontSize: "13px", marginTop: "4px" }}>{config.description}</div>
                                    </div>

                                    <NumberStepper
                                        value={config.concurrency}
                                        min={1}
                                        max={32}
                                        onChange={(val) => handleConcurrencyChange(config.id, val)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={cardStyles.footer}>
                        <button
                            className={formStyles.saveButton}
                            disabled={!isDirty}
                            onClick={handleSave}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </CollapsibleCard>
        </div>
    );
}
