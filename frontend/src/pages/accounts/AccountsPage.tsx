import React from "react";
import { Cloud, ShieldCheck, LogOut } from "lucide-react";

export function AccountsPage() {
    return (
        <div style={{ padding: "40px 24px", height: "100%", overflowY: "auto", backgroundColor: "var(--bg-primary)", scrollbarWidth: "none" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
                <header>
                    <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "8px" }}>Accounts</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Manage connected accounts and sign-in options.</p>
                </header>

                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Your Account</h2>
                    <div style={{
                        borderRadius: 16,
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        padding: 24,
                        display: "flex", alignItems: "center", justifyItems: "space-between", gap: 24,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: "50%",
                                backgroundColor: "var(--accent-primary)",
                                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 20, fontWeight: 700
                            }}>
                                B
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Burhan</div>
                                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>burhan@example.com</div>
                            </div>
                        </div>
                        <button style={{
                            padding: "8px 16px", borderRadius: 8,
                            border: "1px solid var(--border-subtle)",
                            backgroundColor: "transparent",
                            color: "var(--text-primary)", fontWeight: 500,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                        }}>
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Connected Services</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <AccountItem
                            icon={Cloud}
                            name="Google Photos"
                            status="Connected"
                            email="burhan@gmail.com"
                            connected={true}
                        />
                        <AccountItem
                            icon={ShieldCheck}
                            name="Apple iCloud"
                            status="Not connected"
                            connected={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function AccountItem({ icon: Icon, name, status, email, connected }: { icon: React.ElementType, name: string, status: string, email?: string, connected: boolean }) {
    return (
        <div style={{
            borderRadius: 16,
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            padding: 20,
            display: "flex", alignItems: "center", justifyItems: "space-between", gap: 16
        }}>
            <div style={{
                width: 48, height: 48, borderRadius: 12,
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <Icon size={24} />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        backgroundColor: connected ? "var(--status-success)" : "var(--text-muted)"
                    }} />
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{status} {email && `• ${email}`}</span>
                </div>
            </div>
            <button style={{
                padding: "8px 16px", borderRadius: 8,
                border: "none",
                backgroundColor: connected ? "var(--bg-secondary)" : "var(--accent-primary)",
                color: connected ? "var(--text-primary)" : "white", fontWeight: 600,
                cursor: "pointer"
            }}>
                {connected ? "Manage" : "Connect"}
            </button>
        </div>
    );
}
