'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import ServiceSelectorModal from '@/components/ServiceSelectorModal/ServiceSelectorModal';

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/record", label: "Profile" },
];

const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
        
        {/* LOGO */}
        <Link href="/" className={styles.logoWrapper} aria-label="Go to AutoFlash home">
          <Image
            src="/AFLOGO.png"
            alt="AutoFlash Logo"
            width={250}
            height={100}
            priority
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            className={styles.bookingBtn}
            onClick={() => setShowModal(true)}
          >
            Book Now
          </button>

        </nav>

        {/* HAMBURGER */}
        <button
          type="button"
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* MOBILE MENU */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.show : ""}`}>
          {navLinks.map((link) => (
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
            Book Now
          </button>

        </div>

      </header>

      {/* ✅ MODAL OUTSIDE HEADER STRUCTURE */}
      {showModal && (
        <ServiceSelectorModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default Header;
