// src/components/Sidebar.tsx

import React from "react";
import { Image, Library, Map, MapPin, Info, Trash2, Cloud, BarChart3, Clock, HardDrive, Activity } from "lucide-react";
import styles from "./Sidebar.module.css";

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
    if (!isOpen) return null;

    const stats = [
        { label: "Photos", value: "1,248" },
        { label: "Videos", value: "156" },
        { label: "Total Files", value: "1,404" },
    ];

    return (
        <div className={styles.statsCard}>
            <div className={styles.statsHeader}>
                <BarChart3 size={18} />
                <span>Statistics</span>
            </div>
            <div className={styles.statsList}>
                {stats.map((stat) => (
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
    if (!isOpen) return null;

    const used = 12.8;
    const total = 15;
    const percentage = (used / total) * 100;

    return (
        <div className={styles.storageCard}>
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
                        width: `${percentage}%`,
                        backgroundColor: percentage > 90 ? "#EA4335" : "var(--accent-primary)",
                    }}
                />
            </div>
            <span className={styles.storageText}>
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
            className={styles.sidebar}
            style={{ width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" }}
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

            <div className={styles.bottomSection}>
                <StatisticsCard isOpen={isOpen} />
                <StorageCard isOpen={isOpen} />
            </div>
        </aside>
    );
}
