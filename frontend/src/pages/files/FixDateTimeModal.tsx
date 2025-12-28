import { useState, useEffect } from "react";
import { X, Clock, Image as ImageIcon, FileText, Check, Sunrise, Sun, Sunset, Moon, Shuffle, ChevronDown } from "lucide-react";
import styles from "./FilesPage.module.css";

interface FixDateTimeModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: {
        id: string;
        name: string;
        type: 'folder' | 'image' | 'video' | 'file';
        size?: string;
        modified?: string;
        metadata?: any;
    };
    onSave: (id: string, newDate: string) => void;
}

export const FixDateTimeModal = ({ isOpen, onClose, file, onSave }: FixDateTimeModalProps) => {
    const [dateTimeStr, setDateTimeStr] = useState("");
    const [timezone, setTimezone] = useState("");

    const [references, setReferences] = useState<{ label: string; value: string; source: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            const initialDate = file.metadata?.dateCreated
                ? new Date(file.metadata.dateCreated)
                : file.modified
                    ? new Date(file.modified)
                    : new Date();

            const y = initialDate.getFullYear();
            const m = (initialDate.getMonth() + 1).toString().padStart(2, '0');
            const d = initialDate.getDate().toString().padStart(2, '0');
            const H = initialDate.getHours().toString().padStart(2, '0');
            const M = initialDate.getMinutes().toString().padStart(2, '0');
            const S = initialDate.getSeconds().toString().padStart(2, '0');

            setDateTimeStr(`${y}-${m}-${d}T${H}:${M}:${S}`);
            setTimezone(file.metadata?.timezone || "+00:00");

            const refs = [
                { label: "DateTimeOriginal", value: "2023-12-25 14:30:15", source: "EXIF" },
                { label: "CreateDate", value: "2023-12-25 14:30:15", source: "EXIF" },
                { label: "ModifyDate", value: "2024-01-10 09:12:00", source: "File System" },
                // Add more logic to extract real metadata in a real app
            ];
            setReferences(refs);
        }
    }, [isOpen, file]);

    if (!isOpen) return null;

    const handleReferenceClick = (dateStr: string) => {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = (d.getMonth() + 1).toString().padStart(2, '0');
            const day = d.getDate().toString().padStart(2, '0');
            const H = d.getHours().toString().padStart(2, '0');
            const M = d.getMinutes().toString().padStart(2, '0');
            const S = d.getSeconds().toString().padStart(2, '0');
            setDateTimeStr(`${y}-${m}-${day}T${H}:${M}:${S}`);
        }
    };

    const handlePreset = (type: 'morning' | 'afternoon' | 'evening' | 'midnight' | 'random') => {
        const current = dateTimeStr ? new Date(dateTimeStr) : new Date();
        const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min).toString().padStart(2, '0');

        const y = current.getFullYear();
        const m = (current.getMonth() + 1).toString().padStart(2, '0');
        const d = current.getDate().toString().padStart(2, '0');

        const rMin = rand(0, 59);
        const rSec = rand(0, 59);

        let rHour;
        switch (type) {
            case 'morning': // 06 - 11
                rHour = rand(6, 11);
                break;
            case 'afternoon': // 12 - 17
                rHour = rand(12, 17);
                break;
            case 'evening': // 18 - 23
                rHour = rand(18, 23);
                break;
            case 'midnight': // 00 - 05
                rHour = rand(0, 5);
                break;
            case 'random':
                rHour = rand(0, 23);
                break;
        }

        setDateTimeStr(`${y}-${m}-${d}T${rHour}:${rMin}:${rSec}`);
    };

    const handleSave = () => {
        onSave(file.id, dateTimeStr); // Pass the ISO-like local string, formatting handled by backend or kept as is
        onClose();
    };

    const timezones = Array.from({ length: 27 }, (_, i) => {
        const offset = i - 12;
        const sign = offset >= 0 ? "+" : "-";
        const abs = Math.abs(offset);
        return `${sign}${abs.toString().padStart(2, '0')}:00`;
    });

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modalContent} ${styles.modalWide}`} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Clock size={18} className={styles.modalTitleIcon} />
                        Fix Date Time
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.filePreviewSummary}>
                        <div className={styles.miniIcon}>
                            {file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <div className={styles.miniInfo}>
                            <span className={styles.miniName}>{file.name}</span>
                            <span className={styles.miniMeta}>{file.type === 'folder' ? 'FOLDER' : `${file.size} • ${file.type.toUpperCase()}`}</span>
                        </div>
                    </div>

                    <div className={styles.dateTimeContainer}>
                        {/* Main Input Row: Date Taken + Time Zone */}
                        <div className={styles.row} style={{ gap: 12 }}>
                            <div className={styles.controlSection} style={{ flex: 2 }}>
                                <label className={styles.controlLabel}>Date Taken</label>
                                <div className={styles.selectWrapper}>
                                    <input
                                        type="datetime-local"
                                        step="1"
                                        value={dateTimeStr}
                                        onChange={e => setDateTimeStr(e.target.value)}
                                        className={styles.inputNumber}
                                        style={{ fontFamily: 'var(--font-mono)' }}
                                    />
                                </div>
                            </div>
                            <div className={styles.controlSection} style={{ flex: 1 }}>
                                <label className={styles.controlLabel}>Time Zone</label>
                                <div className={styles.selectWrapper}>
                                    <input
                                        type="text"
                                        value={timezone}
                                        onChange={e => setTimezone(e.target.value)}
                                        className={styles.inputNumber}
                                        list="timezone-options"
                                        placeholder="+00:00"
                                    />
                                    <datalist id="timezone-options">
                                        {timezones.map(tz => <option key={tz} value={tz} />)}
                                    </datalist>
                                    <span className={styles.selectArrow}><ChevronDown size={14} /></span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.dividerDots} style={{ margin: '10px 0' }} />

                        {/* Helpers Section (Stacked) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Metadata Dates (Detailed Buttons) */}
                            <div className={styles.controlSection}>
                                <label className={styles.controlLabel}>Dates from Metadata</label>
                                <div className={styles.quickRefList}>
                                    {references.length > 0 ? references.map((ref, i) => (
                                        <div key={i} className={styles.quickRefItem} onClick={() => handleReferenceClick(ref.value)}>
                                            <div className={styles.quickRefHeader}>
                                                <span className={styles.quickRefLabel}>{ref.label}</span>
                                                <span className={styles.quickRefSource}>{ref.source}</span>
                                            </div>
                                            <span className={styles.quickRefValue}>{ref.value}</span>
                                        </div>
                                    )) : (
                                        <div className={styles.emptyState}>No dates found in metadata</div>
                                    )}
                                </div>
                            </div>

                            {/* Time Presets */}
                            <div className={styles.controlSection}>
                                <label className={styles.controlLabel}>Set time to</label>
                                <div className={styles.presetsRow}>
                                    <button className={styles.presetIconBtn} onClick={() => handlePreset('morning')} title="Morning (6-11)">
                                        <Sunrise size={16} />
                                    </button>
                                    <button className={styles.presetIconBtn} onClick={() => handlePreset('afternoon')} title="Afternoon (12-17)">
                                        <Sun size={16} />
                                    </button>
                                    <button className={styles.presetIconBtn} onClick={() => handlePreset('evening')} title="Evening (18-23)">
                                        <Sunset size={16} />
                                    </button>
                                    <button className={styles.presetIconBtn} onClick={() => handlePreset('midnight')} title="Midnight (0-5)">
                                        <Moon size={16} />
                                    </button>
                                    <button className={`${styles.presetIconBtn} ${styles.presetRandom}`} onClick={() => handlePreset('random')} title="Random Time">
                                        <Shuffle size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <Check size={16} /> Update Date
                    </button>
                </div>
            </div>
        </div>
    );
};
