import type { CuratedNewsCard } from "@/content/news/types";
import { formatNewsTime } from "@/lib/news/display";

import styles from "@/app/home.module.css";

type HomeNewsProps = {
  items: CuratedNewsCard[];
};

export function HomeNews({ items }: HomeNewsProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={`${styles.band} ${styles.news}`}
      aria-label="What we’re following"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>What we’re following</p>
        <h2 className={styles.newsTitle}>The wire, not the reprint.</h2>
        <ol className={styles.newsList}>
          {items.map((item) => (
            <li key={item.id} className={styles.newsItem}>
              <a
                className={styles.newsLink}
                href={item.sourceUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className={styles.newsPublisher}>
                  {item.publisher} · {formatNewsTime(item.sourcePublishedAt)}
                </span>
                <span className={styles.newsHeadline}>{item.headline}</span>
                <span className={styles.newsContext}>{item.jomContext}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
