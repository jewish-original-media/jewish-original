import Link from "next/link";

import { HistoryEntryCard } from "@/components/history/history-entry-card";
import {
  FILTER_LABELS,
  historyArchiveHref,
  type HistoryArchiveHrefQuery,
  type HistoryArchiveSearch,
} from "@/content/history/archive";
import type {
  HistoryArchiveFacets,
  HistoryEntrySummary,
} from "@/content/history/types";
import { GREGORIAN_MONTH_NAMES } from "@/lib/history/format-date";

const days = Array.from({ length: 31 }, (_, index) => index + 1);

type HistoryArchiveDiscoveryProps = {
  facets: HistoryArchiveFacets;
  items: HistoryEntrySummary[];
  page: number;
  pageCount: number;
  search: HistoryArchiveSearch;
  total: number;
};

function activeQuery(search: HistoryArchiveSearch): HistoryArchiveHrefQuery {
  const legacyFilter =
    search.filter &&
    search.filter.type !== "topic" &&
    search.filter.type !== "place"
      ? search.filter
      : undefined;

  return {
    filter: legacyFilter,
    query: search.query,
    topic: search.topic,
    place: search.place,
    month: search.month,
    day: search.day,
    sort: search.sort,
  };
}

function labelFor(items: Array<{ name: string; slug: string }>, slug?: string) {
  return items.find((item) => item.slug === slug)?.name ?? slug;
}

export function HistoryArchiveDiscovery({
  facets,
  items,
  page,
  pageCount,
  search,
  total,
}: HistoryArchiveDiscoveryProps) {
  const current = activeQuery(search);
  const topicLabel = labelFor(facets.topics, search.topic);
  const placeLabel = labelFor(facets.places, search.place);
  const hasFilters = Boolean(
    search.filter ||
    search.query ||
    search.topic ||
    search.place ||
    search.month ||
    search.sort !== "historical-newest",
  );

  return (
    <div className="history-discovery">
      <form action="/history" className="history-discovery__form" method="get">
        <div className="history-discovery__search">
          <label htmlFor="history-search">Search the public archive</label>
          <div className="history-discovery__search-row">
            <input
              defaultValue={search.query}
              id="history-search"
              maxLength={80}
              name="q"
              placeholder="Search people, places, topics, or stories"
              type="search"
            />
            <button className="button button--primary" type="submit">
              Search
            </button>
          </div>
          <p className="history-discovery__search-help">
            Searches titles, summaries, people, places, topics, eras, regions,
            and organizations.
          </p>
        </div>

        <details className="history-discovery__filters" open={hasFilters}>
          <summary>
            Filters
            {hasFilters ? <span>Active</span> : null}
          </summary>
          <div className="history-discovery__filter-grid">
            <div className="history-discovery__field">
              <label htmlFor="history-topic">Topic</label>
              <select
                defaultValue={search.topic ?? ""}
                id="history-topic"
                name="topic"
              >
                <option value="">All topics</option>
                {facets.topics.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="history-discovery__field">
              <label htmlFor="history-place">Place</label>
              <select
                defaultValue={search.place ?? ""}
                id="history-place"
                name="place"
              >
                <option value="">All places</option>
                {facets.places.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="history-discovery__field">
              <label htmlFor="history-month">Month</label>
              <select
                defaultValue={search.month ? String(search.month) : ""}
                id="history-month"
                name="month"
              >
                <option value="">Any month</option>
                {GREGORIAN_MONTH_NAMES.slice(1).map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="history-discovery__field">
              <label htmlFor="history-day">Day</label>
              <select
                defaultValue={search.day ? String(search.day) : ""}
                id="history-day"
                name="day"
              >
                <option value="">Any day</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div className="history-discovery__field">
              <label htmlFor="history-sort">Sort</label>
              <select defaultValue={search.sort} id="history-sort" name="sort">
                <option value="historical-newest">
                  Historical date: newest
                </option>
                <option value="historical-oldest">
                  Historical date: oldest
                </option>
                <option value="added-newest">Recently added</option>
              </select>
            </div>
          </div>
          <div className="history-discovery__filter-actions">
            <button className="button button--secondary" type="submit">
              Apply filters
            </button>
            {hasFilters ? <Link href="/history">Clear all</Link> : null}
          </div>
        </details>
      </form>

      <div className="history-discovery__results-header">
        <div>
          <p className="eyebrow">Public archive</p>
          <h2 className="history-section-title" id="history-results">
            {total === 1 ? "1 story" : `${total} stories`}
          </h2>
        </div>
        <p className="history-discovery__sort-note">
          {search.sort === "added-newest"
            ? "Sorted by date added to the archive"
            : search.sort === "historical-oldest"
              ? "Sorted by historical date, oldest first"
              : "Sorted by historical date, newest first"}
        </p>
      </div>

      {hasFilters ? (
        <ul aria-label="Active filters" className="history-discovery__chips">
          {search.filter &&
          search.filter.type !== "topic" &&
          search.filter.type !== "place" ? (
            <li>
              <Link
                href={historyArchiveHref({ ...current, filter: undefined })}
              >
                {FILTER_LABELS[search.filter.type]}: {search.filter.slug}{" "}
                <span aria-hidden="true">×</span>
                <span className="sr-only">
                  Remove {FILTER_LABELS[search.filter.type].toLowerCase()}{" "}
                  filter
                </span>
              </Link>
            </li>
          ) : null}
          {search.query ? (
            <li>
              <Link href={historyArchiveHref({ ...current, query: undefined })}>
                Search: {search.query} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove search filter</span>
              </Link>
            </li>
          ) : null}
          {search.topic ? (
            <li>
              <Link href={historyArchiveHref({ ...current, topic: undefined })}>
                Topic: {topicLabel} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove topic filter</span>
              </Link>
            </li>
          ) : null}
          {search.place ? (
            <li>
              <Link href={historyArchiveHref({ ...current, place: undefined })}>
                Place: {placeLabel} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove place filter</span>
              </Link>
            </li>
          ) : null}
          {search.month ? (
            <li>
              <Link
                href={historyArchiveHref({
                  ...current,
                  month: undefined,
                  day: undefined,
                })}
              >
                Date: {GREGORIAN_MONTH_NAMES[search.month]}
                {search.day ? ` ${search.day}` : ""}{" "}
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove date filter</span>
              </Link>
            </li>
          ) : null}
          {search.sort !== "historical-newest" ? (
            <li>
              <Link
                href={historyArchiveHref({
                  ...current,
                  sort: "historical-newest",
                })}
              >
                Sort changed <span aria-hidden="true">×</span>
                <span className="sr-only">Reset sort order</span>
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}

      {items.length ? (
        <div aria-labelledby="history-results" className="history-archive-list">
          {items.map((entry) => (
            <HistoryEntryCard entry={entry} key={entry._id} variant="archive" />
          ))}
        </div>
      ) : (
        <div className="history-archive-empty" role="status">
          <h3>No reviewed stories match these filters.</h3>
          <p>
            Try a broader search, remove a filter, or return to the full public
            archive.
          </p>
          <Link href="/history">View the full archive</Link>
        </div>
      )}

      {pageCount > 1 ? (
        <nav aria-label="Archive pages" className="history-pagination">
          {page > 1 ? (
            <Link
              href={historyArchiveHref({ ...current, page: page - 1 })}
              rel="prev"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Link
              href={historyArchiveHref({ ...current, page: page + 1 })}
              rel="next"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
