import { NavLink, Link } from "react-router-dom";
import {
    Image,
    Video,
    FileCode,
    Cpu,
    Code,
    FolderTree,
    ChevronLeft
} from "lucide-react";
import styles from "./SettingsSidebar.module.css";

const SETTINGS_MENU = [
    { path: "/settings/images", label: "Images", icon: Image },
    { path: "/settings/videos", label: "Videos", icon: Video },
    { path: "/settings/raw", label: "Raw Conversion", icon: FileCode },
    { path: "/settings/jobs", label: "Jobs", icon: Cpu },
    { path: "/settings/encoding", label: "Encoding", icon: Code },
    { path: "/settings/organization", label: "Organization", icon: FolderTree },
];

export function SettingsSidebar() {
    return (
        <aside className={styles.sidebar}>
            <Link to="/" className={styles.backLink}>
                <ChevronLeft size={14} /> Back to Gallery
            </Link>

            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Settings</h1>
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
                        <item.icon size={18} className={styles.icon} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
