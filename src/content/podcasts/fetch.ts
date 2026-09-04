import "server-only";

import { cache } from "react";

import {
  getDraftSanityClient,
  getPublishedSanityClient,
} from "@/lib/sanity/client";
import { isYouTubeId, parseYouTubeId } from "@/lib/podcasts/youtube";

import { pilotEpisodes, pilotShow } from "./pilot";
import {
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

function withLocalRelated(episode: PodcastEpisode): PodcastEpisode {
  return {
    ...episode,
    relatedEpisodes: pilotEpisodes
      .filter((other) => other.slug !== episode.slug)
      .map((other) => ({
        _id: other._id,
        title: other.title,
        slug: other.slug,
        showSlug: other.showSlug,
        showTitle: other.showTitle,
        excerpt: other.excerpt,
        publishedAt: other.publishedAt,
        durationSeconds: other.durationSeconds,
        season: other.season,
        episodeNumber: other.episodeNumber,
        guestNames: other.guestNames,
        artwork: other.artwork,
      })),
  };
}

export async function getPodcastShow(showSlug: string, preview: boolean) {
  try {
    const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
    const show = await client.fetch<PodcastShow | null>(
      podcastShowQuery,
      { preview, showSlug },
      preview ? previewOptions : publishedOptions,
    );
    if (show) {
      return { ...show, markSrc: show.markSrc || "/brand/ttjs-mark.png" };
    }
  } catch {
    // Local pilot is the unpublished foundation until CMS documents exist.
  }

  return showSlug === pilotShow.slug ? { ...pilotShow } : null;
}

export async function getPodcastEpisodes(showSlug: string, preview: boolean) {
  try {
    const client = preview ? getDraftSanityClient() : getPublishedSanityClient();
    const episodes = await client.fetch<PodcastEpisodeSummary[]>(
      podcastEpisodeIndexQuery,
      { preview, showSlug },
      preview ? previewOptions : publishedOptions,
    );
    if (episodes.length) return episodes;
  } catch {
    // Fall through to the local RSS-derived pilot.
  }

  return showSlug === pilotShow.slug
    ? pilotEpisodes.map((episode) => ({
        _id: episode._id,
        title: episode.title,
        slug: episode.slug,
        showSlug: episode.showSlug,
        showTitle: episode.showTitle,
        excerpt: episode.excerpt,
        publishedAt: episode.publishedAt,
        durationSeconds: episode.durationSeconds,
        season: episode.season,
        episodeNumber: episode.episodeNumber,
        guestNames: episode.guestNames,
        artwork: episode.artwork,
      }))
    : [];
}

export const getPodcastEpisode = cache(
  async (showSlug: string, slug: string, preview: boolean) => {
    try {
      const client = preview
        ? getDraftSanityClient()
        : getPublishedSanityClient();
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
      if (episode) {
        return {
          ...episode,
          youtubeId: isYouTubeId(episode.youtubeId)
            ? episode.youtubeId
            : parseYouTubeId(episode.youtubeUrl),
          relatedEpisodes: (episode.relatedEpisodes || [])
            .map((item) => item.episode)
            .filter((item): item is PodcastEpisodeSummary => Boolean(item)),
          source: "sanity" as const,
        };
      }
    } catch {
      // Fall through to the local RSS-derived pilot.
    }

    const local = pilotEpisodes.find(
      (episode) => episode.showSlug === showSlug && episode.slug === slug,
    );
    return local ? withLocalRelated(local) : null;
  },
);

export async function getPublishedPodcastSlugs() {
  const local = pilotEpisodes.map((episode) => ({
    showSlug: episode.showSlug,
    slug: episode.slug,
  }));
  try {
    const slugs = await getPublishedSanityClient().fetch<
      { showSlug: string; slug: string }[]
    >(podcastEpisodeSlugsQuery, {}, publishedOptions);
    return slugs.length ? slugs : local;
  } catch {
    return local;
  }
}

export async function getPublishedPodcastShowSlugs() {
  try {
    const slugs = await getPublishedSanityClient().fetch<{ showSlug: string }[]>(
      podcastShowSlugsQuery,
      {},
      publishedOptions,
    );
    if (slugs.length) return slugs;
  } catch {
    // Local show remains the unpublished foundation.
  }
  return [{ showSlug: pilotShow.slug }];
}
