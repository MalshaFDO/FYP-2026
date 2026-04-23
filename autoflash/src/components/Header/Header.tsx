'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import ServiceSelectorModal from '@/components/ServiceSelectorModal/ServiceSelectorModal';

const Header = () => {
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

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        
        {/* LOGO */}
        <div className={styles.logoWrapper}>
          <Image
            src="/AFLOGO.jpg"
            alt="AutoFlash Logo"
            width={132}
            height={56}
            priority
          />
        </div>

        {/* DESKTOP NAV */}
        <nav className={styles.nav}>
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/record">Profile</Link>

         <button
  className={styles.bookingBtn}
  onClick={() => setShowModal(true)}
>
  Book Now 
</button>

        </nav>

        {/* HAMBURGER */}
        <div
          className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* MOBILE MENU */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.show : ""}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link href="/record" onClick={() => setMenuOpen(false)}>Profile</Link>

          <button
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
