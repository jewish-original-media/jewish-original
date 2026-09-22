import type {
  HistoryArchiveFacets,
  HistoryEntrySummary,
  HistoryFilter,
  HistoryFilterType,
  HistoryReference,
} from "./types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILTER_TYPES: HistoryFilterType[] = [
  "topic",
  "era",
  "place",
  "region",
  "person",
  "organization",
];

export type HistoryArchiveSearch = {
  filter?: HistoryFilter;
  query?: string;
  topic?: string;
  place?: string;
  region?: string;
  month?: number;
  day?: number;
  sort: HistoryArchiveSort;
  page: number;
  isBrowsing: boolean;
};

export type HistoryArchiveSort =
  "historical-newest" | "historical-oldest" | "added-newest";

export const HISTORY_ARCHIVE_PAGE_SIZE = 12;
export const USEFUL_PUBLISHED_FACET_MIN = 2;

export function isPublishedHistoryId(id?: string) {
  return typeof id === "string" && id.length > 0 && !id.startsWith("drafts.");
}

export function selectPublishedHistoryEntries<T extends { _id: string }>(
  entries: readonly T[],
) {
  return entries.filter((entry) => isPublishedHistoryId(entry._id));
}

export function isUsefulPublishedFacet(items: readonly HistoryReference[]) {
  return items.length >= USEFUL_PUBLISHED_FACET_MIN;
}

export function hasPublishedRelatedHistoryEntry(
  entry?: { _id?: string; slug?: string } | null,
) {
  if (!entry?.slug) return false;
  return !entry._id || isPublishedHistoryId(entry._id);
}

function firstString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseBoundedInt(
  value: string | undefined,
  min: number,
  max: number,
): number | undefined {
  if (!value || !/^\d{1,2}$/.test(value)) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    return undefined;
  }
  return parsed;
}

export function parseHistoryArchiveSearch(
  searchParams: Record<string, string | string[] | undefined>,
): HistoryArchiveSearch {
  const rawQuery = firstString(searchParams.q)?.trim().replace(/\s+/g, " ");
  const query = rawQuery ? rawQuery.slice(0, 80) : undefined;
  const month = parseBoundedInt(firstString(searchParams.month), 1, 12);
  const day = parseBoundedInt(firstString(searchParams.day), 1, 31);
  const page = parseBoundedInt(firstString(searchParams.page), 1, 99) ?? 1;
  const rawSort = firstString(searchParams.sort);
  const sort: HistoryArchiveSort =
    rawSort === "historical-oldest" || rawSort === "added-newest"
      ? rawSort
      : "historical-newest";
  const topicValue = firstString(searchParams.topic);
  const placeValue = firstString(searchParams.place);
  const regionValue = firstString(searchParams.region);
  const topic =
    topicValue && SLUG_PATTERN.test(topicValue) ? topicValue : undefined;
  const place =
    placeValue && SLUG_PATTERN.test(placeValue) ? placeValue : undefined;
  const region =
    regionValue && SLUG_PATTERN.test(regionValue) ? regionValue : undefined;
  let filter: HistoryFilter | undefined;

  for (const type of FILTER_TYPES) {
    const value = firstString(searchParams[type]);
    if (value && SLUG_PATTERN.test(value)) {
      filter = { type, slug: value };
      break;
    }
  }

  return {
    filter,
    query,
    topic,
    place,
    region,
    month,
    day: month ? day : undefined,
    sort,
    page,
    isBrowsing: Boolean(
      filter ||
      query ||
      topic ||
      place ||
      region ||
      month ||
      sort !== "historical-newest" ||
      page > 1,
    ),
  };
}

export type HistoryArchiveHrefQuery = {
  filter?: HistoryFilter;
  query?: string;
  topic?: string;
  place?: string;
  region?: string;
  month?: number;
  day?: number;
  sort?: HistoryArchiveSort;
  page?: number;
};

export function historyArchiveHref(query: HistoryArchiveHrefQuery) {
  const params = new URLSearchParams();
  if (query.query) params.set("q", query.query);
  if (query.topic) params.set("topic", query.topic);
  if (query.place) params.set("place", query.place);
  if (query.region) params.set("region", query.region);
  if (query.month) params.set("month", String(query.month));
  if (query.month && query.day) params.set("day", String(query.day));
  if (query.filter) params.set(query.filter.type, query.filter.slug);
  if (query.sort && query.sort !== "historical-newest") {
    params.set("sort", query.sort);
  }
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `/history?${search}` : "/history";
}

function searchableText(entry: HistoryEntrySummary) {
  return [
    entry.title,
    entry.excerpt,
    ...entry.topics.map((item) => item.name),
    ...entry.people.map((item) => item.name),
    ...entry.places.map((item) => item.name),
    ...entry.eras.map((item) => item.name),
    ...entry.organizations.map((item) => item.name),
    ...entry.geographicRegions.map((item) => item.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en");
}

function historicalTimestamp(entry: HistoryEntrySummary) {
  const start = entry.historicalDate?.start;
  if (!start?.year) return Number.NEGATIVE_INFINITY;
  return start.year * 10_000 + (start.month ?? 0) * 100 + (start.day ?? 0);
}

function updatedTimestamp(entry: HistoryEntrySummary) {
  const timestamp = Date.parse(entry._updatedAt ?? entry._createdAt ?? "");
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function matchesLegacyFilter(
  entry: HistoryEntrySummary,
  filter?: HistoryFilter,
) {
  if (!filter) return true;
  const references =
    filter.type === "topic"
      ? entry.topics
      : filter.type === "era"
        ? entry.eras
        : filter.type === "place"
          ? entry.places
          : filter.type === "region"
            ? entry.geographicRegions
            : filter.type === "person"
              ? entry.people
              : entry.organizations;
  return references.some((item) => item.slug === filter.slug);
}

export function filterAndSortHistoryArchive(
  entries: HistoryEntrySummary[],
  search: HistoryArchiveSearch,
) {
  const terms = search.query
    ?.toLocaleLowerCase("en")
    .split(/\s+/)
    .filter(Boolean);
  const filtered = entries.filter((entry) => {
    if (!matchesLegacyFilter(entry, search.filter)) return false;
    if (
      terms?.length &&
      !terms.every((term) => searchableText(entry).includes(term))
    ) {
      return false;
    }
    if (
      search.topic &&
      !entry.topics.some((item) => item.slug === search.topic)
    ) {
      return false;
    }
    if (
      search.place &&
      !entry.places.some((item) => item.slug === search.place)
    ) {
      return false;
    }
    if (
      search.region &&
      !entry.geographicRegions.some((item) => item.slug === search.region)
    ) {
      return false;
    }
    if (search.month) {
      const date = entry.historicalDate;
      if (
        entry.entryKind === "recurringObservance" ||
        date?.calendarSystem !== "gregorian" ||
        date.precision !== "day" ||
        date.start?.month !== search.month ||
        (search.day && date.start.day !== search.day)
      ) {
        return false;
      }
    }
    return true;
  });

  return filtered.toSorted((left, right) => {
    if (search.sort === "added-newest") {
      return updatedTimestamp(right) - updatedTimestamp(left);
    }
    const direction = search.sort === "historical-oldest" ? 1 : -1;
    return (historicalTimestamp(left) - historicalTimestamp(right)) * direction;
  });
}

export function paginateHistoryArchive(
  entries: HistoryEntrySummary[],
  requestedPage: number,
  pageSize = HISTORY_ARCHIVE_PAGE_SIZE,
) {
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const start = (page - 1) * pageSize;
  return {
    items: entries.slice(start, start + pageSize),
    page,
    pageCount,
    total: entries.length,
  };
}

function uniqueReferences(items: HistoryReference[]) {
  const bySlug = new Map<string, HistoryReference>();
  for (const item of items) {
    if (!item.slug || !item.name) continue;
    bySlug.set(item.slug, item);
  }
  return [...bySlug.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export function collectPublishedFacets(
  entries: HistoryEntrySummary[],
): HistoryArchiveFacets {
  return {
    topics: uniqueReferences(entries.flatMap((entry) => entry.topics)),
    eras: uniqueReferences(entries.flatMap((entry) => entry.eras)),
    places: uniqueReferences(entries.flatMap((entry) => entry.places)),
    regions: uniqueReferences(
      entries.flatMap((entry) => entry.geographicRegions),
    ),
    people: uniqueReferences(entries.flatMap((entry) => entry.people)),
    organizations: uniqueReferences(
      entries.flatMap((entry) => entry.organizations),
    ),
  };
}

export function historyEventLocation(
  entry: Pick<HistoryEntrySummary, "eventLocation">,
) {
  const location = entry.eventLocation?.trim();
  return location || undefined;
}

export function historyCardLocation(entry: HistoryEntrySummary) {
  return historyEventLocation(entry);
}

export function historyCardRegion(entry: HistoryEntrySummary) {
  return entry.geographicRegions[0]?.name;
}

export const FILTER_LABELS: Record<HistoryFilterType, string> = {
  topic: "Topic",
  era: "Era",
  place: "Place",
  region: "Region",
  person: "Person",
  organization: "Organization",
};
