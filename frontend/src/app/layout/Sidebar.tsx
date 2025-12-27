// src/components/Sidebar.tsx

import React from "react";
import { Image, Library, Map, MapPin, Info, Trash2, Cloud, BarChart3, Clock, HardDrive, Activity } from "lucide-react";

type AppView = "photos" | "albums" | "sources" | "metadata" | "jobs" | "jobDetails" | "map";

interface SidebarProps {
    isOpen: boolean;
    view: AppView;
    onNavigate: (view: AppView) => void;
}

const NavItem = ({
    icon,
    label,
    isOpen,
    active = false,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    isOpen: boolean;
    active?: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            padding: "12px",
            gap: "16px",
            background: active ? "rgba(52, 168, 83, 0.1)" : "transparent",
            border: "none",
            color: active ? "#34A853" : "var(--text-secondary)",
            cursor: "pointer",
            borderRadius: "0 24px 24px 0",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            margin: "4px 0",
            paddingLeft: "24px",
            textAlign: "left",
        }}
        onMouseEnter={(e) => {
            if (!active) {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                e.currentTarget.style.color = "var(--text-primary)";
            }
        }}
        onMouseLeave={(e) => {
            if (!active) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
            }
        }}
    >
        <div style={{ minWidth: "24px", display: "flex", justifyContent: "center" }}>{icon}</div>
        <span
            style={{
                fontSize: "14px",
                fontWeight: active ? 500 : 400,
                opacity: isOpen ? 1 : 0,
                transition: "opacity 0.2s",
                marginLeft: "4px",
            }}
        >
            {label}
        </span>
    </button>
);

const Divider = () => (
    <div
        style={{
            height: "1px",
            backgroundColor: "var(--border-subtle)",
            margin: "12px 0 12px 24px",
        }}
    />
);

const SectionHeader = ({ label, isOpen }: { label: string; isOpen: boolean }) => (
    <div
        style={{
            paddingLeft: "24px",
            paddingBottom: "8px",
            paddingTop: "16px",
            opacity: isOpen ? 1 : 0,
            height: isOpen ? "auto" : "0px",
            overflow: "hidden",
            transition: "all 0.2s ease",
            pointerEvents: "none",
        }}
    >
        <span
            style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
            }}
        >
            {label}
        </span>
    </div>
);

const StatisticsCard = ({ isOpen }: { isOpen: boolean }) => {
    if (!isOpen) return null;

    const stats = [
        { label: "Photos", value: "1,248" },
        { label: "Videos", value: "156" },
        { label: "Total Files", value: "1,404" },
    ];

    return (
        <div
            style={{
                margin: "24px 16px 0 24px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "var(--bg-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--text-secondary)" }}>
                <BarChart3 size={18} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Statistics</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{stat.label}</span>
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StorageCard = ({ isOpen }: { isOpen: boolean }) => {
    if (!isOpen) return null;

    const used = 12.8;
    const total = 15;
    const percentage = (used / total) * 100;

    return (
        <div
            style={{
                margin: "12px 16px 24px 24px",
                padding: "16px",
                borderRadius: "16px",
                backgroundColor: "var(--bg-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ color: percentage > 90 ? "#EA4335" : "var(--accent-primary)" }}>
                    <Cloud size={20} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>Storage</span>
            </div>

            <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-subtle)", borderRadius: "2px", overflow: "hidden" }}>
                <div
                    style={{
                        width: `${percentage}%`,
                        height: "100%",
                        backgroundColor: percentage > 90 ? "#EA4335" : "var(--accent-primary)",
                        transition: "width 1s ease-out",
                    }}
                />
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {used} GB of {total} GB used
            </span>
        </div>
    );
};

export function Sidebar({ isOpen, view, onNavigate }: SidebarProps) {
    const isPhotosActive = view === "photos";
    const isAlbumsActive = view === "albums";
    const isSourcesActive = view === "sources";
    const isMetadataActive = view === "metadata";

    return (
        <aside
            style={{
                width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)",
                height: "100%",
                backgroundColor: "var(--bg-primary)",
                transition: "width var(--transition-smooth)",
                display: "flex",
                flexDirection: "column",
                paddingTop: "20px",
                borderRight: "1px solid var(--border-subtle)",
                overflow: "hidden",
                zIndex: 100,
                flexShrink: 0,
            }}
        >
            <NavItem icon={<Image size={20} />} label="Photos" isOpen={isOpen} active={isPhotosActive} onClick={() => onNavigate("photos")} />

            <NavItem icon={<Library size={20} />} label="Albums" isOpen={isOpen} active={isAlbumsActive} onClick={() => onNavigate("albums")} />

            <NavItem
                icon={<Map size={20} />}
                label="Map"
                isOpen={isOpen}
                active={view === "map"}
                onClick={() => onNavigate("map")}
            />

            <SectionHeader label="Manage" isOpen={isOpen} />

            <NavItem icon={<HardDrive size={20} />} label="Sources" isOpen={isOpen} active={isSourcesActive} onClick={() => onNavigate("sources")} />

            <NavItem
                icon={<MapPin size={20} />}
                label="Locations"
                isOpen={isOpen}
                active={false}
                onClick={() => {
                    // placeholder
                }}
            />

            <NavItem
                icon={<Info size={20} />}
                label="Metadata"
                isOpen={isOpen}
                active={isMetadataActive}
                onClick={() => onNavigate("metadata")}
            />

            <NavItem
                icon={<Clock size={20} />}
                label="Date Time"
                isOpen={isOpen}
                active={false}
                onClick={() => {
                    // placeholder
                }}
            />

            <NavItem
                icon={<Activity size={20} />}
                label="Jobs"
                isOpen={isOpen}
                active={view === "jobs"}
                onClick={() => onNavigate("jobs")}
            />

            <Divider />

            <NavItem
                icon={<Trash2 size={20} />}
                label="Trash"
                isOpen={isOpen}
                active={false}
                onClick={() => {
                    // placeholder
                }}
            />

            <div style={{ marginTop: "auto" }}>
                <StatisticsCard isOpen={isOpen} />
                <StorageCard isOpen={isOpen} />
            </div>
        </aside>
    );
}
