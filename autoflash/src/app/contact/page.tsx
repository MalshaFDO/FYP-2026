import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import styles from "../info-pages.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Contact | AutoFlash",
  description: "Contact AutoFlash for bookings, support, and service questions.",
};

const contactBlocks = [
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
];

const faqs = [
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
];

export default function ContactPage() {
  return (
    <main className={`${styles.page} ${styles.contactPage} ${inter.className}`}>
      <section className={styles.contactHero}>
        <div className={styles.heroInner}>
          <div className={styles.contactHeroWrap}>
            <div className={styles.contactInfoBlock}>
              <span className={styles.eyebrow}>Contact AutoFlash</span>
              <h1 className={`${styles.heroTitle} ${oswald.className}`}>Talk To Us Fast, Or Book Without Waiting</h1>
              <p className={styles.heroText}>
                This page is meant to feel direct and useful. If someone needs help, they should know who to call. If they already
                know what service they want, they should be pushed straight into the booking flow.
              </p>
              <div className={styles.contactActionStrip}>
                <a href="tel:+94768248676" className={styles.primaryBtn}>
                  Call Now
                </a>
                <Link href="/booking/bodywash" className={styles.secondaryBtn}>
                  Quick Booking
                </Link>
              </div>
            </div>

            <div className={styles.contactHighlight}>
              <div className={styles.contactQuickCard}>
                <span className={styles.contactQuickLabel}>Phone</span>
                <span className={styles.contactQuickValue}>+94 76 824 8676</span>
              </div>
              <div className={styles.contactQuickCard}>
                <span className={styles.contactQuickLabel}>Open days</span>
                <span className={styles.contactQuickValue}>Monday to Saturday</span>
              </div>
              <div className={styles.contactQuickCard}>
                <span className={styles.contactQuickLabel}>Best route</span>
                <span className={styles.contactQuickValue}>Book online when possible</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.signalSection}>
        <div className={styles.sectionInner}>
          <div className={styles.signalGrid}>
            <aside className={styles.signalCard}>
              <span className={styles.cardTag}>When to call</span>
              <h2 className={`${styles.cardTitle} ${oswald.className}`}>Best for urgent questions and service-day coordination</h2>
              <ul className={styles.signalList}>
                <li>Need help choosing between services</li>
                <li>Need quick clarification before arriving</li>
                <li>Need support with a same-day booking issue</li>
              </ul>
            </aside>

            <div className={styles.contactGrid}>
              {contactBlocks.map((block) => (
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
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Quick Answers Before You Reach Out</h2>
            <p className={styles.sectionCopy}>This section works more like a support desk than a marketing block.</p>
          </div>

          <div className={styles.faqStack}>
            {faqs.map((item) => (
              <article key={item.question} className={styles.faqWide}>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>

          <div className={styles.infoStrip}>
            <div>
              <strong>Need the fastest path?</strong>
              <p className={styles.cardText}>If the customer already knows the service needed, booking online is usually the quickest option.</p>
            </div>
            <Link href="/booking/full-service" className={styles.primaryBtn}>
              Start Booking
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={`${styles.ctaTitle} ${oswald.className}`}>Ready to move from question to booking?</h2>
          <p className={styles.ctaText}>
            Use the live booking flow for the smoothest experience, or call if you need help deciding which service fits the
            vehicle best.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/booking/bodywash" className={styles.primaryBtn}>
              Book Body Wash
            </Link>
            <a href="tel:+94768248676" className={styles.secondaryBtn}>
              Call Support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
