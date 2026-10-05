import Image from "next/image";
import Link from "next/link";

import { HomeEvents } from "@/components/home/home-events";
import { HomeHistoryFeature } from "@/components/home/home-history-feature";
import { HomeJewishToday } from "@/components/home/home-jewish-today";
import { HomeLivingArchive } from "@/components/home/home-living-archive";
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
    { href: "#living-archive", label: "Living archive" },
    { href: "/history", label: "History" },
    { href: "/explore", label: "Explore" },
    ...(data.originals.length > 0
      ? [{ href: "/originals", label: "Originals" }]
      : []),
    ...(showNews ? [{ href: "/news", label: "News" }] : []),
    { href: "/podcasts", label: "Listen" },
    ...(showEvents ? [{ href: "/events", label: "Events" }] : []),
    { href: "/about", label: "About" },
  ];

  return (
    <div
      className={`${styles.page} ${styles.immersive} ${styles.livingArchive}`}
    >
      <section className={styles.masthead} aria-labelledby="home-masthead">
        <figure className={styles.heroFigure} data-home-hero>
          <div className={styles.heroImage}>
            <Image
              alt={HERO_PHOTO.alt}
              fill
              preload
              sizes="100vw"
              src={HERO_PHOTO.src}
            />
          </div>
          <div className={styles.heroVeil} aria-hidden="true" />
          <figcaption className={styles.heroCaption}>
            <span>Tradition, lived.</span>
            <span>{HERO_PHOTO.credit}</span>
          </figcaption>
        </figure>

        <div className={`${styles.bandInner} ${styles.mastheadGrid}`}>
          <div className={styles.mastheadCopy}>
            <div className={styles.mastheadIdentity}>
              <p className={styles.wordmark}>Jewish Original Media</p>
              <p className={styles.liveEdition}>The living Jewish story</p>
            </div>
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
              <Link className={styles.primaryPath} href="/explore">
                Explore the Living Archive <span aria-hidden="true">↗</span>
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

      <HomeLivingArchive />

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
        className={`${styles.band} ${styles.aboutScene}`}
        aria-labelledby="home-about"
      >
        <div className={styles.bandInner}>
          <p className={styles.sectionLabel}>About Jewish Original</p>
          <div className={styles.aboutGrid}>
            <h2 className={styles.aboutTitle} id="home-about">
              History is the foundation. Identity is the work.
            </h2>
            <div className={styles.aboutCopy}>
              <p>
                We connect the Jewish past to the Jewish present—so memory can
                become knowledge, culture, and a stronger shared future.
              </p>
              <Link className={styles.scenePath} href="/about">
                Our story <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`${styles.band} ${styles.support}`}
        aria-labelledby="home-support"
      >
        <div className={styles.bandInner}>
          <p className={styles.sectionLabel}>Support</p>
          <h2 className={styles.supportTitle} id="home-support">
            Help build what Jewish media can become.
          </h2>
          <p className={styles.supportCopy}>
            Keep Jewish history, culture, education, and original voices in
            public view.
          </p>
          <ButtonLink className={styles.supportAction} href="/support">
            Support Jewish Original
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
