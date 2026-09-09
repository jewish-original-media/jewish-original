import type { Metadata } from "next";

import { EventsIndex } from "@/components/events/events-index";
import { getPublishedEventsIndex } from "@/content/events/fetch";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming Jewish cultural programs from official calendars and JOM-owned records.",
  alternates: { canonical: "/events" },
};

export default async function EventsPage() {
  const items = await getPublishedEventsIndex().catch(() => []);
  return <EventsIndex items={items} />;
}
