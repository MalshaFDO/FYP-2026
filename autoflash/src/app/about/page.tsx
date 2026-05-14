"use client";

import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "./aboutpage.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const copy = {
  en: {
    eyebrow: "About AutoFlash",
    heroTitle: "A Brand Story Built Around Better Vehicle Service",
    heroText: "AutoFlash exists to make vehicle care feel more modern, more organized, and easier to trust from the first click to the final booking.",
    exploreServices: "Explore Services",
    contactAutoflash: "Contact AutoFlash",
    snapshot: "Snapshot",
    snapshotTitle: "The platform already connects discovery, quoting, and booking",
    snapshotText: "AutoFlash guides people from interest to confirmation without making the experience feel heavy.",
    metrics: [
      "one connected platform for service discovery, quoting, and booking",
      "two live booking paths tailored to different service needs",
      "three promises at the core: clarity, speed, and structure",
    ],
    whyItMatters: "Why it matters",
    storyTitle: "Vehicle service should not feel messy before the car even arrives",
    storyParagraphs: [
      "Traditional service booking often breaks down before the workshop even starts working. Customers wait on replies, repeat details, and stay unsure about what happens next.",
      "The platform turns scattered communication into a more confident flow where service choice, quotation, and booking all connect in one place.",
    ],
    whatWeBelieve: "What we believe",
    values: [
      { tag: "Clarity", title: "Transparent booking flow", text: "Customers can see service choices and timeslot availability without back-and-forth calls." },
      { tag: "Speed", title: "Less friction, faster action", text: "The platform is designed to turn intent into an actual booking while the customer still has momentum." },
      { tag: "Control", title: "Structured service management", text: "AutoFlash keeps the experience organized across vehicle type, package selection, and booking confirmation." },
    ],
    differentTitle: "What makes it different",
    differentText: "Pages are designed to move people toward a real decision instead of leaving them to assemble the process alone.",
    actionTitle: "The platform is shaped around action, not just information",
    brandDirection: "Brand direction",
    brandTitle: "Modern workshop energy with digital structure",
    brandText: "AutoFlash blends the feel of a real vehicle-care business with the convenience customers expect from online services.",
    journeyTitle: "Platform Journey",
    journeyText: "This section reads like a timeline, providing a clear path from start to finish.",
    milestones: [
      { tag: "01", title: "Digital-first service discovery", text: "Service information is presented in a way that encourages action rather than forcing hunt for details." },
      { tag: "02", title: "AI quotation support", text: "For more involved jobs, AutoFlash can guide customers through service selection and quotation generation." },
      { tag: "03", title: "Operational booking logic", text: "Closed days, closed slots, and service-specific capacity are reflected directly." },
      { tag: "04", title: "Ready for growth", text: "The current structure already supports future expansion into more services and richer quoting." },
    ],
    currentFocus: "Current focus",
    currentFocusText: "Make bookings easier to complete, easier to trust, and easier to manage at scale.",
    serviceFlow: "Service flow",
    tryServiceFlow: "Try The Service Flow",
    nextStep: "Next step",
    nextStepTitle: "Explore the wider platform",
    viewServicePages: "View Service Pages",
    ctaTitle: "Want to see AutoFlash in action?",
    ctaText: "The best way to understand the platform is to move through the service journey yourself.",
    openBookingFlow: "Open Booking Flow",
  },
  si: {
    eyebrow: "AutoFlash ගැන",
    heroTitle: "වඩා හොඳ වාහන සේවාවක් වටා ගොඩනැගුණු කතාන්දරයක්",
    heroText: "AutoFlash පළමු click එකේ සිට අවසාන booking එක දක්වා වාහන රැකවරණය නවීන, සංවිධානාත්මක සහ විශ්වාසවන්ත අත්දැකීමක් කිරීමට ඇත.",
    exploreServices: "සේවා බලන්න",
    contactAutoflash: "AutoFlash සමඟ සම්බන්ධ වන්න",
    snapshot: "සාරාංශය",
    snapshotTitle: "මෙම platform එක discovery, quotation සහ booking එකට සම්බන්ධ කරයි",
    snapshotText: "AutoFlash බරක් නොදැනෙන අයුරින් උනන්දුවෙන් තහවුරු කිරීම දක්වා මඟපෙන්වයි.",
    metrics: [
      "සේවා සොයාගැනීම, මිල ගණන් සහ වෙන්කරවා ගැනීම සඳහා එකම platform එක",
      "වෙනස් සේවා අවශ්‍යතා සඳහා සකස් කළ live booking මාර්ග දෙකක්",
      "මූලික පොරොන්දු තුනක්: පැහැදිලිත්වය, වේගය සහ ව්‍යුහය",
    ],
    whyItMatters: "මෙය වැදගත් වන්නේ ඇයි",
    storyTitle: "වාහනය එන්නට පෙරම සේවා අත්දැකීම අවුල් විය යුතු නැත",
    storyParagraphs: [
      "සාම්ප්‍රදායික සේවා වෙන්කරවා ගැනීම බොහෝවිට workshop එක වැඩ අරඹා නොමැති අතරතුරම බිඳ වැටේ. පාරිභෝගිකයා පිළිතුරු බලාසිටිමින්, තොරතුරු නැවත කියමින් අවුලෙන් සිටී.",
      "මෙම platform එක විසිරුණු සන්නිවේදනය එකම ස්ථානයක සේවා තේරීම, මිල ගණන් සහ booking එක සම්බන්ධ කරන විශ්වාසදායක ගමනකට පරිවර්තනය කරයි.",
    ],
    whatWeBelieve: "අප විශ්වාස කරන්නේ",
    values: [
      { tag: "පැහැදිලිත්වය", title: "පැහැදිලි booking ගමන", text: "පසුපස-ඉදිරියට ඇමතුම් නැතිව සේවා තේරීම් හා ස්ලොට් දෘශ්‍යතාව පාරිභෝගිකයාට දැකිය හැක." },
      { tag: "වේගය", title: "අඩු friction, වැඩි ක්‍රියාව", text: "පාරිභෝගිකයාගේ උනන්දුව පවතින තුරාම එය සැබෑ booking එකකට ගෙන යාම සඳහා platform එක සැලසුම් කර ඇත." },
      { tag: "පාලනය", title: "ව්‍යුහගත සේවා කළමනාකරණය", text: "වාහන වර්ගය, පැකේජ තේරීම සහ booking තහවුරු කිරීම පුරාම AutoFlash අත්දැකීම සංවිධානය කරයි." },
    ],
    differentTitle: "වෙනස් කරන්නේ කුමක්ද",
    differentText: "මිනිසුන්ට තනිව ක්‍රියාවලිය එකතු කිරීමට නොදී, සැබෑ තීරණයකට ගෙන යාමට පිටු සැලසුම් කර ඇත.",
    actionTitle: "මෙම platform එක තොරතුරු පමණක් නොව ක්‍රියාව සඳහා හැඩගස්වා ඇත",
    brandDirection: "brand දිශාව",
    brandTitle: "ඩිජිටල් ව්‍යුහයක් සමඟ නවීන වර්ක්ශොප් ශක්තිය",
    brandText: "AutoFlash සැබෑ වාහන රැකවරණ ව්‍යාපාරයක හැඟීම සහ modern online සේවාවක පහසුව එකතු කරයි.",
    journeyTitle: "Platform ගමන",
    journeyText: "මෙම කොටස timeline එකක් ලෙස කියවෙන නිසා අනෙක් පිටු වලින් වෙනස් හැඟීමක් ලබාදේ.",
    milestones: [
      { tag: "01", title: "ඩිජිටල්-පළමු සේවා සොයාගැනීම", text: "පරිශීලකයාට තොරතුරු හොයන්නට බල නොකර ක්‍රියාවට යොමු වන ආකාරයෙන් සේවා තොරතුරු පෙන්වයි." },
      { tag: "02", title: "AI මිල ගණන් සහාය", text: "වඩා සංකීර්ණ සේවා සඳහා AutoFlash සේවා තේරීම සහ quotation generation සඳහා මඟපෙන්වයි." },
      { tag: "03", title: "ක්‍රියාකාරී booking logic", text: "වසා ඇති දින, වසා ඇති ස්ලොට් සහ සේවා ධාරිතාව පාරිභෝගික ගමන තුළම පෙන්වයි." },
      { tag: "04", title: "වර්ධනයට සූදානම්", text: "වත්මන් ව්‍යුහය අනාගත සේවා, වඩා හොඳ quoting සහ retention සඳහා දැනටමත් සහාය දක්වයි." },
    ],
    currentFocus: "වත්මන් අවධානය",
    currentFocusText: "bookings සම්පූර්ණ කිරීමට, විශ්වාස කිරීමට සහ පරිමාණයෙන් කළමනාකරණය කිරීමට පහසු කිරීම.",
    serviceFlow: "සේවා ගමන",
    tryServiceFlow: "සේවා ගමන උත්සාහ කරන්න",
    nextStep: "ඊළඟ පියවර",
    nextStepTitle: "පුළුල් platform එක බලන්න",
    viewServicePages: "සේවා පිටු බලන්න",
    ctaTitle: "AutoFlash ක්‍රියාවෙන් බලන්න කැමතිද?",
    ctaText: "මෙම platform එක තේරුම් ගැනීමට හොඳම ක්‍රමය සේවා ගමන තුළින්ම ගමන් කිරීමයි.",
    openBookingFlow: "Booking ගමන විවෘත කරන්න",
  },
} as const;

export default function AboutPageClient() {
  const { language } = useLanguage();
  const t = copy[language as keyof typeof copy] || copy.en;

  return (
    <main className={`${styles.page} ${inter.className}`}>
      {/* --- HERO SECTION --- */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>{t.eyebrow}</span>
            <h1 className={`${styles.heroTitle} ${oswald.className}`}>{t.heroTitle}</h1>
            <p className={styles.heroText}>{t.heroText}</p>
            <div className={styles.heroActions}>
              <Link href="/services" className={styles.primaryBtn}>{t.exploreServices}</Link>
              <Link href="/contact" className={styles.secondaryBtn}>{t.contactAutoflash}</Link>
            </div>
          </div>

          <aside className={styles.heroSnapshotGrid}>
            <div className={styles.snapshotCard}>
              <span className={styles.cardTag}>{t.snapshot}</span>
              <h2 className={`${styles.cardTitle} ${oswald.className}`}>{t.snapshotTitle}</h2>
              <p className={styles.cardText}>{t.snapshotText}</p>
            </div>
            <div className={styles.metricsWrapper}>
              {t.metrics.map((metric, idx) => (
                <div key={idx} className={styles.metricItem}>
                  <span className={styles.metricNum}>{String(idx + 1).padStart(2, '0')}</span>
                  <p>{metric}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* --- NARRATIVE SECTION --- */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          <div className={styles.splitLayout}>
            <article className={styles.storyContent}>
              <span className={styles.cardTag}>{t.whyItMatters}</span>
              <h2 className={`${styles.storyTitle} ${oswald.className}`}>{t.storyTitle}</h2>
              {t.storyParagraphs.map((p, i) => <p key={i} className={styles.storyPara}>{p}</p>)}
              
              <div className={styles.valuesGrid}>
                {t.values.map((v, i) => (
                  <div key={i} className={styles.valueCard}>
                    <span className={styles.cardTag}>{v.tag}</span>
                    <h3 className={oswald.className}>{v.title}</h3>
                    <p>{v.text}</p>
                  </div>
                ))}
              </div>
            </article>

            <aside className={styles.stickyRail}>
              <div className={styles.aboutCompactCard}>
                <span className={styles.cardTag}>{t.differentTitle}</span>
                <p>{t.differentText}</p>
              </div>
              <div className={styles.highlightCard}>
                <span className={styles.brandTag}>{t.brandDirection}</span>
                <h3 className={oswald.className}>{t.brandTitle}</h3>
                <p>{t.brandText}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* --- TIMELINE / JOURNEY --- */}
      <section className={styles.journeySection}>
        <div className={styles.container}>
          <div className={styles.journeyHeader}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>{t.journeyTitle}</h2>
            <p>{t.journeyText}</p>
          </div>
          <div className={styles.timelineGrid}>
            {t.milestones.map((m, i) => (
              <div key={i} className={styles.timelineItem}>
                <span className={styles.timelineTag}>{m.tag}</span>
                <h3 className={oswald.className}>{m.title}</h3>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaBox}>
            <h2 className={`${styles.ctaTitle} ${oswald.className}`}>{t.ctaTitle}</h2>
            <p className={styles.ctaText}>{t.ctaText}</p>
            <div className={styles.ctaActions}>
              <Link href="/services" className={styles.primaryBtn}>{t.viewServicePages}</Link>
              <Link href="/booking" className={styles.secondaryBtn}>{t.openBookingFlow}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}