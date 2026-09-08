import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { HomeHistoryFeature } from "@/components/home/home-history-feature";
import { HomeJewishToday } from "@/components/home/home-jewish-today";
import { HomePodcastFeature } from "@/components/home/home-podcast-feature";
import { ButtonLink } from "@/components/ui/button-link";
import {
  composeHomeHistory,
  composeHomePodcasts,
  type HomePageData,
} from "@/features/homepage";

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

  return (
    <div className={styles.page}>
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
            <p className={styles.mastheadMeta}>
              <span>{data.jewishToday.gregorianLabel}</span>
              {data.jewishToday.hebrewDate ? (
                <span>{data.jewishToday.hebrewDate}</span>
              ) : null}
            </p>
          </div>
          <div className={styles.watermark}>
            <HistoryHeroWatermark />
          </div>
        </div>
      </section>

      <HomeJewishToday day={data.jewishToday} />

      <HomeHistoryFeature
        history={history}
        unavailable={data.history.status === "unavailable"}
      />

      <section
        className={`${styles.band} ${styles.manifesto}`}
        aria-label="Legacy"
      >
        <div className={styles.bandInner}>
          <p className={styles.sectionLabel}>For what lasts</p>
          <blockquote className={styles.manifestoQuote}>
            We don’t ask what’s going viral. We ask what’s worth remembering in
            100 years.
          </blockquote>
          <p className={styles.manifestoNote}>Jewish Original Media</p>
        </div>
      </section>

      <HomePodcastFeature
        podcasts={podcasts}
        show={data.podcasts.show}
        status={data.podcasts.status}
      />

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
            Help keep Jewish memory, culture, and original work in public view.
            Support stays secondary to the editorial record.
          </p>
          <ButtonLink href="/support">Support Jewish Original</ButtonLink>
        </div>
      </section>
    </div>
  );
}
