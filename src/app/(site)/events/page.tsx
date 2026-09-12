import type { Metadata } from "next";

import { EventsIndex } from "@/components/events/events-index";
import { getPublishedEventsIndex } from "@/content/events/fetch";
import { buildPageMetadata } from "@/lib/seo/site";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const items = await getPublishedEventsIndex().catch(() => []);
  return buildPageMetadata({
    title: "Events",
    description:
      "Upcoming Jewish cultural programs from official calendars and JOM-owned records.",
    path: "/events",
    index: items.length > 0,
  });
}

export default async function EventsPage() {
  const items = await getPublishedEventsIndex().catch(() => []);
  return <EventsIndex items={items} />;
}
