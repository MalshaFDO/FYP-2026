"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import styles from "../success/PaymentStatus.module.css";

const copy = {
  en: {
    badge: "Payment cancelled",
    title: "Your payment was cancelled.",
    text: "Your booking items are still in the cart, so you can try again.",
    order: "Order",
    back: "Return to cart",
  },
  si: {
    badge: "ගෙවීම අවලංගු විය",
    title: "ඔබේ ගෙවීම අවලංගු විය.",
    text: "ඔබේ booking items තවමත් කරත්තයේ ඇති බැවින් නැවත උත්සාහ කළ හැක.",
    order: "ඇණවුම",
    back: "කරත්තයට ආපසු යන්න",
  },
} as const;

export default function PaymentCancelPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <span className={styles.cancelBadge}>{t.badge}</span>
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
