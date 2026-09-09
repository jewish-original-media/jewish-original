import { Container } from "@/components/ui/container";
import type { CuratedNewsCard } from "@/content/news/types";
import { formatNewsTime, newsDeskLabel } from "@/lib/news/display";

import styles from "@/app/news.module.css";

type NewsIndexProps = {
  items: CuratedNewsCard[];
};

export function NewsIndex({ items }: NewsIndexProps) {
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
          {items.length === 0 ? (
            <p className={styles.empty}>
              No published News items yet. This desk stays empty until
              allowlisted sources pass the automation gates.
            </p>
          ) : (
            <ol className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <a
                    className={styles.link}
                    href={item.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <p className={styles.meta}>
                      <span>{item.publisher}</span>
                      <span>{formatNewsTime(item.sourcePublishedAt)}</span>
                      <span>{newsDeskLabel(item.desk)}</span>
                    </p>
                    <h2 className={styles.headline}>{item.headline}</h2>
                    <p className={styles.context}>{item.jomContext}</p>
                    <span className={styles.arrow}>View source ↗</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </section>
    </div>
  );
}
