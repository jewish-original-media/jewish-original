import Link from "next/link";

import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { EpisodeCard } from "@/components/podcasts/episode-card";
import { JewishTodayModule } from "@/components/today/jewish-today-module";
import { Container } from "@/components/ui/container";
import { LATER_DESKS, type HomePageData } from "@/features/homepage";

import styles from "@/app/home.module.css";

type HomePageViewProps = {
  data: HomePageData;
};

function HomeSection({
  id,
  eyebrow,
  title,
  className = "",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;

  return (
    <section
      className={`${styles.section} ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <Container>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={styles.sectionTitle} id={headingId}>
          {title}
        </h2>
        {children}
      </Container>
    </section>
  );
}

export function HomePageView({ data }: HomePageViewProps) {
  const historyUnavailable = data.history.status === "unavailable";
  const historyEntries = data.history.entries;

  return (
    <div className={styles.page}>
      <section className={styles.masthead} aria-labelledby="home-masthead">
        <div className={styles.mastheadRule} aria-hidden="true" />
        <Container>
          <p className="eyebrow">Jewish Original Media</p>
          <h1 className="display-title" id="home-masthead">
            A modern home for Jewish history, culture, education, connection,
            and identity.
          </h1>
          <p className="editorial-lede">
            An editorial publication and daily Jewish utility. History is the
            foundation. Education transmits it. Identity is the product.
            Connection is the outcome.
          </p>
          <p className={styles.principle}>
            Start with today and the published archive. Published podcasts and
            later desks will join this home when they are ready — never as
            invented filler.
          </p>
        </Container>
      </section>

      <section
        className={`${styles.section} ${styles.todaySection}`}
        aria-label="Jewish Today"
      >
        <Container>
          <JewishTodayModule day={data.jewishToday} />
        </Container>
      </section>

      <HomeSection
        className={styles.sectionRule}
        eyebrow="History"
        id="history"
        title="From the archive"
      >
        {historyUnavailable ? (
          <p className={styles.slotCopy} role="status">
            The History archive is briefly unavailable.
          </p>
        ) : null}
        {!historyUnavailable && historyEntries.length === 0 ? (
          <p className={styles.slotCopy}>
            Published History will appear here when a reviewed entry is ready.
          </p>
        ) : null}
        {historyEntries.length > 0 ? (
          <div className={styles.historyList}>
            {historyEntries.map((entry) => (
              <HistoryEntryCard
                entry={entry}
                key={entry._id}
                variant="archive"
              />
            ))}
          </div>
        ) : null}
        <p className={styles.archiveLink}>
          <Link href="/history">Open the History archive</Link>
        </p>
      </HomeSection>

      <HomeSection
        className={styles.pendingSection}
        eyebrow="Podcasts"
        id="podcasts"
        title={
          data.podcasts.status === "live" && data.podcasts.show
            ? data.podcasts.show.title
            : "Podcasts are being prepared."
        }
      >
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
        {data.podcasts.status === "live" &&
        data.podcasts.episodes.length === 0 ? (
          <p className={styles.slotCopy}>
            Published episodes will appear here after editorial review.
          </p>
        ) : null}
        {data.podcasts.episodes.length > 0 ? (
          <div className="podcast-episode-list">
            {data.podcasts.episodes.map((episode) => (
              <EpisodeCard episode={episode} key={episode._id} />
            ))}
          </div>
        ) : null}
        <p className={styles.archiveLink}>
          <Link href="/podcasts">Open Podcasts</Link>
        </p>
      </HomeSection>

      <HomeSection
        className={styles.sectionRule}
        eyebrow="Later desks"
        id="later-desks"
        title="News, events, culture, and support"
      >
        <p className={styles.laterNote}>
          These desks are reserved. They will join this home when they have
          reviewed content.
        </p>
        <ul className={styles.laterList}>
          {LATER_DESKS.map((desk) => (
            <li className={styles.laterItem} key={desk.id}>
              <p className={styles.laterTitle}>{desk.title}</p>
              <p className={styles.swapItem}>{desk.note}</p>
            </li>
          ))}
        </ul>
      </HomeSection>
    </div>
  );
}
