import Link from "next/link";

import { HomeEditorialMedia } from "@/components/home/home-editorial-media";
import type { OriginalSummary } from "@/content/originals/types";
import {
  formatOriginalDate,
  isSampleOriginal,
  SAMPLE_ORIGINAL_NOTICE,
} from "@/lib/originals/display";
import { firstSentence } from "@/lib/jewish-today/display";

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
        <header className={styles.originalsHeader}>
          <p className={styles.sectionLabel}>Originals</p>
          <p className={styles.originalsDek}>
            Essays, ideas, and original Jewish voices.
          </p>
        </header>
        <article className={styles.originalLead}>
          <HomeEditorialMedia
            context="originals"
            href={`/originals/${lead.slug}`}
            image={lead.featuredMedia}
            title={lead.title}
            variant="feature"
          />
          <div className={styles.originalLeadCopy}>
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
              <p className={styles.originalExcerpt}>
                {firstSentence(lead.excerpt, 120)}
              </p>
            ) : null}
            {leadIsSample ? (
              <p className={styles.originalSample}>{SAMPLE_ORIGINAL_NOTICE}</p>
            ) : null}
          </div>
        </article>
        {rest.length ? (
          <ol className={styles.originalRail}>
            {rest.slice(0, 2).map((item) => (
              <li key={item._id}>
                <HomeEditorialMedia
                  context="originals"
                  href={`/originals/${item.slug}`}
                  image={item.featuredMedia}
                  title={item.title}
                  variant="supporting"
                />
                <Link
                  className={styles.originalRailLink}
                  href={`/originals/${item.slug}`}
                >
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
