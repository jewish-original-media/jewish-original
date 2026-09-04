import type { MetadataRoute } from "next";

import { getPublishedHistorySlugs } from "@/content/history/fetch";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const historySlugs = await getPublishedHistorySlugs().catch(() => []);

  return [
    {
      url: siteConfig.url,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/today`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/history`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/support`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...historySlugs.map(({ slug }) => ({
      url: `${siteConfig.url}/history/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
