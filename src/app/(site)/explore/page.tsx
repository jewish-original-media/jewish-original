import type { Metadata } from "next";

import { ArchiveDiscovery } from "@/components/explore/archive-discovery";
import { ArchiveTrail } from "@/components/explore/archive-trail";
import styles from "@/components/explore/explore.module.css";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCurrentArchiveRecords,
  getDurableArchiveRecords,
} from "@/content/archive/fetch";
import {
  collectArchiveFacets,
  filterArchiveRecords,
  paginateArchiveRecords,
  parseArchiveSearchParams,
} from "@/content/archive/search";
import { breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const search = parseArchiveSearchParams(await searchParams);
  const title = search.q
    ? `Search: ${search.q}`
    : search.view === "current"
      ? "Current news and events"
      : "Explore the living archive";

  return buildPageMetadata({
    title,
    description:
      "Search Jewish Original history, original reporting, podcasts, people, places, and ideas.",
    path: "/explore",
    index: !search.isBrowsing,
  });
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [params, durable, current] = await Promise.all([
    searchParams,
    getDurableArchiveRecords(),
    getCurrentArchiveRecords().catch(() => []),
  ]);
  const search = parseArchiveSearchParams(params);
  const allRecords = [...durable, ...current];
  const facets = collectArchiveFacets(durable);
  const filtered = filterArchiveRecords(allRecords, search);
  const page = paginateArchiveRecords(filtered, search.page);

  return (
    <div className={styles.page}>
      {!search.isBrowsing ? (
        <>
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Explore", path: "/explore" },
            ])}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Jewish Original Living Archive",
              description:
                "Jewish history, original reporting, podcasts, people, places, and ideas.",
              url: `${siteConfig.url}/explore`,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: durable.length,
                itemListElement: page.items.map((record, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: record.title,
                  url: `${siteConfig.url}${record.href}`,
                })),
              },
            }}
          />
        </>
      ) : null}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Jewish Original · Living archive</p>
          <h1 className={styles.title}>Everything connects.</h1>
          <p className={styles.lede}>
            Move through Jewish history, culture, ideas, people, and places.
            Follow the threads between the past and the Jewish present.
          </p>
        </div>
      </header>
      <ArchiveTrail
        current={search.view === "current" ? "current" : "explore"}
      />
      <div className={styles.content}>
        <ArchiveDiscovery
          allRecords={allRecords}
          facets={facets}
          page={page}
          search={search}
        />
      </div>
    </div>
  );
}
