import Link from "next/link";

import { HomeEvents } from "@/components/home/home-events";
import { HomeHistoryFeature } from "@/components/home/home-history-feature";
import { HomeJewishToday } from "@/components/home/home-jewish-today";
import { HomeLivingArchive } from "@/components/home/home-living-archive";
import { HomeMasthead } from "@/components/home/home-masthead";
import { HomeNews } from "@/components/home/home-news";
import { HomeOriginals } from "@/components/home/home-originals";
import { HomePodcastFeature } from "@/components/home/home-podcast-feature";
import { ButtonLink } from "@/components/ui/button-link";
import {
  composeHomeHistory,
  composeHomePodcasts,
  type HomePageData,
} from "@/features/homepage";
import { shouldShowHomepageEvents } from "@/features/ingest/select";
import { siteSocial } from "@/lib/site";

import styles from "@/app/home.module.css";

type HomePageViewProps = {
  data: HomePageData;
};

export function HomePageView({ data }: HomePageViewProps) {
  const history = composeHomeHistory(
    data.history.entries,
    data.jewishToday.onThisDay,
  );
  const podcasts = composeHomePodcasts(data.podcasts.episodes);
  const showNews = data.news.length > 0;
  const showEvents = shouldShowHomepageEvents(data.events);
  const instagram = siteSocial[0];
  const chapters = [
    { href: "/news", label: "News" },
    { href: "/today#weekly-torah", label: "Torah" },
    {
      href: instagram.href,
      label: "Instagram",
      external: true,
      analyticsEvent: instagram.analyticsEvent,
      accessibleName: `${instagram.account} on Instagram`,
    },
    { href: "/support", label: "Support" },
    { href: "/explore", label: "Search the archive" },
  ];

  return (
    <div
      className={`${styles.page} ${styles.immersive} ${styles.livingArchive}`}
    >
      <HomeMasthead
        chapters={chapters}
        gregorianLabel={data.jewishToday.gregorianLabel}
        hebrewDate={data.jewishToday.hebrewDate}
      />

      <HomeJewishToday day={data.jewishToday} />

      {showNews ? <HomeNews items={data.news} /> : null}

      <HomeLivingArchive />

      <HomeHistoryFeature
        history={history}
        unavailable={data.history.status === "unavailable"}
      />

      {data.originals.length ? <HomeOriginals items={data.originals} /> : null}
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
