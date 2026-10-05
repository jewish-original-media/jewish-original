export function firstSentence(
  value?: string,
  maxLength = 160,
): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  const sentence = trimmed.match(/^.+?[.!?](?:\s|$)/u)?.[0]?.trim() ?? trimmed;
  if (sentence.length <= maxLength) return sentence;

  return `${sentence.slice(0, maxLength - 1).trimEnd()}…`;
}

export function calendarHighlights(input: {
  holidays: Array<{ title: string; memo?: string; sourceHref?: string }>;
  observances: Array<{ title: string; memo?: string; sourceHref?: string }>;
  roshChodesh?: { title: string; memo?: string; sourceHref?: string };
  specialShabbat: Array<{
    title: string;
    memo?: string;
    sourceHref?: string;
  }>;
  omer?: { title: string; countEnglish?: string; sefira?: string };
}) {
  const items = [
    ...input.holidays,
    ...(input.roshChodesh ? [input.roshChodesh] : []),
    ...input.specialShabbat,
    ...input.observances,
  ].map((item) => ({
    title: item.title,
    memo: firstSentence(item.memo),
    sourceHref: item.sourceHref,
  }));

  if (input.omer) {
    items.push({
      title: input.omer.title,
      memo: [input.omer.countEnglish, input.omer.sefira]
        .filter(Boolean)
        .join(" · "),
      sourceHref: undefined,
    });
  }

  return items;
}

export function formatParashahDisplayTitle(title?: string) {
  if (!title) return undefined;
  return title.replace(/-/g, "–");
}

export function torahPortionLabel(readingKind?: "thisWeek" | "recent") {
  return readingKind === "recent"
    ? "Most recent Torah portion"
    : "This week in Torah";
}

export function sefariaPassageHref(reference: string) {
  const path = reference.trim().replace(/\s+/g, "_").replace(/:/g, ".");
  return `https://www.sefaria.org/${encodeURI(path)}?lang=bi`;
}

export function readingBookNames(readings: string[]) {
  return [
    ...new Set(
      readings
        .map((reading) => reading.match(/^(.+?)\s+\d/u)?.[1]?.trim())
        .filter((book): book is string => Boolean(book)),
    ),
  ];
}

export function torahReadingContext(readings: string[]) {
  const books = readingBookNames(readings);
  if (!books.length) return undefined;

  const source =
    books.length === 1
      ? books[0]
      : `${books.slice(0, -1).join(", ")} and ${books.at(-1)}`;
  return `The appointed Torah reading is drawn from ${source}. The chapter-and-verse links below open the source text with Hebrew and English.`;
}

export function hebcalSourceLabel(title: string) {
  return `Calendar notes for ${title} on Hebcal`;
}
