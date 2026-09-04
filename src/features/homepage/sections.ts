import type {
  PodcastEpisodeSummary,
  PodcastShow,
} from "@/content/podcasts/types";

import type {
  HomeSectionContract,
  LaterDeskContract,
  HistoryHomeContract,
  PodcastHomeContract,
} from "./types";

export const HOME_SECTION_ORDER: readonly HomeSectionContract[] = [
  {
    id: "masthead",
    eyebrow: "Jewish Original Media",
    title:
      "A modern home for Jewish history, culture, education, connection, and identity.",
    status: "live",
    description:
      "Restrained editorial identity. Not a marketing hero and not a card grid.",
  },
  {
    id: "jewish-today",
    eyebrow: "Jewish Today",
    title: "Daily Jewish context",
    status: "live",
    description:
      "Uses getJewishToday() and JewishTodayModule. Do not fetch Hebcal or History again.",
  },
  {
    id: "history",
    eyebrow: "History",
    title: "From the archive",
    status: "live",
    description:
      "Published HistoryEntryCard archive cards from getHistoryIndex. Not a second /history page.",
  },
  {
    id: "podcasts",
    eyebrow: "Podcasts",
    title: "Podcasts are being prepared.",
    status: "preparing",
    description:
      "Published getPodcastShow and EpisodeCard only. Draft pilots stay off the public homepage.",
  },
  {
    id: "later-desks",
    eyebrow: "Later desks",
    title: "News, events, culture, and support",
    status: "later-desk",
    description:
      "Named only. No fabricated headlines, events, culture items, or donation claims.",
  },
] as const;

export const LATER_DESKS: readonly LaterDeskContract[] = [
  {
    id: "news",
    title: "News",
    status: "later-desk",
    note: "Curated, rights-safe reporting. Not a wire dump.",
  },
  {
    id: "events",
    title: "Events",
    status: "later-desk",
    note: "Reviewed gatherings with real dates and sources.",
  },
  {
    id: "culture",
    title: "Culture",
    status: "later-desk",
    note: "Books, music, food, art, and discoveries as typed editorial objects.",
  },
  {
    id: "support",
    title: "Support",
    status: "later-desk",
    note: "Donations and sponsorships that stay secondary to editorial trust.",
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
