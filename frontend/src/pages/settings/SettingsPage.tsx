import React, { useState } from "react";
import {
    Moon,
    Sun,
    Monitor,
    Cpu,
    HardDrive,
    Shield,
    Smartphone,
    DownloadCloud
} from "lucide-react";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
    return (
        <div className={styles.settingsRoot}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1>Settings</h1>
                    <p>Manage your application preferences and system configurations.</p>
                </header>

                <div className={styles.sectionsList}>
                    <AppearanceSection />
                    <PerformanceSection />
                    <SystemSection />
                </div>
            </div>
        </div>
    );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={styles.sectionContent}>
                {children}
            </div>
        </div>
    );
}

function SettingsItem({
    icon: Icon,
    label,
    description,
    action
}: {
    icon: React.ElementType;
    label: string;
    description?: string;
    action: React.ReactNode
}) {
    return (
        <div className={styles.settingsItem}>
            <div className={styles.itemInfo}>
                <div className={styles.iconWrapper}>
                    <Icon size={20} />
                </div>
                <div>
                    <div className={styles.label}>{label}</div>
                    {description && <div className={styles.description}>{description}</div>}
                </div>
            </div>
            <div>{action}</div>
        </div>
    );
}

function AppearanceSection() {
    const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

    return (
        <SettingsSection title="Appearance">
            <SettingsItem
                icon={theme === "dark" ? Moon : theme === "light" ? Sun : Monitor}
                label="Interface Theme"
                description="Select your preferred color theme for the interface."
                action={
                    <div className={styles.themeGroup}>
                        <ThemeBtn active={theme === "light"} icon={Sun} onClick={() => setTheme("light")} />
                        <ThemeBtn active={theme === "dark"} icon={Moon} onClick={() => setTheme("dark")} />
                        <ThemeBtn active={theme === "system"} icon={Monitor} onClick={() => setTheme("system")} />
                    </div>
                }
            />
            <SettingsItem
                icon={Smartphone}
                label="Compact Mode"
                description="Increase information density by reducing padding."
                action={<Switch checked={false} onChange={() => { }} />}
            />
        </SettingsSection>
    );
}

function PerformanceSection() {
    const [animations, setAnimations] = useState(true);
    const [virtualization, setVirtualization] = useState(true);

    return (
        <SettingsSection title="Performance">
            <SettingsItem
                icon={Cpu}
                label="Reduce GPU Usage"
                description="Disable complex visual effects and blur comparisons."
                action={<Switch checked={!animations} onChange={() => setAnimations(!animations)} />}
            />
            <SettingsItem
                icon={DownloadCloud}
                label="Aggressive Preloading"
                description="Preload next page of photos for smoother browsing (uses more bandwidth)."
                action={<Switch checked={virtualization} onChange={() => setVirtualization(!virtualization)} />}
            />
        </SettingsSection>
    );
}

function SystemSection() {
    return (
        <SettingsSection title="System">
            <SettingsItem
                icon={HardDrive}
                label="Storage & Cache"
                description="Clear temporary thumbnail cache to free up disk space."
                action={
                    <button className={styles.actionButton}>
                        Clear Cache (245 MB)
                    </button>
                }
            />
            <SettingsItem
                icon={Shield}
                label="Privacy Mode"
                description="Blur photos locally until hovered."
                action={<Switch checked={false} onChange={() => { }} />}
            />
        </SettingsSection>
    );
}

function ThemeBtn({ active, icon: Icon, onClick }: { active: boolean; icon: React.ElementType; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`${styles.themeBtn} ${active ? styles.active : ""}`}
        >
            <Icon size={16} />
        </button>
    );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={styles.switch}
            style={{ backgroundColor: checked ? "var(--accent-primary)" : "var(--bg-secondary)" }}
        >
            <div
                className={styles.switchThumb}
                style={{ left: checked ? 22 : 2 }}
            />
        </button>
    );
}
