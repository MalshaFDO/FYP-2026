"use client";

import styles from "./Footer.module.css";
import { useLanguage } from "@/components/providers/LanguageProvider";

const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer className={styles.footer}>
      <p>
        © {new Date().getFullYear()} AutoFlash.{" "}
        {language === "si" ? "සියලු හිමිකම් ඇවිරිණි." : "All rights reserved."}
      </p>
    </footer>
  );
};

export default Footer;
