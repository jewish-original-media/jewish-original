import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";

import { HistoryDateBrowse } from "@/components/history/history-date-browse";
import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { HistoryMediaAbsent } from "@/components/history/history-featured-media";
import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { HistoryPreviewBanner } from "@/components/history/history-preview-banner";
import { HistoryTaxonomyNav } from "@/components/history/history-taxonomy-nav";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  collectPublishedFacets,
  FILTER_LABELS,
  parseHistoryArchiveSearch,
} from "@/content/history/archive";
import {
  getHistoryFilterLabel,
  getHistoryIndex,
  getOnThisDayHistory,
} from "@/content/history/fetch";
import { formatMonthDay, formatMonthName } from "@/lib/history/format-date";
import {
  civilDateParts,
  formatCivilDateLabel,
  isValidGregorianMonthDay,
} from "@/lib/history/on-this-day";
import {
  buildHistoryArchiveJsonLd,
  buildHistoryArchiveMetadata,
  serializeJsonLd,
} from "@/lib/seo/history";

type HistoryIndexPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function browseHeading(options: {
  filterName?: string;
  filterType?: string;
  month?: number;
  day?: number;
  invalidDate: boolean;
}) {
  if (options.invalidDate && options.month && options.day) {
    return `${formatMonthDay(options.month, options.day)} is not a calendar date`;
  }
  if (options.month && options.day) {
    return `On ${formatMonthDay(options.month, options.day)}`;
  }
  if (options.month) {
    return `In ${formatMonthName(options.month)}`;
  }
  if (options.filterName) {
    return options.filterName;
  }
  return "From the archive";
}

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
  const dateTitle =
    search.month && search.day
      ? `${formatMonthDay(search.month, search.day)} in Jewish history`
      : search.month
        ? `${formatMonthName(search.month)} in Jewish history`
        : undefined;

  return buildHistoryArchiveMetadata({
    browsing: search.isBrowsing,
    preview,
    title: filterLabel?.name || dateTitle,
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
  const invalidDate = Boolean(
    search.month &&
    search.day &&
    !isValidGregorianMonthDay(search.month, search.day),
  );
  const dateQuery =
    search.month && !invalidDate
      ? { month: search.month, day: search.day }
      : undefined;

  const [publishedEntries, filteredEntries, todayEntries, filterEntity] =
    await Promise.all([
      getHistoryIndex(preview),
      search.isBrowsing
        ? invalidDate
          ? Promise.resolve([])
          : getHistoryIndex(preview, {
              filter: search.filter,
              ...dateQuery,
            })
        : Promise.resolve(null),
      getOnThisDayHistory(preview, today.month, today.day),
      search.filter
        ? getHistoryFilterLabel(preview, search.filter)
        : Promise.resolve(null),
    ]);

  const facets = collectPublishedFacets(publishedEntries);
  const featured = publishedEntries[0];
  const remaining = publishedEntries.slice(1);
  const filterName = filterEntity?.name || search.filter?.slug;
  const results = filteredEntries ?? [];
  const showToday = !search.isBrowsing && todayEntries.length > 0;
  const showFeatured = !search.isBrowsing && Boolean(featured);
  const showRemaining = !search.isBrowsing && remaining.length > 0;

  return (
    <>
      {preview ? <HistoryPreviewBanner /> : null}
      {!preview && !search.isBrowsing ? (
        <script
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              buildHistoryArchiveJsonLd(publishedEntries),
            ),
          }}
          type="application/ld+json"
        />
      ) : null}

      <header className="history-entry-header">
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
            <h1 className="history-display">On this day in Jewish history.</h1>
            <p className="history-lede">
              A living archive of reviewed Jewish historical stories, dated with
              care and opened only when they are ready to be public.
            </p>
          </div>
          <aside className="history-archive-rail">
            <p className="eyebrow">The archive</p>
            <p className="history-archive-rail__text">
              {publishedEntries.length === 1
                ? "The collection begins with one published story. More will appear here as they are reviewed and approved."
                : "Stories are preserved in their original voice and connected across people, place, and time."}
            </p>
            <p className="history-archive-rail__note">
              Historical dates use the civil Gregorian calendar in Eastern Time.
            </p>
          </aside>
        </Container>
      </header>

      <HistoryMediaAbsent />

      {showToday ? (
        <Section className="history-archive-today" spacing="compact">
          <Container>
            <p className="eyebrow">Today in Jewish history</p>
            <h2 className="history-section-title">
              {formatMonthDay(today.month, today.day)}
            </h2>
            <div className="history-archive-list">
              {todayEntries.map((entry) => (
                <HistoryEntryCard
                  entry={entry}
                  key={entry._id}
                  variant="archive"
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {showFeatured && featured ? (
        <Section className="history-archive-featured" spacing="compact">
          <Container>
            <p className="eyebrow">From the archive</p>
            <HistoryEntryCard entry={featured} variant="featured" />
          </Container>
        </Section>
      ) : null}

      {search.isBrowsing ? (
        <Section className="history-archive-results" spacing="compact">
          <Container>
            <div className="history-archive-results__header">
              <div>
                <p className="eyebrow">
                  {search.filter
                    ? FILTER_LABELS[search.filter.type]
                    : "On this day"}
                </p>
                <h2 className="history-section-title">
                  {browseHeading({
                    filterName,
                    filterType: search.filter?.type,
                    month: search.month,
                    day: search.day,
                    invalidDate,
                  })}
                </h2>
              </div>
              <Link className="history-archive-clear" href="/history">
                Return to the archive
              </Link>
            </div>
            {results.length ? (
              <div className="history-archive-list">
                {results.map((entry) => (
                  <HistoryEntryCard
                    entry={entry}
                    key={entry._id}
                    variant="archive"
                  />
                ))}
              </div>
            ) : (
              <p className="history-archive-empty">
                {invalidDate
                  ? "That month and day do not exist on the civil calendar."
                  : search.filter
                    ? "No reviewed entry currently matches this connection."
                    : "No reviewed story is attached to this date yet."}
              </p>
            )}
          </Container>
        </Section>
      ) : null}

      {showRemaining ? (
        <Section className="history-archive-collection" spacing="compact">
          <Container>
            <p className="eyebrow">The collection</p>
            <h2 className="history-section-title">More from the archive</h2>
            <div className="history-archive-list">
              {remaining.map((entry) => (
                <HistoryEntryCard
                  entry={entry}
                  key={entry._id}
                  variant="archive"
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section className="history-archive-browse" spacing="compact">
        <Container>
          <div className="history-archive-browse__intro">
            <p className="eyebrow">Browse the archive</p>
            <h2 className="history-section-title">Look up a date</h2>
            <p className="history-archive-browse__lede">
              Choose a month and day to see reviewed historical events that fall
              on that civil date. Recurring observances are kept on the Jewish
              calendar, not this fixed-date list.
            </p>
          </div>
          <HistoryDateBrowse day={search.day} month={search.month} />
          <HistoryTaxonomyNav facets={facets} />
        </Container>
      </Section>
    </>
  );
}
