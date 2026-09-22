import "server-only";

import { cache } from "react";

import {
  getDraftSanityClient,
  getPublishedSanityApiClient,
} from "@/lib/sanity/client";

import {
  originalArticleQuery,
  originalsHomeQuery,
  originalsIndexQuery,
  originalsSlugsQuery,
} from "./queries";
import type { OriginalArticle, OriginalSummary } from "./types";

const publishedOptions = {
  next: {
    revalidate: 3600,
    tags: ["originals"],
  },
};

const previewOptions = {
  cache: "no-store" as const,
};

export async function getPublishedOriginalsIndex(preview = false) {
  const client = preview
    ? getDraftSanityClient()
    : getPublishedSanityApiClient();
  return client.fetch<OriginalSummary[]>(
    originalsIndexQuery,
    { preview },
    preview ? previewOptions : publishedOptions,
  );
}

export async function getHomepageOriginals() {
  return getPublishedSanityApiClient().fetch<OriginalSummary[]>(
    originalsHomeQuery,
    {},
    publishedOptions,
  );
}

export const getOriginalArticle = cache(
  async (slug: string, preview: boolean) => {
    const client = preview
      ? getDraftSanityClient()
      : getPublishedSanityApiClient();
    return client.fetch<OriginalArticle | null>(
      originalArticleQuery,
      { preview, slug },
      preview
        ? previewOptions
        : {
            next: {
              revalidate: 3600,
              tags: ["originals", `originals:${slug}`],
            },
          },
    );
  },
);

export async function getPublishedOriginalSlugs() {
  return getPublishedSanityApiClient().fetch<{ slug: string }[]>(
    originalsSlugsQuery,
    {},
    publishedOptions,
  );
}

export function originalsAreLive(items: readonly unknown[]) {
  return items.length > 0;
}
