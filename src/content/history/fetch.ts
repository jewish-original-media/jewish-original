import "server-only";

import { cache } from "react";

import {
  getDraftSanityClient,
  getPublishedSanityClient,
} from "@/lib/sanity/client";

import {
  draftCandidateSlugQuery,
  historyEntryQuery,
  historyFilterLabelQuery,
  historyIndexQuery,
  historySlugsQuery,
} from "./queries";
import type { HistoryEntry, HistoryEntrySummary, HistoryFilter } from "./types";

const publishedOptions = {
  next: {
    revalidate: 3600,
    tags: ["history"],
  },
};

const previewOptions = {
  cache: "no-store" as const,
};

export async function getHistoryIndex(
  preview: boolean,
  filter?: HistoryFilter,
) {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  return client.fetch<HistoryEntrySummary[]>(
    historyIndexQuery,
    {
      filterSlug: filter?.slug || null,
      filterType: filter?.type || null,
      preview,
    },
    preview ? previewOptions : publishedOptions,
  );
}

export const getHistoryEntry = cache(async (slug: string, preview: boolean) => {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  return client.fetch<HistoryEntry | null>(
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
