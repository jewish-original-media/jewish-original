import type { Metadata } from "next";

import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { Container } from "@/components/ui/container";

import styles from "@/app/editorial.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Jewish Original Media is a home for Jewish history, culture, education, connection, and identity.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <HistoryHeroWatermark />
        <Container size="content">
          <p className="eyebrow">About</p>
          <h1 className={styles.title}>Our path forward</h1>
          <p className={styles.lede}>
            We’re not here to copy trends. We’re here to remember, to rebuild,
            and to create.
          </p>
          <p className={styles.founders}>Meyer Grunberg and Isaac Simon</p>
        </Container>
      </section>

      <section className={styles.chapter} aria-labelledby="about-path">
        <Container size="content">
          <h2 className={styles.sectionTitle} id="about-path">
            Our Path Forward
          </h2>
          <p className={styles.copy}>
            Jewish Original Media started as a response: to loss, to longing, to
            the silence we felt in the spaces we loved.
          </p>
          <p className={styles.copy}>
            We don’t ask what’s going viral. We ask what’s worth remembering in
            100 years.
          </p>
          <p className={styles.copy}>
            Each piece of content is stitched with kavod (honor), with chutzpah
            (courage), and with a fierce love of our people.
          </p>
          <p className={styles.copy}>
            We believe Jewish creativity is not just heritage. It’s a living
            engine of renewal. That’s our path forward.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.chapter} ${styles.chapterDrive}`}
        aria-labelledby="about-drive"
      >
        <Container size="content">
          <h2 className={styles.sectionTitle} id="about-drive">
            What Drives Us
          </h2>
          <p className={styles.copy}>
            We’re two friends who couldn’t stay quiet. What began as
            conversations on Jewish meaning — across coffees, comment sections,
            and Shabbat tables — became a home for the Jewish story in real
            time.
          </p>
          <p className={styles.copy}>
            This isn’t a brand. It’s a movement of memory. We don’t just write
            headlines. We listen to whispers of history, translate the poetry of
            our people, and beam it back into the scrolls of your feed.
          </p>
          <p className={styles.copy}>
            We’re not in this for clicks. We’re in it for legacy.
          </p>
        </Container>
      </section>
    </div>
  );
}
