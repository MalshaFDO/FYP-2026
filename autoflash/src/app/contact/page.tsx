"use client";

import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "./contactpage.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const copy = {
  en: {
    eyebrow: "CONTACT AUTOFLASH",
    heroTitle: "Talk To Us Fast, Or Book Without Waiting",
    heroText: "If you need help, know who to call. If you already know the service you want, jump straight into the booking flow.",
    callNow: "CALL NOW",
    quickBooking: "QUICK BOOKING",
    phoneLabel: "Phone",
    hoursLabel: "Open Days",
    routeLabel: "Best Route",
    phoneValue: "+94 76 824 8676",
    hoursValue: "Monday - Saturday",
    routeValue: "Book Online",
    whenToCall: "When to call",
    whenToCallTitle: "Best for urgent questions and coordination",
    whenToCallList: [
      "Need help choosing between services",
      "Need quick clarification before arriving",
      "Need support with a same-day booking issue",
    ],
    contactBlocks: [
      { tag: "CALL", title: "+94 76 824 8676", text: "Best for urgent booking help, service-day coordination, and direct support." },
      { tag: "HOURS", title: "Monday to Saturday", text: "Bookings are organized around visible timeslots. Sundays are closed." },
      { tag: "PLATFORM", title: "AutoFlash Online", text: "Use live pages for package selection, slot visibility, and instant confirmation." },
    ],
    answersTitle: "Quick Answers",
    answersText: "This section works more like a support desk than marketing.",
    faqs: [
      { question: "How do I make a booking?", answer: "Pick your vehicle type, choose a package, and select an available time slot." },
      { question: "Can I use a saved vehicle?", answer: "Yes, logged-in users can skip vehicle entry and move through the process faster." },
      { question: "What if a time is unavailable?", answer: "Closed days and filled slots are blocked automatically to ensure no double-bookings." },
    ],
    ctaTitle: "Ready to move from question to booking?",
    ctaText: "Use the live booking flow for the smoothest experience, or call if you need help deciding.",
    bookBodyWash: "BOOK NOW",
    callSupport: "CALL SUPPORT",
  },
  si: {
    eyebrow: "AUTOFLASH සමඟ සම්බන්ධ වන්න",
    heroTitle: "ඉක්මනින් අප සමඟ කතා කරන්න",
    heroText: "උදව් අවශ්‍ය නම් අප අමතන්න. සේවාව දැනටමත් තෝරාගෙන නම් ඔහු booking flow එකට සෘජුව යා යුතුයි.",
    callNow: "දැන් අමතන්න",
    quickBooking: "ඉක්මන් BOOKING",
    phoneLabel: "දුරකථනය",
    hoursLabel: "විවෘත දින",
    routeLabel: "හොඳම මාර්ගය",
    phoneValue: "+94 76 824 8676",
    hoursValue: "සඳුදා - සෙනසුරාදා",
    routeValue: "Online Booking",
    whenToCall: "කවදා අමතන්නද",
    whenToCallTitle: "හදිසි ප්‍රශ්න සහ සම්බන්ධීකරණයට සුදුසුයි",
    whenToCallList: [
      "සේවා දෙකක් අතර තේරීමට උදව් අවශ්‍ය නම්",
      "පැමිණීමට පෙර පැහැදිලි කිරීමක් අවශ්‍ය නම්",
      "එදිනම booking ගැටලුවක් සඳහා සහාය අවශ්‍ය නම්",
    ],
    contactBlocks: [
      { tag: "අමතන්න", title: "+94 76 824 8676", text: "හදිසි booking උදව් සහ සෘජු පාරිභෝගික සහාය සඳහා සුදුසුයි." },
      { tag: "වේලාවන්", title: "සඳුදා සිට සෙනසුරාදා දක්වා", text: "Bookings දෘශ්‍ය timeslots මත සංවිධානය කර ඇත." },
      { tag: "PLATFORM", title: "AutoFlash Online", text: "පැකේජ තේරීම සඳහා live booking pages භාවිතා කරන්න." },
    ],
    answersTitle: "ඉක්මන් පිළිතුරු",
    answersText: "මෙය marketing එකකට වඩා සහාය ලබා දෙන අංශයකි.",
    faqs: [
      { question: "මම booking එකක් කරන්නේ කොහොමද?", answer: "වාහන වර්ගය, පැකේජය සහ ඔබට ගැලපෙන වේලාව තෝරාගන්න." },
      { question: "සුරකින්න ලද වාහනයක් භාවිතා කළ හැකිද?", answer: "ඔව්, login වී ඇති අයට සුරකින්න ලද තොරතුරු භාවිතා කළ හැක." },
      { question: "වේලාවක් නොමැති නම්?", answer: "පිරුණු slots සහ වසා ඇති දින ස්වයංක්‍රීයව අවහිර කර ඇත." },
    ],
    ctaTitle: "ප්‍රශ්නයකින් booking එකකට යාමට සූදානම්ද?",
    ctaText: "සුමටම අත්දැකීම සඳහා live booking flow එක භාවිතා කරන්න.",
    bookBodyWash: "දැන් වෙන්කරන්න",
    callSupport: "සහාය අමතන්න",
  }
} as const;

export default function ContactPageClient() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className={`${styles.page} ${inter.className}`}>
      {/* 1. HERO SECTION WITH QUICK CARDS */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <span className={styles.stepTag}>{t.eyebrow}</span>
          <h1 className={`${styles.heroTitle} ${oswald.className}`}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroText}</p>
          
          <div className={styles.heroActions}>
            <a href="tel:+94768248676" className={styles.primaryBtn}>{t.callNow}</a>
            <Link href="/booking/bodywash" className={styles.secondaryBtn}>{t.quickBooking}</Link>
          </div>

          <div className={styles.quickCardRow}>
            <div className={styles.quickCard}>
              <span className={styles.cardTag}>{t.phoneLabel}</span>
              <p className={oswald.className}>{t.phoneValue}</p>
            </div>
            <div className={styles.quickCard}>
              <span className={styles.cardTag}>{t.hoursLabel}</span>
              <p className={oswald.className}>{t.hoursValue}</p>
            </div>
            <div className={styles.quickCard}>
              <span className={styles.cardTag}>{t.routeLabel}</span>
              <p className={oswald.className}>{t.routeValue}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOGIC GRID (WHEN TO CALL + INFO BLOCKS) */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          <div className={styles.splitLayout}>
            <aside className={styles.logicCard}>
              <span className={styles.cardTag}>{t.whenToCall}</span>
              <h2 className={oswald.className}>{t.whenToCallTitle}</h2>
              <ul className={styles.checkList}>
                {t.whenToCallList.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </aside>

            <div className={styles.blockGrid}>
              {t.contactBlocks.map((block) => (
                <div key={block.title} className={styles.infoCard}>
                  <span className={styles.cardTag}>{block.tag}</span>
                  <h3 className={oswald.className}>{block.title}</h3>
                  <p>{block.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ SECTION */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={oswald.className}>{t.answersTitle}</h2>
            <p>{t.answersText}</p>
          </div>
          <div className={styles.faqGrid}>
            {t.faqs.map((faq) => (
              <div key={faq.question} className={styles.faqCard}>
                <span className={styles.cardTag}>FAQ</span>
                <h4 className={oswald.className}>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* FINAL CTA BOX */}
          <div className={styles.ctaBox}>
            <h2 className={oswald.className}>{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
            <div className={styles.heroActions}>
              <Link href="/booking/bodywash" className={styles.primaryBtn}>{t.bookBodyWash}</Link>
              <a href="tel:+94768248676" className={styles.outlineBtn}>{t.callSupport}</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}