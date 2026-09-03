export const JEWISH_TODAY_TIMEZONE = "America/New_York";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));

  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function parseIsoDate(value: string): {
  year: number;
  month: number;
  day: number;
} | null {
  if (!isIsoDate(value)) return null;

  const [, year, month, day] = ISO_DATE.exec(value) ?? [];
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  };
}

export function civilDateInTimeZone(
  instant: Date,
  timeZone = JEWISH_TODAY_TIMEZONE,
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(
      "Unable to determine a civil date for the requested timezone.",
    );
  }

  return `${year}-${month}-${day}`;
}

export function addUtcDays(isoDate: string, days: number): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }

  const utc = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day + days),
  );
  return utc.toISOString().slice(0, 10);
}

export function weekdayUtc(isoDate: string): number {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }

  return new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day),
  ).getUTCDay();
}

export function nextSaturdayInclusive(isoDate: string): string {
  const weekday = weekdayUtc(isoDate);
  const daysUntilSaturday = (6 - weekday + 7) % 7;
  return addUtcDays(isoDate, daysUntilSaturday);
}

export function formatGregorianLabel(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)));
}

export function timezoneLabel(timeZone = JEWISH_TODAY_TIMEZONE): string {
  if (timeZone === "America/New_York") {
    return "Eastern Time";
  }

  return timeZone.replaceAll("_", " ");
}

export function resolveCivilDate(
  requestedDate: string | undefined,
  now: Date,
  timeZone = JEWISH_TODAY_TIMEZONE,
): string {
  if (requestedDate && isIsoDate(requestedDate)) {
    return requestedDate;
  }

  return civilDateInTimeZone(now, timeZone);
}
