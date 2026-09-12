import Link from "next/link";

import type { OriginalSummary } from "@/content/originals/types";
import { authorLine, formatOriginalDate } from "@/lib/originals/display";

import styles from "@/app/home.module.css";

export function HomeOriginals({ items }: { items: OriginalSummary[] }) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  if (!lead) return null;

  return (
    <section
      className={`${styles.band} ${styles.originals}`}
      aria-label="Originals"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>Originals</p>
        <article className={styles.originalLead}>
          <p className={styles.originalMeta}>
            {authorLine(lead.authors) || "Jewish Original"}
            {lead.publishedAt
              ? ` · ${formatOriginalDate(lead.publishedAt)}`
              : ""}
          </p>
          <h2 className={styles.originalTitle}>
            <Link href={`/originals/${lead.slug}`}>{lead.title}</Link>
          </h2>
          {lead.excerpt ? (
            <p className={styles.originalExcerpt}>{lead.excerpt}</p>
          ) : null}
        </article>
        {rest.length ? (
          <ol className={styles.originalRail}>
            {rest.slice(0, 2).map((item) => (
              <li key={item._id}>
                <Link href={`/originals/${item.slug}`}>
                  <span className={styles.originalMeta}>
                    {authorLine(item.authors) || "Jewish Original"}
                  </span>
                  <span className={styles.originalRailTitle}>{item.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : null}
        <p className={styles.originalPath}>
          <Link href="/originals">The journal</Link>
        </p>
      </div>
    </section>
  );
}
