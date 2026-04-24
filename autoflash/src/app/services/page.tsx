import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import styles from "../info-pages.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "Services | AutoFlash",
  description: "Explore AutoFlash car care, body wash, full service, and AI-assisted booking services.",
};

const serviceCards = [
  {
    tag: "Fast Lane",
    title: "Body Wash",
    text: "Ideal for regular upkeep with four clear packages, from a quick exterior wash to a full bodywash package.",
    meta: ["4 wash packages", "Online booking", "3 slots per hour"],
    href: "/booking/bodywash",
    linkLabel: "Book body wash",
  },
  {
    tag: "Workshop Care",
    title: "Full Service",
    text: "A guided service journey that combines scheduling, add-ons, and an AI-powered quotation experience.",
    meta: ["Vehicle-based quotation", "2 slots per hour", "Saved vehicle support"],
    href: "/booking/full-service",
    linkLabel: "Start full service",
  },
  {
    tag: "Quote Path",
    title: "Oil Change Journey",
    text: "Oil-change selection already lives inside the service flow, with pricing shaped by vehicle type and oil choice.",
    meta: ["Included in full-service flow", "Quote-aware", "Built for expansion"],
    href: "/booking/full-service",
    linkLabel: "Open service flow",
  },
];

const bodyWashPackages = [
  {
    name: "Quick Wash",
    description: "Exterior wash only. Best for a fast refresh when the body needs cleaning without interior work.",
  },
  {
    name: "Wash & Vacuum",
    description: "Exterior wash plus interior vacuuming for customers who want the body cleaned and the cabin tidied.",
  },
  {
    name: "Wash, Vacuum & Wax",
    description: "Exterior wash, interior vacuum, and a wax coat on the body for added shine and surface protection.",
  },
  {
    name: "Full Bodywash",
    description: "A full package including wash, vacuum, underwash, and wax. The wax is included free of charge in this package.",
  },
];

export default function ServicesPage() {
  return (
    <main className={`${styles.page} ${styles.servicesPage} ${inter.className}`}>
      <section className={styles.servicesHero}>
        <div className={styles.heroInner}>
          <div className={styles.servicesHeroGrid}>
            <div className={styles.servicesHeroLead}>
              <span className={styles.eyebrow}>Service Catalogue</span>
              <h1 className={`${styles.heroTitle} ${oswald.className}`}>Pick The Lane. Book The Slot. Arrive Ready.</h1>
              <p className={styles.heroText}>
                This page is intentionally built like a service menu. Each route below is for a different kind of vehicle visit,
                so customers can understand the difference before they enter the booking flow.
              </p>
              <div className={styles.heroActions}>
                <Link href="/booking/full-service" className={styles.primaryBtn}>
                  Start A Full Service
                </Link>
                <Link href="/booking/bodywash" className={styles.secondaryBtn}>
                  Book A Body Wash
                </Link>
              </div>
            </div>

            <div className={styles.servicesHeroAside}>
              <article className={`${styles.heroPanel} ${styles.heroPanelAccent}`}>
                <h2 className={`${styles.heroPanelTitle} ${oswald.className}`}>Body Wash</h2>
                <p className={styles.heroPanelText}>Fast upkeep with four visible packages, flexible extras, and a clean slot-based booking flow.</p>
              </article>
              <article className={`${styles.heroPanel} ${styles.heroPanelGold}`}>
                <h2 className={`${styles.heroPanelTitle} ${oswald.className}`}>Full Service</h2>
                <p className={styles.heroPanelText}>A workshop-style journey with AI quote generation, service selection, and stronger guidance.</p>
              </article>
              <article className={`${styles.heroPanel} ${styles.heroPanelPlain}`}>
                <h2 className={`${styles.heroPanelTitle} ${oswald.className}`}>What You Can Expect</h2>
                <ul className={styles.heroMiniList}>
                  <li>Different entry points for different needs</li>
                  <li>Package-led and quote-led service paths</li>
                  <li>Clear booking actions instead of dead-end browsing</li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Choose The Service Track That Fits The Visit</h2>
            <p className={styles.sectionCopy}>
              Whether the customer wants a fast exterior refresh or a more involved maintenance appointment, the platform guides
              them into the right route instead of forcing everyone through the same experience.
            </p>
          </div>

          <div className={styles.serviceGrid}>
            {serviceCards.map((service) => (
              <article key={service.title} className={styles.serviceCard}>
                <span className={styles.serviceTag}>{service.tag}</span>
                <h3 className={`${styles.serviceTitle} ${oswald.className}`}>{service.title}</h3>
                <p className={styles.serviceText}>{service.text}</p>
                <div className={styles.serviceMeta}>
                  {service.meta.map((item) => (
                    <span key={item} className={styles.pill}>
                      {item}
                    </span>
                  ))}
                </div>
                <Link href={service.href} className={styles.serviceLink}>
                  {service.linkLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Bodywash Packages</h2>
            <p className={styles.sectionCopy}>
              The bodywash route includes four package options, so customers can quickly understand what is included before
              they book.
            </p>
          </div>

          <div className={styles.packageGrid}>
            {bodyWashPackages.map((pkg) => (
              <article key={pkg.name} className={styles.packageCard}>
                <span className={styles.cardTag}>Bodywash Option</span>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>{pkg.name}</h3>
                <p className={styles.cardText}>{pkg.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionDark}>
        <div className={styles.sectionInner}>
          <div className={styles.splitPanel}>
            <div className={styles.highlightCard}>
              <span className={styles.cardTag}>Why this page feels different</span>
              <h2 className={`${styles.cardTitle} ${oswald.className}`}>It is here to separate customer intent clearly</h2>
              <ul className={styles.list}>
                <li>Body wash is about speed, repeatability, and visible package choice.</li>
                <li>Full service is about deeper guidance, add-ons, and quotation support.</li>
                <li>Saved vehicle support helps returning customers move faster.</li>
                <li>Slot visibility reduces back-and-forth scheduling.</li>
                <li>The structure leaves room for future workshop offerings.</li>
              </ul>
            </div>

            <aside className={styles.floatingCard}>
              <div className={styles.floatingKicker}>Catalogue mindset</div>
              <h3 className={`${styles.floatingTitle} ${oswald.className}`}>Different visits need different entry points</h3>
              <p className={styles.floatingText}>
                This page acts more like a smart menu than a company overview. It helps the customer identify the right lane and
                move forward with fewer wrong turns.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>How The Service Journey Works</h2>
            <p className={styles.sectionCopy}>Each route in AutoFlash is designed to reduce confusion and keep the user moving.</p>
          </div>

          <div className={styles.detailGrid}>
            <article className={styles.detailCard}>
              <span className={styles.cardTag}>Step 01</span>
              <h3 className={`${styles.cardTitle} ${oswald.className}`}>Choose the lane</h3>
              <p className={styles.cardText}>Start with the kind of visit the customer actually needs, not a one-size-fits-all form.</p>
            </article>
            <article className={styles.detailCard}>
              <span className={styles.cardTag}>Step 02</span>
              <h3 className={`${styles.cardTitle} ${oswald.className}`}>Shape the service</h3>
              <p className={styles.cardText}>One route is package-first. The other is quote-first. That difference matters.</p>
            </article>
            <article className={styles.detailCard}>
              <span className={styles.cardTag}>Step 03</span>
              <h3 className={`${styles.cardTitle} ${oswald.className}`}>Confirm the visit</h3>
              <p className={styles.cardText}>Once the right path is clear, the customer can lock a visible slot without extra calls.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={`${styles.ctaTitle} ${oswald.className}`}>Need a quick wash or a deeper workshop visit?</h2>
          <p className={styles.ctaText}>
            Both routes are ready. Choose the service flow that matches the customer need and move straight into scheduling.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/booking/bodywash" className={styles.primaryBtn}>
              Book Body Wash
            </Link>
            <Link href="/booking/full-service" className={styles.secondaryBtn}>
              Generate Service Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
