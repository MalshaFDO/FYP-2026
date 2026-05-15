"use client";

import { useAdminLanguage } from "@/components/providers/AdminLanguageProvider";
import styles from "./ThemeToggleButton.module.css";

interface ThemeToggleButtonProps {
  className?: string;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v2.5M12 18.5V21M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M3 12h2.5M18.5 12H21M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.2 14.7A7.8 7.8 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
    </svg>
  );
}

export default function ThemeToggleButton({ className = "" }: ThemeToggleButtonProps) {
  const { theme, setTheme } = useAdminLanguage();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`.trim()}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
