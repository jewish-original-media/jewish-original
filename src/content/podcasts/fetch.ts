import "server-only";

import { cache } from "react";

import {
  getDraftSanityClient,
  getPublishedSanityClient,
} from "@/lib/sanity/client";
import { TTJS_SHOW_SLUG } from "@/lib/podcasts/urls";
import { isYouTubeId, parseYouTubeId } from "@/lib/podcasts/youtube";

import {
  draftPodcastCandidateQuery,
  draftPodcastShowCandidateQuery,
  podcastEpisodeIndexQuery,
  podcastEpisodeQuery,
  podcastEpisodeSlugsQuery,
  podcastShowQuery,
  podcastShowSlugsQuery,
} from "./queries";
import type { PodcastEpisode, PodcastEpisodeSummary, PodcastShow } from "./types";

const publishedOptions = {
  next: {
    revalidate: 3600,
    tags: ["podcasts"],
  },
};

const previewOptions = {
  cache: "no-store" as const,
};

type SanityEpisode = Omit<PodcastEpisode, "relatedEpisodes" | "source"> & {
  youtubeId?: string;
  youtubeUrl?: string;
  relatedEpisodes?: {
    episode?: PodcastEpisodeSummary;
  }[];
};

function withVerifiedYouTube(episode: SanityEpisode): PodcastEpisode {
  const youtubeId = isYouTubeId(episode.youtubeId)
    ? episode.youtubeId
    : parseYouTubeId(episode.youtubeUrl);

  return {
    ...episode,
    youtubeId,
    relatedEpisodes: (episode.relatedEpisodes || [])
      .map((item) => item.episode)
      .filter((item): item is PodcastEpisodeSummary => Boolean(item)),
    source: "sanity",
  };
}

export async function getPodcastShow(showSlug: string, preview: boolean) {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  const show = await client.fetch<PodcastShow | null>(
    podcastShowQuery,
    { preview, showSlug },
    preview ? previewOptions : publishedOptions,
  );
  if (!show) return null;
  return { ...show, markSrc: show.markSrc || "/brand/ttjs-mark.png" };
}

export async function getPodcastEpisodes(showSlug: string, preview: boolean) {
  const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
  return client.fetch<PodcastEpisodeSummary[]>(
    podcastEpisodeIndexQuery,
    { preview, showSlug },
    preview ? previewOptions : publishedOptions,
  );
}

export async function getPublishedPodcastHome() {
  const show = await getPodcastShow(TTJS_SHOW_SLUG, false);
  if (!show) return null;
  const episodes = await getPodcastEpisodes(show.slug, false);
  return { show, episodes };
}

export const getPodcastEpisode = cache(
  async (showSlug: string, slug: string, preview: boolean) => {
    const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
    const episode = await client.fetch<SanityEpisode | null>(
      podcastEpisodeQuery,
      { preview, showSlug, slug },
      preview
        ? previewOptions
        : {
            next: {
              revalidate: 3600,
              tags: ["podcasts", `podcast:${showSlug}:${slug}`],
            },
          },
    );
    return episode ? withVerifiedYouTube(episode) : null;
  },
);

export async function getPublishedPodcastSlugs() {
  return getPublishedSanityClient().fetch<{ showSlug: string; slug: string }[]>(
    podcastEpisodeSlugsQuery,
    {},
    publishedOptions,
  );
}

export async function getPublishedPodcastShowSlugs() {
  return getPublishedSanityClient().fetch<{ showSlug: string }[]>(
    podcastShowSlugsQuery,
    {},
    publishedOptions,
  );
}

export async function getDraftPodcastCandidate(slug: string) {
  return getDraftSanityClient().fetch<{ slug: string; showSlug: string } | null>(
    draftPodcastCandidateQuery,
    { slug },
    previewOptions,
  );
}

export async function getDraftPodcastShowCandidate(slug: string) {
  return getDraftSanityClient().fetch<{ slug: string } | null>(
    draftPodcastShowCandidateQuery,
    { slug },
    previewOptions,
  );
}
