import { getHistoryIndex } from "@/content/history/fetch";
import { getJewishToday } from "@/features/jewish-today";

import { PODCASTS_HOME_CONTRACT } from "./sections";
import type { HomePageData } from "./types";

export async function getHomePageData(): Promise<HomePageData> {
  const [jewishToday, publishedHistory] = await Promise.all([
    getJewishToday(),
    getHistoryIndex(false)
      .then((entries) => ({ status: "live" as const, entries }))
      .catch(() => ({ status: "unavailable" as const, entries: [] })),
  ]);

  return {
    jewishToday,
    history: publishedHistory,
    podcasts: PODCASTS_HOME_CONTRACT,
  };
}
