import Link from "next/link";

import type { OnThisDayHistoryEntry } from "@/features/jewish-today";

import styles from "@/app/today/today.module.css";

type TodayHistoryCardProps = {
  entry: OnThisDayHistoryEntry;
};

export function TodayHistoryCard({ entry }: TodayHistoryCardProps) {
  return (
    <article className={styles.historyCard}>
      {entry.dateLabel ? (
        <p className={styles.historyDate}>{entry.dateLabel}</p>
      ) : null}
      <div>
        <h3 className={styles.historyTitle}>
          <Link className={styles.historyLink} href={entry.href}>
            {entry.title}
          </Link>
        </h3>
        {entry.excerpt ? (
          <p className={styles.historyExcerpt}>{entry.excerpt}</p>
        ) : null}
        {entry.topics.length ? (
          <p className={styles.historyTopics}>
            {entry.topics.map((topic) => topic.name).join(" · ")}
          </p>
        ) : null}
        {entry.location ? (
          <p className={styles.historyLocation}>{entry.location}</p>
        ) : null}
      </div>
    </article>
  );
}
