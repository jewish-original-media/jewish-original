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
  holidays: Array<{ title: string; memo?: string }>;
  observances: Array<{ title: string; memo?: string }>;
  roshChodesh?: { title: string; memo?: string };
  specialShabbat: Array<{ title: string; memo?: string }>;
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
  }));

  if (input.omer) {
    items.push({
      title: input.omer.title,
      memo: [input.omer.countEnglish, input.omer.sefira]
        .filter(Boolean)
        .join(" · "),
    });
  }

  return items;
}

export function formatParashahDisplayTitle(title?: string) {
  if (!title) return undefined;
  return title.replace(/-/g, "–");
}
