import { useState } from "react";
import { ChevronRight, Settings, Cpu, Save } from "lucide-react";
import { Link } from "react-router-dom";
import shared from "../../styles/shared.module.css";

// Interface for Job Configuration
interface JobConfig {
    id: string;
    name: string;
    description: string;
    concurrency: number;
    maxRetries: number;
}

const INITIAL_CONFIG: JobConfig[] = [
    { id: "image-processing", name: "Image Processing", description: "Thumbnail generation and metadata extraction", concurrency: 4, maxRetries: 3 },
    { id: "video-transcoding", name: "Video Transcoding", description: "Convert videos to optimized formats", concurrency: 1, maxRetries: 5 },
    { id: "face-detection", name: "Face Detection", description: "Detect and recognize faces in photos", concurrency: 2, maxRetries: 3 },
    { id: "metadata-sync", name: "Metadata Sync", description: "Synchronize metadata with external sources", concurrency: 5, maxRetries: 2 },
];

export function JobConcurrencyPage() {
    const [configs, setConfigs] = useState<JobConfig[]>(INITIAL_CONFIG);

    const handleConcurrencyChange = (id: string, value: number) => {
        setConfigs(prev => prev.map(c =>
            c.id === id ? { ...c, concurrency: Math.max(1, Math.min(32, value)) } : c
        ));
    };

    const handleSave = () => {
        // In a real app, this would make an API call
        console.log("Saving configs:", configs);
        // You could add a toast notification here
    };

    return (
        <div className={shared.pageContainer}>
            <div className={shared.pageCentered} style={{ maxWidth: 800 }}>
                {/* Header */}
                <header className={shared.pageHeader} style={{ marginBottom: 32 }}>
                    <div className={shared.pageHeaderContent} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className={shared.breadcrumb}>
                            <Link to="/jobs" className={shared.breadcrumbLink}>Jobs</Link>
                            <ChevronRight size={16} className={shared.breadcrumbSeparator} />
                            <span>Concurrency</span>
                        </div>
                    </div>
                </header>

                <div className={shared.card}>
                    <div className={shared.cardHeader}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                backgroundColor: "var(--bg-secondary)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "var(--accent-primary)"
                            }}>
                                <Settings size={20} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Concurrency Settings</h2>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Adjust worker threads and parallel processing limits.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            className={`${shared.btn} ${shared.btnPrimary}`}
                        >
                            <Save size={16} /> Save Changes
                        </button>
                    </div>

                    <div className={shared.cardBody}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {configs.map(config => (
                                <div key={config.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{config.name}</h3>
                                            <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "var(--bg-secondary)", color: "var(--text-muted)" }}>
                                                ID: {config.id}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0 0" }}>{config.description}</p>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                            <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>Concurrency</label>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <button
                                                    onClick={() => handleConcurrencyChange(config.id, config.concurrency - 1)}
                                                    style={{
                                                        width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border-subtle)",
                                                        background: "var(--bg-surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                                    }}
                                                >-</button>
                                                <div style={{ width: 32, textAlign: "center", fontWeight: 600, color: "var(--text-primary)" }}>{config.concurrency}</div>
                                                <button
                                                    onClick={() => handleConcurrencyChange(config.id, config.concurrency + 1)}
                                                    style={{
                                                        width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border-subtle)",
                                                        background: "var(--bg-surface)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                                    }}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, backgroundColor: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)" }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <Cpu size={20} style={{ color: "var(--accent-primary)", marginTop: 2 }} />
                                <div>
                                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>System Resource Usage</h4>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
                                        Increasing concurrency defaults may improve throughput but can result in higher CPU and memory usage.
                                        Recommended max concurrency for this system is <strong>12</strong> workers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
