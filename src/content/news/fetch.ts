import "server-only";

import { INGEST_CAPS, INGEST_WINDOWS } from "@/features/ingest/config";
import { isWithinDays } from "@/features/ingest/freshness";
import { selectHomepageNews } from "@/features/ingest/news/diversity";
import { getPublishedSanityClient } from "@/lib/sanity/client";

import { newsHomeQuery, newsIndexQuery, newsReviewQuery } from "./queries";
import { resolveSourcePreviewImage } from "./source-preview";
import type { CuratedNewsCard } from "./types";

const publishedOptions = {
  next: {
    revalidate: 300,
    tags: ["news"],
  },
};

export async function getPublishedNewsIndex() {
  const items = await getPublishedSanityClient().fetch<CuratedNewsCard[]>(
    newsIndexQuery,
    {},
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
    return { ok: true, items: await getPublishedNewsIndex() };
  } catch {
    return { ok: false };
  }
}

async function withSourcePreviewImages(items: CuratedNewsCard[]) {
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
    {},
    publishedOptions,
  );
  return withSourcePreviewImages(
    selectHomepageNews(
      items.filter((item) =>
        isWithinDays(
          new Date(item.sourcePublishedAt),
          INGEST_WINDOWS.homepageNewsDays,
        ),
      ),
      { limit: INGEST_CAPS.homepageNewsPrefer },
    ),
  );
}

/**
 * Founder visual review only. Shows the latest published outbound cards with
 * their real dates, including cards past the public expiry window. Restore
 * `getHomepageNews` before launch. `/news`, the Today submenu, and the daily
 * ribbon keep their existing gates.
 */
export async function getHomepageReviewNews() {
  const items = await getPublishedSanityClient().fetch<CuratedNewsCard[]>(
    newsReviewQuery,
    {},
    publishedOptions,
  );
  return withSourcePreviewImages(
    selectHomepageNews(items, { limit: INGEST_CAPS.homepageNews }),
  );
}
