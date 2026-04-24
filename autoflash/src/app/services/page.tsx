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
          <div className={styles.servicesBoard}>
            <div className={styles.servicesBoardIntro}>
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

            <div className={styles.servicesBoardMetrics}>
              <article className={styles.servicesMetricCard}>
                <span className={styles.metricNumber}>02</span>
                <span className={styles.metricCaption}>main booking lanes already live for different customer needs</span>
              </article>
              <article className={styles.servicesMetricCard}>
                <span className={styles.metricNumber}>04</span>
                <span className={styles.metricCaption}>body wash packages clearly visible before the customer commits</span>
              </article>
              <article className={styles.servicesMetricCard}>
                <span className={styles.metricNumber}>03</span>
                <span className={styles.metricCaption}>service stages that move from choice to scheduling without dead ends</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.servicesLaneGrid}>
            <div className={styles.sectionIntro}>
              <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Choose The Service Track That Fits The Visit</h2>
              <p className={styles.sectionCopy}>
                Whether the customer wants a fast exterior refresh or a more involved maintenance appointment, the platform guides
                them into the right route instead of forcing everyone through the same experience.
              </p>
            </div>

            <div className={styles.servicesLaneStack}>
              {serviceCards.map((service) => (
                <article key={service.title} className={styles.serviceLaneCard}>
                  <div className={styles.serviceLaneMain}>
                    <span className={styles.serviceTag}>{service.tag}</span>
                    <h3 className={`${styles.serviceTitle} ${oswald.className}`}>{service.title}</h3>
                    <p className={styles.serviceText}>{service.text}</p>
                  </div>
                  <div className={styles.serviceLaneMeta}>
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
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.servicesPackagesSection}>
        <div className={styles.sectionInner}>
          <div className={styles.servicesPackagesWrap}>
            <div className={styles.servicesPackagesLead}>
              <span className={styles.cardTag}>Bodywash Packages</span>
              <h2 className={`${styles.sectionTitle} ${oswald.className}`}>Four visible options before the booking even starts</h2>
              <p className={styles.sectionCopy}>
                The bodywash route includes four package options, so customers can quickly understand what is included before
                they book.
              </p>
            </div>

            <div className={styles.servicesPackageColumns}>
              {bodyWashPackages.map((pkg, index) => (
                <article key={pkg.name} className={styles.servicePackageColumn}>
                  <span className={styles.servicesPackageIndex}>0{index + 1}</span>
                  <h3 className={`${styles.cardTitle} ${oswald.className}`}>{pkg.name}</h3>
                  <p className={styles.cardText}>{pkg.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.servicesProcessSection}>
        <div className={styles.sectionInner}>
          <div className={styles.servicesProcessWrap}>
            <div className={styles.sectionIntro}>
              <h2 className={`${styles.sectionTitle} ${oswald.className}`}>How The Service Journey Works</h2>
              <p className={styles.sectionCopy}>Each route in AutoFlash is designed to reduce confusion and keep the user moving.</p>
            </div>

            <div className={styles.servicesProcessLine}>
              <article className={styles.servicesStepCard}>
                <span className={styles.cardTag}>Step 01</span>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>Choose the lane</h3>
                <p className={styles.cardText}>Start with the kind of visit the customer actually needs, not a one-size-fits-all form.</p>
              </article>
              <article className={styles.servicesStepCard}>
                <span className={styles.cardTag}>Step 02</span>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>Shape the service</h3>
                <p className={styles.cardText}>One route is package-first. The other is quote-first. That difference matters.</p>
              </article>
              <article className={styles.servicesStepCard}>
                <span className={styles.cardTag}>Step 03</span>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>Confirm the visit</h3>
                <p className={styles.cardText}>Once the right path is clear, the customer can lock a visible slot without extra calls.</p>
              </article>
            </div>

            <div className={styles.servicesNotesBar}>
              <div>
                <strong>Why this page exists</strong>
                <p className={styles.cardText}>It separates customer intent clearly, so body wash and deeper workshop visits never feel mixed together.</p>
              </div>
              <ul className={styles.list}>
                <li>Body wash is about speed, repeatability, and visible package choice.</li>
                <li>Full service is about deeper guidance, add-ons, and quotation support.</li>
                <li>Slot visibility reduces back-and-forth scheduling.</li>
              </ul>
            </div>
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
