import Image from "next/image";
import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { FOUNDER_PHOTOS } from "@/content/media/public-assets";

import styles from "@/app/home.module.css";

const HERO_PHOTOS = [
  FOUNDER_PHOTOS.tefillin,
  FOUNDER_PHOTOS.gathering,
  FOUNDER_PHOTOS.overlook,
] as const;

const DESCRIPTORS = [
  { text: "Media" },
  { text: "History" },
  { text: "Culture" },
  { text: "Education" },
  { text: "משפחה", lang: "he", dir: "rtl" },
  { text: "News" },
  { text: "Games" },
  { text: "עם ישראל חי", lang: "he", dir: "rtl" },
  { text: "Podcasts" },
  { text: "Stories" },
] as const;

const DESCRIPTOR_HOLD_SECONDS = 3;
const DESCRIPTOR_CYCLE_SECONDS = DESCRIPTORS.length * DESCRIPTOR_HOLD_SECONDS;

type HomeChapter = {
  href: string;
  label: string;
  external?: boolean;
  analyticsEvent?: string;
  accessibleName?: string;
};

type HomeMastheadProps = {
  chapters: HomeChapter[];
  gregorianLabel: string;
  hebrewDate?: string;
};

export function HomeMasthead({
  chapters,
  gregorianLabel,
  hebrewDate,
}: HomeMastheadProps) {
  return (
    <section className={styles.masthead} aria-labelledby="home-masthead">
      <figure className={styles.heroFigure} data-home-hero>
        <div className={styles.heroImage}>
          {HERO_PHOTOS.map((photo, index) => (
            <div
              className={styles.heroSlide}
              data-hero-slide={index + 1}
              key={photo.id}
            >
              <Image
                alt={index === 0 ? photo.alt : ""}
                fill
                preload={index === 0}
                sizes="100vw"
                src={photo.src}
              />
            </div>
          ))}
        </div>
        <div className={styles.heroVeil} aria-hidden="true" />
        <figcaption className={styles.heroCaption}>
          <span>Tradition. Community. The Jewish present.</span>
          <span>Jewish Original Media</span>
        </figcaption>
      </figure>

      <div className={`${styles.bandInner} ${styles.mastheadGrid}`}>
        <div className={styles.mastheadCopy}>
          <div className={styles.mastheadIdentity}>
            <p className={styles.wordmark}>Jewish Original</p>
            <p className={styles.liveEdition}>The living Jewish story</p>
          </div>
          <h1 className="sr-only" id="home-masthead">
            Jewish Original Media, history, culture, education, news, events,
            podcasts, games, and stories.
          </h1>
          <div aria-hidden="true" className={styles.display}>
            <span>Jewish Original</span>
            <span className={styles.descriptorReel} data-home-descriptors>
              {DESCRIPTORS.map((descriptor, index) => (
                <span
                  className={styles.descriptor}
                  key={descriptor.text}
                  lang={"lang" in descriptor ? descriptor.lang : undefined}
                  style={{
                    animationDuration: `${DESCRIPTOR_CYCLE_SECONDS}s`,
                    animationDelay:
                      index === 0
                        ? "0s"
                        : `-${DESCRIPTOR_CYCLE_SECONDS - index * DESCRIPTOR_HOLD_SECONDS}s`,
                  }}
                >
                  {"dir" in descriptor ? (
                    <bdi dir={descriptor.dir}>{descriptor.text}</bdi>
                  ) : (
                    descriptor.text
                  )}
                </span>
              ))}
            </span>
          </div>
          <p className={styles.lede}>
            A modern home for Jewish history, culture, education, connection,
            and identity.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryPath} href="/explore">
              Explore the Living Archive <span aria-hidden="true">↗</span>
            </Link>
            <Link className={styles.secondaryPath} href="/today">
              Discover Jewish Today <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className={styles.mastheadMeta}>
            <span>{gregorianLabel}</span>
            {hebrewDate ? <span>{hebrewDate}</span> : null}
          </p>
        </div>
      </div>
      <nav
        className={`${styles.bandInner} ${styles.chapterNav}`}
        aria-label="Discover Jewish Original"
        data-count={chapters.length}
      >
        {chapters.map((chapter, index) => {
          const content = (
            <>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {chapter.label}
              <span aria-hidden="true">↗</span>
            </>
          );
          if (chapter.external) {
            return (
              <TrackedAnchor
                aria-label={chapter.accessibleName}
                event={chapter.analyticsEvent ?? "chapter_outbound"}
                href={chapter.href}
                key={chapter.href}
                rel="noreferrer"
                target="_blank"
              >
                {content}
              </TrackedAnchor>
            );
          }
          return (
            <Link href={chapter.href} key={chapter.href}>
              {content}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
