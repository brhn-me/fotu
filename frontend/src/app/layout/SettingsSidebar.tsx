import { NavLink, Link } from "react-router-dom";
import {
    Image,
    Monitor,
    FileCode,
    Cpu,
    Code,
    FolderTree,
    ChevronLeft,
    Terminal
} from "lucide-react";
import styles from "./SettingsSidebar.module.css";

const SETTINGS_MENU = [
    { path: "/settings/thumbnails", label: "Thumbnails", icon: Image },
    { path: "/settings/lightbox", label: "Lightbox", icon: Monitor },
    { path: "/settings/raw", label: "Raw Conversion", icon: FileCode },
    { path: "/settings/jobs", label: "Jobs", icon: Cpu },
    { path: "/settings/encoding", label: "Encoding", icon: Code },
    { path: "/settings/organization", label: "Organization", icon: FolderTree },
    { path: "/settings/runtimes", label: "Runtimes", icon: Terminal },
];

interface SettingsSidebarProps {
    isOpen: boolean;
}

export function SettingsSidebar({ isOpen }: SettingsSidebarProps) {
    return (
        <aside
            className={styles.sidebar}
            style={{ width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" }}
        >
            <div
                className={styles.sectionHeader}
                style={{
                    opacity: isOpen ? 1 : 0,
                    height: isOpen ? "auto" : "0px",
                    paddingTop: isOpen ? "16px" : "0px",
                    paddingBottom: isOpen ? "8px" : "0px",
                }}
            >
                <span className={styles.sectionLabel}>Settings</span>
            </div>

            <nav className={styles.nav}>
                {SETTINGS_MENU.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                        }
                    >
                        <div className={styles.iconWrapper}>
                            <item.icon size={20} />
                        </div>
                        <span
                            className={styles.label}
                            style={{
                                opacity: isOpen ? 1 : 0,
                            }}
                        >
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            <div className={styles.bottomSection}>
                <Link
                    to="/"
                    className={styles.navItem}
                >
                    <div className={styles.iconWrapper}>
                        <ChevronLeft size={20} />
                    </div>
                    <span
                        className={styles.label}
                        style={{
                            opacity: isOpen ? 1 : 0,
                        }}
                    >
                        Back to Gallery
                    </span>
                </Link>
            </div>
        </aside>
    );
}
