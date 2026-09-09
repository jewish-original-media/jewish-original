import type { HistoryEntrySummary } from "@/content/history/types";

export type JewishTodayCalendarStatus = "ready" | "unavailable";

export type JewishTodayHolidayKind =
  "major" | "minor" | "modern" | "fast" | "other";

export type JewishTodayNamedEvent = {
  title: string;
  titleHebrew?: string;
  memo?: string;
};

export type JewishTodayHoliday = JewishTodayNamedEvent & {
  kind: JewishTodayHolidayKind;
  yomTov: boolean;
};

export type TorahReadingKind = "thisWeek" | "recent";

export type JewishTodayParashah = JewishTodayNamedEvent & {
  observedOn: string;
  readingKind: TorahReadingKind;
};

export type JewishTodayFestivalShabbat = JewishTodayNamedEvent & {
  observedOn: string;
};

export type JewishTodayOmer = {
  day: number;
  title: string;
  titleHebrew?: string;
  countEnglish?: string;
  sefira?: string;
};

export type JewishTodayCalendarEvent = JewishTodayNamedEvent & {
  category: string;
};

export type OnThisDayTopic = {
  name: string;
  slug: string;
};

export type OnThisDayHistoryEntry = HistoryEntrySummary;

export type JewishTodayDay = {
  gregorianDate: string;
  gregorianLabel: string;
  timezone: string;
  timezoneLabel: string;
  hebrewDate?: string;
  hebrewDateHebrew?: string;
  hebrewYear?: number;
  hebrewMonth?: string;
  hebrewDay?: number;
  isShabbat: boolean;
  parashah?: JewishTodayParashah;
  festivalShabbat?: JewishTodayFestivalShabbat;
  holidays: JewishTodayHoliday[];
  observances: JewishTodayHoliday[];
  omer?: JewishTodayOmer;
  roshChodesh?: JewishTodayNamedEvent;
  specialShabbat: JewishTodayNamedEvent[];
  calendarEvents: JewishTodayCalendarEvent[];
  onThisDay: HistoryEntrySummary[];
  calendarStatus: JewishTodayCalendarStatus;
  attribution: {
    provider: "hebcal";
    label: string;
    href: string;
  };
};

export type GetJewishTodayOptions = {
  now?: Date;
  date?: string;
  timeZone?: string;
  forceCalendarUnavailable?: boolean;
  fetchCalendar?: (startDate: string, endDate: string) => Promise<unknown>;
  fetchOnThisDay?: (
    month: number,
    day: number,
  ) => Promise<HistoryEntrySummary[]>;
};
