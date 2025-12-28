import React from 'react';
import { X, FileText, ImageIcon, Calendar, HardDrive, MapPin, Hash, Info } from 'lucide-react';
import styles from './FilesPage.module.css';
import { FileItem } from './FilesPage';

interface FilePropertiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: FileItem;
}

export const FilePropertiesModal = ({ isOpen, onClose, file }: FilePropertiesModalProps) => {
    if (!isOpen) return null;

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Unknown';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modalContent} ${styles.modalWide}`} onClick={e => e.stopPropagation()} style={{ width: 480 }}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>File Properties</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <div className={styles.modalBody}>
                    {/* Header Preview */}
                    <div className={styles.filePreviewSummary} style={{ marginBottom: 24 }}>
                        <div className={styles.miniIcon} style={{ width: 64, height: 64 }}>
                            {file.type === 'image' ? <ImageIcon size={32} /> : <FileText size={32} />}
                        </div>
                        <div className={styles.miniInfo}>
                            <span className={styles.miniName} style={{ fontSize: 16 }}>{file.name}</span>
                            <span className={styles.miniMeta}>{file.type.toUpperCase()} File</span>
                        </div>
                    </div>

                    <div className={styles.propertiesGrid}>
                        {/* General */}
                        <div className={styles.controlSection}>
                            <label className={styles.controlLabel}>General</label>
                            <div className={styles.propRow}>
                                <div className={styles.propLabel}>Typ</div>
                                <div className={styles.propValue}>{file.type === 'folder' ? 'Folder' : `${file.type.toUpperCase()} Image`}</div>
                            </div>
                            <div className={styles.propRow}>
                                <div className={styles.propLabel}>MIME Type</div>
                                <div className={styles.propValue}>{file.type === 'folder' ? 'inode/directory' : (file.name.endsWith('.jpg') ? 'image/jpeg' : (file.name.endsWith('.png') ? 'image/png' : 'application/octet-stream'))}</div>
                            </div>
                            <div className={styles.propRow}>
                                <div className={styles.propLabel}>Location</div>
                                <div className={styles.propValue} style={{ wordBreak: 'break-all' }}>/volume1/photos/{file.path || file.name}</div>
                            </div>
                            <div className={styles.propRow}>
                                <div className={styles.propLabel}>Size</div>
                                <div className={styles.propValue}>{typeof file.size === 'string' ? file.size : formatBytes(Number(file.size || 0))}</div>
                            </div>
                        </div>

                        <div className={styles.dividerDots} />

                        {/* Dates */}
                        <div className={styles.controlSection}>
                            <label className={styles.controlLabel}>Timestamps</label>
                            <div className={styles.propRow}>
                                <div className={styles.propLabel}>Created</div>
                                <div className={styles.propValue}>{formatDate(file.metadata?.dateCreated || new Date().toISOString())}</div>
                            </div>
                            <div className={styles.propRow}>
                                <div className={styles.propLabel}>Modified</div>
                                <div className={styles.propValue}>{formatDate(file.modified || new Date().toISOString())}</div>
                            </div>
                        </div>

                        {/* Extended Info for Images */}
                        {file.type === 'image' && (
                            <>
                                <div className={styles.dividerDots} />
                                <div className={styles.controlSection}>
                                    <label className={styles.controlLabel}>Dimensions</label>
                                    <div className={styles.propRow}>
                                        <div className={styles.propLabel}>Resolution</div>
                                        <div className={styles.propValue}>4032 x 3024</div>
                                    </div>
                                    <div className={styles.propRow}>
                                        <div className={styles.propLabel}>Megapixels</div>
                                        <div className={styles.propValue}>12.2 MP</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.secondaryBtn} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};
