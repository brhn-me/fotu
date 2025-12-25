import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            style={{
                background: "transparent",
                border: "none",
                color: "var(--text-primary)",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-surface)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};
