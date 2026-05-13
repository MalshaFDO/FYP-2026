import styles from "./loading.module.css";

const rows = Array.from({ length: 4 }, (_, index) => index);
const cards = Array.from({ length: 3 }, (_, index) => index);

export default function Loading() {
  return (
    <section className={styles.page} aria-label="Loading page">
      <div className={styles.heroSkeleton}>
        <div className={styles.kicker} />
        <div className={styles.title} />
        <div className={styles.subtitle} />
        <div className={styles.actions}>
          <div />
          <div />
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader} />
          {rows.map((row) => (
            <div className={styles.lineRow} key={row}>
              <span />
              <strong />
            </div>
          ))}
        </div>

        <div className={styles.cardGrid}>
          {cards.map((card) => (
            <div className={styles.card} key={card}>
              <span />
              <strong />
              <p />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
