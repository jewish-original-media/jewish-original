import Image from "next/image";
import Link from "next/link";

import { historyCardLocation } from "@/content/history/archive";
import type { HistoryEntrySummary } from "@/content/history/types";
import { formatHistoricalDate } from "@/lib/history/format-date";

export type HistoryCardVariant = "featured" | "archive" | "related";

export function HistoryEntryCard({
  entry,
  variant = "archive",
}: {
  entry: HistoryEntrySummary;
  variant?: HistoryCardVariant;
}) {
  const date = formatHistoricalDate(
    entry.historicalDate,
    entry.entryKind,
    entry.observanceRule,
  );
  const location = historyCardLocation(entry);
  const TitleTag = variant === "featured" ? "h2" : "h3";
  const titleClass =
    variant === "featured"
      ? "history-archive-title"
      : variant === "related"
        ? "history-related-title"
        : "history-archive-card-title";

  return (
    <article className={`history-entry-card history-entry-card--${variant}`}>
      <p className="history-entry-card__date">{date}</p>
      <div className="history-entry-card__body">
        {entry.primaryImage ? (
          <div className="history-entry-card__media">
            <Image
              alt={entry.primaryImage.alt}
              className="history-featured-media__image"
              fill
              placeholder={entry.primaryImage.asset.lqip ? "blur" : "empty"}
              blurDataURL={entry.primaryImage.asset.lqip}
              sizes={
                variant === "featured"
                  ? "(max-width: 48rem) 100vw, 44rem"
                  : "(max-width: 40rem) 100vw, 22rem"
              }
              src={entry.primaryImage.asset.url}
            />
          </div>
        ) : null}
        <TitleTag className={titleClass}>
          <Link
            className="history-related-link"
            href={`/history/${entry.slug}`}
          >
            {entry.title}
          </Link>
        </TitleTag>
        {entry.excerpt ? (
          <p className="history-entry-card__excerpt">{entry.excerpt}</p>
        ) : null}
        {entry.topics.length ? (
          <p className="history-entry-card__topics">
            {entry.topics.map((topic) => topic.name).join(" · ")}
          </p>
        ) : null}
        {location ? (
          <p className="history-entry-card__location">{location}</p>
        ) : null}
      </div>
    </article>
  );
}
