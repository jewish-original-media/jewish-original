import type { SanityClient } from "@sanity/client";

export const INTEGRITY_QUERY = `{
  "historyPublished": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
  "historyIds": *[_type == "historyEntry" && !(_id in path("drafts.**"))]._id,
  "podcastShowsPublished": count(*[_type == "podcastShow" && !(_id in path("drafts.**"))]),
  "podcastEpisodesPublished": count(*[_type == "podcastEpisode" && !(_id in path("drafts.**"))]),
  "podcastShowDrafts": count(*[_type == "podcastShow" && _id in path("drafts.**")]),
  "podcastEpisodeDrafts": count(*[_type == "podcastEpisode" && _id in path("drafts.**")]),
  "newsPublished": count(*[_type == "curatedNewsItem" && !(_id in path("drafts.**")) && status == "published"]),
  "newsAll": count(*[_type == "curatedNewsItem"]),
  "newsIds": *[_type == "curatedNewsItem" && !(_id in path("drafts.**"))]._id,
  "eventsPublished": count(*[_type == "event" && !(_id in path("drafts.**")) && status == "published"]),
  "eventsAll": count(*[_type == "event"]),
  "eventIds": *[_type == "event" && !(_id in path("drafts.**"))]._id,
  "ingestSources": count(*[_type == "ingestSource"]),
  "ingestExceptions": count(*[_type == "ingestException"]),
  "ingestRuns": count(*[_type == "ingestRun"]),
  "ingestReceipts": count(*[_type == "ingestReceipt"])
}`;

export type IngestIntegrityCounts = {
  historyPublished: number;
  historyIds: string[];
  podcastShowsPublished: number;
  podcastEpisodesPublished: number;
  podcastShowDrafts: number;
  podcastEpisodeDrafts: number;
  newsPublished: number;
  newsAll: number;
  newsIds: string[];
  eventsPublished: number;
  eventsAll: number;
  eventIds: string[];
  ingestSources: number;
  ingestExceptions: number;
  ingestRuns: number;
  ingestReceipts: number;
};

export const BASELINE_HISTORY_IDS = [
  "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
  "historyEntry.jom-513f6a739543db8be9034576144811f9",
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc",
  "historyEntry.jom-d68726d23439a8e6135c869acacfd547",
  "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
] as const;

export async function fetchIngestIntegrity(client: SanityClient) {
  return client.fetch<IngestIntegrityCounts>(INTEGRITY_QUERY);
}

export function assertProtectedContentUnchanged(
  before: IngestIntegrityCounts,
  after: IngestIntegrityCounts,
) {
  if (after.historyPublished !== 5 || before.historyPublished !== 5) {
    throw new Error("history-count-changed");
  }
  const beforeIds = [...before.historyIds].sort();
  const afterIds = [...after.historyIds].sort();
  if (beforeIds.join() !== afterIds.join()) {
    throw new Error("history-ids-changed");
  }
  if (
    after.podcastShowsPublished !== 1 ||
    after.podcastEpisodesPublished !== 4 ||
    after.podcastShowDrafts !== 0 ||
    after.podcastEpisodeDrafts !== 0
  ) {
    throw new Error("podcast-counts-changed");
  }
}
