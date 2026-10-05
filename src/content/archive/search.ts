import type {
  ArchiveFacet,
  ArchiveFacetType,
  ArchiveFacets,
  ArchiveKind,
  ArchivePage,
  ArchiveRecord,
  ArchiveSearchState,
  ArchiveSort,
  ArchiveView,
} from "./types";

export const ARCHIVE_PAGE_SIZE = 12;

const FACET_FIELDS = {
  topic: "topics",
  person: "people",
  place: "places",
  region: "regions",
  era: "eras",
  organization: "organizations",
} as const;

const ENTITY_SEGMENTS: Record<ArchiveFacetType, string> = {
  topic: "topics",
  person: "people",
  place: "places",
  region: "regions",
  era: "eras",
  organization: "organizations",
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInteger(value: string | undefined, fallback = 1) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeArchiveText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

export function parseArchiveSearchParams(
  params: RawSearchParams,
): ArchiveSearchState {
  const q = (first(params.q) ?? "").trim().slice(0, 120);
  const viewValue = first(params.view);
  const view: ArchiveView = viewValue === "current" ? "current" : "archive";
  const kindValue = first(params.kind);
  const allowedKinds =
    view === "current" ? ["news", "event"] : ["history", "original", "podcast"];
  const kind = allowedKinds.includes(kindValue ?? "")
    ? (kindValue as ArchiveKind)
    : undefined;
  const sortValue = first(params.sort);
  const sort: ArchiveSort =
    sortValue === "oldest" || sortValue === "title" ? sortValue : "newest";

  const state: ArchiveSearchState = {
    q,
    view,
    kind,
    topic: first(params.topic),
    person: first(params.person),
    place: first(params.place),
    region: first(params.region),
    era: first(params.era),
    organization: first(params.organization),
    sort,
    page: positiveInteger(first(params.page)),
    isBrowsing: false,
  };

  state.isBrowsing = Boolean(
    q ||
    kind ||
    state.topic ||
    state.person ||
    state.place ||
    state.region ||
    state.era ||
    state.organization ||
    sort !== "newest" ||
    state.page > 1 ||
    view !== "archive",
  );

  return state;
}

function hasFacet(
  record: ArchiveRecord,
  type: ArchiveFacetType,
  slug: string | undefined,
) {
  return (
    !slug || record[FACET_FIELDS[type]].some((facet) => facet.slug === slug)
  );
}

function matchesQuery(record: ArchiveRecord, query: string) {
  const terms = normalizeArchiveText(query).split(" ").filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeArchiveText(record.searchText);
  return terms.every((term) => haystack.includes(term));
}

function compareRecords(
  left: ArchiveRecord,
  right: ArchiveRecord,
  sort: ArchiveSort,
) {
  if (sort === "title") return left.title.localeCompare(right.title);

  const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0;
  const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0;
  const difference = leftTime - rightTime;
  return sort === "oldest" ? difference : -difference;
}

export function filterArchiveRecords(
  records: ArchiveRecord[],
  state: ArchiveSearchState,
) {
  const durability = state.view === "current" ? "current" : "durable";

  return records
    .filter((record) => record.durability === durability)
    .filter((record) => !state.kind || record.kind === state.kind)
    .filter((record) => matchesQuery(record, state.q))
    .filter((record) => hasFacet(record, "topic", state.topic))
    .filter((record) => hasFacet(record, "person", state.person))
    .filter((record) => hasFacet(record, "place", state.place))
    .filter((record) => hasFacet(record, "region", state.region))
    .filter((record) => hasFacet(record, "era", state.era))
    .filter((record) => hasFacet(record, "organization", state.organization))
    .sort((left, right) => compareRecords(left, right, state.sort));
}

export function paginateArchiveRecords(
  records: ArchiveRecord[],
  requestedPage: number,
  pageSize = ARCHIVE_PAGE_SIZE,
): ArchivePage {
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: records.slice(start, start + pageSize),
    page,
    pageCount,
    total: records.length,
  };
}

export function collectArchiveFacets(records: ArchiveRecord[]): ArchiveFacets {
  const collect = (type: ArchiveFacetType) => {
    const unique = new Map<string, ArchiveFacet>();
    for (const record of records) {
      for (const facet of record[FACET_FIELDS[type]]) {
        if (!unique.has(facet.slug)) unique.set(facet.slug, facet);
      }
    }
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  };

  return {
    topic: collect("topic"),
    person: collect("person"),
    place: collect("place"),
    region: collect("region"),
    era: collect("era"),
    organization: collect("organization"),
  };
}

export function getArchiveSuggestions(
  records: ArchiveRecord[],
  query: string,
  limit = 8,
) {
  const needle = normalizeArchiveText(query);
  if (needle.length < 2) return [];

  const candidates = new Set<string>();
  for (const record of records) {
    candidates.add(record.title);
    for (const field of Object.values(FACET_FIELDS)) {
      for (const facet of record[field]) candidates.add(facet.name);
    }
  }

  return [...candidates]
    .filter((candidate) => normalizeArchiveText(candidate).includes(needle))
    .sort((a, b) => {
      const aStarts = normalizeArchiveText(a).startsWith(needle);
      const bStarts = normalizeArchiveText(b).startsWith(needle);
      return Number(bStarts) - Number(aStarts) || a.localeCompare(b);
    })
    .slice(0, limit);
}

export function archiveEntityHref(type: ArchiveFacetType, slug: string) {
  return `/${ENTITY_SEGMENTS[type]}/${encodeURIComponent(slug)}`;
}

export function recordsForArchiveEntity(
  records: ArchiveRecord[],
  type: ArchiveFacetType,
  slug: string,
) {
  return records.filter(
    (record) =>
      record.durability === "durable" &&
      record[FACET_FIELDS[type]].some((facet) => facet.slug === slug),
  );
}

export function isArchiveEntityIndexable(
  description: string | undefined,
  durableRecordCount: number,
) {
  return Boolean(description?.trim()) && durableRecordCount >= 3;
}

export function archiveSearchHref(
  state: Partial<ArchiveSearchState>,
  updates: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  const values: Record<string, string | number | undefined> = {
    q: state.q,
    view: state.view === "current" ? "current" : undefined,
    kind: state.kind,
    topic: state.topic,
    person: state.person,
    place: state.place,
    region: state.region,
    era: state.era,
    organization: state.organization,
    sort: state.sort !== "newest" ? state.sort : undefined,
    page: state.page && state.page > 1 ? state.page : undefined,
    ...updates,
  };

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `/explore?${query}` : "/explore";
}
