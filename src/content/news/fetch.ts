import "server-only";

import { INGEST_CAPS, INGEST_WINDOWS } from "@/features/ingest/config";
import { isWithinDays } from "@/features/ingest/freshness";
import { selectHomepageNews } from "@/features/ingest/news/diversity";
import { getPublishedSanityClient } from "@/lib/sanity/client";

import { newsHomeQuery, newsIndexQuery } from "./queries";
import { resolveSourcePreviewImage } from "./source-preview";
import type { CuratedNewsCard } from "./types";

const publishedOptions = {
  next: {
    revalidate: 300,
    tags: ["news"],
  },
};

function newsSince(days: number, now = new Date()) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function getPublishedNewsIndex() {
  const items = await getPublishedSanityClient().fetch<CuratedNewsCard[]>(
    newsIndexQuery,
    { since: newsSince(INGEST_WINDOWS.newsIndexDays) },
    publishedOptions,
  );
  return items.filter((item) =>
    isWithinDays(
      new Date(item.sourcePublishedAt),
      INGEST_WINDOWS.newsIndexDays,
    ),
  );
}

export async function loadPublishedNewsIndex(): Promise<
  { ok: true; items: CuratedNewsCard[] } | { ok: false }
> {
  try {
    return {
      ok: true,
      items: await attachSourcePreviewImages(await getPublishedNewsIndex()),
    };
  } catch {
    return { ok: false };
  }
}

export async function attachSourcePreviewImages(items: CuratedNewsCard[]) {
  const images = await Promise.all(
    items.map((item) => resolveSourcePreviewImage(item.sourceUrl)),
  );

  return items.map((item, index) => {
    const sourceImageUrl = images[index];
    return sourceImageUrl ? { ...item, sourceImageUrl } : item;
  });
}

export async function getHomepageNews() {
  const items = await getPublishedSanityClient().fetch<CuratedNewsCard[]>(
    newsHomeQuery,
    { since: newsSince(INGEST_WINDOWS.homepageNewsDays) },
    publishedOptions,
  );
  return attachSourcePreviewImages(
    selectHomepageNews(
      items.filter((item) =>
        isWithinDays(
          new Date(item.sourcePublishedAt),
          INGEST_WINDOWS.homepageNewsDays,
        ),
      ),
      { limit: INGEST_CAPS.homepageNews },
    ),
  );
}
