import { getHistoryIndex } from "@/content/history/fetch";
import { getPodcastEpisodes, getPodcastShow } from "@/content/podcasts/fetch";
import { getJewishToday } from "@/features/jewish-today";
import { TTJS_SHOW_SLUG } from "@/lib/podcasts/urls";

import { buildPodcastHomeContract } from "./sections";
import type { HomePageData, PodcastHomeContract } from "./types";

async function getPublishedPodcastHome(): Promise<PodcastHomeContract> {
  const show = await getPodcastShow(TTJS_SHOW_SLUG, false);
  if (!show) return buildPodcastHomeContract(null);

  const episodes = await getPodcastEpisodes(show.slug, false);
  return buildPodcastHomeContract(show, episodes);
}

export async function getHomePageData(): Promise<HomePageData> {
  const [jewishToday, publishedHistory, publishedPodcasts] = await Promise.all([
    getJewishToday(),
    getHistoryIndex(false)
      .then((entries) => ({ status: "live" as const, entries }))
      .catch(() => ({ status: "unavailable" as const, entries: [] })),
    getPublishedPodcastHome().catch(() => ({
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
