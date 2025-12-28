// src/components/Sidebar.tsx

import React from "react";
import { Image, Library, Map, MapPin, Info, Trash2, Cloud, BarChart3, Clock, HardDrive, Activity, Files } from "lucide-react";
import styles from "./Sidebar.module.css";
import { useStats } from "../../hooks/useStats";

type AppView = "photos" | "albums" | "sources" | "metadata" | "jobs" | "jobDetails" | "map" | "files";

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
        className={`${styles.navItem} ${active ? styles.active : ""}`}
    >
        <div className={styles.iconWrapper}>{icon}</div>
        <span
            className={styles.label}
            style={{
                opacity: isOpen ? 1 : 0,
                fontWeight: active ? 500 : 400,
            }}
        >
            {label}
        </span>
    </button>
);

const Divider = () => (
    <div className={styles.divider} />
);

const SectionHeader = ({ label, isOpen }: { label: string; isOpen: boolean }) => (
    <div
        className={styles.sectionHeader}
        style={{
            opacity: isOpen ? 1 : 0,
            height: isOpen ? "auto" : "0px",
            paddingTop: isOpen ? "16px" : "0px",
            paddingBottom: isOpen ? "8px" : "0px",
        }}
    >
        <span className={styles.sectionLabel}>
            {label}
        </span>
    </div>
);

const StatisticsCard = ({ isOpen }: { isOpen: boolean }) => {
    const stats = useStats();

    if (!stats) return null;

    const items = [
        { label: "Photos", value: stats.photos.toLocaleString() },
        { label: "Videos", value: stats.videos.toLocaleString() },
        { label: "Total Files", value: stats.totalFiles.toLocaleString() },
    ];

    return (
        <div
            className={styles.statsCard}
            style={{
                opacity: isOpen ? 1 : 0,
                transition: `opacity 0.2s ease ${isOpen ? '0.2s' : '0s'}`
            }}
        >
            <div className={styles.statsHeader}>
                <BarChart3 size={18} />
                <span>Statistics</span>
            </div>
            <div className={styles.statsList}>
                {items.map((stat) => (
                    <div key={stat.label} className={styles.statItem}>
                        <span className={styles.statItemLabel}>{stat.label}</span>
                        <span className={styles.statItemValue}>{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StorageCard = ({ isOpen }: { isOpen: boolean }) => {
    const stats = useStats();

    if (!stats) return null;

    // Use reported total from OS, or fallback
    const totalGB = stats.totalGB || 100;
    const freeGB = stats.freeGB || 0;
    const usedGB = totalGB - freeGB;

    const percentage = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;

    return (
        <div
            className={styles.storageCard}
            style={{
                opacity: isOpen ? 1 : 0,
                transition: `opacity 0.2s ease ${isOpen ? '0.2s' : '0s'}`
            }}
        >
            <div className={styles.storageHeader}>
                <div className={styles.storageIcon} style={{ color: percentage > 90 ? "#EA4335" : "var(--accent-primary)" }}>
                    <Cloud size={20} />
                </div>
                <span>Storage</span>
            </div>

            <div className={styles.progressOuter}>
                <div
                    className={styles.progressInner}
                    style={{
                        width: `${Math.max(2, percentage)}%`,
                        backgroundColor: percentage > 90 ? "#EA4335" : "var(--accent-primary)",
                    }}
                />
            </div>
            <span className={styles.storageText}>
                {freeGB.toFixed(1)} GB Free of {totalGB.toFixed(0)} GB
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
            className={styles.sidebar}
            style={{
                width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)",
                transition: `width 0.3s ease ${isOpen ? '0s' : '0.2s'}`
            }}
        >
            <NavItem icon={<Image size={20} />} label="Photos" isOpen={isOpen} active={isPhotosActive} onClick={() => onNavigate("photos")} />

            <NavItem icon={<Library size={20} />} label="Albums" isOpen={isOpen} active={isAlbumsActive} onClick={() => onNavigate("albums")} />

            <NavItem
                icon={<Files size={20} />}
                label="Files"
                isOpen={isOpen}
                active={view === "files"}
                onClick={() => onNavigate("files")}
            />

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

            <div className={styles.bottomSection}>
                <StatisticsCard isOpen={isOpen} />
                <StorageCard isOpen={isOpen} />
            </div>
        </aside>
    );
}
