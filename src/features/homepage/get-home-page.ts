import { getJewishToday } from "@/features/jewish-today";

import { HISTORY_HOME_CONTRACT, PODCASTS_HOME_CONTRACT } from "./sections";
import type { HomePageData } from "./types";

export async function getHomePageData(): Promise<HomePageData> {
  const jewishToday = await getJewishToday();

  return {
    jewishToday,
    history: HISTORY_HOME_CONTRACT,
    podcasts: PODCASTS_HOME_CONTRACT,
  };
}
