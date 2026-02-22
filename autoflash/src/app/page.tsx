'use client';

import React, { useEffect, useRef } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import styles from "./Home.module.css";

const HomePage: React.FC = () => {
  const revealRef = useRef<HTMLDivElement>(null);

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

      {/* SECTION 1: HERO */}
      <section className={styles.hero}>
        <video autoPlay muted loop playsInline className={styles.bgVideo}>
          <source src="/BGV.mp4" type="video/mp4" />
        </video>
        <div className={styles.videoOverlay}></div>

        <div className={styles.heroContent}>
          <span className={styles.heroSubtitle}>MODERN EQUIPMENT</span>
          <h1 className={styles.heroTitle}>Car Wash</h1>
          <p className={styles.heroDescription}>
            A clean car is essential for maintaining its resale value and
            ensuring a presentable appearance on the road.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.btnRed}>
              Read More <FaChevronRight size={10} />
            </button>
            <button className={styles.btnGold}>
              Order Now <FaChevronRight size={10} />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT AUTOFLASH */}
      <section
        ref={revealRef}
        className={`${styles.contentSection} ${styles.revealEffect}`}
      >
        <div className={styles.container}>
          <div className={styles.mainInfo}>
            <div className={styles.textSide}>
              <span className={styles.accentText}>SMART PLATFORM</span>
              <h2 className={styles.sectionTitle}>
                Smart Vehicle Service & Quotation
              </h2>
              <p className={styles.sectionDesc}>
                AutoFlash simplifies vehicle servicing with AI-powered quotations,
                online booking, and transparent pricing — no phone calls, no delays.
              </p>

              <div className={styles.contactInfo}>
                <span className={styles.label}>Call for booking</span>
                <span className={styles.phone}> +94 76 824 8676</span>
              </div>

              <button className={styles.btnRedSquare}>
                Learn More <FaChevronRight size={10} />
              </button>
            </div>

            <div className={styles.imageSide}>
              <img src="/REDCAR.png" alt="Vehicle" className={styles.carImage} />
            </div>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Instant Quotations</h3>
              <p>AI-generated pricing in seconds.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>📅</div>
              <h3>Online Booking</h3>
              <p>Book services anytime, anywhere.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🧠</div>
              <h3>Smart System</h3>
              <p>Centralized service management.</p>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>💰</div>
              <h3>Transparent Pricing</h3>
              <p>No hidden costs or confusion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className={styles.howSection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitleLight}>How AutoFlash Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}><span>01</span><h3>Select Service</h3><p>Choose vehicle & service type.</p></div>
            <div className={styles.stepCard}><span>02</span><h3>Get Quotation</h3><p>Instant AI-powered pricing.</p></div>
            <div className={styles.stepCard}><span>03</span><h3>Book Slot</h3><p>Select date & time.</p></div>
            <div className={styles.stepCard}><span>04</span><h3>Service Done</h3><p>Visit & complete service.</p></div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SERVICES */}
      <section className={styles.servicesSection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitle}>Our Services</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}><h3>Contactless Wash</h3><p>Fast, automated cleaning.</p></div>
            <div className={styles.serviceCard}><h3>Full Service</h3><p>Routine inspection & care.</p></div>
            <div className={styles.serviceCard}><h3>Engine Check</h3><p>Advanced diagnostics.</p></div>
            <div className={styles.serviceCard}><h3>Detailing</h3><p>Interior & exterior care.</p></div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY AUTOFLASH */}
      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.centerTitleLight}>Why Choose AutoFlash</h2>
          <ul className={styles.whyList}>
            <li>AI-powered quotations</li>
            <li>No hidden costs</li>
            <li>Fast online booking</li>
            <li>Modern equipment</li>
            <li>Built for Sri Lanka</li>
          </ul>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
            <h2>Ready to Service Your Vehicle?</h2>
            <p>Get a quotation or book your service in minutes.</p>
            <div className={styles.heroBtns}>
              <button className={styles.btnRed}>Get Quotation</button>
              <button className={styles.btnGold}>Book Service</button>
            </div>
        </div>
      </section>

    </main>
  );
};

export default HomePage;