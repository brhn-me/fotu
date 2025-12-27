import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import styles from "./ThemeToggle.module.css";

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className={styles.toggleButton}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};
