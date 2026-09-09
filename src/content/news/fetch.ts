import "server-only";

import { INGEST_WINDOWS } from "@/features/ingest/config";
import { isWithinDays } from "@/features/ingest/freshness";
import { selectHomepageNews } from "@/features/ingest/news/diversity";
import { getPublishedSanityClient } from "@/lib/sanity/client";

import { newsHomeQuery, newsIndexQuery } from "./queries";
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

export async function getHomepageNews() {
  const items = await getPublishedSanityClient().fetch<CuratedNewsCard[]>(
    newsHomeQuery,
    {},
    publishedOptions,
  );
  return selectHomepageNews(
    items.filter((item) =>
      isWithinDays(
        new Date(item.sourcePublishedAt),
        INGEST_WINDOWS.homepageNewsDays,
      ),
    ),
  );
}
