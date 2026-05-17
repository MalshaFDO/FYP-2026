"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "./servicespage.module.css";

const copy = {
  en: {
    eyebrow: "Our Services",
    heroTitle: "Precision Care for Every Vehicle",
    heroText: "From express detailing to full mechanical restoration, AutoFlash provides a structured, high-end service experience tailored to your car's needs.",
    bookNow: "Book a Service",
    viewPricing: "View Pricing",
    categoriesTitle: "Service Categories",
    categoriesText: "We have divided our expertise into specialized flows to ensure your vehicle gets exactly what it requires.",
    services: [
      {
        tag: "Maintenance",
        title: "Full Service",
        text: "Comprehensive mechanical checkups, oil changes, and filter replacements to keep your engine running at peak performance.",
        link: "/booking/full-service"
      },
      {
        tag: "Wash",
        title: "Body Wash",
        text: "A clean and quick wash service to keep your vehicle fresh and tidy.",
        link: "/booking/bodywash"
      },
      {
        tag: "Wash",
        title: "Bodywash Vacuum Wax",
        text: "Body wash with vacuuming and wax finishing for a cleaner, sharper result.",
        link: "/booking/bodywash"
      },
      {
        tag: "Wash",
        title: "Full Body Wash",
        text: "A more detailed wash package for deeper exterior cleaning and finishing.",
        link: "/booking/bodywash"
      }
    ],
    ctaTitle: "Not sure which service you need?",
    ctaText: "Launch our smart booking flow and we'll help you select the right package based on your vehicle type.",
    startFlow: "Start Smart Booking",
    contactUs: "Contact Us"
  },
  si: {
    eyebrow: "අපගේ සේවාවන්",
    heroTitle: "සෑම වාහනයකටම නිවැරදි රැකවරණය",
    heroText: "Express detailing සිට සම්පූර්ණ යාන්ත්‍රික අලුත්වැඩියාව දක්වා, AutoFlash ඔබේ වාහනයේ අවශ්‍යතාවයට සරිලන උසස් සේවාවක් ලබා දෙයි.",
    bookNow: "දැන් වෙන්කරවා ගන්න",
    viewPricing: "මිල ගණන් බලන්න",
    categoriesTitle: "සේවා වර්ගීකරණය",
    categoriesText: "ඔබේ වාහනයට අවශ්‍ය දේ නිවැරදිව ලබා දීම සඳහා අපි අපගේ විශේෂඥතාව ප්‍රධාන අංශ හතරකට බෙදා ඇත.",
    services: [
      {
        tag: "නඩත්තුව",
        title: "සම්පූර්ණ සහ Express සේවා",
        text: "එන්ජිමේ උපරිම ක්‍රියාකාරීත්වය සඳහා තෙල් මාරු කිරීම, ෆිල්ටර් ප්‍රතිස්ථාපනය සහ සම්පූර්ණ පරීක්ෂාවන්.",
        link: "/booking/full-service"
      },
      {
        tag: "Detailing",
        title: "Auto Detailing සහ Cut Polish",
        text: "ඉහළ ප්‍රමිතියෙන් යුත් protective coatings භාවිතා කරමින් බාහිර පෙනුම සහ අභ්‍යන්තරය පිරිසිදු කිරීම.",
        link: "/booking/detailing"
      },
      {
        tag: "ආරක්ෂාව",
        title: "Under-Carriage Coating",
        text: "පරිසර බලපෑම් වලින් වාහනයේ යටිබාහිර කොටස් ආරක්ෂා කිරීම සඳහා විශේෂිත ප්‍රති-ඛාදන ප්‍රතිකාර.",
        link: "/booking/coating"
      },
      {
        tag: "විශේෂිත",
        title: "යාන්ත්‍රික සහ Hybrid අලුත්වැඩියාව",
        text: "නවීන හයිබ්‍රිඩ් පද්ධති සහ සංකීර්ණ යාන්ත්‍රික ගැටළු සඳහා උසස් රෝග විනිශ්චය සහ අලුත්වැඩියාවන්.",
        link: "/booking/mechanical"
      }
    ],
    ctaTitle: "ඔබට අවශ්‍ය සේවාව ගැන විශ්වාස නැද්ද?",
    ctaText: "අපගේ smart booking flow එක හරහා ඔබේ වාහනයට ගැළපෙන හොඳම පැකේජය තෝරා ගැනීමට අපි උදවු වන්නෙමු.",
    startFlow: "Smart Booking අරඹන්න",
    contactUs: "අපට කතා කරන්න"
  }
} as const;

export default function ServicesPageClient() {
  const { language } = useLanguage();
  const t = copy[language as keyof typeof copy] || copy.en;

  return (
    <main className={styles.page}>
      {/* --- HERO SECTION --- */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent} style={{ textAlign: "center" }}>
            <span className={styles.cardTag}>{t.eyebrow}</span>
            <h1 className={`${styles.heroTitle} ${styles.displayFont}`}>{t.heroTitle}</h1>
            <p className={styles.heroText}>{t.heroText}</p>
            <div className={styles.heroActions}>
              <Link href="/booking" className={styles.primaryBtn}>{t.bookNow}</Link>
              <Link href="#categories" className={styles.secondaryBtn}>{t.viewPricing}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section id="categories" className={styles.gridSection}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
             <span className={styles.cardTag}>{t.eyebrow}</span>
             <h2 className={`${styles.heroTitle} ${styles.displayFont}`} style={{ color: '#111', fontSize: '3rem', margin: '10px 0' }}>{t.categoriesTitle}</h2>
             <p style={{ maxWidth: '700px', margin: '0 auto', color: '#666', lineHeight: '1.6' }}>{t.categoriesText}</p>
          </div>

          <div className={styles.valuesGrid}>
            {t.services.map((service, i) => (
              <article key={i} className={styles.valueCard}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.cardTag}>{service.tag}</span>
                  <h3 className={styles.displayFont} style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#111' }}>{service.title}</h3>
                  <p style={{ color: '#444', marginBottom: '30px', flexGrow: 1 }}>{service.text}</p>
                  <Link href={service.link} className={styles.secondaryBtn} style={{ alignSelf: 'flex-start' }}>
                    {t.bookNow}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <h2 className={`${styles.ctaTitle} ${styles.displayFont}`}>{t.ctaTitle}</h2>
            <p className={styles.ctaText}>{t.ctaText}</p>
            <div className={styles.ctaActions}>
              <Link href="/booking" className={styles.primaryBtn}>{t.startFlow}</Link>
              <Link href="/contact" className={styles.secondaryBtn}>{t.contactUs}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
