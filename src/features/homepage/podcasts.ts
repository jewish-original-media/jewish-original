import type { PodcastEpisodeSummary } from "@/content/podcasts/types";

export type HomePodcastPresentation = {
  lead: PodcastEpisodeSummary | null;
  moreCount: number;
};

export function composeHomePodcasts(
  episodes: PodcastEpisodeSummary[],
): HomePodcastPresentation {
  return {
    lead: episodes[0] ?? null,
    moreCount: Math.max(0, episodes.length - 1),
  };
}
