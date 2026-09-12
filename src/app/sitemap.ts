import type { MetadataRoute } from "next";

import { getPublishedHistorySlugs } from "@/content/history/fetch";
import { getPublishedOriginalSlugs } from "@/content/originals/fetch";
import {
  getPublishedPodcastShowSlugs,
  getPublishedPodcastSlugs,
} from "@/content/podcasts/fetch";
import { publicStaticSitemapPaths } from "@/lib/seo/site";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [historySlugs, podcastShows, podcastEpisodes, originalSlugs] =
    await Promise.all([
      getPublishedHistorySlugs().catch(() => []),
      getPublishedPodcastShowSlugs().catch(() => []),
      getPublishedPodcastSlugs().catch(() => []),
      getPublishedOriginalSlugs().catch(() => []),
    ]);

  return [
    ...publicStaticSitemapPaths().map((path) => ({
      url: path === "/" ? siteConfig.url : `${siteConfig.url}${path}`,
      changeFrequency:
        path === "/" || path === "/today" || path === "/news"
          ? ("daily" as const)
          : path === "/privacy"
            ? ("yearly" as const)
            : ("weekly" as const),
      priority:
        path === "/"
          ? 1
          : path === "/history"
            ? 0.9
            : path === "/today" || path === "/podcasts"
              ? 0.8
              : path === "/originals"
                ? 0.75
                : path === "/news"
                  ? 0.6
                  : path === "/about"
                    ? 0.5
                    : path === "/support"
                      ? 0.4
                      : 0.2,
    })),
    ...historySlugs.map(({ slug }) => ({
      url: `${siteConfig.url}/history/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...podcastShows.map(({ showSlug }) => ({
      url: `${siteConfig.url}/podcasts/${showSlug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...podcastEpisodes.map(({ showSlug, slug }) => ({
      url: `${siteConfig.url}/podcasts/${showSlug}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...originalSlugs.map(({ slug }) => ({
      url: `${siteConfig.url}/originals/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
