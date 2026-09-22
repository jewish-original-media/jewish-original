import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";

import { HistoryArchiveDiscovery } from "@/components/history/history-archive-discovery";
import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { HistoryPreviewBanner } from "@/components/history/history-preview-banner";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  collectPublishedFacets,
  filterAndSortHistoryArchive,
  paginateHistoryArchive,
  parseHistoryArchiveSearch,
} from "@/content/history/archive";
import {
  getHistoryFilterLabel,
  getHistoryIndex,
} from "@/content/history/fetch";
import {
  civilDateParts,
  formatCivilDateLabel,
} from "@/lib/history/on-this-day";
import {
  buildHistoryArchiveJsonLd,
  buildHistoryArchiveMetadata,
  buildHistoryBreadcrumbJsonLd,
} from "@/lib/seo/history";

type HistoryIndexPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: HistoryIndexPageProps): Promise<Metadata> {
  const [{ isEnabled: preview }, resolvedSearchParams] = await Promise.all([
    draftMode(),
    searchParams,
  ]);
  const search = parseHistoryArchiveSearch(resolvedSearchParams);
  const filterLabel = search.filter
    ? await getHistoryFilterLabel(preview, search.filter)
    : null;

  return buildHistoryArchiveMetadata({
    browsing: search.isBrowsing,
    preview,
    title: search.query
      ? `Search: ${search.query}`
      : filterLabel?.name || undefined,
  });
}

export default async function HistoryIndexPage({
  searchParams,
}: HistoryIndexPageProps) {
  const [{ isEnabled: preview }, resolvedSearchParams] = await Promise.all([
    draftMode(),
    searchParams,
  ]);
  const search = parseHistoryArchiveSearch(resolvedSearchParams);
  const today = civilDateParts();
  const publishedEntries = await getHistoryIndex(false);
  const facets = collectPublishedFacets(publishedEntries);
  const filteredEntries = filterAndSortHistoryArchive(publishedEntries, search);
  const page = paginateHistoryArchive(filteredEntries, search.page);

  return (
    <>
      {preview ? <HistoryPreviewBanner /> : null}
      {!preview && !search.isBrowsing ? (
        <>
          <JsonLd data={buildHistoryArchiveJsonLd(publishedEntries)} />
          <JsonLd data={buildHistoryBreadcrumbJsonLd()} />
        </>
      ) : null}

      <header className="history-entry-header history-discovery-hero">
        <HistoryHeroWatermark />
        <Container className="history-entry-hero">
          <div className="history-hero-copy">
            <nav aria-label="Breadcrumb">
              <ol className="history-breadcrumb">
                <li>
                  <Link href="/">Jewish Original</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">History</li>
              </ol>
            </nav>
            <p className="history-date-line">{formatCivilDateLabel(today)}</p>
            <h1 className="history-display">Explore Jewish history.</h1>
            <p className="history-lede">
              Search published stories by person, place, topic, or verified
              Gregorian date.
            </p>
          </div>
          <aside className="history-archive-rail">
            <p className="eyebrow">On this day</p>
            <p className="history-archive-rail__text">
              Browse a month and day to find Gregorian anniversaries in the
              archive.
            </p>
            <Link
              className="editorial-link"
              href={`/history?month=${today.month}&day=${today.day}`}
            >
              Explore {formatCivilDateLabel(today).replace(/^\w+,\s/, "")}
            </Link>
          </aside>
        </Container>
      </header>

      <Section className="history-archive-results" spacing="compact">
        <Container>
          <HistoryArchiveDiscovery
            facets={facets}
            items={page.items}
            page={page.page}
            pageCount={page.pageCount}
            search={search}
            total={page.total}
          />
        </Container>
      </Section>
    </>
  );
}
