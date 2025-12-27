import { useState, useEffect } from "react";
import { FolderPlus, RefreshCw, Trash2, HardDrive } from "lucide-react";
import toast from "react-hot-toast";
import formStyles from "../../styles/Form.module.css";
import { Modal } from "../../components/ui/Modal";

const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type Source = {
    id: string;
    path: string;
    mode: "scanOnce" | "watch";
    enabled: boolean;
    status: string;
    scannedAt: string | null;
    createdAt: string;
};

export function SourcesPage() {
    const [sources, setSources] = useState<Source[]>([]);
    const [path, setPath] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);

    const fetchSources = async () => {
        try {
            const res = await fetch(`${API_Base}/api/sources`);
            if (res.ok) {
                const data = await res.json();
                setSources(data);
            }
        } catch (error) {
            console.error("Failed to fetch sources", error);
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    const handleAddSource = async () => {
        if (!path.trim()) return;
        setIsLoading(true);
        setError(undefined);
        try {
            const res = await fetch(`${API_Base}/api/sources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, mode: 'watch' })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to add source');
            }

            toast.success("Source added successfully");
            setPath("");
            fetchSources();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSource = (source: Source) => {
        setSourceToDelete(source);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!sourceToDelete) return;
        try {
            const res = await fetch(`${API_Base}/api/sources/${sourceToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Source removed");
                fetchSources();
            } else {
                toast.error("Failed to remove source");
            }
        } catch (error) {
            toast.error("Failed to remove source");
        } finally {
            setIsDeleteModalOpen(false);
            setSourceToDelete(null);
        }
    };



    const handleRescan = async (id: string) => {
        toast.promise(
            fetch(`${API_Base}/api/sources/${id}/scan`, { method: 'POST' }),
            {
                loading: 'Scanning source...',
                success: 'Scan triggered',
                error: 'Failed to trigger scan'
            }
        );
    };

    return (
        <div className={formStyles.pageContainer}>
            <h1 className={formStyles.pageTitle}>Sources</h1>

            <div className={formStyles.formGroup} style={{ marginBottom: 32 }}>
                <label className={formStyles.label}>Add New Source</label>
                <div style={{ display: "flex", gap: 12 }}>
                    <input
                        className={`${formStyles.input} ${error ? formStyles.inputError : ''}`}
                        placeholder="/path/to/photos"
                        value={path}
                        onChange={(e) => {
                            setPath(e.target.value);
                            setError(undefined);
                        }}
                        style={{ flex: 1 }}
                    />
                    <button
                        className={formStyles.saveButton}
                        disabled={!path.trim() || isLoading}
                        onClick={handleAddSource}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        <FolderPlus size={16} /> Add Source
                    </button>
                </div>
                {error && (
                    <p className={formStyles.errorMessage}>{error}</p>
                )}
                {!error && (
                    <p className={formStyles.description}>
                        Add a directory path to scan for photos and videos.
                    </p>
                )}
            </div>

            <div className={formStyles.divider} />

            <div style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: "var(--text-primary)" }}>Sources</h2>

                {sources.length === 0 ? (
                    <div style={{
                        padding: 40,
                        textAlign: 'center',
                        border: '2px dashed var(--border-subtle)',
                        borderRadius: 12,
                        color: 'var(--text-secondary)'
                    }}>
                        <FolderPlus size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p>No sources configured yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {sources.map(source => (
                            <SourceCard
                                key={source.id}
                                source={source}
                                onRemove={() => handleRemoveSource(source)}
                                onRescan={() => handleRescan(source.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Remove Source"
                confirmLabel="Remove"
                type="danger"
            >
                <p>Are you sure you want to remove <strong>{sourceToDelete?.path}</strong>?</p>
                <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>This will stop monitoring the folder. Existing data remains untouched.</p>
            </Modal>
        </div>
    );
}

function SourceCard({ source, onRemove, onRescan }: {
    source: Source,
    onRemove: () => void,
    onRescan: () => void
}) {
    return (
        <div style={{
            padding: 20,
            backgroundColor: "var(--bg-secondary)",
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                    width: 40, height: 40,
                    borderRadius: 10,
                    backgroundColor: "var(--bg-surface)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent-primary)"
                }}>
                    <HardDrive size={20} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15 }}>
                        {source.path}
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
                        <span style={{
                            display: "inline-block",
                            width: 8, height: 8, borderRadius: "50%",
                            backgroundColor: source.status === 'Scanning' ? "var(--accent-primary)" : "var(--status-success)"
                        }} />
                        <span>{source.status === 'Scanning' ? 'Scanning...' : 'Idle'}</span>
                        <span>•</span>
                        <span>
                            {source.scannedAt ? `Last scan: ${new Date(source.scannedAt).toLocaleDateString()}` : 'Never scanned'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>


                <button
                    onClick={onRescan}
                    title="Rescan Now"
                    style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid var(--border-subtle)",
                        background: "var(--bg-surface)",
                        color: "var(--text-primary)",
                        cursor: "pointer"
                    }}
                >
                    <RefreshCw size={18} />
                </button>

                <button
                    onClick={onRemove}
                    title="Remove Source"
                    style={{
                        padding: 8,
                        borderRadius: 8,
                        border: "1px solid var(--border-subtle)",
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "var(--color-destructive)",
                        cursor: "pointer"
                    }}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
