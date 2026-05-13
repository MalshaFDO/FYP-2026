import Link from "next/link";
import styles from "../success/PaymentStatus.module.css";

export default function PaymentCancelPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <span className={styles.cancelBadge}>Payment cancelled</span>
        <h1>Your payment was cancelled.</h1>
        <p>Your booking items are still in the cart, so you can try again.</p>
        {searchParams.order_id && <strong>Order: {searchParams.order_id}</strong>}
        <Link href="/cart">Return to cart</Link>
      </section>
    </main>
  );
}

