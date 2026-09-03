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
  month?: number;
  day?: number;
  isBrowsing: boolean;
};

function firstString(
  value: string | string[] | undefined,
): string | undefined {
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
  const month = parseBoundedInt(firstString(searchParams.month), 1, 12);
  const day = parseBoundedInt(firstString(searchParams.day), 1, 31);
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
    month,
    day: month ? day : undefined,
    isBrowsing: Boolean(filter || month),
  };
}

export function historyArchiveHref(query: {
  filter?: HistoryFilter;
  month?: number;
  day?: number;
}) {
  const params = new URLSearchParams();
  if (query.month) params.set("month", String(query.month));
  if (query.month && query.day) params.set("day", String(query.day));
  if (query.filter) params.set(query.filter.type, query.filter.slug);
  const search = params.toString();
  return search ? `/history?${search}` : "/history";
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

export function historyCardLocation(entry: HistoryEntrySummary) {
  return entry.places[0]?.name || entry.geographicRegions[0]?.name;
}

export const FILTER_LABELS: Record<HistoryFilterType, string> = {
  topic: "Topic",
  era: "Era",
  place: "Place",
  region: "Region",
  person: "Person",
  organization: "Organization",
};
