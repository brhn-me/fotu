import { X } from "lucide-react";
import styles from "./FilterModal.module.css";

export const FilterModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div onClick={onClose} className={styles.overlay}>
            <div onClick={(e) => e.stopPropagation()} className={styles.modal}>
                <div className={styles.header}>
                    <h2>Search filters</h2>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.body}>
                    <div>
                        <div className={styles.categoryList}>
                            {["Favorites", "Videos", "Selfies", "Screenshots", "Archives"].map(cat => (
                                <button key={cat} className={styles.categoryButton}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.footer} style={{ marginTop: "40px" }}>
                    <button onClick={onClose} className={styles.resetButton}>Reset</button>
                    <button onClick={onClose} className={styles.applyButton}>Apply filters</button>
                </div>
            </div>
        </div>
    );
}
