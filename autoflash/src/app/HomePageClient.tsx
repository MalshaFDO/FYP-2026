"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import {
  FaRocket,
  FaCalendarAlt,
  FaBrain,
  FaMoneyBillWave,
  FaCar,
  FaFileInvoiceDollar,
  FaTools,
  FaCheckCircle,
} from "react-icons/fa";
import styles from "./Home.module.css";

const copy = {
  en: {
    heroSubtitle: "MODERN EQUIPMENT",
    heroTitle: "Vehicle Services",
    heroDescription:
      "A clean vehicle is essential for maintaining its resale value and ensuring a presentable appearance on the road.",
    btnBodyWash: "Body Wash",
    btnFullService: "Full Service",
    btnOilChange: "Oil Change",
    accentText: "SMART PLATFORM",
    sectionTitle: "Smart Vehicle Service & Quotation",
    sectionDesc:
      "AutoFlash simplifies vehicle servicing with AI-powered quotations, online booking, and transparent pricing without phone-call delays.",
    features: [
      { icon: <FaRocket />, title: "Instant Quotations", text: "AI-generated pricing in seconds." },
      { icon: <FaCalendarAlt />, title: "Online Booking", text: "Book services anytime, anywhere." },
      { icon: <FaBrain />, title: "Smart System", text: "Centralized service management." },
      { icon: <FaMoneyBillWave />, title: "Transparent Pricing", text: "No hidden costs or confusion." },
    ],
    howTitle: "How AutoFlash Works",
    steps: [
      { number: "01", title: "Select Service", text: "Choose vehicle and service type.", icon: <FaCar /> },
      { number: "02", title: "Get Quotation", text: "Instant AI-powered pricing.", icon: <FaFileInvoiceDollar /> },
      { number: "03", title: "Book Slot", text: "Pick a time that fits you.", icon: <FaCalendarAlt /> },
      { number: "04", title: "Service Done", text: "Professional care for your car.", icon: <FaTools /> },
    ],
    servicesTitle: "Our Main Tracks",
    services: [
      { title: "Body Wash", text: "Premium exterior and interior cleaning.", link: "/booking" },
      { title: "Full Service", text: "Complete mechanical checkup and oil change.", link: "/booking" },
      { title: "Detailing", text: "Professional cut and polish services. Contact us for details.", link: "/contact" },
      { title: "Hybrid Care", text: "Specialized maintenance for hybrid vehicles.", link: "/booking" },
    ],
    ctaTitle: "Ready to Experience AutoFlash?",
    ctaText: "Join the modern way of vehicle maintenance today.",
    getQuotation: "Get Quotation",
    bookService: "Book Now",
  },
  si: {
    heroSubtitle: "නවීන උපකරණ",
    heroTitle: "වාහන සේවා",
    heroDescription:
      "වාහනය පිරිසිදුව තබාගැනීම එහි නැවත විකිණීමේ වටිනාකම සහ මාර්ගයේ හොඳ පෙනුම රැක ගැනීමට අත්‍යවශ්‍ය වේ.",
    btnBodyWash: "බොඩි වොෂ්",
    btnFullService: "සම්පූර්ණ සේවාව",
    btnOilChange: "තෙල් වෙනස් කිරීම",
    accentText: "සැලසුම් බිහිගත වේදිකාව",
    sectionTitle: "ස්මාර්ට් වාහන සේවාව සහ මිල ගණන්",
    sectionDesc:
      "AutoFlash AI ආධාරිත මිල ගණන්, online booking, සහ පැහැදිලි මිලකරණය සමඟ වාහන සේවාව සරල කරයි.",
    features: [
      { icon: <FaRocket />, title: "ක්ෂණික මිල ගණන්", text: "තත්පර කිහිපයකින් AI මඟින් මිල ගණන් ලබාගන්න." },
      { icon: <FaCalendarAlt />, title: "Online Booking", text: "ඕනෑම වේලාවක, ඕනෑම තැනකින් සේවා වෙන්කරන්න." },
      { icon: <FaBrain />, title: "ස්මාර්ට් පද්ධතිය", text: "කේන්ද්‍රගත සේවා කළමනාකරණය." },
      { icon: <FaMoneyBillWave />, title: "පැහැදිලි මිලකරණය", text: "රහස් ගාස්තු හෝ අවුල් නැහැ." },
    ],
    howTitle: "AutoFlash ක්‍රියා කරන ආකාරය",
    steps: [
      { number: "01", title: "සේවාව තෝරන්න", text: "වාහන වර්ගය සහ සේවා වර්ගය තෝරන්න.", icon: <FaCar /> },
      { number: "02", title: "මිල ගණන් ලබාගන්න", text: "ක්ෂණික AI මිල ගණන්.", icon: <FaFileInvoiceDollar /> },
      { number: "03", title: "වේලාව වෙන්කරන්න", text: "ඔබට ගැළපෙන වේලාවක් තෝරන්න.", icon: <FaCalendarAlt /> },
      { number: "04", title: "සේවාව අවසන්", text: "ඔබේ වාහනයට වෘත්තීය සත්කාරය.", icon: <FaTools /> },
    ],
    servicesTitle: "අපගේ ප්‍රධාන සේවා",
    services: [
      { title: "බොඩි වොෂ්", text: "උසස් මට්ටමේ බාහිර සහ අභ්‍යන්තර පිරිසිදු කිරීම.", link: "/booking" },
      { title: "සම්පූර්ණ සේවාව", text: "සම්පූර්ණ යාන්ත්‍රික පරීක්ෂාව සහ තෙල් වෙනස් කිරීම.", link: "/booking" },
      { title: "Detailing", text: "වෘත්තීය cut සහ polish සේවාව. වැඩි විස්තර සඳහා අපව අමතන්න.", link: "/contact" },
      { title: "Hybrid Care", text: "hybrid වාහන සඳහා විශේෂිත නඩත්තුව.", link: "/booking" },
    ],
    ctaTitle: "AutoFlash අත්විඳීමට සූදානම්ද?",
    ctaText: "වාහන නඩත්තුවේ නවීන ක්‍රමයට අදම එක්වන්න.",
    getQuotation: "මිල ගණන් ලබාගන්න",
    bookService: "දැන් වෙන්කරන්න",
  },
} as const;

export default function HomePageClient() {
  const { language } = useLanguage();
  const t = copy[language as keyof typeof copy] || copy.en;

  return (
    <main className={styles.pageWrapper}>
      <section className={styles.hero}>
        <video autoPlay muted loop className={styles.bgVideo}>
          <source src="/BGV.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroSubtitle}>{t.heroSubtitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroDescription}>{t.heroDescription}</p>

          <div className={styles.heroBtns}>
            <Link href="/booking/bodywash" className={styles.btnRed}>
              {t.btnBodyWash}
            </Link>
            <Link href="/booking/full-service" className={styles.btnGold}>
              {t.btnFullService}
            </Link>
            <Link href="/booking/full-service?plan=oil" className={styles.btnTransparent}>
              {t.btnOilChange}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.accentText}>{t.accentText}</span>
            <h2 className={styles.sectionTitle}>{t.sectionTitle}</h2>
            <p className={styles.sectionDesc}>{t.sectionDesc}</p>
          </div>
          <div className={styles.featureGrid}>
            {t.features.map((feature, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.howSection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitleLight}>{t.howTitle}</h2>
          <div className={styles.howGrid}>
            {t.steps.map((step) => (
              <div key={step.number} className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div className={styles.stepIcon}>{step.icon}</div>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitle}>{t.servicesTitle}</h2>
          <div className={styles.servicesGrid}>
            {t.services.map((service) => (
              <Link
                href={service.link}
                key={service.title}
                className={styles.serviceCard}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <div className={styles.checkIcon}>
                  <FaCheckCircle />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className={styles.heroBtns}>
            <Link href="/booking/full-service" className={styles.btnRed}>
              {t.getQuotation}
            </Link>
            <Link href="/booking/bodywash" className={styles.btnGold}>
              {t.bookService}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
