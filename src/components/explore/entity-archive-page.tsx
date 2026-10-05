import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getArchiveEntity } from "@/content/archive/entities";
import { getDurableArchiveRecords } from "@/content/archive/fetch";
import {
  archiveEntityHref,
  isArchiveEntityIndexable,
  recordsForArchiveEntity,
} from "@/content/archive/search";
import type { ArchiveFacetType } from "@/content/archive/types";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

import { ArchiveGrid } from "./archive-discovery";
import styles from "./explore.module.css";

const FACET_LABELS: Record<ArchiveFacetType, string> = {
  topic: "Topic",
  person: "Person",
  place: "Place",
  region: "Region",
  era: "Era",
  organization: "Organization",
};

async function entityPageData(type: ArchiveFacetType, slug: string) {
  const [entity, archive] = await Promise.all([
    getArchiveEntity(type, slug),
    getDurableArchiveRecords(),
  ]);
  if (!entity) return null;

  return {
    entity,
    records: recordsForArchiveEntity(archive, type, slug),
  };
}

export async function generateArchiveEntityMetadata(
  type: ArchiveFacetType,
  slug: string,
): Promise<Metadata> {
  const data = await entityPageData(type, slug);
  if (!data || !data.records.length) {
    return buildPageMetadata({
      title: "Archive entry not found",
      description: "This archive entry is not available.",
      path: archiveEntityHref(type, slug),
      index: false,
    });
  }

  const description = data.entity.description?.trim();
  const indexable = isArchiveEntityIndexable(description, data.records.length);

  return buildPageMetadata({
    title: `${data.entity.name} — ${FACET_LABELS[type]}`,
    description:
      description ||
      `Explore ${data.records.length} Jewish Original archive ${
        data.records.length === 1 ? "record" : "records"
      } connected to ${data.entity.name}.`,
    path: archiveEntityHref(type, slug),
    index: indexable,
  });
}

export async function EntityArchivePage({
  slug,
  type,
}: {
  slug: string;
  type: ArchiveFacetType;
}) {
  const data = await entityPageData(type, slug);
  if (!data || !data.records.length) notFound();

  const path = archiveEntityHref(type, slug);
  const description = data.entity.description?.trim();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explore", path: "/explore" },
          { name: data.entity.name, path },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: data.entity.name,
          description:
            description ||
            `Jewish Original archive records connected to ${data.entity.name}.`,
          url: `${siteConfig.url}${path}`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: data.records.length,
            itemListElement: data.records.slice(0, 24).map((record, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: record.title,
              url: `${siteConfig.url}${record.href}`,
            })),
          },
        }}
      />
      <header className={styles.entityHeader}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>
            {FACET_LABELS[type]} · Living archive
          </p>
          <h1 className={styles.entityTitle}>{data.entity.name}</h1>
          {description ? (
            <p className={styles.entityDescription}>{description}</p>
          ) : null}
          <p className={styles.entityMeta}>
            {data.records.length} connected{" "}
            {data.records.length === 1 ? "record" : "records"}
          </p>
        </div>
      </header>
      <div className={styles.entityContent}>
        <Link className={styles.entityBack} href="/explore">
          ← Explore the full archive
        </Link>
        <ArchiveGrid records={data.records} />
      </div>
    </>
  );
}
