import { HEBCAL_ATTRIBUTION, type HebcalCalendarResponse } from "./types";

const HEBCAL_CALENDAR_URL = "https://www.hebcal.com/hebcal";
const REQUEST_TIMEOUT_MS = 8_000;

export const HEBCAL_REVALIDATE_SECONDS = 60 * 60;

export function buildHebcalCalendarUrl(
  startDate: string,
  endDate: string,
): string {
  const params = new URLSearchParams({
    v: "1",
    cfg: "json",
    maj: "on",
    min: "on",
    mod: "on",
    nx: "on",
    mf: "on",
    ss: "on",
    s: "on",
    o: "on",
    d: "on",
    leyning: "off",
    i: "off",
    c: "off",
    hdp: "1",
    start: startDate,
    end: endDate,
  });

  return `${HEBCAL_CALENDAR_URL}?${params.toString()}`;
}

export async function fetchHebcalCalendar(
  startDate: string,
  endDate: string,
): Promise<HebcalCalendarResponse> {
  const response = await fetch(buildHebcalCalendarUrl(startDate, endDate), {
    headers: {
      Accept: "application/json",
      "User-Agent": "JewishOriginalMedia/1.0 (+https://jewishoriginal.com)",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    next: {
      revalidate: HEBCAL_REVALIDATE_SECONDS,
      tags: ["jewish-today", `jewish-today:${startDate}`],
    },
  });

  if (!response.ok) {
    throw new Error(
      `Hebcal calendar request failed with HTTP ${response.status}.`,
    );
  }

  return (await response.json()) as HebcalCalendarResponse;
}

export { HEBCAL_ATTRIBUTION };
