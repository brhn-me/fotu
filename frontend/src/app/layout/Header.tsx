import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../components/search/SearchBar";
import { ThemeToggle } from "./ThemeToggle"; // Same folder imports
import { ProfileMenu } from "./ProfileMenu";
import styles from "./Header.module.css";

const PinwheelLogo = () => (
    <img src="/logo.png" alt="Fotu Logo" width="28" height="28" style={{ display: "block" }} />
);

export const Header = ({ onMenuClick, onFilterClick }: { onMenuClick: () => void; onFilterClick: () => void; }) => {
    const navigate = useNavigate();
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <button onClick={onMenuClick} className={styles.menuButton}>
                    <Menu size={20} />
                </button>
                <div onClick={() => navigate("/")} className={styles.logoContainer}>
                    <PinwheelLogo />
                    <h1 className={styles.title}>Fotu</h1>
                </div>
            </div>
            <SearchBar onFilterClick={onFilterClick} />
            <div className={styles.rightSection}>
                <div className={styles.spacer} />
                <ThemeToggle />
                <ProfileMenu />
            </div>
        </header>
    );
};
