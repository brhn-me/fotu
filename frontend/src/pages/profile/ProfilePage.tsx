import React from "react";
import { Mail, Shield, Image, Film, HardDrive, Calendar } from "lucide-react";

export function ProfilePage() {
    return (
        <div style={{ padding: "40px 24px", height: "100%", overflowY: "auto", backgroundColor: "var(--bg-primary)", scrollbarWidth: "none" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>

                {/* Profile Header Card */}
                <div style={{
                    borderRadius: 24,
                    backgroundColor: "var(--bg-surface)",
                    padding: 32,
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: 32,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)"
                }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: "50%",
                        backgroundColor: "var(--accent-primary)",
                        color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 32, fontWeight: 700,
                        border: "4px solid var(--bg-surface)",
                        boxShadow: "0 0 0 2px var(--accent-primary)"
                    }}>
                        B
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Burhan</h1>
                            <div style={{
                                padding: "4px 10px", borderRadius: 99,
                                backgroundColor: "rgba(59, 130, 246, 0.1)",
                                color: "#3b82f6", fontSize: 12, fontWeight: 600,
                                display: "flex", alignItems: "center", gap: 4
                            }}>
                                <Shield size={12} />
                                ADMIN
                            </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
                                <Mail size={16} />
                                <span>burhan@example.com</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
                                <Calendar size={16} />
                                <span>Joined December 2025</span>
                            </div>
                        </div>
                    </div>
                    <button style={{
                        padding: "10px 20px", borderRadius: 12,
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s"
                    }}>
                        Edit Profile
                    </button>
                </div>

                {/* Stats Grid */}
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Library Stats</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        <StatCard icon={Image} label="Total Photos" value="12,450" color="var(--accent-primary)" />
                        <StatCard icon={Film} label="Total Videos" value="843" color="#f59e0b" />
                        <StatCard icon={HardDrive} label="Storage Used" value="45.2 GB" color="#10b981" />
                    </div>
                </div>

                {/* Recent Activity or other sections could go here */}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
    return (
        <div style={{
            borderRadius: 16,
            backgroundColor: "var(--bg-surface)",
            padding: 24,
            border: "1px solid var(--border-subtle)",
            display: "flex", flexDirection: "column", gap: 12,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                    color: color,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <Icon size={20} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
        </div>
    );
}
