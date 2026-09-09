import Image from "next/image";
import Link from "next/link";

import { historyCardLocation } from "@/content/history/archive";
import type { HistoryEntrySummary } from "@/content/history/types";
import type { HomeHistoryPresentation } from "@/features/homepage/history";
import { formatHistoricalDate } from "@/lib/history/format-date";

import styles from "@/app/home.module.css";

type HomeHistoryFeatureProps = {
  history: HomeHistoryPresentation;
  unavailable: boolean;
};

function historyDate(entry: HistoryEntrySummary) {
  return formatHistoricalDate(
    entry.historicalDate,
    entry.entryKind,
    entry.observanceRule,
  );
}

function LeadHistory({ entry }: { entry: HistoryEntrySummary }) {
  const location = historyCardLocation(entry);
  const topics = entry.topics.map((topic) => topic.name).join(" · ");

  return (
    <article className={styles.historyLead}>
      <p className={styles.historyCatalog}>Archive record</p>
      <p className={styles.historyDate}>{historyDate(entry)}</p>
      <h3 className={styles.historyTitle}>
        <Link href={`/history/${entry.slug}`}>{entry.title}</Link>
      </h3>
      {entry.excerpt ? (
        <p className={styles.historyExcerpt}>{entry.excerpt}</p>
      ) : null}
      <p className={styles.historyMeta}>
        {[topics, location].filter(Boolean).join(" · ")}
      </p>
    </article>
  );
}

function SupportingHistory({ entry }: { entry: HistoryEntrySummary }) {
  const location = historyCardLocation(entry);

  return (
    <article className={styles.supportingStory}>
      {entry.primaryImage ? (
        <div className={styles.supportingMedia}>
          <Image
            alt={entry.primaryImage.alt}
            fill
            sizes="(max-width: 64rem) 100vw, 22rem"
            src={entry.primaryImage.asset.url}
          />
        </div>
      ) : null}
      <p className={styles.supportingDate}>{historyDate(entry)}</p>
      <h3 className={styles.supportingTitle}>
        <Link href={`/history/${entry.slug}`}>{entry.title}</Link>
      </h3>
      {entry.excerpt ? (
        <p className={styles.supportingExcerpt}>{entry.excerpt}</p>
      ) : null}
      {location ? <p className={styles.historyMeta}>{location}</p> : null}
    </article>
  );
}

export function HomeHistoryFeature({
  history,
  unavailable,
}: HomeHistoryFeatureProps) {
  return (
    <section
      className={`${styles.band} ${styles.history}`}
      aria-label="History"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>History</p>
        <h2 className={styles.historyHeading}>{history.title}</h2>
        {unavailable ? (
          <p className={styles.unavailableNote} role="status">
            The History archive is briefly unavailable.
          </p>
        ) : null}
        {!unavailable && !history.lead ? (
          <p className={styles.unavailableNote}>
            Published History will appear here when a reviewed entry is ready.
          </p>
        ) : null}
        <div className={styles.historyLayout}>
          {history.lead ? <LeadHistory entry={history.lead} /> : null}
          {history.supporting.length > 0 ? (
            <div className={styles.supporting}>
              {history.supporting.map((entry) => (
                <SupportingHistory entry={entry} key={entry._id} />
              ))}
            </div>
          ) : null}
        </div>
        <p className={styles.historyPath}>
          <Link className="editorial-link" href="/history">
            Enter the Archive
          </Link>
        </p>
      </div>
    </section>
  );
}
