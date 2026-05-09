"use client";

import { useEffect, useRef } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "./Home.module.css";

const copy = {
  en: {
    heroSubtitle: "MODERN EQUIPMENT",
    heroTitle: "Car Wash",
    heroDescription:
      "A clean car is essential for maintaining its resale value and ensuring a presentable appearance on the road.",
    readMore: "Read More",
    orderNow: "Order Now",
    accentText: "SMART PLATFORM",
    sectionTitle: "Smart Vehicle Service & Quotation",
    sectionDesc:
      "AutoFlash simplifies vehicle servicing with AI-powered quotations, online booking, and transparent pricing without phone-call delays.",
    callForBooking: "Call for booking",
    learnMore: "Learn More",
    features: [
      { icon: "⚡", title: "Instant Quotations", text: "AI-generated pricing in seconds." },
      { icon: "📆", title: "Online Booking", text: "Book services anytime, anywhere." },
      { icon: "🧠", title: "Smart System", text: "Centralized service management." },
      { icon: "💰", title: "Transparent Pricing", text: "No hidden costs or confusion." },
    ],
    howTitle: "How AutoFlash Works",
    steps: [
      { number: "01", title: "Select Service", text: "Choose vehicle and service type." },
      { number: "02", title: "Get Quotation", text: "Instant AI-powered pricing." },
      { number: "03", title: "Book Slot", text: "Select date and time." },
      { number: "04", title: "Service Done", text: "Visit and complete service." },
    ],
    servicesTitle: "Our Services",
    services: [
      { title: "Premium Wash", text: "Fast, perfect cleaning." },
      { title: "Full Service", text: "Routine inspection and care." },
      { title: "Engine Check", text: "Advanced diagnostics." },
      { title: "Detailing", text: "Interior and exterior care." },
    ],
    whyTitle: "Why Choose AutoFlash",
    whyList: [
      "AI-powered quotations",
      "No hidden costs",
      "Fast online booking",
      "Modern equipment",
      "Built for Sri Lanka",
    ],
    ctaTitle: "Ready to Service Your Vehicle?",
    ctaText: "Get a quotation or book your service in minutes.",
    getQuotation: "Get Quotation",
    bookService: "Book Service",
  },
  si: {
    heroSubtitle: "නවීන උපකරණ",
    heroTitle: "කාර් වොෂ්",
    heroDescription:
      "ඔබගේ වාහනය පිරිසිදුව තබා ගැනීම එහි නැවත විකිණීමේ වටිනාකම සහ පාරේ හොඳ පෙනුම රැකගැනීමට වැදගත්ය.",
    readMore: "තවත් බලන්න",
    orderNow: "දැන් අයදුම් කරන්න",
    accentText: "ස්මාර්ට් පද්ධතිය",
    sectionTitle: "ස්මාර්ට් වාහන සේවා සහ මිල ගණන්",
    sectionDesc:
      "AutoFlash AI මගින් මිල ගණන්, ඔන්ලයින් වෙන්කරවාගැනීම සහ පැහැදිලි මිලකරණය සමඟ වාහන සේවාව පහසු කරයි.",
    callForBooking: "වෙන්කරවා ගැනීමට අමතන්න",
    learnMore: "වැඩිදුර දැනගන්න",
    features: [
      { icon: "⚡", title: "ක්ෂණික මිල ගණන්", text: "තත්පර කිහිපයකින් AI මිල ගණන්." },
      { icon: "📆", title: "ඔන්ලයින් වෙන්කරවා ගැනීම", text: "ඕනෑම වෙලාවක සේවා වෙන්කරන්න." },
      { icon: "🧠", title: "ස්මාර්ට් පද්ධතිය", text: "මධ්‍යගත සේවා කළමනාකරණය." },
      { icon: "💰", title: "පැහැදිලි මිලකරණය", text: "සැඟවුණු ගාස්තු නොමැත." },
    ],
    howTitle: "AutoFlash ක්‍රියා කරන ආකාරය",
    steps: [
      { number: "01", title: "සේවාව තෝරන්න", text: "වාහනය සහ සේවා වර්ගය තෝරන්න." },
      { number: "02", title: "මිල ගණන් ලබාගන්න", text: "ක්ෂණික AI මිල ගණන්." },
      { number: "03", title: "වේලාව වෙන්කරන්න", text: "දිනය සහ වේලාව තෝරන්න." },
      { number: "04", title: "සේවාව සම්පූර්ණ කරන්න", text: "පැමිණ සේවාව ලබාගන්න." },
    ],
    servicesTitle: "අපගේ සේවා",
    services: [
      { title: "ප්‍රිමියම් වොෂ්", text: "වේගවත් හා නිවැරදි පිරිසිදු කිරීම." },
      { title: "සම්පූර්ණ සේවාව", text: "නිතිපතා පරීක්ෂාව සහ නඩත්තු." },
      { title: "එන්ජින් පරීක්ෂාව", text: "උසස් දෝෂ විමර්ශනය." },
      { title: "ඩීටේලින්", text: "ඇතුළත සහ පිටත රැකවරණය." },
    ],
    whyTitle: "AutoFlash තෝරාගත යුත්තේ ඇයි",
    whyList: [
      "AI මගින් මිල ගණන්",
      "සැඟවුණු ගාස්තු නැත",
      "වේගවත් ඔන්ලයින් වෙන්කරවාගැනීම",
      "නවීන උපකරණ",
      "ශ්‍රී ලංකාව සඳහා නිර්මාණය කර ඇත",
    ],
    ctaTitle: "ඔබගේ වාහනයට සේවාවක් ලබාදීමට සූදානම්ද?",
    ctaText: "මිනිත්තු කිහිපයකින් මිල ගණන් ලබාගෙන සේවාව වෙන්කරන්න.",
    getQuotation: "මිල ගණන් ලබාගන්න",
    bookService: "සේවාව වෙන්කරන්න",
  },
} as const;

export default function HomePageClient() {
  const revealRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = copy[language];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.isVisible);
        }
      },
      { threshold: 0.1 }
    );

    if (revealRef.current) observer.observe(revealRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.pageWrapper}>
      <section className={styles.hero}>
        <video autoPlay muted loop playsInline className={styles.bgVideo}>
          <source src="/BGV.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay}></div>

        <div className={styles.heroContent}>
          <span className={styles.heroSubtitle}>{t.heroSubtitle}</span>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroDescription}>{t.heroDescription}</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnRed}>
              {t.readMore} <FaChevronRight size={10} />
            </button>
            <button className={styles.btnGold}>
              {t.orderNow} <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </section>

      <section ref={revealRef} className={`${styles.contentSection} ${styles.revealEffect}`}>
        <div className={styles.container}>
          <div className={styles.mainInfo}>
            <div className={styles.textSide}>
              <span className={styles.accentText}>{t.accentText}</span>
              <h2 className={styles.sectionTitle}>{t.sectionTitle}</h2>
              <p className={styles.sectionDesc}>{t.sectionDesc}</p>

              <div className={styles.contactInfo}>
                <span className={styles.label}>{t.callForBooking}</span>
                <span className={styles.phone}> +94 76 824 8676</span>
              </div>

              <button className={styles.btnRedSquare}>
                {t.learnMore} <FaChevronRight size={10} />
              </button>
            </div>

            <div className={styles.imageSide}>
              <img src="/REDCAR.png" alt="Vehicle" className={styles.carImage} />
            </div>
          </div>

          <div className={styles.featuresGrid}>
            {t.features.map((feature) => (
              <div key={feature.title} className={styles.featureItem}>
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
          <div className={styles.stepsGrid}>
            {t.steps.map((step) => (
              <div key={step.number} className={styles.stepCard}>
                <span>{step.number}</span>
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
              <div key={service.title} className={styles.serviceCard}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitleLight}>{t.whyTitle}</h2>
          <ul className={styles.whyList}>
            {t.whyList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnRed}>{t.getQuotation}</button>
            <button className={styles.btnGold}>{t.bookService}</button>
          </div>
        </div>
      </section>
    </main>
  );
}
