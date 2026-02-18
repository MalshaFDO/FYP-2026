'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      
      {/* LOGO */}
      <div className={styles.logoWrapper}>
        <Image
          src="/AF2.png"
          alt="AutoFlash Logo"
          width={140} // Increased slightly for better visibility
          height={38}
          priority
        />
      </div>

      {/* DESKTOP NAV */}
      <nav className={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/services">Services</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        {/* Added a Header CTA */}
        <Link href="/booking" className={styles.navCTA}>Book Now</Link>
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
        <Link href="/booking" className={styles.mobileCTA} onClick={() => setMenuOpen(false)}>Book Now</Link>
      </div>
    </header>
  );
};

export default Header;