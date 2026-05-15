"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "./PaymentStatus.module.css";

const copy = {
  en: {
    badge: "Payment returned",
    title: "Thanks, your payment flow is complete.",
    text: "PayHere redirected back to AutoFlash. Final payment confirmation should be trusted only after the server notification is verified.",
    order: "Order",
    back: "Back to cart",
  },
  si: {
    badge: "ගෙවීම ආපසු ලැබුණි",
    title: "ස්තුතියි, ඔබේ ගෙවීම් ක්‍රියාවලිය අවසන් විය.",
    text: "PayHere ඔබව නැවත AutoFlash වෙත යොමු කළා. අවසන් ගෙවීම් තහවුරු කිරීම server notification එක සනාථ වූ පසුව පමණක් විශ්වාස කරන්න.",
    order: "ඇණවුම",
    back: "කරත්තයට ආපසු",
  },
} as const;

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <span className={styles.successBadge}>{t.badge}</span>
        <h1>{t.title}</h1>
        <p>{t.text}</p>
        {searchParams.order_id && (
          <strong>
            {t.order}: {searchParams.order_id}
          </strong>
        )}
        <Link href="/cart">{t.back}</Link>
      </section>
    </main>
  );
}
