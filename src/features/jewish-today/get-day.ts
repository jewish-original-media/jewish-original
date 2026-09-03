import { fetchOnThisDayHistory } from "../../content/jewish-today/on-this-day";
import { fetchHebcalCalendar } from "../../integrations/hebcal/client";
import {
  emptyJewishTodayDay,
  isHebcalCalendarResponse,
  mapHebcalDay,
} from "../../integrations/hebcal/map-day";

import {
  JEWISH_TODAY_TIMEZONE,
  nextSaturdayInclusive,
  parseIsoDate,
  resolveCivilDate,
} from "./timezone";
import type { GetJewishTodayOptions, JewishTodayDay } from "./types";

export async function getJewishToday(
  options: GetJewishTodayOptions = {},
): Promise<JewishTodayDay> {
  const timeZone = options.timeZone ?? JEWISH_TODAY_TIMEZONE;
  const gregorianDate = resolveCivilDate(
    options.date,
    options.now ?? new Date(),
    timeZone,
  );
  const parsed = parseIsoDate(gregorianDate);
  const fetchOnThisDay = options.fetchOnThisDay ?? fetchOnThisDayHistory;
  const onThisDay = parsed
    ? await fetchOnThisDay(parsed.month, parsed.day).catch(() => [])
    : [];

  if (options.forceCalendarUnavailable) {
    return emptyJewishTodayDay(gregorianDate, timeZone, onThisDay);
  }

  try {
    const endDate = nextSaturdayInclusive(gregorianDate);
    const calendar = options.fetchCalendar
      ? await options.fetchCalendar(gregorianDate, endDate)
      : await fetchHebcalCalendar(gregorianDate, endDate);

    if (!isHebcalCalendarResponse(calendar)) {
      return emptyJewishTodayDay(gregorianDate, timeZone, onThisDay);
    }

    return mapHebcalDay(gregorianDate, timeZone, calendar, onThisDay);
  } catch {
    return emptyJewishTodayDay(gregorianDate, timeZone, onThisDay);
  }
}
