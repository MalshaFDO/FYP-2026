"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  FaFacebook,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

const content = {
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
  si: {
    tagline: "ප්‍රිමියම් වාහන සේවා සහ අනුමත අලෙවි නියෝජිත සේවාව.",
    quickLinks: "ඉක්මන් සබැඳි",
    inventory: "වාහන එකතුව",
    booking: "සේවාවක් වෙන්කරන්න",
    about: "අප ගැන",
    visit: "අපව හමුවන්න",
    location: "වෙන්නප්පුව, ශ්‍රී ලංකාව",
    callUs: "අමතන්න",
    followUs: "අපව අනුගමනය කරන්න",
    contactLine: "වෙන්කරවා ගැනීම්, detailing සහ වාහන සත්කාර සඳහා අපව අමතන්න.",
    bookingCta: "ඔබේ සේවාව වෙන්කරන්න",
    rights: "සියලුම හිමිකම් ඇවිරිනි.",
    dev: "සැකසුම: මල්ෂ ප්‍රනාන්දු",
  },
} as const;

const Footer = () => {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
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

        <div className={styles.section}>
          <h3 className={styles.heading}>{t.quickLinks}</h3>
          <ul className={styles.list}>
            <li><Link href="/inventory">{t.inventory}</Link></li>
            <li><Link href="/booking">{t.booking}</Link></li>
            <li><Link href="/about">{t.about}</Link></li>
          </ul>
        </div>

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

        <div className={styles.section}>
          <h3 className={styles.heading}>{t.followUs}</h3>
          <div className={styles.socials}>
            <a href="https://facebook.com" className={styles.socialLink} aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" className={styles.socialLink} aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>
          &copy; {new Date().getFullYear()} AutoFlash. {t.rights}
        </p>
        <p className={styles.developer}>{t.dev}</p>
      </div>
    </footer>
  );
};

export default Footer;
