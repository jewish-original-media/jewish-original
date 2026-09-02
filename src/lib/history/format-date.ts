import type { HistoricalDate, ObservanceRule } from "@/content/history/types";

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatYear(year: number) {
  return year > 0 ? String(year) : `${1 - year} BCE`;
}

function formatPart(
  part: HistoricalDate["start"],
  precision: HistoricalDate["precision"],
) {
  if (!part || part.year === undefined) return "";
  const year = formatYear(part.year);
  if (precision === "year" || !part.month) return year;
  const month = monthNames[part.month] || "";
  if (precision === "month" || !part.day) return `${month} ${year}`;
  return `${month} ${part.day}, ${year}`;
}

export function formatHistoricalDate(
  date: HistoricalDate | undefined,
  entryKind?: string,
  observance?: ObservanceRule,
) {
  if (entryKind === "recurringObservance") {
    const nominal =
      observance?.nominalHebrewDay && observance.nominalHebrewMonth
        ? `${observance.nominalHebrewDay} ${observance.nominalHebrewMonth}`
        : "Hebrew-calendar observance";
    return `${nominal} · observed date may vary`;
  }
  if (date?.displayText) return date.displayText;
  if (!date || date.precision === "unknown") return "Date under review";

  const start = formatPart(date.start, date.precision);
  const end =
    date.precision === "range"
      ? formatPart(date.end, date.end?.day ? "day" : "year")
      : "";
  const qualified =
    date.qualifier === "circa"
      ? `c. ${start}`
      : date.qualifier === "before"
        ? `Before ${start}`
        : date.qualifier === "after"
          ? `After ${start}`
          : date.qualifier === "traditional"
            ? `${start} (traditional date)`
            : start;
  const value = end ? `${qualified}–${end}` : qualified;

  if (date.calendarSystem === "julian") return `${value} (Julian calendar)`;
  if (date.calendarSystem === "hebrew") return `${value} (Hebrew calendar)`;
  return value || "Date under review";
}
