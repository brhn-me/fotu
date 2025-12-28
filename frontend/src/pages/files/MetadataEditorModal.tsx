import React, { useState, useEffect } from "react";
import { X, Save, MapPin, Calendar, Type, FileText, Tag, Camera, User, Copyright, Cpu, Globe, Image as ImageIcon, Layers, Clock, Star, Palette } from "lucide-react";
import styles from "./FilesPage.module.css";

interface MetadataEditorModalProps {
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
    onSave: (id: string, updates: any) => void;
}

type TabType = 'general' | 'exif' | 'iptc';

export const MetadataEditorModal = ({ isOpen, onClose, file, onSave }: MetadataEditorModalProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('general');

    // General
    const [title, setTitle] = useState(file.name);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState(file.modified ? new Date(file.modified).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    const [timezone, setTimezone] = useState("");
    const [rating, setRating] = useState(0);
    const [colorLabel, setColorLabel] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");

    // EXIF
    const [cameraMake, setCameraMake] = useState("");
    const [cameraModel, setCameraModel] = useState("");
    const [lens, setLens] = useState("");
    const [iso, setIso] = useState("");
    const [aperture, setAperture] = useState("");
    const [shutterSpeed, setShutterSpeed] = useState("");
    const [focalLength, setFocalLength] = useState("");

    // IPTC / Rights
    const [author, setAuthor] = useState("");
    const [copyright, setCopyright] = useState("");
    const [software, setSoftware] = useState("");
    const [usageTerms, setUsageTerms] = useState("");

    useEffect(() => {
        if (isOpen) {
            const m = file.metadata || {};
            setTitle(file.name);
            setDescription(m.description || `Description for ${file.name}`);
            setLocation(m.location || "");
            setDate(file.modified ? new Date(file.modified).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
            setTimezone(m.timezone || "");
            setRating(m.rating || 0);
            setColorLabel(m.colorLabel || "");
            setTags(m.tags || []);

            setCameraMake(m.cameraMake || "");
            setCameraModel(m.camera || m.cameraModel || "");
            setLens(m.lens || "");
            setIso(m.iso || "");
            setAperture(m.aperture || "");
            setShutterSpeed(m.shutterSpeed || "");
            setFocalLength(m.focalLength || "");

            setAuthor(m.author || "");
            setCopyright(m.copyright || "");
            setSoftware(m.software || m.editor || "");
            setUsageTerms(m.usageTerms || "");
        }
    }, [isOpen, file]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(file.id, {
            name: title,
            modified: date,
            metadata: {
                description,
                location,
                timezone,
                rating,
                colorLabel,
                tags,
                cameraMake,
                cameraModel,
                lens,
                iso,
                aperture,
                shutterSpeed,
                focalLength,
                author,
                copyright,
                software,
                usageTerms
            }
        });
        onClose();
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            if (!tags.includes(currentTag.trim())) {
                setTags([...tags, currentTag.trim()]);
            }
            setCurrentTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>Edit Metadata</div>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div style={{ padding: '16px 24px 0 24px' }}>
                    <div className={styles.filePreviewSummary}>
                        <div className={styles.miniIcon}>
                            {file.type === 'image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                        </div>
                        <div className={styles.miniInfo}>
                            <span className={styles.miniName}>{file.name}</span>
                            <span className={styles.miniMeta}>{file.size} • {file.type.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.tabsHeader} style={{ marginTop: 16 }}>
                    <div
                        className={`${styles.tabBtn} ${activeTab === 'general' ? styles.active : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <FileText size={14} /> General
                    </div>
                    <div
                        className={`${styles.tabBtn} ${activeTab === 'exif' ? styles.active : ''}`}
                        onClick={() => setActiveTab('exif')}
                    >
                        <Camera size={14} /> Camera
                    </div>
                    <div
                        className={`${styles.tabBtn} ${activeTab === 'iptc' ? styles.active : ''}`}
                        onClick={() => setActiveTab('iptc')}
                    >
                        <Copyright size={14} /> Copyright and Ownership
                    </div>
                </div>

                <div className={styles.modalBody}>
                    {activeTab === 'general' && (
                        <div className={styles.tabContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}><Type size={14} /> Title / Filename</label>
                                <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><FileText size={14} /> Description</label>
                                <textarea className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} />
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><Calendar size={14} /> Date Created</label>
                                    <input type="datetime-local" className={styles.input} value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><Clock size={14} /> Timezone</label>
                                    <input className={styles.input} value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="e.g. GMT+2" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><MapPin size={14} /> Location</label>
                                <input className={styles.input} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Paris, France" />
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><Star size={14} /> Rating</label>
                                    <div className={styles.ratingContainer}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={18}
                                                className={`${styles.starIcon} ${rating >= star ? styles.filled : ''}`}
                                                onClick={() => setRating(star)}
                                                fill={rating >= star ? "var(--warning-color, #f59e0b)" : "none"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><Palette size={14} /> Color Label</label>
                                    <div className={styles.colorLabelContainer}>
                                        {['red', 'green', 'blue', 'yellow', 'purple', 'none'].map(color => (
                                            <div
                                                key={color}
                                                className={`${styles.colorDot} ${colorLabel === color ? styles.selected : ''}`}
                                                style={{ backgroundColor: color === 'none' ? 'transparent' : `var(--color-${color}, ${color})` }}
                                                onClick={() => setColorLabel(color)}
                                                title={color}
                                            >
                                                {color === 'none' && <X size={12} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><Tag size={14} /> Keywords / Tags</label>
                                <div className={styles.tagInputContainer}>
                                    {tags.map(tag => (
                                        <div key={tag} className={styles.tag}>
                                            {tag} <X size={12} className={styles.tagRemove} onClick={() => removeTag(tag)} />
                                        </div>
                                    ))}
                                    <input
                                        className={styles.tagInput}
                                        value={currentTag}
                                        onChange={e => setCurrentTag(e.target.value)}
                                        onKeyDown={addTag}
                                        placeholder="Add tag + Enter"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exif' && (
                        <div className={styles.tabContent}>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><Camera size={14} /> Make</label>
                                    <input className={styles.input} value={cameraMake} onChange={e => setCameraMake(e.target.value)} placeholder="e.g. Canon" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}><Camera size={14} /> Model</label>
                                    <input className={styles.input} value={cameraModel} onChange={e => setCameraModel(e.target.value)} placeholder="e.g. EOS R5" />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><Layers size={14} /> Lens</label>
                                <input className={styles.input} value={lens} onChange={e => setLens(e.target.value)} placeholder="e.g. EF 24-70mm f/2.8L" />
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>ISO</label>
                                    <input className={styles.input} value={iso} onChange={e => setIso(e.target.value)} placeholder="100" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Aperture</label>
                                    <input className={styles.input} value={aperture} onChange={e => setAperture(e.target.value)} placeholder="f/2.8" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Shutter</label>
                                    <input className={styles.input} value={shutterSpeed} onChange={e => setShutterSpeed(e.target.value)} placeholder="1/200" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Focal</label>
                                    <input className={styles.input} value={focalLength} onChange={e => setFocalLength(e.target.value)} placeholder="24mm" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'iptc' && (
                        <div className={styles.tabContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}><User size={14} /> Author / Creator</label>
                                <input className={styles.input} value={author} onChange={e => setAuthor(e.target.value)} />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><Copyright size={14} /> Copyright Notice</label>
                                <input className={styles.input} value={copyright} onChange={e => setCopyright(e.target.value)} />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><Cpu size={14} /> Software</label>
                                <input className={styles.input} value={software} onChange={e => setSoftware(e.target.value)} placeholder="e.g. Adobe Lightroom" />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}><Globe size={14} /> Usage Terms</label>
                                <textarea className={styles.textarea} value={usageTerms} onChange={e => setUsageTerms(e.target.value)} placeholder="Rights metadata..." />
                            </div>
                        </div>
                    )}

                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
