import {
  collapseWhitespace,
  htmlToPlainText,
  truncateSourceText,
} from "./text";

export type IcsEvent = {
  uid: string;
  title: string;
  startRaw: string;
  startAt: string | null;
  endAt: string | null;
  timezone: string | null;
  location: string;
  url: string;
  description: string;
  status: "scheduled" | "cancelled" | "postponed";
  rrule?: string;
  organizer?: string;
};

function unfoldIcs(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
}

function unescapeIcs(value: string) {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function parseDateValue(raw: string, tzid?: string) {
  const value = raw.trim();
  const match = value.match(
    /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/,
  );
  if (!match) return null;
  const [, year, month, day, hour = "00", minute = "00", second = "00", zulu] =
    match;
  if (zulu === "Z" || !tzid) {
    const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}${zulu === "Z" ? "Z" : ""}`;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return {
      iso: date.toISOString(),
      timezone: zulu === "Z" ? "UTC" : tzid || null,
    };
  }
  return {
    iso: wallTimeToUtcIso(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      tzid,
    ),
    timezone: tzid,
  };
}

export function wallTimeToUtcIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = tzOffsetMs(utcGuess, timeZone);
  if (offset === null) return null;
  return new Date(utcGuess - offset).toISOString();
}

function tzOffsetMs(utcMs: number, timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(utcMs));
    const read = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    const asUtc = Date.UTC(
      read("year"),
      read("month") - 1,
      read("day"),
      read("hour"),
      read("minute"),
      read("second"),
    );
    return asUtc - utcMs;
  } catch {
    return null;
  }
}

function property(block: string, name: string) {
  const match = block.match(new RegExp(`^${name}(?:;([^:]*))?:(.*)$`, "im"));
  if (!match) return null;
  const params = Object.fromEntries(
    (match[1] || "")
      .split(";")
      .filter(Boolean)
      .map((part) => {
        const [key, value] = part.split("=");
        return [key?.toUpperCase() ?? "", value ?? ""];
      }),
  );
  return { value: unescapeIcs(match[2] ?? ""), params };
}

export function parseIcsEvents(ics: string): IcsEvent[] {
  const unfolded = unfoldIcs(ics);
  const blocks = [
    ...unfolded.matchAll(/BEGIN:VEVENT\n([\s\S]*?)\nEND:VEVENT/g),
  ];

  return blocks
    .map((match) => {
      const block = match[1] ?? "";
      const uid = property(block, "UID")?.value ?? "";
      const title = property(block, "SUMMARY")?.value ?? "";
      const startProp = property(block, "DTSTART");
      const endProp = property(block, "DTEND");
      const start = startProp
        ? parseDateValue(startProp.value, startProp.params.TZID)
        : null;
      const end = endProp
        ? parseDateValue(
            endProp.value,
            endProp.params.TZID || startProp?.params.TZID,
          )
        : null;
      const statusRaw = (
        property(block, "STATUS")?.value || "CONFIRMED"
      ).toUpperCase();
      const status =
        statusRaw === "CANCELLED"
          ? "cancelled"
          : statusRaw === "TENTATIVE"
            ? "postponed"
            : "scheduled";
      return {
        uid,
        title: collapseWhitespace(title),
        startRaw: startProp?.value ?? "",
        startAt: start?.iso ?? null,
        endAt: end?.iso ?? null,
        timezone: start?.timezone ?? null,
        location: collapseWhitespace(property(block, "LOCATION")?.value ?? ""),
        url: property(block, "URL")?.value ?? "",
        description: truncateSourceText(
          htmlToPlainText(property(block, "DESCRIPTION")?.value ?? ""),
        ),
        status,
        rrule: property(block, "RRULE")?.value,
        organizer: property(block, "ORGANIZER")?.value,
      } satisfies IcsEvent;
    })
    .filter((event) => event.uid && event.title);
}

export function isValidIanaTimeZone(value: string) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function nextRruleInstance(
  event: IcsEvent,
  now = new Date(),
): { startAt: string; endAt: string | null } | null {
  if (!event.startAt) return null;
  const start = new Date(event.startAt);
  if (!event.rrule) {
    return start.getTime() > now.getTime()
      ? { startAt: event.startAt, endAt: event.endAt }
      : null;
  }

  const parts = Object.fromEntries(
    event.rrule.split(";").map((part) => {
      const [key, value] = part.split("=");
      return [key?.toUpperCase() ?? "", value ?? ""];
    }),
  );
  const freq = parts.FREQ;
  const interval = Number(parts.INTERVAL || "1");
  if (!freq || !Number.isInteger(interval) || interval < 1) return null;

  const duration =
    event.endAt && event.startAt
      ? Date.parse(event.endAt) - Date.parse(event.startAt)
      : 0;
  const cursor = new Date(start);
  let guard = 0;
  while (cursor.getTime() <= now.getTime() && guard < 400) {
    if (freq === "DAILY") cursor.setUTCDate(cursor.getUTCDate() + interval);
    else if (freq === "WEEKLY")
      cursor.setUTCDate(cursor.getUTCDate() + 7 * interval);
    else if (freq === "MONTHLY")
      cursor.setUTCMonth(cursor.getUTCMonth() + interval);
    else return null;
    guard += 1;
  }
  if (cursor.getTime() <= now.getTime()) return null;
  return {
    startAt: cursor.toISOString(),
    endAt: duration
      ? new Date(cursor.getTime() + duration).toISOString()
      : null,
  };
}
