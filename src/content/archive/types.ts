export const ARCHIVE_KINDS = [
  "history",
  "original",
  "podcast",
  "news",
  "event",
] as const;

export type ArchiveKind = (typeof ARCHIVE_KINDS)[number];
export type ArchiveDurability = "durable" | "current";
export type ArchiveFacetType =
  "topic" | "person" | "place" | "region" | "era" | "organization";

export type ArchiveFacet = {
  name: string;
  slug: string;
};

export type ArchiveImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  lqip?: string;
};

export type ArchiveRecord = {
  id: string;
  kind: ArchiveKind;
  durability: ArchiveDurability;
  title: string;
  href: string;
  external: boolean;
  excerpt?: string;
  publishedAt?: string;
  dateLabel?: string;
  eyebrow: string;
  image?: ArchiveImage;
  topics: ArchiveFacet[];
  people: ArchiveFacet[];
  places: ArchiveFacet[];
  regions: ArchiveFacet[];
  eras: ArchiveFacet[];
  organizations: ArchiveFacet[];
  tags: string[];
  searchText: string;
};

export type ArchiveSort = "newest" | "oldest" | "title";
export type ArchiveView = "archive" | "current";

export type ArchiveSearchState = {
  q: string;
  view: ArchiveView;
  kind?: ArchiveKind;
  topic?: string;
  person?: string;
  place?: string;
  region?: string;
  era?: string;
  organization?: string;
  sort: ArchiveSort;
  page: number;
  isBrowsing: boolean;
};

export type ArchiveFacets = Record<ArchiveFacetType, ArchiveFacet[]>;

export type ArchivePage = {
  items: ArchiveRecord[];
  page: number;
  pageCount: number;
  total: number;
};

export type ArchiveEntity = {
  documentType:
    | "topic"
    | "person"
    | "place"
    | "geographicRegion"
    | "historicalEra"
    | "organization";
  facetType: ArchiveFacetType;
  name: string;
  slug: string;
  description?: string;
};
