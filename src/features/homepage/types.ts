import type { HistoryEntrySummary } from "@/content/history/types";
import type {
  PodcastEpisodeSummary,
  PodcastShow,
} from "@/content/podcasts/types";

export const HOME_SECTION_IDS = [
  "masthead",
  "jewish-today",
  "history",
  "podcasts",
  "later-desks",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export type HomeSectionStatus =
  "live" | "unavailable" | "preparing" | "later-desk";

export type HomeSectionContract = {
  id: HomeSectionId;
  eyebrow: string;
  title: string;
  status: HomeSectionStatus;
  description: string;
};

export type LaterDeskId = "news" | "events" | "culture" | "support";

export type LaterDeskContract = {
  id: LaterDeskId;
  title: string;
  status: "later-desk";
  note: string;
};

export type PodcastHomeContract = {
  status: "live" | "preparing" | "unavailable";
  show: PodcastShow | null;
  episodes: PodcastEpisodeSummary[];
};

export type HistoryHomeContract = {
  status: "live" | "unavailable";
  entries: HistoryEntrySummary[];
};

export type HomePageData = {
  jewishToday: import("@/features/jewish-today").JewishTodayDay;
  history: HistoryHomeContract;
  podcasts: PodcastHomeContract;
};
