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

function rememberReference(
  bySlug: Map<string, HistoryReference>,
  item: HistoryReference,
) {
  if (!item.slug || !item.name) return;
  const existing = bySlug.get(item.slug);
  if (existing) {
    existing.count = (existing.count || 0) + 1;
    return;
  }
  bySlug.set(item.slug, { name: item.name, slug: item.slug, count: 1 });
}

function sortReferences(items: HistoryReference[]) {
  return items.sort(
    (left, right) =>
      (right.count || 0) - (left.count || 0) ||
      left.name.localeCompare(right.name),
  );
}

function countedReferences(items: HistoryReference[]) {
  const bySlug = new Map<string, HistoryReference>();
  for (const item of items) rememberReference(bySlug, item);
  return sortReferences([...bySlug.values()]);
}

function countedRegions(entries: HistoryEntrySummary[]) {
  const bySlug = new Map<string, HistoryReference>();
  for (const entry of entries) {
    const seen = new Set<string>();
    for (const region of entry.geographicRegions) {
      const chain = region.parent?.slug && region.parent.name
        ? [region, region.parent]
        : [region];
      for (const item of chain) {
        if (!item.slug || seen.has(item.slug)) continue;
        seen.add(item.slug);
        rememberReference(bySlug, item);
      }
    }
  }
  return sortReferences([...bySlug.values()]);
}

export function collectPublishedFacets(
  entries: HistoryEntrySummary[],
): HistoryArchiveFacets {
  return {
    topics: countedReferences(entries.flatMap((entry) => entry.topics)),
    eras: countedReferences(entries.flatMap((entry) => entry.eras)),
    places: countedReferences(entries.flatMap((entry) => entry.places)),
    regions: countedRegions(entries),
    people: countedReferences(entries.flatMap((entry) => entry.people)),
    organizations: countedReferences(
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
