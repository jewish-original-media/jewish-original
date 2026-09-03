export const HISTORY_CIVIL_TIMEZONE = "America/New_York";

export type HistoryDateCandidate = {
  entryKind?: string | null;
  workflowStatus?: string | null;
  published?: boolean;
  slug?: string | null;
  historicalDate?: {
    precision?: string | null;
    calendarSystem?: string | null;
    start?: {
      month?: number | null;
      day?: number | null;
      year?: number | null;
    } | null;
  } | null;
};

export function matchesOnThisDayHistory(
  entry: HistoryDateCandidate,
  month: number,
  day: number,
): boolean {
  if (entry.published === false) return false;
  if (entry.workflowStatus === "duplicateCandidate") return false;
  if (entry.workflowStatus && entry.workflowStatus !== "ready") return false;
  if (!entry.slug) return false;
  if (entry.entryKind === "recurringObservance") return false;

  const date = entry.historicalDate;
  if (!date) return false;
  if (date.precision !== "day") return false;
  if (date.calendarSystem !== "gregorian") return false;
  if (date.start?.month !== month || date.start.day !== day) return false;

  return true;
}

export function civilDateParts(
  instant = new Date(),
  timeZone = HISTORY_CIVIL_TIMEZONE,
): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(instant);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) {
    throw new Error("Unable to determine a civil date for History matching.");
  }

  return { year, month, day };
}

export function formatCivilDateLabel(parts: {
  year: number;
  month: number;
  day: number;
}) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parts.year, parts.month - 1, parts.day)));
}

export function isValidGregorianMonthDay(month: number, day: number) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const utc = new Date(Date.UTC(2024, month - 1, day));
  return utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}
