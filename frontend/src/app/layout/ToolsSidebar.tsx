import { NavLink, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Info, Clock, Wrench } from "lucide-react";
import styles from "./SettingsSidebar.module.css"; // Reuse settings sidebar styles for consistency

interface ToolsSidebarProps {
    isOpen: boolean;
}

const TOOLS_MENU = [
    { label: "Fix Locations", icon: MapPin, path: "/tools/locations" },
    { label: "Update Metadata", icon: Info, path: "/tools/metadata" },
    { label: "Fix Date Time", icon: Clock, path: "/tools/datetime" },
];

export function ToolsSidebar({ isOpen }: ToolsSidebarProps) {
    return (
        <aside
            className={styles.sidebar}
            style={{ width: isOpen ? "var(--sidebar-width)" : "var(--sidebar-collapsed-width)" }}
        >
            <div
                className={styles.sectionHeader}
                style={{
                    // Fixed height in CSS, just handle opacity here
                }}
            >
                <span
                    className={styles.sectionLabel}
                    style={{
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    }}
                >
                    Tools
                </span>
            </div>

            <nav className={styles.nav}>
                {TOOLS_MENU.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                        }
                        title={!isOpen ? item.label : undefined}
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
                    title={!isOpen ? "Back to Gallery" : undefined}
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
