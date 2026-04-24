import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import styles from "../info-pages.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "About | AutoFlash",
  description: "Learn how AutoFlash combines smart booking, AI quotations, and vehicle service management.",
};

const values = [
  {
    tag: "Clarity",
    title: "Transparent booking flow",
    text: "Customers can see service choices and timeslot availability without depending on back-and-forth calls.",
  },
  {
    tag: "Speed",
    title: "Less friction, faster action",
    text: "The platform is designed to turn intent into an actual booking while the customer still has momentum.",
  },
  {
    tag: "Control",
    title: "Structured service management",
    text: "AutoFlash keeps the experience organized across vehicle type, package selection, and booking confirmation.",
  },
];

const milestones = [
  {
    tag: "01",
    title: "Digital-first service discovery",
    text: "Service information is presented in a way that encourages action rather than forcing the user to hunt for details.",
  },
  {
    tag: "02",
    title: "AI quotation support",
    text: "For more involved jobs, AutoFlash can guide customers through service selection and quotation generation.",
  },
  {
    tag: "03",
    title: "Operational booking logic",
    text: "Closed days, closed slots, and service-specific capacity are reflected directly in the customer journey.",
  },
  {
    tag: "04",
    title: "Ready for growth",
    text: "The current structure already supports future expansion into more services, richer quoting, and stronger retention.",
  },
];

export default function AboutPage() {
  return (
    <main className={`${styles.page} ${styles.aboutPage} ${inter.className}`}>
      <section className={styles.aboutHero}>
        <div className={styles.heroInner}>
          <div className={styles.aboutManifesto}>
            <div className={styles.aboutManifestoLead}>
              <span className={styles.eyebrow}>About AutoFlash</span>
              <h1 className={`${styles.heroTitle} ${oswald.className}`}>A Brand Story Built Around Better Vehicle Service</h1>
              <p className={styles.heroText}>
                This page is meant to feel more like a story and less like a product list. AutoFlash exists to make vehicle care
                feel more modern, more organized, and easier to trust from the first click to the final booking.
              </p>
              <div className={styles.heroActions}>
                <Link href="/services" className={styles.primaryBtn}>
                  Explore Services
                </Link>
                <Link href="/contact" className={styles.secondaryBtn}>
                  Contact AutoFlash
                </Link>
              </div>
            </div>

            <aside className={styles.aboutManifestoStats}>
              <div className={styles.aboutMetrics}>
                <article className={styles.metricTile}>
                  <span className={styles.metricNumber}>01</span>
                  <span className={styles.metricCaption}>one connected platform for service discovery, quoting, and booking</span>
                </article>
                <article className={styles.metricTile}>
                  <span className={styles.metricNumber}>02</span>
                  <span className={styles.metricCaption}>two live booking paths already tailored to different service needs</span>
                </article>
                <article className={styles.metricTile}>
                  <span className={styles.metricNumber}>03</span>
                  <span className={styles.metricCaption}>three promises at the core: clarity, speed, and structure</span>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.sectionInner}>
          <div className={styles.aboutNarrativeStack}>
            <article className={styles.aboutWideStatement}>
              <span className={styles.cardTag}>Why it matters</span>
              <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Vehicle service should not feel messy before the car even arrives</h2>
              <p className={styles.storyParagraph}>
                Traditional service booking often breaks down before the workshop even starts working. Customers wait on replies,
                repeat details, and stay unsure about what happens next. AutoFlash was built to remove that uncertainty.
              </p>
              <p className={styles.storyParagraph}>
                The platform turns scattered communication into a more confident flow where service choice, quotation, and booking
                all connect in one place.
              </p>
            </article>

            <div className={styles.aboutBeliefBand}>
              {values.map((value) => (
                <article key={value.title} className={styles.aboutBeliefCard}>
                  <span className={styles.cardTag}>{value.tag}</span>
                  <h3 className={`${styles.cardTitle} ${oswald.className}`}>{value.title}</h3>
                  <p className={styles.cardText}>{value.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionDark}>
        <div className={styles.sectionInner}>
          <div className={styles.aboutStatementPanel}>
            <span className={styles.floatingKicker}>Brand direction</span>
            <h2 className={`${styles.ctaTitle} ${oswald.className}`}>Modern workshop energy with digital structure</h2>
            <p className={styles.floatingText}>
              AutoFlash blends the feel of a real vehicle-care business with the convenience customers now expect from modern
              online services.
            </p>
            <p className={styles.floatingText}>
              Pages are meant to do more than describe the business. They move people toward a real outcome: selecting a
              service, generating a quote, choosing a slot, and confirming a visit with less confusion.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Platform Journey</h2>
            <p className={styles.sectionCopy}>This section reads like a timeline, so it feels different from the other pages.</p>
          </div>

          <div className={styles.aboutJourneyRail}>
            {milestones.map((item) => (
              <article key={item.tag} className={styles.aboutJourneyCard}>
                <div className={styles.timelineMarker}>{item.tag}</div>
                <div>
                  <h3 className={`${styles.cardTitle} ${oswald.className}`}>{item.title}</h3>
                  <p className={styles.timelineText}>{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.aboutClosingBand}>
            <article className={styles.aboutCompactCard}>
              <span className={styles.cardTag}>Current focus</span>
              <p className={styles.cardText}>Make bookings easier to complete, easier to trust, and easier to manage at scale.</p>
            </article>
            <Link href="/booking/full-service" className={styles.primaryBtn}>
              Try The Service Flow
            </Link>
            <Link href="/services" className={styles.secondaryBtn}>
              View Service Pages
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={`${styles.ctaTitle} ${oswald.className}`}>Want to see AutoFlash in action?</h2>
          <p className={styles.ctaText}>
            The best way to understand the platform is to move through the service journey yourself and see how booking,
            quotations, and scheduling connect.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/services" className={styles.primaryBtn}>
              View Service Pages
            </Link>
            <Link href="/booking/full-service" className={styles.secondaryBtn}>
              Open Booking Flow
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
