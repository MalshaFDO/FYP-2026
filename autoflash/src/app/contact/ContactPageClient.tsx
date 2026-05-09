"use client";

import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "../info-pages.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const copy = {
  en: {
    eyebrow: "Contact AutoFlash",
    heroTitle: "Talk To Us Fast, Or Book Without Waiting",
    heroText:
      "If someone needs help, they should know who to call. If they already know the service they want, they should be pushed straight into the booking flow.",
    callNow: "Call Now",
    quickBooking: "Quick Booking",
    phone: "Phone",
    openDays: "Open days",
    bestRoute: "Best route",
    mondayToSaturday: "Monday to Saturday",
    bookOnline: "Book online when possible",
    whenToCall: "When to call",
    whenToCallTitle: "Best for urgent questions and service-day coordination",
    whenToCallList: [
      "Need help choosing between services",
      "Need quick clarification before arriving",
      "Need support with a same-day booking issue",
    ],
    contactBlocks: [
      {
        tag: "Call",
        title: "+94 76 824 8676",
        text: "Best for urgent booking help, service-day coordination, and direct customer support.",
      },
      {
        tag: "Hours",
        title: "Monday to Saturday",
        text: "Bookings are organized around visible timeslots, with Sundays treated as closed in the scheduling flow.",
      },
      {
        tag: "Platform",
        title: "AutoFlash Online Booking",
        text: "Use the live booking pages when you want package selection, slot visibility, and less back-and-forth.",
      },
    ],
    answersTitle: "Quick Answers Before You Reach Out",
    answersText: "This section works more like a support desk than a marketing block.",
    faqs: [
      {
        question: "How do I make a booking?",
        answer: "Use the body wash or full-service flow, pick your vehicle and package, then choose the date and time slot that works.",
      },
      {
        question: "Can I use a saved vehicle?",
        answer: "Yes. Logged-in customers can reuse saved vehicle details to move through the process faster.",
      },
      {
        question: "What if a day or time is unavailable?",
        answer: "Closed days, past times, and filled slots are blocked in the booking view so customers can choose another available option immediately.",
      },
    ],
    fastestPath: "Need the fastest path?",
    fastestPathText: "If the customer already knows the service needed, booking online is usually the quickest option.",
    startBooking: "Start Booking",
    ctaTitle: "Ready to move from question to booking?",
    ctaText: "Use the live booking flow for the smoothest experience, or call if you need help deciding which service fits the vehicle best.",
    bookBodyWash: "Book Body Wash",
    callSupport: "Call Support",
  },
  si: {
    eyebrow: "AutoFlash සමඟ සම්බන්ධ වන්න",
    heroTitle: "ඉක්මනින් අප සමඟ කතා කරන්න, නැත්නම් රැඳී නොසිට booking කරන්න",
    heroText:
      "උදව් අවශ්‍ය නම් කාට කතා කළ යුතුදැයි පාරිභෝගිකයා දැනගත යුතුයි. සේවාව දැනටමත් තෝරාගෙන නම් ඔහු booking flow එකට සෘජුව යා යුතුයි.",
    callNow: "දැන් අමතන්න",
    quickBooking: "ඉක්මන් booking",
    phone: "දුරකථනය",
    openDays: "විවෘත දින",
    bestRoute: "හොඳම මාර්ගය",
    mondayToSaturday: "සඳුදා සිට සෙනසුරාදා දක්වා",
    bookOnline: "හැකි විට online booking කරන්න",
    whenToCall: "කවදා අමතන්නද",
    whenToCallTitle: "හදිසි ප්‍රශ්න සහ සේවා-දින සම්බන්ධීකරණයට සුදුසුම ක්‍රමය",
    whenToCallList: [
      "සේවා දෙකක් අතර තේරීමට උදව් අවශ්‍ය නම්",
      "පැමිණීමට පෙර ඉක්මන් පැහැදිලි කිරීමක් අවශ්‍ය නම්",
      "එදිනම booking ගැටලුවක් සඳහා සහාය අවශ්‍ය නම්",
    ],
    contactBlocks: [
      {
        tag: "අමතන්න",
        title: "+94 76 824 8676",
        text: "හදිසි booking උදව්, service-day coordination සහ සෘජු පාරිභෝගික සහාය සඳහා සුදුසුයි.",
      },
      {
        tag: "වේලාවන්",
        title: "සඳුදා සිට සෙනසුරාදා දක්වා",
        text: "Bookings දෘශ්‍ය timeslots මත සංවිධානය කර ඇති අතර, ඉරිදා scheduling flow එකේ වසා ඇත.",
      },
      {
        tag: "Platform",
        title: "AutoFlash Online Booking",
        text: "පැකේජ තේරීම, slot visibility සහ අඩු back-and-forth අවශ්‍ය නම් live booking pages භාවිතා කරන්න.",
      },
    ],
    answersTitle: "අප අමතන්නට පෙර ඉක්මන් පිළිතුරු",
    answersText: "මෙය marketing block එකකට වඩා support desk එකක් වගේ වැඩ කරයි.",
    faqs: [
      {
        question: "මම booking එකක් කරන්නේ කොහොමද?",
        answer: "body wash හෝ full-service flow එක භාවිතා කර, වාහනය හා පැකේජය තෝරා, ඔබට ගැලපෙන දිනය සහ වේලාව තෝරන්න.",
      },
      {
        question: "සුරකින්න ලද වාහනයක් භාවිතා කළ හැකිද?",
        answer: "ඔව්. login වී ඇති පාරිභෝගිකයන්ට සුරකින්න ලද වාහන තොරතුරු භාවිතා කර ඉක්මනින් ඉදිරියට යා හැක.",
      },
      {
        question: "දිනයක් හෝ වේලාවක් නොමැති නම්?",
        answer: "වසා ඇති දින, ගතවූ වේලාවන් සහ පිරුණු slots booking view එකේ අවහිර කර ඇති නිසා වෙනත් ලබාගත හැකි විකල්පයක් තෝරාගත හැක.",
      },
    ],
    fastestPath: "ඉක්මන්ම මාර්ගය අවශ්‍යද?",
    fastestPathText: "පාරිභෝගිකයාට අවශ්‍ය සේවාව දැනටමත් දන්නා විට online booking කිරීම සාමාන්‍යයෙන් ඉක්මන්ම විකල්පයයි.",
    startBooking: "Booking අරඹන්න",
    ctaTitle: "ප්‍රශ්නයකින් booking එකකට යාමට සූදානම්ද?",
    ctaText: "සුමටම අත්දැකීම සඳහා live booking flow එක භාවිතා කරන්න, නැත්නම් ගැලපෙන සේවාව තීරණය කිරීමට උදව් අවශ්‍ය නම් අමතන්න.",
    bookBodyWash: "බොඩි වොෂ් වෙන්කරන්න",
    callSupport: "සහාය අමතන්න",
  },
} as const;

export default function ContactPageClient() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className={`${styles.page} ${styles.contactPage} ${inter.className}`}>
      <section className={styles.contactHero}>
        <div className={styles.heroInner}>
          <div className={styles.contactHeroWrap}>
            <div className={styles.contactInfoBlock}>
              <span className={styles.eyebrow}>{t.eyebrow}</span>
              <h1 className={`${styles.heroTitle} ${oswald.className}`}>{t.heroTitle}</h1>
              <p className={styles.heroText}>{t.heroText}</p>
              <div className={styles.contactActionStrip}>
                <a href="tel:+94768248676" className={styles.primaryBtn}>
                  {t.callNow}
                </a>
                <Link href="/booking/bodywash" className={styles.secondaryBtn}>
                  {t.quickBooking}
                </Link>
              </div>
            </div>

            <div className={styles.contactHighlight}>
              <div className={styles.contactQuickCard}>
                <span className={styles.contactQuickLabel}>{t.phone}</span>
                <span className={styles.contactQuickValue}>+94 76 824 8676</span>
              </div>
              <div className={styles.contactQuickCard}>
                <span className={styles.contactQuickLabel}>{t.openDays}</span>
                <span className={styles.contactQuickValue}>{t.mondayToSaturday}</span>
              </div>
              <div className={styles.contactQuickCard}>
                <span className={styles.contactQuickLabel}>{t.bestRoute}</span>
                <span className={styles.contactQuickValue}>{t.bookOnline}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.signalSection}>
        <div className={styles.sectionInner}>
          <div className={styles.signalGrid}>
            <aside className={styles.signalCard}>
              <span className={styles.cardTag}>{t.whenToCall}</span>
              <h2 className={`${styles.cardTitle} ${oswald.className}`}>{t.whenToCallTitle}</h2>
              <ul className={styles.signalList}>
                {t.whenToCallList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>

            <div className={styles.contactGrid}>
              {t.contactBlocks.map((block) => (
                <article key={block.title} className={styles.contactCard}>
                  <span className={styles.cardTag}>{block.tag}</span>
                  <h3 className={`${styles.cardTitle} ${oswald.className}`}>{block.title}</h3>
                  <p className={styles.cardText}>{block.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>{t.answersTitle}</h2>
            <p className={styles.sectionCopy}>{t.answersText}</p>
          </div>

          <div className={styles.faqStack}>
            {t.faqs.map((item) => (
              <article key={item.question} className={styles.faqWide}>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>

          <div className={styles.infoStrip}>
            <div>
              <strong>{t.fastestPath}</strong>
              <p className={styles.cardText}>{t.fastestPathText}</p>
            </div>
            <Link href="/booking/full-service" className={styles.primaryBtn}>
              {t.startBooking}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={`${styles.ctaTitle} ${oswald.className}`}>{t.ctaTitle}</h2>
          <p className={styles.ctaText}>{t.ctaText}</p>
          <div className={styles.ctaActions}>
            <Link href="/booking/bodywash" className={styles.primaryBtn}>
              {t.bookBodyWash}
            </Link>
            <a href="tel:+94768248676" className={styles.secondaryBtn}>
              {t.callSupport}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
