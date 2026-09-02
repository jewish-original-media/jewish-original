import Image from "next/image";
import Link from "next/link";

import type { HistoryEntrySummary } from "@/content/history/types";
import { formatHistoricalDate } from "@/lib/history/format-date";

export function HistoryEntryCard({ entry }: { entry: HistoryEntrySummary }) {
  return (
    <article className="history-entry-card">
      <p className="history-entry-card__date">
        {formatHistoricalDate(
          entry.historicalDate,
          entry.entryKind,
          entry.observanceRule,
        )}
      </p>
      <div>
        {entry.primaryImage ? (
          <div className="history-entry-card__media">
            <Image
              alt={entry.primaryImage.alt}
              className="history-featured-media__image"
              fill
              placeholder={entry.primaryImage.asset.lqip ? "blur" : "empty"}
              blurDataURL={entry.primaryImage.asset.lqip}
              sizes="(max-width: 40rem) 100vw, 22rem"
              src={entry.primaryImage.asset.url}
            />
          </div>
        ) : null}
        <h3 className="history-related-title">
          <Link
            className="history-related-link"
            href={`/history/${entry.slug}`}
          >
            {entry.title}
          </Link>
        </h3>
        {entry.excerpt ? (
          <p className="history-entry-card__excerpt">{entry.excerpt}</p>
        ) : null}
        {entry.topics.length ? (
          <p className="history-entry-card__topics">
            {entry.topics.map((topic) => topic.name).join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
