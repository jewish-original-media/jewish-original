import Image from "next/image";
import Link from "next/link";

import { archiveEntityHref } from "@/content/archive/search";
import type {
  ArchiveFacet,
  ArchiveFacetType,
  ArchiveRecord,
} from "@/content/archive/types";

import styles from "./explore.module.css";

const KIND_LABELS: Record<ArchiveRecord["kind"], string> = {
  history: "History",
  original: "Original",
  podcast: "Podcast",
  news: "News",
  event: "Event",
};

function FacetLinks({
  facets,
  type,
}: {
  facets: ArchiveFacet[];
  type: ArchiveFacetType;
}) {
  if (!facets.length) return null;

  return (
    <>
      {facets.slice(0, 3).map((facet) => (
        <Link
          className={styles.facetLink}
          href={archiveEntityHref(type, facet.slug)}
          key={`${type}-${facet.slug}`}
        >
          {facet.name}
        </Link>
      ))}
    </>
  );
}

export function ArchiveCard({ record }: { record: ArchiveRecord }) {
  const title = (
    <Link
      className={styles.cardTitleLink}
      href={record.href}
      rel={record.external ? "noopener noreferrer" : undefined}
      target={record.external ? "_blank" : undefined}
    >
      {record.title}
      {record.external ? (
        <span className="sr-only"> (opens in a new tab)</span>
      ) : null}
    </Link>
  );

  return (
    <article className={styles.card}>
      {record.image ? (
        <Link
          aria-hidden="true"
          className={styles.cardMedia}
          href={record.href}
          tabIndex={-1}
        >
          <Image
            alt=""
            blurDataURL={record.image.lqip}
            fill
            placeholder={record.image.lqip ? "blur" : "empty"}
            sizes="(max-width: 44rem) 100vw, (max-width: 72rem) 50vw, 30vw"
            src={record.image.url}
          />
        </Link>
      ) : (
        <div aria-hidden="true" className={styles.cardTexture}>
          <span>א</span>
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardKicker}>
          <span>{KIND_LABELS[record.kind]}</span>
          <span aria-hidden="true">·</span>
          <span>{record.dateLabel ?? record.eyebrow}</span>
        </div>
        <h2 className={styles.cardTitle}>{title}</h2>
        {record.excerpt ? (
          <p className={styles.cardExcerpt}>{record.excerpt}</p>
        ) : null}
        {record.durability === "durable" ? (
          <div aria-label="Related archive terms" className={styles.cardFacets}>
            <FacetLinks facets={record.topics} type="topic" />
            <FacetLinks facets={record.people} type="person" />
            <FacetLinks facets={record.places} type="place" />
            <FacetLinks facets={record.regions} type="region" />
            <FacetLinks facets={record.eras} type="era" />
            <FacetLinks facets={record.organizations} type="organization" />
          </div>
        ) : record.tags.length ? (
          <p className={styles.currentTags}>
            {record.tags.slice(0, 3).join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
