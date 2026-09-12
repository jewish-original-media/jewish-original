import type { PodcastEpisodeSummary } from "@/content/podcasts/types";

export type HomePodcastPresentation = {
  lead: PodcastEpisodeSummary | null;
  more: PodcastEpisodeSummary[];
  moreCount: number;
};

export function composeHomePodcasts(
  episodes: PodcastEpisodeSummary[],
): HomePodcastPresentation {
  const more = episodes.slice(1);
  return {
    lead: episodes[0] ?? null,
    more,
    moreCount: more.length,
  };
}
