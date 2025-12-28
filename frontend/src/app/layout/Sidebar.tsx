// src/components/Sidebar.tsx

import React from "react";
import { Image, Library, Map, HardDrive, Files, RefreshCcw, Settings, Wrench, Trash2, Cloud } from "lucide-react";
import styles from "./Sidebar.module.css";
import { useStats } from "../../hooks/useStats";

type AppView = "photos" | "albums" | "sources" | "metadata" | "jobs" | "jobDetails" | "map" | "files" | "settings" | "tools";

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
        title={!isOpen ? label : undefined}
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

const Divider = ({ isOpen }: { isOpen: boolean }) => (
    <div
        className={styles.divider}
        style={{
            marginLeft: isOpen ? 24 : 0,
            marginRight: isOpen ? 24 : 0,
            width: isOpen ? "calc(100% - 48px)" : "100%",
            opacity: isOpen ? 1 : 0.5
        }}
    />
);

const SectionHeader = ({ label, isOpen }: { label: string; isOpen: boolean }) => (
    <div
        className={styles.sectionHeader}
        style={{
            // Keep layout space constant to prevent jumping
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.2s ease',
        }}
    >
        <span className={styles.sectionLabel}>
            {label}
        </span>
    </div>
);

const SystemStatus = ({ isOpen }: { isOpen: boolean }) => {
    const stats = useStats();

    // Use reported total from OS, or fallback
    const totalGB = stats?.totalGB || 0;
    const freeGB = stats?.freeGB || 0;
    const usedGB = totalGB > 0 ? totalGB - freeGB : 0;
    const percentage = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;

    return (
        <div
            className={styles.statsCard}
            style={{
                margin: isOpen ? "24px 16px 24px 24px" : "0px",
                padding: isOpen ? 16 : 0,
                opacity: isOpen ? 1 : 0,
                maxHeight: isOpen ? 300 : 0, // Use max-height for transition (height: auto doesn't animate)
                height: "auto",
                overflow: "hidden",
                // When closing: Fade opacity (0.2s), then collapse max-height/margin/padding (0.3s)
                // When opening: Expand max-height/margin/padding (0.3s), then fade opacity (0.2s)
                transition: isOpen
                    ? "max-height 0.3s ease, margin 0.3s ease, padding 0.3s ease, opacity 0.2s ease 0.2s"
                    : "opacity 0.2s ease, max-height 0.3s ease 0.2s, margin 0.3s ease 0.2s, padding 0.3s ease 0.2s",
                pointerEvents: isOpen ? "auto" : "none"
            }}
            title={!isOpen ? "System Status" : undefined}
        >
            <div className={styles.statsHeader} style={{ marginBottom: 12 }}>
                <Cloud size={18} color={percentage > 90 ? "#EA4335" : "var(--accent-primary)"} />
                <span>System</span>
            </div>

            <div className={styles.statsList}>
                <div className={styles.statItem}>
                    <span className={styles.statItemLabel}>Photos</span>
                    <span className={styles.statItemValue}>{stats?.photos?.toLocaleString() || "-"}</span>
                </div>
                <div className={styles.statItem}>
                    <span className={styles.statItemLabel}>Videos</span>
                    <span className={styles.statItemValue}>{stats?.videos?.toLocaleString() || "-"}</span>
                </div>
            </div>

            <div style={{ marginTop: 12 }}>
                <div className={styles.progressOuter}>
                    <div
                        className={styles.progressInner}
                        style={{
                            width: `${Math.max(2, percentage)}%`,
                            backgroundColor: percentage > 90 ? "#EA4335" : "var(--accent-primary)",
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span className={styles.storageText}>{usedGB.toFixed(0)} GB used</span>
                    <span className={styles.storageText}>{totalGB.toFixed(0)} GB total</span>
                </div>
            </div>
        </div>
    );
};

export function Sidebar({ isOpen, view, onNavigate }: SidebarProps) {
    const isPhotosActive = view === "photos";
    const isAlbumsActive = view === "albums";
    const isSourcesActive = view === "sources";
    // const isMetadataActive = view === "metadata"; // Removed

    return (
        <aside
            className={styles.sidebar}
            style={{
                width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)",
                transition: `width 0.3s ease ${isOpen ? '0s' : '0.2s'}`
            }}
        >
            <div className={styles.scrollArea}>
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
                    icon={<Wrench size={20} />}
                    label="Tools"
                    isOpen={isOpen}
                    active={view === "tools"}
                    onClick={() => onNavigate("tools")}
                />

                <Divider isOpen={isOpen} />

                <NavItem
                    icon={<RefreshCcw size={20} />}
                    label="Jobs"
                    isOpen={isOpen}
                    active={view === "jobs"}
                    onClick={() => onNavigate("jobs")}
                />

                <NavItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    isOpen={isOpen}
                    active={view === "settings"}
                    onClick={() => onNavigate("settings")}
                />

                <Divider isOpen={isOpen} />

                <NavItem
                    icon={<Trash2 size={20} />}
                    label="Trash"
                    isOpen={isOpen}
                    active={false}
                    onClick={() => {
                        // placeholder
                    }}
                />
            </div>

            <div className={styles.bottomSection}>
                <SystemStatus isOpen={isOpen} />
            </div>
        </aside>
    );
}
