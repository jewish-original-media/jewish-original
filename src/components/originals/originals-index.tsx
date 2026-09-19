import Link from "next/link";

import { Container } from "@/components/ui/container";
import type { OriginalSummary } from "@/content/originals/types";
import {
  formatOriginalDate,
  isSampleOriginal,
  SAMPLE_ORIGINAL_NOTICE,
} from "@/lib/originals/display";

import styles from "@/app/originals.module.css";

export function OriginalsIndex({ items }: { items: OriginalSummary[] }) {
  const [lead, ...rest] = items;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <p className={styles.kicker}>Originals</p>
          <h1 className={styles.title}>Writing from the house.</h1>
          <p className={styles.lede}>
            Essays Jewish Original Media writes itself. Not the wire. Not the
            archive. The journal.
          </p>
        </Container>
      </section>
      <section className={styles.list}>
        <Container>
          {!lead ? (
            <p className={styles.empty}>
              No published Originals yet. This journal stays empty until Jewish
              Original publishes its own writing.
            </p>
          ) : (
            <>
              <article className={styles.lead}>
                <OriginalTeaser item={lead} headingLevel="h2" />
              </article>
              {rest.length ? (
                <ol className={styles.listReset}>
                  {rest.map((item) => (
                    <li key={item._id} className={styles.item}>
                      <OriginalTeaser item={item} headingLevel="h3" />
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          )}
        </Container>
      </section>
    </div>
  );
}

function OriginalTeaser({
  headingLevel: Heading,
  item,
}: {
  headingLevel: "h2" | "h3";
  item: OriginalSummary;
}) {
  const sample = isSampleOriginal(item.slug);

  return (
    <Link href={`/originals/${item.slug}`}>
      <p className={styles.meta}>
        {sample ? "Editorial sample" : "Jewish Original"}
        {item.publishedAt ? ` · ${formatOriginalDate(item.publishedAt)}` : ""}
      </p>
      <Heading className={styles.headline}>{item.title}</Heading>
      {sample ? (
        <p className={styles.sampleNotice}>{SAMPLE_ORIGINAL_NOTICE}</p>
      ) : null}
      {item.excerpt ? <p className={styles.excerpt}>{item.excerpt}</p> : null}
    </Link>
  );
}
