import styles from "@/app/home.module.css";

export default function HomeLoading() {
  return (
    <div className={styles.page}>
      <section className={styles.masthead} aria-busy="true" aria-live="polite">
        <div className={styles.bandInner}>
          <p className={styles.wordmark}>Jewish Original Media</p>
          <h1 className={styles.display}>
            Remember,
            <br />
            rebuild,
            <br />
            and create.
          </h1>
          <p className={styles.lede}>Preparing today’s homepage.</p>
        </div>
      </section>
    </div>
  );
}
