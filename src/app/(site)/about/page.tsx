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
            <h1 className={styles.title}>Our path forward</h1>
            <p className={styles.lede}>
              We’re not here to copy trends. We’re here to remember, to rebuild,
              and to create.
            </p>
            <p className={styles.founders}>Meyer Grunberg and Isaac Simon</p>
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

      <section className={styles.chapter} aria-labelledby="about-people">
        <Container size="content">
          <p className="eyebrow">The house</p>
          <h2 className={styles.sectionTitle} id="about-people">
            People
          </h2>
          <ul className={styles.people}>
            <li>
              <h3 className={styles.personName}>Meyer Grunberg</h3>
              <p className={styles.personCaption}>Founder</p>
            </li>
            <li>
              <h3 className={styles.personName}>Isaac Simon</h3>
              <p className={styles.personCaption}>Founder</p>
            </li>
          </ul>
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

      <section className={styles.chapter} aria-labelledby="about-method">
        <Container size="content">
          <p className="eyebrow">How we work</p>
          <h2 className={styles.sectionTitle} id="about-method">
            Sources, corrections, and tools
          </h2>
          <p className={styles.copy}>
            History is reviewed from the Jewish Original archive and published
            only after editorial checks. News is a following desk: allowlisted
            publishers keep the headlines, and Jewish Original adds short
            context with a link back to the source. We do not republish
            publisher article bodies or images.
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
            editorial judgment.
          </p>
        </Container>
      </section>
    </div>
  );
}
