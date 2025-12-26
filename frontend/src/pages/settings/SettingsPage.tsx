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

export function SettingsPage() {
    return (
        <div style={{ padding: "40px 24px", height: "100%", overflowY: "auto", backgroundColor: "var(--bg-primary)", scrollbarWidth: "none" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
                <header>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>Settings</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Manage your application preferences and system configurations.</p>
                </header>

                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
        <div style={{
            borderRadius: 16,
            backgroundColor: "var(--bg-surface)",
            padding: 24,
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)"
        }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>{title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0",
            borderBottom: "1px solid var(--border-subtle)"
        }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                }}>
                    <Icon size={20} />
                </div>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
                    {description && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{description}</div>}
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
                    <div style={{ display: "flex", gap: 4, padding: 4, backgroundColor: "var(--bg-secondary)", borderRadius: 10 }}>
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
                    <button style={{
                        padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-subtle)",
                        background: "transparent", color: "var(--text-primary)", fontWeight: 500, fontSize: 13, cursor: "pointer"
                    }}>
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
            style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                backgroundColor: active ? "var(--bg-surface)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                transition: "all 0.2s"
            }}
        >
            <Icon size={16} />
        </button>
    );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            style={{
                width: 44, height: 24, borderRadius: 99, border: "none",
                backgroundColor: checked ? "var(--accent-primary)" : "var(--bg-secondary)",
                position: "relative", cursor: "pointer", transition: "background 0.2s"
            }}
        >
            <div style={{
                width: 20, height: 20, borderRadius: "50%", backgroundColor: "white",
                position: "absolute", top: 2, left: checked ? 22 : 2,
                transition: "left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
            }} />
        </button>
    );
}
