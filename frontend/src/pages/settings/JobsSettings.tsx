import { useEffect, useState, useMemo } from "react";
import { Clock, Save, Cpu } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import formStyles from "../../styles/Form.module.css";
import cardStyles from "../../components/ui/CollapsibleCard.module.css";
import { useSettings } from "../../context/SettingsContext";
import { NumberStepper } from "../../components/ui/NumberStepper";
import { EditableDropdown } from "../../components/ui/EditableDropdown";
import { Job, JOB_ICONS } from "../jobs/jobsIcons";
import { jobsService } from "../../services/jobsService";

export function JobsSettings() {
    const { settings, updateSettings } = useSettings();
    const [jobs, setJobs] = useState<Job[]>([]);

    // Local state for pending changes
    const [pendingConcurrency, setPendingConcurrency] = useState<any[]>([]);
    const [pendingDelays, setPendingDelays] = useState<Record<string, number>>({});

    useEffect(() => {
        jobsService.getConfig()
            .then(data => {
                const jobList: Job[] = Object.values(data).map((j: any) => ({
                    ...j,
                    icon: JOB_ICONS[j.id] || Clock
                }));
                setJobs(jobList);
            })
            .catch(err => console.error("Failed to load job config", err));
    }, []);

    // Sync local state when settings change
    useEffect(() => {
        try {
            setPendingConcurrency(JSON.parse(settings.jobsConcurrency || '[]'));
        } catch {
            setPendingConcurrency([]);
        }
        try {
            setPendingDelays(JSON.parse(settings.jobDelays || '{}'));
        } catch {
            setPendingDelays({});
        }
    }, [settings.jobsConcurrency, settings.jobDelays]);

    const getDelay = (id: string) => pendingDelays[id] ?? 100;

    const getConcurrency = (id: string) => {
        if (id === 'scan' || id === 'organize') return 1;
        const found = pendingConcurrency.find((c: any) => c.id === id);
        return found ? found.concurrency : 4;
    };

    const updateLocalConcurrency = (jobId: string, value: number) => {
        if (jobId === 'scan' || jobId === 'organize') return;
        setPendingConcurrency(prev => {
            const current = [...prev];
            const index = current.findIndex((c: any) => c.id === jobId);
            if (index >= 0) {
                current[index] = { ...current[index], concurrency: value };
            } else {
                current.push({ id: jobId, concurrency: value });
            }
            return current;
        });
    };

    const updateLocalDelay = (jobId: string, value: number) => {
        setPendingDelays(prev => ({
            ...prev,
            [jobId]: value
        }));
    };

    const isConcurrencyDirty = useMemo(() => {
        return settings.jobsConcurrency !== JSON.stringify(pendingConcurrency);
    }, [settings.jobsConcurrency, pendingConcurrency]);

    const isDelayDirty = useMemo(() => {
        return settings.jobDelays !== JSON.stringify(pendingDelays);
    }, [settings.jobDelays, pendingDelays]);

    const handleSaveConcurrency = async () => {
        await updateSettings({ jobsConcurrency: JSON.stringify(pendingConcurrency) }, "Job concurrency updated");
    };

    const handleSaveDelay = async () => {
        await updateSettings({ jobDelays: JSON.stringify(pendingDelays) }, "Job delay updated");
    };

    const PRESETS = [0, 100, 250, 500, 1000, 2000, 3000, 5000];

    return (
        <div className={formStyles.pageContainer}>
            <CollapsibleCard
                title="Concurrency Configuration"
                description="Configure the number of simultaneous tasks for each job."
                icon={<Cpu size={20} />}
            >
                {jobs.map((job: Job, index: number) => {
                    const Icon = job.icon;
                    const isConcurrencyDisabled = job.id === 'scan' || job.id === 'organize';
                    const isLast = index === jobs.length - 1;

                    return (
                        <div key={job.id} className={`${formStyles.listItem} ${isLast ? formStyles.noBorder : ''}`}>
                            <div className={formStyles.itemHeader} style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--accent-primary)',
                                    }}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className={formStyles.itemTitle}>{job.title}</h3>
                                        <p className={formStyles.itemDesc} style={{ fontSize: '13px' }}>
                                            {job.description}
                                        </p>
                                    </div>
                                </div>

                                <NumberStepper
                                    value={getConcurrency(job.id)}
                                    min={1}
                                    max={10}
                                    onChange={(val) => updateLocalConcurrency(job.id, val)}
                                    disabled={isConcurrencyDisabled}
                                    title={isConcurrencyDisabled ? "Not safe for concurrent operation" : undefined}
                                />
                            </div>
                        </div>
                    );
                })}
                <div className={cardStyles.footer}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!isConcurrencyDirty}
                        onClick={handleSaveConcurrency}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>

            <CollapsibleCard
                title="Time Delay Configuration"
                description="Adjust processing intervals between items to balance load."
                icon={<Clock size={20} />}
            >
                {jobs.map((job: Job, index: number) => {
                    const Icon = job.icon;
                    const isLast = index === jobs.length - 1;

                    return (
                        <div key={job.id} className={`${formStyles.listItem} ${isLast ? formStyles.noBorder : ''}`}>
                            <div className={formStyles.itemHeader} style={{ marginBottom: 0 }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--accent-primary)',
                                    }}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className={formStyles.itemTitle}>{job.title}</h3>
                                        <p className={formStyles.itemDesc} style={{ fontSize: '13px' }}>
                                            {job.description}
                                        </p>
                                    </div>
                                </div>

                                <EditableDropdown
                                    value={getDelay(job.id)}
                                    options={PRESETS}
                                    unit="ms"
                                    onChange={(val: number) => updateLocalDelay(job.id, val)}
                                />
                            </div>
                        </div>
                    );
                })}
                <div className={cardStyles.footer}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!isDelayDirty}
                        onClick={handleSaveDelay}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>
        </div>
    );
}
