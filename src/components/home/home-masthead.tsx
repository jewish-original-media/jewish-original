import Image from "next/image";
import Link from "next/link";

import { FOUNDER_PHOTOS } from "@/content/media/public-assets";

import styles from "@/app/home.module.css";

const HERO_PHOTOS = [
  FOUNDER_PHOTOS.tefillin,
  FOUNDER_PHOTOS.gathering,
  FOUNDER_PHOTOS.overlook,
] as const;

const DESCRIPTORS = [
  "Media",
  "History",
  "Culture",
  "Education",
  "News",
  "Events",
  "Podcasts",
  "Stories",
] as const;

type HomeMastheadProps = {
  chapters: Array<{ href: string; label: string }>;
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
            podcasts, and stories.
          </h1>
          <div aria-hidden="true" className={styles.display}>
            <span>Jewish Original</span>
            <span className={styles.descriptorReel} data-home-descriptors>
              {DESCRIPTORS.map((descriptor, index) => (
                <span
                  className={styles.descriptor}
                  key={descriptor}
                  style={{
                    animationDelay: index === 0 ? "0s" : `-${24 - index * 3}s`,
                  }}
                >
                  {descriptor}
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
        {chapters.map((chapter, index) => (
          <Link href={chapter.href} key={chapter.href}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {chapter.label}
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
