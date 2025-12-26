import { useState } from "react";
import { LogOut, Settings, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#34A853", color: "white", border: "2px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, marginLeft: "4px", transition: "all 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "transparent")}
            >
                B
            </button>
            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1999 }} />
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: "280px", backgroundColor: "var(--bg-primary)", borderRadius: "16px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-subtle)", padding: "16px 0", zIndex: 2000, animation: "fadeInScale 0.15s ease-out" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 20px 20px 20px", borderBottom: "1px solid var(--border-subtle)", marginBottom: "8px" }}>
                            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--accent-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 700, marginBottom: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>B</div>
                            <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Burhan</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>burhan@example.com</div>
                            <button onClick={() => handleNavigate("/accounts")} style={{ marginTop: "16px", padding: "8px 24px", borderRadius: "20px", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-primary)", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>Manage your Account</button>
                        </div>
                        <div style={{ padding: "4px 0" }}>
                            <button onClick={() => handleNavigate("/profile")} style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><User size={18} />Profile</button>
                            <button onClick={() => handleNavigate("/accounts")} style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><Users size={18} />Accounts</button>
                            <button onClick={() => handleNavigate("/settings")} style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><Settings size={18} />Settings</button>
                            <button onClick={() => setIsOpen(false)} style={{ width: "100%", padding: "12px 24px", display: "flex", alignItems: "center", gap: "12px", background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: "14px", textAlign: "left", transition: "background-color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-secondary)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}><LogOut size={18} />Logout</button>
                        </div>
                        <style>{`@keyframes fadeInScale { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
                    </div>
                </>
            )}
        </div>
    );
};
