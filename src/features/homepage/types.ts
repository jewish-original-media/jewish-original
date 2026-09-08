import type { HistoryEntrySummary } from "@/content/history/types";
import type {
  PodcastEpisodeSummary,
  PodcastShow,
} from "@/content/podcasts/types";

export const HOME_SECTION_IDS = [
  "masthead",
  "jewish-today",
  "history",
  "manifesto",
  "podcasts",
  "support",
] as const;

export const HIDDEN_HOME_MODULE_IDS = ["originals", "news", "events"] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];
export type HiddenHomeModuleId = (typeof HIDDEN_HOME_MODULE_IDS)[number];

export type HomeSectionStatus = "live" | "unavailable" | "preparing";

export type HomeSectionContract = {
  id: HomeSectionId;
  eyebrow: string;
  title: string;
  status: HomeSectionStatus;
  description: string;
};

export type HiddenHomeModule = {
  id: HiddenHomeModuleId;
  title: string;
  status: "hidden";
  reason: "no-published-documents";
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
