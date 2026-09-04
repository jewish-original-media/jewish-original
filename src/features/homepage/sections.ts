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
    title: "The archive belongs here",
    status: "pending-history-merge",
    description:
      "Reserved for the History archive and HistoryEntryCard after milestone-1-sanity-history merges.",
  },
  {
    id: "podcasts",
    eyebrow: "Podcasts",
    title: "Shows and episodes belong here",
    status: "pending-podcasts-merge",
    description:
      "Reserved for featured and recent episodes after feature/podcasts merges.",
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
  status: "pending-history-merge",
  replaceOnMerge: [
    "fetchOnThisDayHistory -> getOnThisDayHistory",
    'TodayHistoryCard -> HistoryEntryCard variant="archive"',
    "formatOnThisDayDate -> formatHistoricalDate",
  ],
};

export const PODCASTS_HOME_CONTRACT: PodcastHomeContract = {
  status: "pending-podcasts-merge",
  expectedInputs: [
    "featuredOrRecentEpisodes",
    "showMetadata",
    "episodeCards",
    "mediaLinks",
  ],
};
