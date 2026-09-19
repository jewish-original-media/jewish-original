import Link from "next/link";

import type { OriginalSummary } from "@/content/originals/types";
import {
  formatOriginalDate,
  isSampleOriginal,
  SAMPLE_ORIGINAL_NOTICE,
} from "@/lib/originals/display";

import styles from "@/app/home.module.css";

export function HomeOriginals({ items }: { items: OriginalSummary[] }) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  if (!lead) return null;
  const leadIsSample = isSampleOriginal(lead.slug);

  return (
    <section
      className={`${styles.band} ${styles.originals}`}
      aria-label="Originals"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>Originals</p>
        <article className={styles.originalLead}>
          <p className={styles.originalMeta}>
            {leadIsSample ? "Editorial sample" : "Jewish Original"}
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
          {leadIsSample ? (
            <p className={styles.originalSample}>{SAMPLE_ORIGINAL_NOTICE}</p>
          ) : null}
        </article>
        {rest.length ? (
          <ol className={styles.originalRail}>
            {rest.slice(0, 2).map((item) => (
              <li key={item._id}>
                <Link href={`/originals/${item.slug}`}>
                  <span className={styles.originalMeta}>
                    {isSampleOriginal(item.slug)
                      ? "Editorial sample"
                      : "Jewish Original"}
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
