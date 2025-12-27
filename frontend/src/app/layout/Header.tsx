import React from "react";
import { Activity, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../components/search/SearchBar";
import { ThemeToggle } from "./ThemeToggle"; // Same folder imports
import { ProfileMenu } from "./ProfileMenu";

const PinwheelLogo = () => (
    <img src="/logo.png" alt="Fotu Logo" width="28" height="28" style={{ display: "block" }} />
);

const HeaderAction = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <button style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} title={label}>
        {icon}
    </button>
);

export const Header = ({ onMenuClick, onFilterClick }: { onMenuClick: () => void; onFilterClick: () => void; }) => {
    const navigate = useNavigate();
    return (
        <header style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", position: "sticky", top: 0, zIndex: 1100 }}>
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <button onClick={onMenuClick} style={{ background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: "8px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px" }}><Menu size={20} /></button>
                <div
                    onClick={() => navigate("/")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: "8px",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-secondary)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    <PinwheelLogo />
                    <h1 style={{ fontSize: "18px", fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Fotu</h1>
                </div>
            </div>
            <SearchBar onFilterClick={onFilterClick} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border-subtle)", margin: "0 8px" }} />
                <ThemeToggle />
                <ProfileMenu />
            </div>
        </header>
    );
};
