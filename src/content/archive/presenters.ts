import type { PublicEventCard } from "@/content/events/types";
import type {
  HistoryEntrySummary,
  HistoryReference,
} from "@/content/history/types";
import type { CuratedNewsCard } from "@/content/news/types";
import type { OriginalSummary } from "@/content/originals/types";
import type { PodcastArchiveEpisode } from "@/content/podcasts/types";
import { formatHistoricalDate } from "@/lib/history/format-date";

import type { ArchiveFacet, ArchiveImage, ArchiveRecord } from "./types";

function cleanFacets(
  references: HistoryReference[] | undefined,
): ArchiveFacet[] {
  return (references ?? []).filter(
    (reference) =>
      Boolean(reference.name?.trim()) && Boolean(reference.slug?.trim()),
  );
}

function historyImage(
  image: HistoryEntrySummary["primaryImage"] | OriginalSummary["featuredMedia"],
): ArchiveImage | undefined {
  if (!image?.asset?.url) return undefined;

  return {
    url: image.asset.url,
    alt: image.alt,
    width: image.asset.width,
    height: image.asset.height,
    lqip: image.asset.lqip,
  };
}

function searchable(
  parts: Array<string | undefined>,
  facets: ArchiveFacet[][] = [],
) {
  return [...parts, ...facets.flat().map((facet) => facet.name)]
    .filter(Boolean)
    .join(" ");
}

export function presentHistoryRecord(
  entry: HistoryEntrySummary,
): ArchiveRecord {
  const topics = cleanFacets(entry.topics);
  const people = cleanFacets(entry.people);
  const places = cleanFacets(entry.places);
  const regions = cleanFacets(entry.geographicRegions);
  const eras = cleanFacets(entry.eras);
  const organizations = cleanFacets(entry.organizations);
  const facets = [topics, people, places, regions, eras, organizations];

  return {
    id: entry._id,
    kind: "history",
    durability: "durable",
    title: entry.title,
    href: `/history/${entry.slug}`,
    external: false,
    excerpt: entry.excerpt,
    publishedAt: entry._updatedAt ?? entry._createdAt,
    dateLabel: formatHistoricalDate(
      entry.historicalDate,
      entry.entryKind,
      entry.observanceRule,
    ),
    eyebrow:
      entry.entryKind === "recurringObservance" ? "Observance" : "History",
    image: historyImage(entry.primaryImage),
    topics,
    people,
    places,
    regions,
    eras,
    organizations,
    tags: [],
    searchText: searchable(
      [entry.title, entry.excerpt, entry.eventLocation],
      facets,
    ),
  };
}

export function presentOriginalRecord(
  original: OriginalSummary,
): ArchiveRecord {
  const topics = cleanFacets(original.topics);
  const people = cleanFacets(original.authors);
  const facets = [topics, people];

  return {
    id: original._id,
    kind: "original",
    durability: "durable",
    title: original.title,
    href: `/originals/${original.slug}`,
    external: false,
    excerpt: original.excerpt,
    publishedAt: original.publishedAt,
    eyebrow: "Original",
    image: historyImage(original.featuredMedia),
    topics,
    people,
    places: [],
    regions: [],
    eras: [],
    organizations: [],
    tags: [],
    searchText: searchable([original.title, original.excerpt], facets),
  };
}

export function presentPodcastRecord(
  episode: PodcastArchiveEpisode,
): ArchiveRecord {
  const topics = cleanFacets(episode.topics);
  const people = cleanFacets([...episode.people, ...episode.hosts]);
  const places = cleanFacets(episode.places);
  const facets = [topics, people, places];

  return {
    id: episode._id,
    kind: "podcast",
    durability: "durable",
    title: episode.title,
    href: `/podcasts/${episode.showSlug}/${episode.slug}`,
    external: false,
    excerpt: episode.excerpt,
    publishedAt: episode.publishedAt,
    eyebrow: episode.showTitle || "Podcast",
    image: episode.artwork?.url
      ? {
          url: episode.artwork.url,
          alt: episode.artwork.alt,
          width: episode.artwork.width,
          height: episode.artwork.height,
        }
      : undefined,
    topics,
    people,
    places,
    regions: [],
    eras: [],
    organizations: [],
    tags: episode.guestNames,
    searchText: searchable(
      [
        episode.title,
        episode.excerpt,
        episode.showTitle,
        ...episode.guestNames,
      ],
      facets,
    ),
  };
}

export function presentNewsRecord(item: CuratedNewsCard): ArchiveRecord {
  return {
    id: item.id,
    kind: "news",
    durability: "current",
    title: item.headline,
    href: item.sourceUrl,
    external: true,
    excerpt: item.jomContext,
    publishedAt: item.sourcePublishedAt,
    eyebrow: item.publisher,
    topics: [],
    people: [],
    places: [],
    regions: [],
    eras: [],
    organizations: [],
    tags: item.topics,
    searchText: searchable([
      item.headline,
      item.publisher,
      item.jomContext,
      ...item.topics,
    ]),
  };
}

export function presentEventRecord(event: PublicEventCard): ArchiveRecord {
  const location = [event.venueName, event.city, event.region, event.country]
    .filter(Boolean)
    .join(", ");

  return {
    id: event.id,
    kind: "event",
    durability: "current",
    title: event.title,
    href: event.eventUrl,
    external: true,
    excerpt: event.jomContext,
    publishedAt: event.startAt,
    dateLabel: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(event.startAt)),
    eyebrow: event.organizer,
    topics: [],
    people: [],
    places: [],
    regions: [],
    eras: [],
    organizations: [],
    tags: [event.attendanceMode, event.geoBucket, location].filter(
      (value): value is string => Boolean(value),
    ),
    searchText: searchable([
      event.title,
      event.organizer,
      event.jomContext,
      location,
      event.attendanceMode,
    ]),
  };
}
