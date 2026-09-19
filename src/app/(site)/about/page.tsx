import type { Metadata } from "next";

import { MuseumFigure } from "@/components/media/museum-figure";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { FOUNDER_PHOTOS } from "@/content/media/public-assets";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

import styles from "@/app/editorial.module.css";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "Jewish Original Media is a home for Jewish history, culture, education, connection, and identity.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className={`${styles.page} ${styles.roomAbout}`}>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <section className={styles.hero}>
        <Container className={styles.aboutHero}>
          <div>
            <p className="eyebrow">About</p>
            <h1 className={styles.title}>Jewish Original Media</h1>
            <p className={styles.lede}>
              A modern home for Jewish history, culture, education, connection,
              and identity.
            </p>
            <p className={styles.founders}>
              Founded by Meyer Grunberg and Isaac Simon
            </p>
          </div>
          <div className={styles.aboutPortrait}>
            <MuseumFigure
              photo={FOUNDER_PHOTOS.steps}
              priority
              sizes="(max-width: 47.98rem) 100vw, (max-width: 63.98rem) 70vw, 40rem"
            />
          </div>
        </Container>
      </section>

      <section className={styles.chapter} aria-labelledby="about-house">
        <Container size="content">
          <p className="eyebrow">The house</p>
          <h2 className={styles.sectionTitle} id="about-house">
            What we publish
          </h2>
          <p className={styles.copy}>
            Jewish Original publishes a reviewed History archive, a daily Jewish
            Today page, original essays, and The Two Tall Jews Show, hosted by
            Meyer Grunberg and Isaac Simon.
          </p>
          <p className={styles.copy}>
            History is the foundation. Education transmits it. Identity is the
            product. Connection is the outcome.
          </p>
        </Container>
      </section>

      <section className={styles.chapter} aria-labelledby="about-method">
        <Container size="content">
          <p className="eyebrow">How we work</p>
          <h2 className={styles.sectionTitle} id="about-method">
            Sources, corrections, and tools
          </h2>
          <p className={styles.copy}>
            History is published only after editorial review. News is a
            following desk: allowlisted publishers keep the headlines, and
            Jewish Original adds short context with a link back to the source.
            We do not republish publisher article bodies or images.
          </p>
          <p className={styles.copy}>
            Jewish Original uses automation and AI-assisted tools for selected
            curation and drafting tasks. Editorial rules, source selection, and
            publication safeguards are set by Jewish Original.
          </p>
          <p className={styles.copy}>
            If something is wrong, write{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
            Confirmed History corrections are recorded in the editorial record.
          </p>
          <p className={styles.copy}>
            Sponsorship supports Jewish Original Media. It does not determine
            editorial judgment. Jewish Original Media is a for-profit business.
          </p>
        </Container>
      </section>
    </div>
  );
}
