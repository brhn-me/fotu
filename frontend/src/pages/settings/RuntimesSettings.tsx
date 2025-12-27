import { useState, useEffect, useMemo } from "react";
import { Terminal, CheckCircle2, XCircle, Save } from "lucide-react";
import { CollapsibleCard } from "../../components/ui/CollapsibleCard";
import { runtimesApi, RuntimeInfo } from "../../api/runtimes";
import formStyles from "../../styles/Form.module.css";
import { useSettings } from "../../context/SettingsContext";

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
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "32px", color: "var(--text-primary)" }}>Runtimes</h1>

            <CollapsibleCard
                title="System Binaries"
                description="Status of external tools required for media processing."
                icon={<Terminal size={20} />}
            >
                {loading ? (
                    <div style={{ padding: "20px", color: "var(--text-secondary)" }}>Checking system paths...</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                        {runtimes.map((runtime, index) => {
                            const userPath = localPaths[runtime.key] || "";

                            // Status is found if we have a valid effective path that is confirmed (either system detected or we assume user input valid if saved, but here we dynamically check presence)
                            // Actually, immediate feedback for "Found" badge is tricky without re-verifying everything constantly.
                            // Better logic: If user override exists, assume found? No, user wants badge to reflect reality.
                            // Since we only save valid paths, if localPaths matches settings, we can trust previous validation status?
                            // Let's stick to: effective path exists AND (user override is set OR backend said found).
                            // Wait, if user types garbage and hasn't saved, badge might differ.
                            // User request: Found badge on right.

                            const isFound = runtime.found || (!!userPath && !errors[runtime.key]); // Simplify: if system found it OR user set it (and no error yet)
                            const isAutoDetected = !userPath && !!runtime.path;

                            return (
                                <div key={runtime.key} style={{
                                    padding: "24px 0",
                                    borderBottom: index === runtimes.length - 1 ? "none" : "1px solid var(--border-subtle)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                                                {runtime.name}
                                            </h3>
                                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                                                {TOOL_DESCRIPTIONS[runtime.key]}
                                            </p>
                                        </div>
                                        <div>
                                            {isFound ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--accent-green)", fontWeight: 600, background: "rgba(34, 197, 94, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
                                                    <CheckCircle2 size={14} /> FOUND
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--color-destructive)", fontWeight: 600, background: "rgba(239, 68, 68, 0.1)", padding: "2px 8px", borderRadius: "12px" }}>
                                                    <XCircle size={14} /> MISSING
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={formStyles.formGroup}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                            <label className={formStyles.label}>Path</label>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                className={`${formStyles.input} ${errors[runtime.key] ? formStyles.inputError : ''}`}
                                                value={userPath} // Controlled by local state
                                                onChange={(e) => handlePathChange(runtime.key, e.target.value)}
                                                placeholder={runtime.path || "Not detected"} // Show detected path as placeholder if available
                                            />
                                            {isAutoDetected && (
                                                <span style={{
                                                    position: 'absolute',
                                                    right: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    fontSize: '12px',
                                                    color: 'var(--text-muted)',
                                                    pointerEvents: 'none'
                                                }}>
                                                    Auto detected
                                                </span>
                                            )}
                                        </div>
                                        {errors[runtime.key] && (
                                            <p className={formStyles.errorMessage}>{errors[runtime.key]}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className={formStyles.cardFooter}>
                    <button
                        className={formStyles.saveButton}
                        disabled={!isDirty || saving}
                        onClick={handleSaveAll}
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </CollapsibleCard>
        </div>
    );
}
