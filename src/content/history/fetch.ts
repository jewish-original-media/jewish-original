import "server-only";

import { cache } from "react";

import {
  getDraftSanityClient,
  getPublishedSanityClient,
} from "@/lib/sanity/client";

import { selectPublishedHistoryEntries } from "./archive";
import {
  draftCandidateSlugQuery,
  historyEntryQuery,
  historyFilterLabelQuery,
  historyIndexQuery,
  historyOnThisDayQuery,
  historySlugsQuery,
} from "./queries";
import type { HistoryEntry, HistoryEntrySummary, HistoryFilter } from "./types";

export type HistoryIndexOptions = {
  filter?: HistoryFilter;
  month?: number;
  day?: number;
};

const publishedOptions = {
  next: {
    revalidate: 3600,
    tags: ["history"],
  },
};

const previewOptions = {
  cache: "no-store" as const,
};

function indexParams(preview: boolean, options?: HistoryIndexOptions) {
  return {
    filterSlug: options?.filter?.slug || null,
    filterType: options?.filter?.type || null,
    month: options?.month ?? null,
    day: options?.day ?? null,
    preview,
  };
}

export async function getHistoryIndex(
  preview: boolean,
  options?: HistoryIndexOptions,
) {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  const entries = await client.fetch<HistoryEntrySummary[]>(
    historyIndexQuery,
    indexParams(preview, options),
    preview ? previewOptions : publishedOptions,
  );
  return preview ? entries : selectPublishedHistoryEntries(entries);
}

export async function getOnThisDayHistory(
  preview: boolean,
  month: number,
  day: number,
) {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  const entries = await client.fetch<HistoryEntrySummary[]>(
    historyOnThisDayQuery,
    { preview, month, day },
    preview ? previewOptions : publishedOptions,
  );
  return preview ? entries : selectPublishedHistoryEntries(entries);
}

export const getHistoryEntry = cache(async (slug: string, preview: boolean) => {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  const entry = await client.fetch<HistoryEntry | null>(
    historyEntryQuery,
    { preview, slug },
    preview
      ? previewOptions
      : {
          next: {
            revalidate: 3600,
            tags: ["history", `history:${slug}`],
          },
        },
  );
  if (!entry || preview) return entry;
  return {
    ...entry,
    relatedHistory: entry.relatedHistory.filter(
      (relationship) =>
        relationship.entry &&
        selectPublishedHistoryEntries([relationship.entry]).length > 0,
    ),
  };
});

export async function getPublishedHistorySlugs() {
  return getPublishedSanityClient().fetch<{ slug: string }[]>(
    historySlugsQuery,
    {},
    publishedOptions,
  );
}

export async function getDraftCandidateSlug(slug: string) {
  return getDraftSanityClient().fetch<{ slug: string } | null>(
    draftCandidateSlugQuery,
    { slug },
    previewOptions,
  );
}

export async function getHistoryFilterLabel(
  preview: boolean,
  filter: HistoryFilter,
) {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  return client.fetch<{ name: string; slug: string } | null>(
    historyFilterLabelQuery,
    { filterType: filter.type, slug: filter.slug },
    preview ? previewOptions : publishedOptions,
  );
}
