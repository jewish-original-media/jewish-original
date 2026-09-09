import "server-only";

import { INGEST_CAPS, INGEST_WINDOWS } from "@/features/ingest/config";
import { getPublishedSanityClient } from "@/lib/sanity/client";

import { eventsHomeQuery, eventsIndexQuery } from "./queries";
import type { PublicEventCard } from "./types";

const publishedOptions = {
  next: {
    revalidate: 300,
    tags: ["events"],
  },
};

export async function getPublishedEventsIndex() {
  return getPublishedSanityClient().fetch<PublicEventCard[]>(
    eventsIndexQuery,
    {},
    publishedOptions,
  );
}

export async function getHomepageEvents() {
  const items = await getPublishedSanityClient().fetch<PublicEventCard[]>(
    eventsHomeQuery,
    {},
    publishedOptions,
  );
  if (items.length < INGEST_WINDOWS.homepageEventMin) return [];
  return items.slice(0, INGEST_CAPS.homepageEvents);
}
