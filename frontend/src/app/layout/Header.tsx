import React from "react";
import { Activity, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../components/search/SearchBar";
import { ThemeToggle } from "./ThemeToggle"; // Same folder imports
import { ProfileMenu } from "./ProfileMenu";

const PinwheelLogo = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C12 8.68629 9.31371 6 6 6C2.68629 6 0 8.68629 0 12C0 12 0 12 0 12H12Z" fill="#4285F4" transform="translate(12, 0)" />
        <path d="M12 12C15.3137 12 18 9.31371 18 6C18 2.68629 15.3137 0 12 0C12 0 12 0 12 0V12Z" fill="#EA4335" transform="translate(0, 0)" />
        <path d="M12 12C12 15.3137 14.6863 18 18 18C21.3137 18 24 15.3137 24 12C24 12 24 12 24 12H12Z" fill="#FBBC05" transform="translate(-12, 0)" />
        <path d="M12 12C8.68629 12 6 14.6863 6 18C6 21.3137 8.68629 24 12 24C12 24 12 24 12 24V12Z" fill="#34A853" transform="translate(0, -12)" />
    </svg>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px" }}><PinwheelLogo /></div>
                <h1 style={{ fontSize: "18px", fontWeight: 400, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Fotu</h1>
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
