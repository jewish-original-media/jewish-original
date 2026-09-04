import type { Metadata } from "next";

import type { PodcastEpisode, PodcastShow } from "@/content/podcasts/types";
import { formatPublishedDate } from "@/lib/podcasts/format";
import {
  podcastEpisodePath,
  podcastShowPath,
  podcastsHomePath,
} from "@/lib/podcasts/urls";
import { youtubeWatchUrl } from "@/lib/podcasts/youtube";
import { siteConfig } from "@/lib/site";

export function podcastHomeUrl() {
  return `${siteConfig.url}${podcastsHomePath()}`;
}

export function podcastShowUrl(showSlug: string) {
  return `${siteConfig.url}${podcastShowPath(showSlug)}`;
}

export function podcastEpisodeUrl(showSlug: string, slug: string) {
  return `${siteConfig.url}${podcastEpisodePath(showSlug, slug)}`;
}

export function buildPodcastHomeMetadata(): Metadata {
  const title = "Podcasts";
  const description =
    "Listen to The Two Tall Jews Show and other Jewish Original conversations about history, culture, and Jewish life.";
  return {
    title,
    description,
    alternates: { canonical: podcastsHomePath() },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.shortName}`,
      description,
      url: podcastsHomePath(),
    },
    twitter: {
      card: "summary",
      title: `${title} | ${siteConfig.shortName}`,
      description,
    },
  };
}

export function buildPodcastShowMetadata(show: PodcastShow): Metadata {
  const title = show.seo?.title
    ? { absolute: show.seo.title }
    : show.title;
  const description = show.seo?.description || show.description;
  const url = podcastShowPath(show.slug);
  return {
    title,
    description,
    alternates: { canonical: show.seo?.canonicalUrl || url },
    robots: show.seo?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: show.seo?.openGraphTitle || show.seo?.title || show.title,
      description: show.seo?.openGraphDescription || description,
      url,
    },
    twitter: {
      card: "summary",
      title: show.seo?.openGraphTitle || show.seo?.title || show.title,
      description,
    },
  };
}

export function buildPodcastEpisodeMetadata(episode: PodcastEpisode): Metadata {
  const title = episode.seo?.title
    ? { absolute: episode.seo.title }
    : episode.title;
  const description =
    episode.seo?.description ||
    episode.excerpt ||
    `An episode of ${episode.showTitle}.`;
  const url = podcastEpisodePath(episode.showSlug, episode.slug);
  const image = episode.artwork?.url;
  const socialTitle =
    episode.seo?.openGraphTitle || episode.seo?.title || episode.title;

  return {
    title,
    description,
    alternates: { canonical: episode.seo?.canonicalUrl || url },
    robots: episode.seo?.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "article",
      siteName: siteConfig.name,
      title: socialTitle,
      description: episode.seo?.openGraphDescription || description,
      url,
      publishedTime: episode.publishedAt,
      images: image
        ? [{ url: image, alt: episode.artwork?.alt || episode.title }]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function buildPodcastHomeJsonLd(show: PodcastShow) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Podcasts",
    description:
      "Jewish Original podcasts, beginning with The Two Tall Jews Show.",
    url: podcastHomeUrl(),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    hasPart: {
      "@type": "PodcastSeries",
      name: show.title,
      url: podcastShowUrl(show.slug),
    },
  };
}

export function buildPodcastShowJsonLd(
  show: PodcastShow,
  episodes: { title: string; slug: string; excerpt?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: show.title,
    description: show.description,
    url: podcastShowUrl(show.slug),
    webFeed: show.rssUrl,
    author: show.hosts.map((host) => ({
      "@type": "Person",
      name: host.name,
    })),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    episode: episodes.map((episode) => ({
      "@type": "PodcastEpisode",
      name: episode.title,
      url: podcastEpisodeUrl(show.slug, episode.slug),
      description: episode.excerpt,
    })),
  };
}

export function buildPodcastEpisodeJsonLd(episode: PodcastEpisode) {
  const url = podcastEpisodeUrl(episode.showSlug, episode.slug);
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: episode.title,
    description: episode.excerpt || episode.description,
    url,
    datePublished: episode.publishedAt,
    duration: episode.durationSeconds
      ? `PT${episode.durationSeconds}S`
      : undefined,
    episodeNumber: episode.episodeNumber,
    partOfSeason: episode.season
      ? { "@type": "PodcastSeason", seasonNumber: episode.season }
      : undefined,
    partOfSeries: {
      "@type": "PodcastSeries",
      name: episode.showTitle,
      url: podcastShowUrl(episode.showSlug),
    },
    associatedMedia: episode.youtubeId
      ? {
          "@type": "VideoObject",
          name: episode.title,
          embedUrl: `https://www.youtube-nocookie.com/embed/${episode.youtubeId}`,
          url: youtubeWatchUrl(episode.youtubeId),
        }
      : episode.audioUrl
        ? {
            "@type": "MediaObject",
            contentUrl: episode.audioUrl,
            encodingFormat: "audio/mpeg",
          }
        : undefined,
    image: episode.artwork?.url,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function formatEpisodeDateLabel(publishedAt: string) {
  return formatPublishedDate(publishedAt);
}
