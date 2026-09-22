export type PublicEventCard = {
  id: string;
  title: string;
  organizer: string;
  eventUrl: string;
  startAt: string;
  endAt?: string;
  timezone: string;
  attendanceMode: "online" | "in-person" | "hybrid";
  venueName?: string;
  city?: string;
  region?: string;
  country?: string;
  geoBucket?: string;
  jomContext?: string;
};
