import Link from "next/link";

import { TrackedAnchor } from "@/components/analytics/tracked-anchor";
import type { CuratedNewsCard } from "@/content/news/types";
import { formatNewsTime } from "@/lib/news/display";

import styles from "@/app/home.module.css";

type HomeNewsProps = {
  items: CuratedNewsCard[];
};

export function HomeNews({ items }: HomeNewsProps) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <section
      className={`${styles.band} ${styles.news}`}
      aria-label="What we’re following"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>What we’re following</p>
        <h2 className={styles.newsTitle}>The wire, not the reprint.</h2>
        <ol className={styles.newsList}>
          <li className={`${styles.newsItem} ${styles.newsLead}`}>
            <NewsDeskLink item={lead} lead />
          </li>
          {rest.map((item) => (
            <li key={item.id} className={styles.newsItem}>
              <NewsDeskLink item={item} />
            </li>
          ))}
        </ol>
        <p className={styles.newsDesk}>
          <Link className={styles.newsDeskLink} href="/news">
            Full desk
          </Link>
        </p>
      </div>
    </section>
  );
}

function NewsDeskLink({
  item,
  lead = false,
}: {
  item: CuratedNewsCard;
  lead?: boolean;
}) {
  return (
    <TrackedAnchor
      className={lead ? styles.newsLeadLink : styles.newsLink}
      event="news_outbound"
      href={item.sourceUrl}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className={styles.newsMeta}>
        <span className={styles.newsPublisher}>{item.publisher}</span>
        <time dateTime={item.sourcePublishedAt}>
          {formatNewsTime(item.sourcePublishedAt)}
        </time>
      </span>
      <span className={styles.newsHeadline}>{item.headline}</span>
      <span className={styles.newsContext}>{item.jomContext}</span>
      <span className={styles.newsSource}>Read at {item.publisher}</span>
    </TrackedAnchor>
  );
}
