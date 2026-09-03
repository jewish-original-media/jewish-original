import type {
  JewishTodayCalendarEvent,
  JewishTodayDay,
  JewishTodayHoliday,
  JewishTodayHolidayKind,
  JewishTodayNamedEvent,
  JewishTodayOmer,
  JewishTodayParashah,
  OnThisDayHistoryEntry,
} from "../../features/jewish-today/types";
import {
  formatGregorianLabel,
  timezoneLabel,
  weekdayUtc,
} from "../../features/jewish-today/timezone";

import {
  HEBCAL_ATTRIBUTION,
  type HebcalCalendarResponse,
  type HebcalItem,
} from "./types";

const HDATE_PATTERN = /^(\d{1,2})\s+(.+?)\s+(\d{3,4})$/;

export function parseHdate(hdate: string): {
  day: number;
  month: string;
  year: number;
} | null {
  const match = HDATE_PATTERN.exec(hdate.trim());
  const day = match?.[1];
  const month = match?.[2];
  const year = match?.[3];
  if (!day || !month || !year) return null;

  return {
    day: Number(day),
    month,
    year: Number(year),
  };
}

function itemCivilDate(item: HebcalItem): string {
  return item.date.slice(0, 10);
}

function namedEvent(item: HebcalItem): JewishTodayNamedEvent {
  return {
    title: item.title,
    ...(item.hebrew ? { titleHebrew: item.hebrew } : {}),
    ...(item.memo ? { memo: item.memo } : {}),
  };
}

function holidayKind(item: HebcalItem): JewishTodayHolidayKind {
  if (
    item.subcat === "major" ||
    item.subcat === "minor" ||
    item.subcat === "modern" ||
    item.subcat === "fast"
  ) {
    return item.subcat;
  }

  return "other";
}

function toHoliday(item: HebcalItem): JewishTodayHoliday {
  return {
    ...namedEvent(item),
    kind: holidayKind(item),
    yomTov: item.yomtov === true,
  };
}

function parashahTitle(title: string): string {
  return title.replace(/^Parashat\s+/u, "").trim() || title;
}

function omerDay(item: HebcalItem): number | null {
  const fromOrig = item.title_orig?.match(/^Omer\s+(\d{1,2})$/u);
  if (fromOrig) return Number(fromOrig[1]);

  const fromTitle = item.title.match(
    /^(\d{1,2})(?:st|nd|rd|th)\s+day of the Omer$/u,
  );
  if (fromTitle) return Number(fromTitle[1]);

  return null;
}

function hebrewDateHebrew(item: HebcalItem): string | undefined {
  const parts = item.heDateParts;
  if (parts?.d && parts.m && parts.y) {
    return `${parts.d} ${parts.m} ${parts.y}`;
  }

  return item.hebrew;
}

export function emptyJewishTodayDay(
  gregorianDate: string,
  timeZone: string,
  onThisDay: OnThisDayHistoryEntry[] = [],
): JewishTodayDay {
  return {
    gregorianDate,
    gregorianLabel: formatGregorianLabel(gregorianDate),
    timezone: timeZone,
    timezoneLabel: timezoneLabel(timeZone),
    isShabbat: weekdayUtc(gregorianDate) === 6,
    holidays: [],
    observances: [],
    specialShabbat: [],
    calendarEvents: [],
    onThisDay,
    calendarStatus: "unavailable",
    attribution: HEBCAL_ATTRIBUTION,
  };
}

export function mapHebcalDay(
  gregorianDate: string,
  timeZone: string,
  response: HebcalCalendarResponse,
  onThisDay: OnThisDayHistoryEntry[] = [],
): JewishTodayDay {
  const items = response.items ?? [];
  const todayItems = items.filter(
    (item) => itemCivilDate(item) === gregorianDate,
  );
  const hebdate = todayItems.find((item) => item.category === "hebdate");
  const parsedHebrew = hebdate?.hdate ? parseHdate(hebdate.hdate) : null;
  const parashahItem = items.find((item) => item.category === "parashat");
  const omerItem = todayItems.find((item) => item.category === "omer");
  const roshChodeshItem = todayItems.find(
    (item) => item.category === "roshchodesh",
  );

  const holidays: JewishTodayHoliday[] = [];
  const observances: JewishTodayHoliday[] = [];
  const specialShabbat: JewishTodayNamedEvent[] = [];
  const calendarEvents: JewishTodayCalendarEvent[] = [];

  for (const item of todayItems) {
    if (
      item.category === "hebdate" ||
      item.category === "parashat" ||
      item.category === "omer"
    ) {
      continue;
    }

    if (item.category === "roshchodesh") {
      continue;
    }

    if (item.category === "holiday" && item.subcat === "shabbat") {
      specialShabbat.push(namedEvent(item));
      continue;
    }

    if (item.category === "holiday") {
      const holiday = toHoliday(item);
      if (holiday.kind === "major" || holiday.yomTov) {
        holidays.push(holiday);
      } else {
        observances.push(holiday);
      }
      continue;
    }

    calendarEvents.push({
      ...namedEvent(item),
      category: item.category,
    });
  }

  const omer = omerFromItem(omerItem);
  const parashah = parashahFromItem(parashahItem);
  const hebrewInHebrew = hebdate ? hebrewDateHebrew(hebdate) : undefined;

  return {
    gregorianDate,
    gregorianLabel: formatGregorianLabel(gregorianDate),
    timezone: timeZone,
    timezoneLabel: timezoneLabel(timeZone),
    ...(hebdate?.hdate ? { hebrewDate: hebdate.hdate } : {}),
    ...(hebrewInHebrew ? { hebrewDateHebrew: hebrewInHebrew } : {}),
    ...(parsedHebrew
      ? {
          hebrewYear: parsedHebrew.year,
          hebrewMonth: parsedHebrew.month,
          hebrewDay: parsedHebrew.day,
        }
      : {}),
    isShabbat: weekdayUtc(gregorianDate) === 6,
    ...(parashah ? { parashah } : {}),
    holidays,
    observances,
    ...(omer ? { omer } : {}),
    ...(roshChodeshItem ? { roshChodesh: namedEvent(roshChodeshItem) } : {}),
    specialShabbat,
    calendarEvents,
    onThisDay,
    calendarStatus: "ready",
    attribution: HEBCAL_ATTRIBUTION,
  };
}

function parashahFromItem(
  item: HebcalItem | undefined,
): JewishTodayParashah | undefined {
  if (!item) return undefined;

  return {
    title: parashahTitle(item.title),
    observedOn: itemCivilDate(item),
    ...(item.hebrew ? { titleHebrew: item.hebrew } : {}),
    ...(item.memo ? { memo: item.memo } : {}),
  };
}

function omerFromItem(
  item: HebcalItem | undefined,
): JewishTodayOmer | undefined {
  if (!item) return undefined;

  const day = omerDay(item);
  if (day === null) return undefined;

  return {
    day,
    title: item.title,
    ...(item.hebrew ? { titleHebrew: item.hebrew } : {}),
    ...(item.omer?.count?.en ? { countEnglish: item.omer.count.en } : {}),
    ...(item.omer?.sefira?.en ? { sefira: item.omer.sefira.en } : {}),
  };
}

export function isHebcalCalendarResponse(
  value: unknown,
): value is HebcalCalendarResponse {
  if (!value || typeof value !== "object") return false;

  const items = (value as { items?: unknown }).items;
  return items === undefined || Array.isArray(items);
}
