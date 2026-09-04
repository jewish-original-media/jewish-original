import type {
  PodcastEpisodeSummary,
  PodcastShow,
} from "@/content/podcasts/types";

import type {
  HiddenHomeModule,
  HomeSectionContract,
  HistoryHomeContract,
  PodcastHomeContract,
} from "./types";

export const HOME_SECTION_ORDER: readonly HomeSectionContract[] = [
  {
    id: "masthead",
    eyebrow: "Jewish Original Media",
    title: "Remember, rebuild, and create.",
    status: "live",
    description:
      "One restrained opening. Positioning lives in the lede, not as a slogan stack.",
  },
  {
    id: "jewish-today",
    eyebrow: "Jewish Today",
    title: "Daily Jewish context",
    status: "live",
    description:
      "Uses getJewishToday() once. Homepage presents the same day. Do not fetch Hebcal again.",
  },
  {
    id: "history",
    eyebrow: "History",
    title: "On this day or from the archive",
    status: "live",
    description:
      "Lead HistoryEntryCard plus supporting archive items from getHistoryIndex.",
  },
  {
    id: "podcasts",
    eyebrow: "Podcasts",
    title: "The Two Tall Jews Show",
    status: "live",
    description:
      "Published getPodcastShow and one EpisodeCard lead. The catalog holds the remaining published episodes.",
  },
  {
    id: "support",
    eyebrow: "Support",
    title: "Stand with us",
    status: "live",
    description: "A short invitation into /support. No invented campaigns.",
  },
] as const;

export const HIDDEN_HOME_MODULES: readonly HiddenHomeModule[] = [
  {
    id: "originals",
    title: "Originals",
    status: "hidden",
    reason: "no-published-documents",
  },
  {
    id: "news",
    title: "What We’re Following",
    status: "hidden",
    reason: "no-published-documents",
  },
  {
    id: "events",
    title: "Upcoming Events",
    status: "hidden",
    reason: "no-published-documents",
  },
] as const;

export const HISTORY_HOME_CONTRACT: HistoryHomeContract = {
  status: "live",
  entries: [],
};

export const PODCASTS_HOME_CONTRACT: PodcastHomeContract = {
  status: "preparing",
  show: null,
  episodes: [],
};

export function buildPodcastHomeContract(
  show: PodcastShow | null,
  episodes: PodcastEpisodeSummary[] = [],
): PodcastHomeContract {
  if (!show) {
    return {
      status: "preparing",
      show: null,
      episodes: [],
    };
  }

  return {
    status: "live",
    show,
    episodes,
  };
}
