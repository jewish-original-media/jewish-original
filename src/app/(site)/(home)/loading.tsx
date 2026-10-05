import styles from "@/app/home.module.css";

export default function HomeLoading() {
  return (
    <div
      className={`${styles.page} ${styles.immersive} ${styles.livingArchive}`}
    >
      <section className={styles.masthead} aria-busy="true" aria-live="polite">
        <div className={`${styles.bandInner} ${styles.mastheadGrid}`}>
          <div className={styles.mastheadCopy}>
            <div className={styles.mastheadIdentity}>
              <p className={styles.wordmark}>Jewish Original Media</p>
              <p className={styles.liveEdition}>The living Jewish story</p>
            </div>
            <h1 className={styles.display}>
              Remember,
              <br />
              rebuild,
              <br />
              and create.
            </h1>
            <p className={styles.lede}>
              A modern home for Jewish history, culture, education, connection,
              and identity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
