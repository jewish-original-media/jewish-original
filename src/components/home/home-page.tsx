import Link from "next/link";

import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { HomeJewishToday } from "@/components/home/home-jewish-today";
import { EpisodeCard } from "@/components/podcasts/episode-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
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
  const historyUnavailable = data.history.status === "unavailable";
  const history = composeHomeHistory(
    data.history.entries,
    data.jewishToday.onThisDay,
  );
  const podcasts = composeHomePodcasts(data.podcasts.episodes);

  return (
    <div className={styles.page}>
      <section className={styles.masthead} aria-labelledby="home-masthead">
        <HistoryHeroWatermark />
        <Container className={styles.mastheadInner}>
          <p className="eyebrow">Jewish Original Media</p>
          <h1 className={styles.mastheadTitle} id="home-masthead">
            Remember, rebuild, and create.
          </h1>
          <p className={styles.mastheadLede}>
            A modern home for Jewish history, culture, education, connection,
            and identity.
          </p>
          <div className={styles.mastheadActions}>
            <ButtonLink href="/today">Jewish Today</ButtonLink>
            <ButtonLink href="/history" variant="secondary">
              History archive
            </ButtonLink>
          </div>
        </Container>
      </section>

      <HomeJewishToday day={data.jewishToday} />

      <section className={styles.historySection} aria-label="History">
        <Container>
          <p className="eyebrow">History</p>
          <h2 className={styles.sectionTitle}>{history.title}</h2>
          {historyUnavailable ? (
            <p className={styles.slotCopy} role="status">
              The History archive is briefly unavailable.
            </p>
          ) : null}
          {!historyUnavailable && !history.lead ? (
            <p className={styles.slotCopy}>
              Published History will appear here when a reviewed entry is ready.
            </p>
          ) : null}
          {history.lead ? (
            <div className={styles.historyLead}>
              {history.onThisDay ? (
                <p className={styles.historyKicker}>Matched to today</p>
              ) : null}
              <HistoryEntryCard
                entry={history.lead}
                headingLevel="h3"
                variant="featured"
              />
            </div>
          ) : null}
          {history.supporting.length > 0 ? (
            <div className={styles.historySupport}>
              {history.supporting.map((entry) => (
                <HistoryEntryCard
                  entry={entry}
                  headingLevel="h3"
                  key={entry._id}
                  variant="archive"
                />
              ))}
            </div>
          ) : null}
          <p className={styles.archiveLink}>
            <Link href="/history">Explore the History archive</Link>
          </p>
        </Container>
      </section>

      <section className={styles.podcastSection} aria-label="Podcasts">
        <Container>
          <p className="eyebrow">Podcasts</p>
          <h2 className={styles.sectionTitle}>
            {data.podcasts.status === "live" && data.podcasts.show
              ? data.podcasts.show.title
              : "Podcasts are being prepared."}
          </h2>
          {data.podcasts.status === "unavailable" ? (
            <p className={styles.slotCopy} role="status">
              Podcasts are briefly unavailable.
            </p>
          ) : null}
          {data.podcasts.status === "preparing" ? (
            <p className={styles.slotCopy}>
              The Two Tall Jews Show archive is in editorial review. Published
              episode pages will appear here after founder approval.
            </p>
          ) : null}
          {data.podcasts.status === "live" && data.podcasts.show?.tagline ? (
            <p className={styles.slotCopy}>{data.podcasts.show.tagline}</p>
          ) : null}
          {data.podcasts.status === "live" &&
          data.podcasts.episodes.length === 0 ? (
            <p className={styles.slotCopy}>
              Published episodes will appear here after editorial review.
            </p>
          ) : null}
          {podcasts.lead ? (
            <div className={styles.podcastLead}>
              <p className={styles.historyKicker}>Latest episode</p>
              <EpisodeCard episode={podcasts.lead} />
            </div>
          ) : null}
          <p className={styles.archiveLink}>
            <Link href="/podcasts">
              {podcasts.moreCount > 0
                ? "Browse the Podcast archive"
                : "Open Podcasts"}
            </Link>
          </p>
        </Container>
      </section>

      <section className={styles.supportSection} aria-labelledby="home-support">
        <Container className={styles.supportGrid}>
          <div>
            <p className="eyebrow">Support</p>
            <h2 className={styles.sectionTitle} id="home-support">
              Stand with us. Build with us.
            </h2>
            <p className={styles.slotCopy}>
              Help keep Jewish memory, culture, and original work in public
              view. Support stays secondary to the editorial record.
            </p>
          </div>
          <p className={styles.supportAction}>
            <ButtonLink href="/support">Support Jewish Original</ButtonLink>
          </p>
        </Container>
      </section>
    </div>
  );
}
