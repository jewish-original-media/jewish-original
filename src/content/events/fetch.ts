import "server-only";

import { INGEST_CAPS } from "@/features/ingest/config";
import { shouldShowHomepageEvents } from "@/features/ingest/select";
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
  const upcoming = items.slice(0, INGEST_CAPS.homepageEvents);
  if (!shouldShowHomepageEvents(upcoming)) return [];
  return upcoming;
}
