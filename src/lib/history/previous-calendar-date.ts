export type GregorianMonthDay = {
  month: number;
  day: number;
};

function isValidMonthDay(date: GregorianMonthDay) {
  return (
    Number.isInteger(date.month) &&
    Number.isInteger(date.day) &&
    date.month >= 1 &&
    date.month <= 12 &&
    date.day >= 1 &&
    date.day <= 31
  );
}

export function selectPreviousCalendarDate(
  dates: GregorianMonthDay[],
  current: GregorianMonthDay,
) {
  const uniqueDates = Array.from(
    new Map(
      dates
        .filter(isValidMonthDay)
        .map((date) => [`${date.month}-${date.day}`, date]),
    ).values(),
  ).sort((left, right) => left.month - right.month || left.day - right.day);
  if (!uniqueDates.length) return null;

  return (
    [...uniqueDates]
      .reverse()
      .find(
        (date) =>
          date.month < current.month ||
          (date.month === current.month && date.day < current.day),
      ) ??
    uniqueDates.at(-1) ??
    null
  );
}
