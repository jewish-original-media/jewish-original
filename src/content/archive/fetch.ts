import "server-only";

import { getPublishedEventsIndex } from "@/content/events/fetch";
import { getHistoryIndex } from "@/content/history/fetch";
import { getPublishedNewsIndex } from "@/content/news/fetch";
import { getPublishedOriginalsIndex } from "@/content/originals/fetch";
import { getPodcastArchiveEpisodes } from "@/content/podcasts/fetch";

import {
  presentEventRecord,
  presentHistoryRecord,
  presentNewsRecord,
  presentOriginalRecord,
  presentPodcastRecord,
} from "./presenters";
import type { ArchiveRecord } from "./types";

export async function getDurableArchiveRecords(): Promise<ArchiveRecord[]> {
  const [history, originals, podcasts] = await Promise.all([
    getHistoryIndex(false),
    getPublishedOriginalsIndex(false),
    getPodcastArchiveEpisodes(false),
  ]);

  return [
    ...history.map(presentHistoryRecord),
    ...originals.map(presentOriginalRecord),
    ...podcasts.map(presentPodcastRecord),
  ];
}

export async function getCurrentArchiveRecords(): Promise<ArchiveRecord[]> {
  const [news, events] = await Promise.all([
    getPublishedNewsIndex(),
    getPublishedEventsIndex(),
  ]);

  return [...news.map(presentNewsRecord), ...events.map(presentEventRecord)];
}

export async function getArchiveRecords(): Promise<ArchiveRecord[]> {
  const [durable, current] = await Promise.all([
    getDurableArchiveRecords(),
    getCurrentArchiveRecords(),
  ]);

  return [...durable, ...current];
}
