export const SAMPLE_ORIGINAL_SLUGS = new Set([
  "our-path-forward",
  "what-drives-us",
]);

export const SAMPLE_ORIGINAL_NOTICE =
  "Sample editorial content. Final essays coming soon.";

export function isSampleOriginal(slug: string) {
  return SAMPLE_ORIGINAL_SLUGS.has(slug);
}

export function formatOriginalDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(date);
}

export function authorLine(authors: readonly { name: string }[]) {
  return authors.map((author) => author.name).join(" and ");
}
