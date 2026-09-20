import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import { Container } from "@/components/ui/container";
import type { CuratedNewsCard } from "@/content/news/types";
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
  const [lead, ...rest] = items;
  const state = newsIndexState(items.length, unavailable);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <p className="eyebrow">News</p>
          <h1 className={styles.title}>What we’re following</h1>
          <p className={styles.lede}>
            Outward-linking Jewish current affairs. Headlines stay with their
            publishers. Jewish Original adds only short context.
          </p>
        </Container>
      </section>
      <section className="section">
        <Container>
          {state === "unavailable" ? (
            <p className={styles.empty}>
              {NEWS_INDEX_UNAVAILABLE}{" "}
              <Link href="/today">Open Today</Link>
            </p>
          ) : state === "empty" ? (
            <p className={styles.empty}>
              {NEWS_INDEX_EMPTY}{" "}
              <Link href="/today">Open Today</Link>
              {" · "}
              <Link href="/history">Browse the archive</Link>
            </p>
          ) : lead ? (
            <ol className={styles.list}>
              <li className={`${styles.item} ${styles.lead}`}>
                <NewsItemLink item={lead} headingLevel="h2" />
              </li>
              {rest.map((item) => (
                <li key={item.id} className={styles.item}>
                  <NewsItemLink item={item} headingLevel="h3" />
                </li>
              ))}
            </ol>
          ) : null}
        </Container>
      </section>
    </div>
  );
}

function NewsItemLink({
  headingLevel: Heading,
  item,
}: {
  headingLevel: "h2" | "h3";
  item: CuratedNewsCard;
}) {
  return (
    <TrackedAnchor
      className={styles.link}
      event="news_outbound"
      href={item.sourceUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <p className={styles.meta}>
        <span className={styles.publisher}>{item.publisher}</span>
        <time dateTime={item.sourcePublishedAt}>
          {formatNewsTime(item.sourcePublishedAt)}
        </time>
        <span>{newsDeskLabel(item.desk)}</span>
      </p>
      <Heading className={styles.headline}>{item.headline}</Heading>
      <p className={styles.context}>{item.jomContext}</p>
      <span className={styles.arrow}>View source at {item.publisher}</span>
    </TrackedAnchor>
  );
}
