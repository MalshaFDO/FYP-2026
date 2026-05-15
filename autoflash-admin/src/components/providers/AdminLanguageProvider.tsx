"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminLanguage = "en" | "si";

interface AdminLanguageContextValue {
  language: AdminLanguage;
  setLanguage: (language: AdminLanguage) => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

const STORAGE_KEY = "autoflash-language";

const AdminLanguageContext = createContext<AdminLanguageContextValue | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AdminLanguage>("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
    const savedTheme = window.localStorage.getItem("autoflash-theme");

    if (savedLanguage === "en" || savedLanguage === "si") {
      setLanguage(savedLanguage);
    }

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("autoflash-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
    }),
    [language, theme]
  );

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);

  if (!context) {
    throw new Error("useAdminLanguage must be used within an AdminLanguageProvider");
  }

  return context;
}
