export type PodcastReference = {
  name: string;
  slug: string;
};

export type PodcastArtwork = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type PodcastChapter = {
  title: string;
  start: string;
};

export type PodcastShow = {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  hosts: PodcastReference[];
  artwork?: PodcastArtwork;
  markSrc?: string;
  rssUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  seo?: PodcastSeo;
};

export type PodcastEpisodeSummary = {
  _id: string;
  title: string;
  slug: string;
  showSlug: string;
  showTitle: string;
  excerpt?: string;
  publishedAt: string;
  durationSeconds?: number;
  season?: number;
  episodeNumber?: number;
  guestNames: string[];
  artwork?: PodcastArtwork;
};

export type PodcastEpisode = PodcastEpisodeSummary & {
  description?: string;
  audioUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  primaryMedia?: "auto" | "youtube" | "audio";
  sourceArtworkUrl?: string;
  summary?: string;
  reviewedTranscript?: string;
  chapters: PodcastChapter[];
  topics: PodcastReference[];
  people: PodcastReference[];
  places: PodcastReference[];
  hosts: PodcastReference[];
  workflowStatus?: string;
  relatedHistory: {
    relationType?: string;
    note?: string;
    entry?: {
      title: string;
      slug: string;
      excerpt?: string;
    };
  }[];
  relatedEpisodes: PodcastEpisodeSummary[];
  seo?: PodcastSeo;
  source: "sanity" | "local-pilot";
};

export type PodcastSeo = {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
};
