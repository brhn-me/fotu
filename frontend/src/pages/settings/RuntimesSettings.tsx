import { useState, useEffect, useMemo } from "react";
import { Terminal, CheckCircle2, XCircle } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { runtimesApi, RuntimeInfo } from "../../api/runtimes";
import formStyles from "../../styles/Form.module.css";
import { useSettings } from "../../context/SettingsContext";
import { SaveButton } from "../../components/ui/SaveButton";
import { Input } from "../../components/ui/Input";

const TOOL_DESCRIPTIONS: Record<string, string> = {
    exiftool: "Reads and writes metadata for images and videos.",
    ffmpeg: "Processes video files, generates thumbnails and transcode streams.",
    ffprobe: "Analyzes video streams to extract detailed technical metadata.",
    darktable: "Performs high-fidelity RAW image development and conversion."
};

const TOOL_SETTINGS_KEYS: Record<string, keyof import('../../context/SettingsContext').AppSettings> = {
    exiftool: 'exiftoolPath',
    ffmpeg: 'ffmpegPath',
    ffprobe: 'ffprobePath',
    darktable: 'darktableCliPath' // mapped from 'darktable' key in runtimes api to 'darktableCliPath' in settings
};

export function RuntimesSettings() {
    const { settings, updateSettings } = useSettings();
    const [runtimes, setRuntimes] = useState<RuntimeInfo[]>([]);
    const [loading, setLoading] = useState(true);

    // Local state for paths
    const [localPaths, setLocalPaths] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRuntimes();
    }, []);

    const loadRuntimes = async () => {
        try {
            setLoading(true);
            const data = await runtimesApi.getRuntimes();
            setRuntimes(data);

            // Initialize local paths from settings
            const initialPaths: Record<string, string> = {};
            data.forEach(r => {
                const settingKey = TOOL_SETTINGS_KEYS[r.key];
                initialPaths[r.key] = (settings[settingKey] as string) || "";
            });
            setLocalPaths(initialPaths);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Update local paths when settings change externally (e.g. initial load)
    useEffect(() => {
        if (runtimes.length > 0) {
            const newPaths = { ...localPaths };
            runtimes.forEach(r => {
                const settingKey = TOOL_SETTINGS_KEYS[r.key];
                const val = (settings[settingKey] as string) || "";
                if (newPaths[r.key] !== val && !Object.keys(localPaths).length) { // Only sync on first load or forced refresh logic
                    newPaths[r.key] = val;
                }
            });
            // We only want to sync initial load, otherwise we overwrite user typing.
            // Simplified: Just trust internal state after load.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]);


    const handlePathChange = (key: string, val: string) => {
        setLocalPaths(prev => ({ ...prev, [key]: val }));
        if (errors[key]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    };

    const isDirty = useMemo(() => {
        return runtimes.some(r => {
            const settingKey = TOOL_SETTINGS_KEYS[r.key];
            const original = (settings[settingKey] as string) || "";
            const current = localPaths[r.key] || "";
            return original !== current;
        });
    }, [runtimes, localPaths, settings]);

    const handleSaveAll = async () => {
        setSaving(true);
        const newErrors: Record<string, string> = {};
        const updates: any = {};
        let hasError = false;

        for (const r of runtimes) {
            const currentPath = localPaths[r.key] || "";
            const settingKey = TOOL_SETTINGS_KEYS[r.key];
            const original = (settings[settingKey] as string) || "";

            if (currentPath !== original) {
                if (!currentPath.trim()) {
                    // Clearing is always allowed
                    updates[settingKey] = "";
                } else {
                    // Verify
                    try {
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/runtimes/verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ path: currentPath })
                        });
                        const data = await res.json();
                        if (data.valid) {
                            updates[settingKey] = currentPath;
                        } else {
                            newErrors[r.key] = `${r.name} command in given path not found.`;
                            hasError = true;
                        }
                    } catch (e) {
                        newErrors[r.key] = `Failed to verify ${r.name} path.`;
                        hasError = true;
                    }
                }
            }
        }

        setErrors(newErrors);

        if (!hasError && Object.keys(updates).length > 0) {
            await updateSettings(updates);
            // Re-load runtimes to update "found" status from backend if needed, although local state is mostly source of truth for paths
            loadRuntimes();
        }
        setSaving(false);
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Runtimes</h1>

            <CollapsibleCard
                title="System Binaries"
                description="Status of external tools required for media processing."
                icon={<Terminal size={20} />}
            >
                {loading ? (
                    <div style={{ padding: "20px", color: "var(--text-secondary)" }}>Checking system paths...</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                        {runtimes.map((runtime) => {
                            const userPath = localPaths[runtime.key] || "";
                            const isFound = runtime.found || (!!userPath && !errors[runtime.key]);
                            const isAutoDetected = !userPath && !!runtime.path;

                            return (
                                <div key={runtime.key} className={formStyles.listItem}>
                                    <div className={formStyles.itemHeader}>
                                        <div>
                                            <h3 className={formStyles.itemTitle}>
                                                {runtime.name}
                                            </h3>
                                            <p className={formStyles.itemDesc}>
                                                {TOOL_DESCRIPTIONS[runtime.key]}
                                            </p>
                                        </div>
                                        <div>
                                            {isFound ? (
                                                <div className={`${formStyles.badge} ${formStyles.badgeFound}`}>
                                                    <CheckCircle2 size={14} /> FOUND
                                                </div>
                                            ) : (
                                                <div className={`${formStyles.badge} ${formStyles.badgeMissing}`}>
                                                    <XCircle size={14} /> MISSING
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Input
                                        label="Path"
                                        value={userPath}
                                        onChange={(e) => handlePathChange(runtime.key, e.target.value)}
                                        placeholder={runtime.path || "Not detected"}
                                        error={errors[runtime.key]}
                                        rightElement={isAutoDetected ? (
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Auto detected
                                            </span>
                                        ) : undefined}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                <SaveButton
                    onClick={handleSaveAll}
                    disabled={!isDirty || saving}
                />
            </CollapsibleCard >
        </div >
    );
}
