import React from "react";
import { Mail, Shield, Image, Film, HardDrive, Calendar } from "lucide-react";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
    return (
        <div className={styles.container}>
            <div className={styles.centered}>

                {/* Profile Header Card */}
                <div className={styles.headerCard}>
                    <div className={styles.avatar}>
                        B
                    </div>
                    <div className={styles.profileInfo}>
                        <div className={styles.nameRow}>
                            <h1 className={styles.name}>Fotu</h1>
                            <div className={styles.badge}>
                                <Shield size={12} />
                                ADMIN
                            </div>
                        </div>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactRow}>
                                <Mail size={16} />
                                <span>burhan@example.com</span>
                            </div>
                            <div className={styles.contactRow}>
                                <Calendar size={16} />
                                <span>Joined December 2025</span>
                            </div>
                        </div>
                    </div>
                    <button className={styles.editButton}>
                        Edit Profile
                    </button>
                </div>

                {/* Stats Grid */}
                <div>
                    <h2 className={styles.sectionTitle}>Library Stats</h2>
                    <div className={styles.statsGrid}>
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
        <div className={styles.statCard}>
            <div className={styles.statHeader}>
                <div
                    className={styles.iconWrapper}
                    style={{
                        backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                        color: color,
                    }}
                >
                    <Icon size={20} />
                </div>
                <div className={styles.statLabel}>{label}</div>
            </div>
            <div className={styles.statValue}>{value}</div>
        </div>
    );
}
