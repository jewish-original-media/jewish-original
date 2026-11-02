import { cache } from "react";

import type { HistoryEntrySummary } from "@/content/history/types";

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
  previousSaturdayInclusive,
  resolveCivilDate,
} from "./timezone";
import type { GetJewishTodayOptions, JewishTodayDay } from "./types";

async function getPublishedOnThisDay(
  month: number,
  day: number,
): Promise<HistoryEntrySummary[]> {
  const { getOnThisDayHistory } = await import("@/content/history/fetch");
  return getOnThisDayHistory(false, month, day);
}

async function getPublishedTorahBrief(lookup: {
  canonicalTitle: string;
  observedOn: string;
  hebcalSourceHref?: string;
}) {
  const { getPublishedTorahPortionBrief } =
    await import("@/content/torah/fetch");
  return getPublishedTorahPortionBrief(lookup);
}

export const getJewishToday = cache(async function getJewishToday(
  options: GetJewishTodayOptions = {},
): Promise<JewishTodayDay> {
  const timeZone = options.timeZone ?? JEWISH_TODAY_TIMEZONE;
  const gregorianDate = resolveCivilDate(
    options.date,
    options.now ?? new Date(),
    timeZone,
  );
  const parsed = parseIsoDate(gregorianDate);
  const fetchOnThisDay = options.fetchOnThisDay ?? getPublishedOnThisDay;
  const onThisDay = parsed
    ? await fetchOnThisDay(parsed.month, parsed.day).catch(() => [])
    : [];

  if (options.forceCalendarUnavailable) {
    return emptyJewishTodayDay(gregorianDate, timeZone, onThisDay);
  }

  try {
    const startDate = previousSaturdayInclusive(gregorianDate);
    const endDate = nextSaturdayInclusive(gregorianDate);
    const calendar = options.fetchCalendar
      ? await options.fetchCalendar(startDate, endDate)
      : await fetchHebcalCalendar(startDate, endDate);

    if (!isHebcalCalendarResponse(calendar)) {
      return emptyJewishTodayDay(gregorianDate, timeZone, onThisDay);
    }

    const mappedDay = mapHebcalDay(
      gregorianDate,
      timeZone,
      calendar,
      onThisDay,
    );
    if (!mappedDay.parashah) return mappedDay;

    const fetchTorahPortionBrief =
      options.fetchTorahPortionBrief ?? getPublishedTorahBrief;
    const brief = await fetchTorahPortionBrief({
      canonicalTitle: mappedDay.parashah.title,
      observedOn: mappedDay.parashah.observedOn,
      hebcalSourceHref: mappedDay.parashah.sourceHref,
    }).catch(() => null);

    return brief
      ? {
          ...mappedDay,
          parashah: {
            ...mappedDay.parashah,
            brief,
          },
        }
      : mappedDay;
  } catch {
    return emptyJewishTodayDay(gregorianDate, timeZone, onThisDay);
  }
});
