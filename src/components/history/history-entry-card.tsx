import Image from "next/image";
import Link from "next/link";

import {
  historyArchiveHref,
  historyCardLocation,
  historyCardRegion,
} from "@/content/history/archive";
import type { HistoryEntrySummary } from "@/content/history/types";
import { formatHistoricalDate } from "@/lib/history/format-date";

export type HistoryCardVariant = "featured" | "archive" | "related";

function HistoryCardMedia({
  entry,
  variant,
}: {
  entry: HistoryEntrySummary;
  variant: HistoryCardVariant;
}) {
  if (entry.primaryImage) {
    return (
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
              : "(max-width: 48rem) 6rem, 8rem"
          }
          src={entry.primaryImage.asset.url}
        />
      </div>
    );
  }

  if (variant === "featured") return null;

  return (
    <div className="history-entry-card__media">
      <span
        aria-hidden="true"
        className="history-index-plate"
        data-history-index-plate
      >
        <span className="history-gold-rule" />
        <span className="history-archive-mark" />
        <span className="history-gold-rule" />
      </span>
    </div>
  );
}

export function HistoryEntryCard({
  entry,
  variant = "archive",
  headingLevel,
}: {
  entry: HistoryEntrySummary;
  variant?: HistoryCardVariant;
  headingLevel?: "h2" | "h3";
}) {
  const date = formatHistoricalDate(
    entry.historicalDate,
    entry.entryKind,
    entry.observanceRule,
  );
  const location = historyCardLocation(entry);
  const region = historyCardRegion(entry);
  const TitleTag = headingLevel ?? (variant === "featured" ? "h2" : "h3");
  const titleClass =
    variant === "featured"
      ? "history-archive-title"
      : variant === "related"
        ? "history-related-title"
        : "history-archive-card-title";
  const media = <HistoryCardMedia entry={entry} variant={variant} />;
  const copy = (
    <>
      <TitleTag className={titleClass}>
        <Link className="history-related-link" href={`/history/${entry.slug}`}>
          {entry.title}
        </Link>
      </TitleTag>
      {entry.excerpt ? (
        <p className="history-entry-card__excerpt">{entry.excerpt}</p>
      ) : null}
      {entry.topics.length ? (
        <p className="history-entry-card__topics">
          {entry.topics.map((topic, index) => (
            <span key={topic.slug}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              <Link
                href={historyArchiveHref({
                  filter: { type: "topic", slug: topic.slug },
                })}
              >
                {topic.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      {location ? (
        <p className="history-entry-card__location">{location}</p>
      ) : null}
      {region ? <p className="history-entry-card__region">{region}</p> : null}
    </>
  );

  if (variant === "featured") {
    return (
      <article className={`history-entry-card history-entry-card--${variant}`}>
        <p className="history-entry-card__date">{date}</p>
        <div className="history-entry-card__body">
          {media}
          {copy}
        </div>
      </article>
    );
  }

  return (
    <article className={`history-entry-card history-entry-card--${variant}`}>
      {media}
      <div className="history-entry-card__main">
        <p className="history-entry-card__date">{date}</p>
        <div className="history-entry-card__body">{copy}</div>
      </div>
    </article>
  );
}
