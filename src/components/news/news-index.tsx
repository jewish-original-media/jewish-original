import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { ArchiveTrail } from "@/components/explore/archive-trail";
import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { SourcePreviewImage } from "@/components/home/source-preview-image";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { CuratedNewsCard } from "@/content/news/types";
import { civilDateParts, formatCivilDateLabel } from "@/lib/history/on-this-day";
import {
  NEWS_INDEX_EMPTY,
  NEWS_INDEX_UNAVAILABLE,
  formatNewsTime,
  newsDeskLabel,
  newsIndexState,
} from "@/lib/news/display";

import styles from "@/app/news.module.css";

type NewsIndexProps = {
  items: CuratedNewsCard[];
  unavailable?: boolean;
};

export function NewsIndex({ items, unavailable = false }: NewsIndexProps) {
  const state = newsIndexState(items.length, unavailable);
  const today = civilDateParts();

  return (
    <>
      <header className="history-entry-header history-discovery-hero">
        <HistoryHeroWatermark />
        <Container className="history-entry-hero">
          <div className="history-hero-copy">
            <nav aria-label="Breadcrumb">
              <ol className="history-breadcrumb">
                <li>
                  <Link href="/">Jewish Original</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">News</li>
              </ol>
            </nav>
            <p className="history-date-line">{formatCivilDateLabel(today)}</p>
            <h1 className="history-display">What we’re following</h1>
            <p className="history-lede">
              Outward-linking Jewish current affairs. Headlines stay with their
              publishers. Jewish Original adds only short context.
            </p>
          </div>
          <aside className="history-archive-rail">
            <p className="eyebrow">The desk</p>
            <p className="history-archive-rail__text">
              {state === "ready"
                ? `${items.length === 1 ? "One story" : `${items.length} stories`} from the last 30 days, newest first.`
                : "The desk shows publisher headlines from the last 30 days."}
            </p>
            <p className="history-archive-rail__note">
              Dates are Eastern Time. Stories older than 30 days leave the desk.
            </p>
            <Link className="editorial-link" href="/explore?view=current">
              See news and events together in Current
            </Link>
          </aside>
        </Container>
      </header>
      <ArchiveTrail current="news" />
      <Section className="history-archive-results" spacing="compact">
        <Container>
          {state === "unavailable" ? (
            <p className={styles.empty}>
              {NEWS_INDEX_UNAVAILABLE} <Link href="/today">Open Today</Link>
            </p>
          ) : state === "empty" ? (
            <p className={styles.empty}>
              {NEWS_INDEX_EMPTY} <Link href="/today">Open Today</Link>
              {" · "}
              <Link href="/history">Browse the archive</Link>
            </p>
          ) : (
            <ol className={styles.list}>
              {items.map((item, index) => (
                <li key={item.id} className={styles.item}>
                  <NewsItemLink item={item} lead={index === 0} />
                </li>
              ))}
            </ol>
          )}
        </Container>
      </Section>
    </>
  );
}

function NewsItemLink({
  item,
  lead = false,
}: {
  item: CuratedNewsCard;
  lead?: boolean;
}) {
  return (
    <TrackedAnchor
      className={[
        styles.link,
        lead ? styles.lead : "",
        item.sourceImageUrl ? styles.withImage : "",
      ]
        .filter(Boolean)
        .join(" ")}
      event="news_outbound"
      href={item.sourceUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      {item.sourceImageUrl ? (
        <SourcePreviewImage
          className={styles.thumb}
          fallbackClassName={styles.thumbFallback}
          src={item.sourceImageUrl}
        />
      ) : null}
      <span className={styles.copy}>
        <p className={styles.meta}>
          <span className={styles.publisher}>{item.publisher}</span>
          <time dateTime={item.sourcePublishedAt}>
            {formatNewsTime(item.sourcePublishedAt)}
          </time>
          <span>{newsDeskLabel(item.desk)}</span>
        </p>
        <h2 className={styles.headline}>{item.headline}</h2>
        <p className={styles.context}>{item.jomContext}</p>
        <span className={styles.arrow}>View source at {item.publisher}</span>
      </span>
    </TrackedAnchor>
  );
}
