const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export function eventDateParts(startAt: string, timeZone: string) {
  const date = new Date(startAt);
  const safeZone = timeZone || "UTC";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone,
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const read = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";
  const monthIndex = Number(read("month")) - 1;
  return {
    month: MONTHS[monthIndex] ?? "—",
    day: read("day"),
    time: `${read("hour")}:${read("minute")} ${read("dayPeriod") || ""}`.trim(),
  };
}

export function eventPlaceLabel(event: {
  attendanceMode: string;
  venueName?: string;
  city?: string;
  region?: string;
}) {
  if (event.attendanceMode === "online") return "Online";
  return (
    [event.venueName, event.city, event.region].filter(Boolean).join(", ") ||
    "Location listed on source"
  );
}
