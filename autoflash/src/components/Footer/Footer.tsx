"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

const Footer = () => {
  const { language } = useLanguage();

  const content = {
    si: {
      tagline: "වාහන පිරිසිදු කිරීමේ සහ නඩත්තු කිරීමේ විශ්වාසනීය නාමය.",
      quickLinks: "ක්ෂණික සබැඳි",
      inventory: "වාහන එකතුව",
      booking: "සේවාවක් වෙන්කරන්න",
      about: "අප ගැන",
      visit: "අපව හමුවන්න",
      location: "වෙන්නප්පුව, ශ්‍රී ලංකාව",
      callUs: "අමතන්න",
      followUs: "අපව අනුගමනය කරන්න",
      contactLine: "වෙන්කරවා ගැනීම්, වාහන විස්තර කිරීම සහ උසස් වාහන සේවා සඳහා අප හා සම්බන්ධ වන්න.",
      bookingCta: "සේවාව වෙන්කරන්න",
      rights: "සියලු හිමිකම් ඇවිරිණි.",
      dev: "නිර්මාණය: මල්ෂ ප්‍රනාන්දු",
    },
    en: {
      tagline: "Premium automotive services and authorized dealership.",
      quickLinks: "Quick Links",
      inventory: "Vehicle Inventory",
      booking: "Book a Service",
      about: "About Us",
      visit: "Visit Us",
      location: "Wennappuwa, Sri Lanka",
      callUs: "Call Us",
      followUs: "Follow Us",
      contactLine: "Reach out for bookings, detailing, and premium vehicle care.",
      bookingCta: "Book Your Service",
      rights: "All rights reserved.",
      dev: "Developed by Malsha Fernando",
    },
  };

  const t = language === "si" ? content.si : content.en;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* BRAND SECTION */}
        <div className={styles.brandSection}>
          <span className={styles.kicker}>Premium Auto Care</span>
          <h2 className={styles.logo}>
            AUTO <span className={styles.highlight}>FLASH</span>
          </h2>
          <p className={styles.tagline}>{t.tagline}</p>
          <p className={styles.contactLine}>{t.contactLine}</p>
          <Link href="/booking" className={styles.primaryAction}>
            {t.bookingCta}
          </Link>
        </div>

        {/* QUICK LINKS */}
        <div className={styles.section}>
          <h3 className={styles.heading}>{t.quickLinks}</h3>
          <ul className={styles.list}>
            <li><Link href="/inventory">{t.inventory}</Link></li>
            <li><Link href="/booking">{t.booking}</Link></li>
            <li><Link href="/about">{t.about}</Link></li>
          </ul>
        </div>

        {/* VISIT US */}
        <div className={styles.section}>
          <h3 className={styles.heading}>{t.visit}</h3>
          <div className={styles.contactCard}>
            <FaMapMarkerAlt className={styles.icon} />
            <div>
              <span className={styles.contactLabel}>{t.visit}</span>
              <span className={styles.contactValue}>{t.location}</span>
            </div>
          </div>
          <div className={styles.contactCard}>
            <FaPhoneAlt className={styles.icon} />
            <div>
              <span className={styles.contactLabel}>{t.callUs}</span>
              <span className={styles.contactValue}>+94 76 824 8676</span>
            </div>
          </div>
        </div>

        {/* FOLLOW US */}
        <div className={styles.section}>
          <h3 className={styles.heading}>{t.followUs}</h3>
          <div className={styles.socials}>
            <a href="https://facebook.com" className={styles.socialLink}><FaFacebook /></a>
            <a href="https://instagram.com" className={styles.socialLink}><FaInstagram /></a>
            <a href="https://wa.me/94768248676" className={styles.socialLink}><FaWhatsapp /></a>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {new Date().getFullYear()} AutoFlash. {t.rights}</p>
        <p className={styles.developer}>{t.dev}</p>
      </div>
    </footer>
  );
};

export default Footer;