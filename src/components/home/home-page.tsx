import Image from "next/image";
import Link from "next/link";

import { HomeEvents } from "@/components/home/home-events";
import { HomeHistoryFeature } from "@/components/home/home-history-feature";
import { HomeJewishToday } from "@/components/home/home-jewish-today";
import { HomeNews } from "@/components/home/home-news";
import { HomeOriginals } from "@/components/home/home-originals";
import { HomePodcastFeature } from "@/components/home/home-podcast-feature";
import { ButtonLink } from "@/components/ui/button-link";
import { FOUNDER_PHOTOS } from "@/content/media/public-assets";
import {
  composeHomeHistory,
  composeHomePodcasts,
  type HomePageData,
} from "@/features/homepage";
import {
  shouldShowHomepageEvents,
  shouldShowHomepageNews,
} from "@/features/ingest/select";

import styles from "@/app/home.module.css";

type HomePageViewProps = {
  data: HomePageData;
};

const HERO_PHOTO = FOUNDER_PHOTOS.tefillin;

export function HomePageView({ data }: HomePageViewProps) {
  const history = composeHomeHistory(
    data.history.entries,
    data.jewishToday.onThisDay,
  );
  const podcasts = composeHomePodcasts(data.podcasts.episodes);
  const showNews = shouldShowHomepageNews(data.news.length);
  const showEvents = shouldShowHomepageEvents(data.events);
  const chapters = [
    { href: "/today", label: "Today" },
    { href: "/history", label: "History" },
    ...(data.originals.length > 0
      ? [{ href: "/originals", label: "Originals" }]
      : []),
    { href: "/podcasts", label: "Conversations" },
  ];

  return (
    <div className={`${styles.page} ${styles.exhibition}`}>
      <section className={styles.masthead} aria-labelledby="home-masthead">
        <div className={`${styles.bandInner} ${styles.mastheadGrid}`}>
          <div className={styles.mastheadCopy}>
            <p className={styles.wordmark}>Jewish Original Media</p>
            <h1 className={styles.display} id="home-masthead">
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
            <div className={styles.heroActions}>
              <Link className={styles.primaryPath} href="/history">
                Enter the Archive <span aria-hidden="true">↗</span>
              </Link>
              <Link className={styles.secondaryPath} href="/today">
                Discover Jewish Today <span aria-hidden="true">→</span>
              </Link>
            </div>
            <p className={styles.mastheadMeta}>
              <span>{data.jewishToday.gregorianLabel}</span>
              {data.jewishToday.hebrewDate ? (
                <span>{data.jewishToday.hebrewDate}</span>
              ) : null}
            </p>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.heroImage}>
              <Image
                alt={HERO_PHOTO.alt}
                fill
                priority
                sizes="(max-width: 47.98rem) 90vw, 42vw"
                src={HERO_PHOTO.src}
              />
            </div>
            <figcaption className={styles.heroCaption}>
              <span>Tradition, lived.</span>
              <span>{HERO_PHOTO.credit}</span>
            </figcaption>
          </figure>
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

      <HomeJewishToday day={data.jewishToday} />

      <HomeHistoryFeature
        history={history}
        unavailable={data.history.status === "unavailable"}
      />

      {data.originals.length ? <HomeOriginals items={data.originals} /> : null}
      {showNews ? <HomeNews items={data.news} /> : null}
      <HomePodcastFeature
        podcasts={podcasts}
        show={data.podcasts.show}
        status={data.podcasts.status}
      />
      {showEvents ? <HomeEvents items={data.events} /> : null}

      <section
        className={`${styles.band} ${styles.support}`}
        aria-labelledby="home-support"
      >
        <div className={styles.bandInner}>
          <p className={styles.sectionLabel}>Support</p>
          <h2 className={styles.supportTitle} id="home-support">
            Stand with us. Build with us.
          </h2>
          <p className={styles.supportCopy}>
            Help keep Jewish history, culture, and original work in public view.
          </p>
          <ButtonLink className={styles.supportAction} href="/support">
            Support Jewish Original
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
