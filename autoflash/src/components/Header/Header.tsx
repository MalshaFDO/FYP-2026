'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "./Header.module.css";
import ServiceSelectorModal from "@/components/ServiceSelectorModal/ServiceSelectorModal";

const copy = {
  en: {
    navLinks: [
      { href: "/", label: "Home" },
      { href: "/services", label: "Services" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/record", label: "Profile" },
    ],
    bookNow: "Book Now",
    goHome: "Go to AutoFlash home",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    english: "English",
    sinhala: "සිංහල",
  },
  si: {
    navLinks: [
      { href: "/", label: "මුල් පිටුව" },
      { href: "/services", label: "සේවා" },
      { href: "/about", label: "අප ගැන" },
      { href: "/contact", label: "සම්බන්ධ වන්න" },
      { href: "/record", label: "පැතිකඩ" },
    ],
    bookNow: "දැන් වෙන්කරන්න",
    goHome: "AutoFlash මුල් පිටුවට යන්න",
    openMenu: "නැවිගේෂන් මෙනුව විවෘත කරන්න",
    closeMenu: "නැවිගේෂන් මෙනුව වසන්න",
    english: "English",
    sinhala: "සිංහල",
  },
} as const;

const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = copy[language];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setShowModal(false);
  }, [pathname]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <Link href="/" className={styles.logoWrapper} aria-label={t.goHome}>
          <Image
            src="/AFLOGO.png"
            alt="AutoFlash Logo"
            width={250}
            height={100}
            priority
          />
        </Link>

        <nav className={styles.nav}>
          {t.navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}

          <div className={styles.languageSwitch}>
            <button
              type="button"
              className={language === "en" ? styles.languageActive : ""}
              onClick={() => setLanguage("en")}
            >
              {t.english}
            </button>
            <button
              type="button"
              className={language === "si" ? styles.languageActive : ""}
              onClick={() => setLanguage("si")}
            >
              {t.sinhala}
            </button>
          </div>

          <button
            type="button"
            className={styles.bookingBtn}
            onClick={() => setShowModal(true)}
          >
            {t.bookNow}
          </button>
        </nav>

        <button
          type="button"
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          aria-label={menuOpen ? t.closeMenu : t.openMenu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${styles.mobileMenu} ${menuOpen ? styles.show : ""}`}>
          <div className={styles.mobileLanguageSwitch}>
            <button
              type="button"
              className={language === "en" ? styles.languageActive : ""}
              onClick={() => setLanguage("en")}
            >
              {t.english}
            </button>
            <button
              type="button"
              className={language === "si" ? styles.languageActive : ""}
              onClick={() => setLanguage("si")}
            >
              {t.sinhala}
            </button>
          </div>

          {t.navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            className={styles.bookingBtn}
            onClick={() => {
              setMenuOpen(false);
              setShowModal(true);
            }}
          >
            {t.bookNow}
          </button>
        </div>
      </header>

      {showModal && <ServiceSelectorModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Header;
