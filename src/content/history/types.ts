import type { PortableTextBlock } from "@/lib/history/source-body";

export type HistoryReference = {
  name: string;
  slug: string;
};

export type HistoricalDate = {
  start?: {
    year?: number;
    month?: number;
    day?: number;
  };
  end?: {
    year?: number;
    month?: number;
    day?: number;
  };
  precision?: "day" | "month" | "year" | "range" | "unknown";
  qualifier?: "exact" | "circa" | "before" | "after" | "traditional";
  calendarSystem?: "gregorian" | "julian" | "hebrew" | "other";
  displayText?: string;
};

export type ObservanceRule = {
  observanceKey?: string;
  calendarSystem?: string;
  nominalHebrewMonth?: string;
  nominalHebrewDay?: number;
  adjustmentPolicy?: string;
  calculationProvider?: string;
  beginsAtSunset?: boolean;
  rule?: string;
};

export type HistoryCitation = {
  _key: string;
  title?: string;
  author?: string;
  publication?: string;
  kind?: string;
  url?: string;
  bibliographicDetail?: string;
  locator?: string;
  publicationDate?: string;
  verificationStatus?: string;
  source?: {
    name?: string;
    canonicalUrl?: string;
  };
};

export type HistoryImage = {
  alt: string;
  caption?: string;
  creditLine?: string;
  rightsStatus: "cleared" | "publicDomain" | "licensed";
  sourcePageUrl?: string;
  asset: {
    url: string;
    width: number;
    height: number;
    lqip?: string;
  };
};

export type HistoryEntrySummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  historicalDate?: HistoricalDate;
  entryKind?: "historicalEvent" | "recurringObservance";
  observanceRule?: ObservanceRule;
  topics: HistoryReference[];
  people: HistoryReference[];
  geographicRegions: HistoryReference[];
  primaryImage?: HistoryImage;
};

export type HistoryEntry = HistoryEntrySummary & {
  body: PortableTextBlock[];
  hebrewDate?: {
    day?: number;
    month?: string;
    year?: number;
    displayText?: string;
    basis?: string;
  };
  contentWarnings: string[];
  contentWarningNote?: string;
  places: HistoryReference[];
  eras: HistoryReference[];
  organizations: HistoryReference[];
  citations: HistoryCitation[];
  relatedHistory: {
    relationType?: string;
    note?: string;
    entry?: HistoryEntrySummary;
  }[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    openGraphTitle?: string;
    openGraphDescription?: string;
  };
  workflowStatus?: string;
  _updatedAt: string;
};

export type HistoryFilter = {
  type: "topic" | "region" | "person";
  slug: string;
};
