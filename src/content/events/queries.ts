import { defineQuery } from "next-sanity";

const publicEvent = `
  !(_id in path("drafts.**")) &&
  status == "published" &&
  eventStatus != "cancelled" &&
  dateTime(startAt) > now() &&
  (!defined(expiresAt) || expiresAt > now())
`;

const eventProjection = `{
  "id": _id,
  title,
  organizer,
  eventUrl,
  startAt,
  endAt,
  timezone,
  attendanceMode,
  venueName,
  city,
  region,
  country,
  geoBucket,
  jomContext
}`;

export const eventsIndexQuery = defineQuery(`
  *[_type == "event" && ${publicEvent}] | order(startAt asc) ${eventProjection}
`);

export const eventsHomeQuery = defineQuery(`
  *[_type == "event" && ${publicEvent}] | order(startAt asc)[0...6] ${eventProjection}
`);
