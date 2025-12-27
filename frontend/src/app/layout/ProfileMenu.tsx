import { useState } from "react";
import { LogOut, Settings, User, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileMenu.module.css";

export const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <div className={styles.profileContainer}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.avatarButton}
            >
                B
            </button>
            {isOpen && (
                <>
                    <div onClick={() => setIsOpen(false)} className={styles.backdrop} />
                    <div className={styles.dropdown}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatarLarge}>B</div>
                            <div className={styles.name}>Burhan</div>
                            <div className={styles.email}>burhan@example.com</div>
                            <button onClick={() => handleNavigate("/accounts")} className={styles.manageBtn}>Manage your Account</button>
                        </div>
                        <div className={styles.menuItems}>
                            <button onClick={() => handleNavigate("/profile")} className={styles.menuItem}><User size={18} />Profile</button>
                            <button onClick={() => handleNavigate("/accounts")} className={styles.menuItem}><Users size={18} />Accounts</button>
                            <button onClick={() => handleNavigate("/settings")} className={styles.menuItem}><Settings size={18} />Settings</button>
                            <button onClick={() => setIsOpen(false)} className={styles.menuItem}><LogOut size={18} />Logout</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
