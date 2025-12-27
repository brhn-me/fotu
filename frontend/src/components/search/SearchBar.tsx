import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./SearchBar.module.css";

export const SearchBar = ({ onFilterClick }: { onFilterClick: () => void }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div className={styles.searchBarContainer}>
            <div
                className={styles.searchIconWrapper}
                style={{ color: isFocused ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
                <Search size={18} />
            </div>
            <input
                type="text"
                placeholder="Search photos..."
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={styles.searchInput}
            />
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFilterClick(); }}
                className={styles.filterButton}
                title="Search filters"
            >
                <SlidersHorizontal size={18} />
            </button>
        </div>
    );
};
