import Link from "next/link";

import {
  archiveSearchHref,
  getArchiveSuggestions,
} from "@/content/archive/search";
import type {
  ArchiveFacets,
  ArchivePage,
  ArchiveRecord,
  ArchiveSearchState,
} from "@/content/archive/types";

import { ArchiveCard } from "./archive-card";
import styles from "./explore.module.css";

const FACET_SELECTS = [
  ["topic", "Topic"],
  ["person", "Person"],
  ["place", "Place"],
  ["region", "Region"],
  ["era", "Era"],
  ["organization", "Organization"],
] as const;

function archiveKindOptions(view: ArchiveSearchState["view"]) {
  return view === "current"
    ? [
        ["", "All current"],
        ["news", "News"],
        ["event", "Events"],
      ]
    : [
        ["", "All formats"],
        ["history", "History"],
        ["original", "Originals"],
        ["podcast", "Podcasts"],
      ];
}

export function ArchiveGrid({ records }: { records: ArchiveRecord[] }) {
  return (
    <div className={styles.grid}>
      {records.map((record) => (
        <ArchiveCard key={`${record.kind}-${record.id}`} record={record} />
      ))}
    </div>
  );
}

export function ArchiveDiscovery({
  allRecords,
  facets,
  page,
  search,
}: {
  allRecords: ArchiveRecord[];
  facets: ArchiveFacets;
  page: ArchivePage;
  search: ArchiveSearchState;
}) {
  const suggestions = getArchiveSuggestions(allRecords, search.q);
  const firstResult = page.total ? (page.page - 1) * 12 + 1 : 0;
  const lastResult = Math.min(page.page * 12, page.total);
  const activeFilters = [
    search.q
      ? {
          key: "q",
          label: `Search: ${search.q}`,
          href: archiveSearchHref(search, { q: undefined, page: undefined }),
        }
      : null,
    search.kind
      ? {
          key: "kind",
          label: `Format: ${search.kind}`,
          href: archiveSearchHref(search, { kind: undefined, page: undefined }),
        }
      : null,
    ...FACET_SELECTS.map(([type, label]) => {
      const slug = search[type];
      const facet = facets[type].find((item) => item.slug === slug);
      return slug
        ? {
            key: type,
            label: `${label}: ${facet?.name ?? slug}`,
            href: archiveSearchHref(search, {
              [type]: undefined,
              page: undefined,
            }),
          }
        : null;
    }),
    search.sort !== "newest"
      ? {
          key: "sort",
          label: `Order: ${search.sort === "oldest" ? "oldest first" : "A–Z"}`,
          href: archiveSearchHref(search, { sort: undefined, page: undefined }),
        }
      : null,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  return (
    <div className={styles.discovery}>
      <nav aria-label="Explore views" className={styles.viewSwitch}>
        <Link
          aria-current={search.view === "archive" ? "page" : undefined}
          className={search.view === "archive" ? styles.viewActive : undefined}
          href="/explore"
        >
          Living archive
        </Link>
        <Link
          aria-current={search.view === "current" ? "page" : undefined}
          className={search.view === "current" ? styles.viewActive : undefined}
          href="/explore?view=current"
        >
          Current
        </Link>
      </nav>

      {search.view === "current" ? (
        <aside className={styles.currentIntroduction}>
          <p className={styles.currentEyebrow}>The Jewish present</p>
          <p>
            Current keeps fresh reporting and upcoming programs together without
            turning outbound records into permanent archive articles.
          </p>
          <div>
            <Link href="/news">Open the News desk</Link>
            <Link href="/events">Open the Events calendar</Link>
          </div>
        </aside>
      ) : null}

      <form action="/explore" className={styles.searchPanel} method="get">
        {search.view === "current" ? (
          <input name="view" type="hidden" value="current" />
        ) : null}
        <label className={styles.searchLabel} htmlFor="archive-query">
          Search the archive
        </label>
        <div className={styles.searchRow}>
          <input
            autoComplete="off"
            className={styles.searchInput}
            defaultValue={search.q}
            id="archive-query"
            list="archive-suggestions"
            name="q"
            placeholder={
              search.view === "current"
                ? "Search current news and events"
                : "Try a person, place, idea, or title"
            }
            type="search"
          />
          <datalist id="archive-suggestions">
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <button className={styles.searchButton} type="submit">
            Search
          </button>
        </div>

        <div className={styles.filterGrid}>
          <label>
            <span>Format</span>
            <select defaultValue={search.kind ?? ""} name="kind">
              {archiveKindOptions(search.view).map(([value, label]) => (
                <option key={value || "all"} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {search.view === "archive"
            ? FACET_SELECTS.map(([type, label]) => (
                <label key={type}>
                  <span>{label}</span>
                  <select defaultValue={search[type] ?? ""} name={type}>
                    <option value="">All {label.toLocaleLowerCase()}s</option>
                    {facets[type].map((facet) => (
                      <option key={facet.slug} value={facet.slug}>
                        {facet.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))
            : null}

          <label>
            <span>Order</span>
            <select defaultValue={search.sort} name="sort">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">A–Z</option>
            </select>
          </label>
        </div>
        <div className={styles.filterActions}>
          <button className={styles.applyButton} type="submit">
            Apply filters
          </button>
          {search.isBrowsing ? (
            <Link
              href={
                search.view === "current" ? "/explore?view=current" : "/explore"
              }
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {activeFilters.length ? (
        <nav aria-label="Active filters" className={styles.activeFilters}>
          {activeFilters.map((filter) => (
            <Link href={filter.href} key={filter.key}>
              {filter.label} <span aria-hidden="true">×</span>
              <span className="sr-only"> Remove filter</span>
            </Link>
          ))}
        </nav>
      ) : null}

      <div aria-live="polite" className={styles.resultsHeading}>
        <p>
          {page.total
            ? `Showing ${firstResult}–${lastResult} of ${page.total}`
            : "No published records match these filters."}
        </p>
        {search.q ? <p>Results for “{search.q}”</p> : null}
      </div>

      {page.items.length ? (
        <ArchiveGrid records={page.items} />
      ) : (
        <div className={styles.emptyState}>
          <p>Try a broader search or remove one of the filters.</p>
          <Link
            href={
              search.view === "current" ? "/explore?view=current" : "/explore"
            }
          >
            Reset the view
          </Link>
        </div>
      )}

      {page.pageCount > 1 ? (
        <nav aria-label="Archive pages" className={styles.pagination}>
          {page.page > 1 ? (
            <Link href={archiveSearchHref(search, { page: page.page - 1 })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            Page {page.page} of {page.pageCount}
          </span>
          {page.page < page.pageCount ? (
            <Link href={archiveSearchHref(search, { page: page.page + 1 })}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
