"use client";

import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "../info-pages.module.css";

const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const copy = {
  en: {
    eyebrow: "Service Catalogue",
    heroTitle: "Pick The Lane. Book The Slot. Arrive Ready.",
    heroText:
      "Each route below is for a different kind of vehicle visit, so customers can understand the difference before they enter the booking flow.",
    startFullService: "Start A Full Service",
    bookBodyWash: "Book A Body Wash",
    bodyWashTitle: "Body Wash",
    bodyWashText: "Fast upkeep with four visible packages, flexible extras, and a clean slot-based booking flow.",
    fullServiceTitle: "Full Service",
    fullServiceText: "A workshop-style journey with AI quote generation, service selection, and stronger guidance.",
    expectTitle: "What You Can Expect",
    expectList: [
      "Different entry points for different needs",
      "Package-led and quote-led service paths",
      "Clear booking actions instead of dead-end browsing",
    ],
    chooseTitle: "Choose The Service Track That Fits The Visit",
    chooseText:
      "Whether the customer wants a fast exterior refresh or a more involved maintenance appointment, the platform guides them into the right route.",
    serviceCards: [
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
    ],
    packagesTitle: "Bodywash Packages",
    packagesText: "The bodywash route includes four package options, so customers can quickly understand what is included before they book.",
    packages: [
      {
        name: "Quick Wash",
        description: "Exterior wash only. Best for a fast refresh without interior work.",
      },
      {
        name: "Wash & Vacuum",
        description: "Exterior wash plus interior vacuuming for customers who want the body cleaned and the cabin tidied.",
      },
      {
        name: "Wash, Vacuum & Wax",
        description: "Exterior wash, interior vacuum, and a wax coat for added shine and surface protection.",
      },
      {
        name: "Full Bodywash",
        description: "A full package including wash, vacuum, underwash, and wax.",
      },
    ],
    bodywashOption: "Bodywash Option",
    whyTag: "Why this page feels different",
    whyTitle: "It is here to separate customer intent clearly",
    whyList: [
      "Body wash is about speed, repeatability, and visible package choice.",
      "Full service is about deeper guidance, add-ons, and quotation support.",
      "Saved vehicle support helps returning customers move faster.",
      "Slot visibility reduces back-and-forth scheduling.",
      "The structure leaves room for future workshop offerings.",
    ],
    catalogueMindset: "Catalogue mindset",
    catalogueTitle: "Different visits need different entry points",
    catalogueText:
      "This page acts more like a smart menu than a company overview. It helps the customer identify the right lane and move forward with fewer wrong turns.",
    journeyTitle: "How The Service Journey Works",
    journeyText: "Each route in AutoFlash is designed to reduce confusion and keep the user moving.",
    journeySteps: [
      {
        tag: "Step 01",
        title: "Choose the lane",
        text: "Start with the kind of visit the customer actually needs, not a one-size-fits-all form.",
      },
      {
        tag: "Step 02",
        title: "Shape the service",
        text: "One route is package-first. The other is quote-first. That difference matters.",
      },
      {
        tag: "Step 03",
        title: "Confirm the visit",
        text: "Once the right path is clear, the customer can lock a visible slot without extra calls.",
      },
    ],
    ctaTitle: "Need a quick wash or a deeper workshop visit?",
    ctaText: "Both routes are ready. Choose the service flow that matches the customer need and move straight into scheduling.",
    generateServiceQuote: "Generate Service Quote",
  },
  si: {
    eyebrow: "සේවා ලැයිස්තුව",
    heroTitle: "නිවැරදි මාර්ගය තෝරන්න. වේලාව වෙන්කරන්න. සූදානමින් එන්න.",
    heroText:
      "පහත සෑම මාර්ගයක්ම වෙනස් වාහන අවශ්‍යතාවක් සඳහාය. එම නිසා වෙන්කරවා ගැනීමට පෙර පාරිභෝගිකයාට වෙනස පැහැදිලිව තේරුම් ගත හැක.",
    startFullService: "සම්පූර්ණ සේවාව අරඹන්න",
    bookBodyWash: "බොඩි වොෂ් වෙන්කරන්න",
    bodyWashTitle: "බොඩි වොෂ්",
    bodyWashText: "පැකේජ හතරක්, අමතර විකල්ප සහ සරල වේලාවන් මත පදනම් වූ වෙන්කරවා ගැනීම.",
    fullServiceTitle: "සම්පූර්ණ සේවාව",
    fullServiceText: "AI මිල ගණන්, සේවා තේරීම් සහ වැඩි මඟපෙන්වීමක් සහිත වර්ක්ශොප් ආකාරයේ ගමනක්.",
    expectTitle: "ඔබට බලාපොරොත්තු විය හැක්කේ",
    expectList: [
      "වෙනස් අවශ්‍යතා සඳහා වෙනස් ආරම්භක මාර්ග",
      "පැකේජ සහ මිල ගණන් මූලික සේවා මාර්ග",
      "අවසානයක් නැති බලන්න-පමණක් පිටු වෙනුවට පැහැදිලි ක්‍රියා",
    ],
    chooseTitle: "ඔබගේ පැමිණීමට ගැලපෙන සේවා මාර්ගය තෝරන්න",
    chooseText:
      "ඉක්මන් බාහිර පිරිසිදු කිරීමක් හෝ වැඩි නඩත්තු අවශ්‍ය සේවාවක් වුවද, පද්ධතිය පාරිභෝගිකයා නිවැරදි මාර්ගයට යොමු කරයි.",
    serviceCards: [
      {
        tag: "වේගවත් මාර්ගය",
        title: "බොඩි වොෂ්",
        text: "ඉක්මන් බාහිර වොෂ් එකකින් සම්පූර්ණ බොඩිවොෂ් පැකේජයක් දක්වා පැහැදිලි පැකේජ හතරක්.",
        meta: ["වොෂ් පැකේජ 4", "ඔන්ලයින් වෙන්කරවා ගැනීම", "පැයකට ස්ලොට් 3"],
        href: "/booking/bodywash",
        linkLabel: "බොඩි වොෂ් වෙන්කරන්න",
      },
      {
        tag: "වර්ක්ශොප් රැකවරණය",
        title: "සම්පූර්ණ සේවාව",
        text: "වේලාව තේරීම, add-ons සහ AI මිල ගණන් සමඟ මඟපෙන්වන සේවා ගමනක්.",
        meta: ["වාහනය අනුව මිල ගණන්", "පැයකට ස්ලොට් 2", "සුරකින්න ලද වාහන සහාය"],
        href: "/booking/full-service",
        linkLabel: "සම්පූර්ණ සේවාව අරඹන්න",
      },
      {
        tag: "මිල ගණන් මාර්ගය",
        title: "ඔයිල් චේන්ජ් ගමන",
        text: "ඔයිල් චේන්ජ් තේරීම දැනටමත් සේවා ගමන තුළම ඇත, මිල වාහන වර්ගය හා තෙල් තේරීම මත තීරණය වේ.",
        meta: ["සම්පූර්ණ සේවා ගමන තුළ", "මිල ගණන් සමඟ සම්බන්ධ", "වර්ධනය සඳහා සූදානම්"],
        href: "/booking/full-service",
        linkLabel: "සේවා ගමන විවෘත කරන්න",
      },
    ],
    packagesTitle: "බොඩිවොෂ් පැකේජ",
    packagesText: "වෙන්කරවා ගැනීමට පෙර ඇතුළත් දේ ඉක්මනින් තේරුම් ගැනීමට බොඩිවොෂ් මාර්ගයේ පැකේජ හතරක් ඇත.",
    packages: [
      { name: "ක්වික් වොෂ්", description: "බාහිර වොෂ් පමණි. ඉක්මන් refresh එකක් සඳහා සුදුසුයි." },
      { name: "වොෂ් සහ වැකියුම්", description: "බාහිර වොෂ් සමඟ ඇතුළත වැකියුම් කිරීම." },
      { name: "වොෂ්, වැකියුම් සහ වැක්ස්", description: "බාහිර වොෂ්, ඇතුළත වැකියුම් සහ වැක්ස් ආවරණයක්." },
      { name: "සම්පූර්ණ බොඩිවොෂ්", description: "වොෂ්, වැකියුම්, අන්ඩර්වොෂ් සහ වැක්ස් ඇතුළත් සම්පූර්ණ පැකේජය." },
    ],
    bodywashOption: "බොඩිවොෂ් විකල්පය",
    whyTag: "මෙම පිටුව වෙනස් වන්නේ ඇයි",
    whyTitle: "මෙය පාරිභෝගික අරමුණ පැහැදිලිව වෙන් කිරීමටයි",
    whyList: [
      "බොඩි වොෂ් යනු වේගය, නැවත නැවත භාවිතය සහ පැකේජ තේරීමයි.",
      "සම්පූර්ණ සේවාව යනු වැඩි මඟපෙන්වීම, add-ons සහ මිල ගණන් සහායයි.",
      "සුරකින්න ලද වාහන සහාය නැවත එන පාරිභෝගිකයින්ට ඉක්මනින් ගමන් කිරීමට උපකාරී වේ.",
      "ස්ලොට් දෘශ්‍යතාව ඉදිරියට-පසුපස කතාබහ අඩු කරයි.",
      "මෙම ව්‍යුහය අනාගත සේවා සඳහා ඉඩ තබයි.",
    ],
    catalogueMindset: "ලැයිස්තු මානසිකත්වය",
    catalogueTitle: "වෙනස් පැමිණීම් සඳහා වෙනස් ආරම්භක මාර්ග අවශ්‍යයි",
    catalogueText:
      "මෙම පිටුව සමාගම් overview එකකට වඩා smart menu එකක් වගේ වැඩ කරයි. නිවැරදි මාර්ගය හඳුනාගෙන අඩු වැරදි හැරීම් සමඟ ඉදිරියට යාමට උපකාරී වේ.",
    journeyTitle: "සේවා ගමන ක්‍රියා කරන ආකාරය",
    journeyText: "AutoFlash හි සෑම මාර්ගයක්ම ගැටලු අඩු කර පරිශීලකයා ඉදිරියට ගෙන යාම සඳහා නිර්මාණය කර ඇත.",
    journeySteps: [
      {
        tag: "පියවර 01",
        title: "මාර්ගය තෝරන්න",
        text: "එකම form එකකට හැමෝම දාන්නේ නැතිව, පාරිභෝගිකයාට අවශ්‍ය පැමිණීමෙන් අරඹන්න.",
      },
      {
        tag: "පියවර 02",
        title: "සේවාව හැඩගස්වන්න",
        text: "එක මාර්ගයක් පැකේජ-මූලිකය. අනිත් එක මිල ගණන්-මූලිකය. ඒ වෙනස වැදගත්.",
      },
      {
        tag: "පියවර 03",
        title: "පැමිණීම තහවුරු කරන්න",
        text: "නිවැරදි මාර්ගය පැහැදිලි වූ පසු, අමතර දුරකථන ඇමතුම් නැතිව ස්ලොට් එකක් වෙන්කරන්න.",
      },
    ],
    ctaTitle: "ඉක්මන් වොෂ් එකක්ද හෝ වැඩි වර්ක්ශොප් සේවාවක්ද අවශ්‍ය?",
    ctaText: "මාර්ග දෙකම සූදානම්. පාරිභෝගික අවශ්‍යතාවයට ගැලපෙන සේවා මාර්ගය තෝරා වේලාවට යන්න.",
    generateServiceQuote: "සේවා මිල ගණන් ලබාගන්න",
  },
} as const;

export default function ServicesPageClient() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className={`${styles.page} ${styles.servicesPage} ${inter.className}`}>
      <section className={styles.servicesHero}>
        <div className={styles.heroInner}>
          <div className={styles.servicesHeroGrid}>
            <div className={styles.servicesHeroLead}>
              <span className={styles.eyebrow}>{t.eyebrow}</span>
              <h1 className={`${styles.heroTitle} ${oswald.className}`}>{t.heroTitle}</h1>
              <p className={styles.heroText}>{t.heroText}</p>
              <div className={styles.heroActions}>
                <Link href="/booking/full-service" className={styles.primaryBtn}>
                  {t.startFullService}
                </Link>
                <Link href="/booking/bodywash" className={styles.secondaryBtn}>
                  {t.bookBodyWash}
                </Link>
              </div>
            </div>

            <div className={styles.servicesHeroAside}>
              <article className={`${styles.heroPanel} ${styles.heroPanelAccent}`}>
                <h2 className={`${styles.heroPanelTitle} ${oswald.className}`}>{t.bodyWashTitle}</h2>
                <p className={styles.heroPanelText}>{t.bodyWashText}</p>
              </article>
              <article className={`${styles.heroPanel} ${styles.heroPanelGold}`}>
                <h2 className={`${styles.heroPanelTitle} ${oswald.className}`}>{t.fullServiceTitle}</h2>
                <p className={styles.heroPanelText}>{t.fullServiceText}</p>
              </article>
              <article className={`${styles.heroPanel} ${styles.heroPanelPlain}`}>
                <h2 className={`${styles.heroPanelTitle} ${oswald.className}`}>{t.expectTitle}</h2>
                <ul className={styles.heroMiniList}>
                  {t.expectList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>{t.chooseTitle}</h2>
            <p className={styles.sectionCopy}>{t.chooseText}</p>
          </div>

          <div className={styles.serviceGrid}>
            {t.serviceCards.map((service) => (
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
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>{t.packagesTitle}</h2>
            <p className={styles.sectionCopy}>{t.packagesText}</p>
          </div>

          <div className={styles.packageGrid}>
            {t.packages.map((pkg) => (
              <article key={pkg.name} className={styles.packageCard}>
                <span className={styles.cardTag}>{t.bodywashOption}</span>
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
              <span className={styles.cardTag}>{t.whyTag}</span>
              <h2 className={`${styles.cardTitle} ${oswald.className}`}>{t.whyTitle}</h2>
              <ul className={styles.list}>
                {t.whyList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <aside className={styles.floatingCard}>
              <div className={styles.floatingKicker}>{t.catalogueMindset}</div>
              <h3 className={`${styles.floatingTitle} ${oswald.className}`}>{t.catalogueTitle}</h3>
              <p className={styles.floatingText}>{t.catalogueText}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.sectionLight}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionIntro}>
            <h2 className={`${styles.sectionTitle} ${oswald.className}`}>{t.journeyTitle}</h2>
            <p className={styles.sectionCopy}>{t.journeyText}</p>
          </div>

          <div className={styles.detailGrid}>
            {t.journeySteps.map((step) => (
              <article key={step.tag} className={styles.detailCard}>
                <span className={styles.cardTag}>{step.tag}</span>
                <h3 className={`${styles.cardTitle} ${oswald.className}`}>{step.title}</h3>
                <p className={styles.cardText}>{step.text}</p>
              </article>
            ))}
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
            <Link href="/booking/full-service" className={styles.secondaryBtn}>
              {t.generateServiceQuote}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
