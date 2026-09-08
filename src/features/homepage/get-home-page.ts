import { getHistoryIndex } from "@/content/history/fetch";
import { getPublishedPodcastHome } from "@/content/podcasts/fetch";
import { getJewishToday } from "@/features/jewish-today";

import { buildPodcastHomeContract } from "./sections";
import type { HomePageData, PodcastHomeContract } from "./types";

async function getHomepagePodcasts(): Promise<PodcastHomeContract> {
  const published = await getPublishedPodcastHome();
  if (!published) return buildPodcastHomeContract(null);
  return buildPodcastHomeContract(published.show, published.episodes);
}

export async function getHomePageData(): Promise<HomePageData> {
  const [jewishToday, publishedHistory, publishedPodcasts] = await Promise.all([
    getJewishToday(),
    getHistoryIndex(false)
      .then((entries) => ({ status: "live" as const, entries }))
      .catch(() => ({ status: "unavailable" as const, entries: [] })),
    getHomepagePodcasts().catch(() => ({
      status: "unavailable" as const,
      show: null,
      episodes: [],
    })),
  ]);

  return {
    jewishToday,
    history: publishedHistory,
    podcasts: publishedPodcasts,
  };
}
