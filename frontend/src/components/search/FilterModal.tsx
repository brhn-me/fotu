import { X } from "lucide-react";

export const FilterModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2200, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "500px", backgroundColor: "var(--bg-primary)", borderRadius: "24px", padding: "24px", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 500, color: "var(--text-primary)" }}>Search filters</h2>
                    <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {["Favorites", "Videos", "Selfies", "Screenshots", "Archives"].map(cat => <button key={cat} style={{ padding: "8px 16px", borderRadius: "18px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-primary)" }}>{cat}</button>)}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "40px" }}>
                    <button onClick={onClose} style={{ padding: "10px 20px", background: "transparent", border: "none", color: "var(--accent-primary)" }}>Reset</button>
                    <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: "20px", border: "none", background: "var(--accent-primary)", color: "white" }}>Apply filters</button>
                </div>
            </div>
        </div>
    );
}
