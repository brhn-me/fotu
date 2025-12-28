import React, { useEffect } from 'react';
import styles from '../../styles/Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'info';
}

export function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    type = 'info'
}: ModalProps) {

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        {cancelLabel}
                    </button>
                    <button
                        className={type === 'danger' ? styles.confirmButton : styles.confirmButton} // For now same style but can easily differentiate
                        style={type === 'danger' ? { backgroundColor: 'var(--color-destructive)' } : { backgroundColor: 'var(--accent-primary)' }}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
