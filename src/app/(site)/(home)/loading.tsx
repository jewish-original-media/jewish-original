import { Container } from "@/components/ui/container";

import styles from "@/app/home.module.css";

export default function HomeLoading() {
  return (
    <div className={styles.page}>
      <section className={styles.masthead} aria-busy="true" aria-live="polite">
        <Container>
          <p className="eyebrow">Jewish Original Media</p>
          <h1 className="display-title">Remember, rebuild, and create.</h1>
          <p className="editorial-lede">Preparing today’s homepage.</p>
        </Container>
      </section>
      <div className={styles.section}>
        <Container>
          <div className={styles.loadingStack}>
            <div className={styles.loadingBlock} />
            <div className={styles.loadingBlock} />
          </div>
        </Container>
      </div>
    </div>
  );
}
