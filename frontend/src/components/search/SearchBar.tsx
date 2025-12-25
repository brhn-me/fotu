import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export const SearchBar = ({ onFilterClick }: { onFilterClick: () => void }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <div style={{ flex: 1, maxWidth: "720px", margin: "0 24px", position: "relative", display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: "16px", color: isFocused ? "var(--accent-primary)" : "var(--text-secondary)", display: "flex", alignItems: "center", pointerEvents: "none" }}><Search size={18} /></div>
            <input type="text" placeholder="Search photos..." onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} style={{ width: "100%", height: "48px", backgroundColor: isFocused ? "var(--bg-primary)" : "var(--bg-secondary)", border: isFocused ? "1px solid var(--accent-primary)" : "1px solid transparent", borderRadius: "24px", padding: "0 52px 0 52px", fontSize: "15px", color: "var(--text-primary)", outline: "none", transition: "all 0.2s ease", boxShadow: isFocused ? "var(--shadow-md)" : "none" }} />
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFilterClick(); }} style={{ position: "absolute", right: "12px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} title="Search filters"><SlidersHorizontal size={18} /></button>
        </div>
    );
};
