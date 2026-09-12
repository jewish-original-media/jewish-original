import { ingestCaps } from "../config";

export type DiversifiableNews = {
  publisher: string;
  publishedAt?: string;
  sourcePublishedAt?: string;
};

export function selectHomepageNews<T extends DiversifiableNews>(
  items: readonly T[],
  options?: { limit?: number; maxPerPublisher?: number },
) {
  const caps = ingestCaps();
  const limit = options?.limit ?? caps.homepageNews;
  const maxPerPublisher =
    options?.maxPerPublisher ?? caps.homepageNewsPerPublisher;
  const counts = new Map<string, number>();
  const selected: T[] = [];

  const publishedAt = (item: DiversifiableNews) =>
    item.publishedAt || item.sourcePublishedAt || "";

  const ranked = [...items].sort(
    (left, right) =>
      Date.parse(publishedAt(right)) - Date.parse(publishedAt(left)),
  );

  for (const item of ranked) {
    const used = counts.get(item.publisher) ?? 0;
    if (used >= maxPerPublisher) continue;
    selected.push(item);
    counts.set(item.publisher, used + 1);
    if (selected.length >= limit) break;
  }

  return selected;
}
