import Link from "next/link";
import styles from "./PaymentStatus.module.css";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <span className={styles.successBadge}>Payment returned</span>
        <h1>Thanks, your payment flow is complete.</h1>
        <p>
          PayHere redirected back to AutoFlash. Final payment confirmation should
          be trusted only after the server notification is verified.
        </p>
        {searchParams.order_id && <strong>Order: {searchParams.order_id}</strong>}
        <Link href="/cart">Back to cart</Link>
      </section>
    </main>
  );
}

