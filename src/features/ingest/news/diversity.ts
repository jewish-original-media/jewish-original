import { ingestCaps } from "../config";

export type DiversifiableNews = {
  publisher: string;
  publishedAt?: string;
  sourcePublishedAt?: string;
  desk?: string;
};

function timestamp(item: DiversifiableNews) {
  const value = Date.parse(item.publishedAt || item.sourcePublishedAt || "");
  return Number.isFinite(value) ? value : 0;
}

function compareFreshness(left: DiversifiableNews, right: DiversifiableNews) {
  const byTime = timestamp(right) - timestamp(left);
  if (byTime !== 0) return byTime;
  const byPublisher = left.publisher.localeCompare(right.publisher);
  if (byPublisher !== 0) return byPublisher;
  return (left.desk ?? "").localeCompare(right.desk ?? "");
}

export function selectHomepageNews<T extends DiversifiableNews>(
  items: readonly T[],
  options?: { limit?: number; maxPerPublisher?: number },
) {
  const caps = ingestCaps();
  const limit = options?.limit ?? caps.homepageNews;
  const maxPerPublisher =
    options?.maxPerPublisher ?? caps.homepageNewsPerPublisher;
  const ranked = [...items].sort(compareFreshness);
  const selected: T[] = [];
  const chosen = new Set<T>();
  const publisherCounts = new Map<string, number>();
  const desks = new Set<string>();

  const canTake = (item: T) => {
    if (chosen.has(item)) return false;
    return (publisherCounts.get(item.publisher) ?? 0) < maxPerPublisher;
  };

  const take = (item: T) => {
    if (!canTake(item)) return false;
    selected.push(item);
    chosen.add(item);
    publisherCounts.set(
      item.publisher,
      (publisherCounts.get(item.publisher) ?? 0) + 1,
    );
    if (item.desk) desks.add(item.desk);
    return selected.length >= limit;
  };

  const finish = () => selected.sort(compareFreshness);

  for (const item of ranked) {
    if (publisherCounts.has(item.publisher)) continue;
    if (item.desk && desks.has(item.desk)) continue;
    if (take(item)) return finish();
  }

  for (const item of ranked) {
    if (publisherCounts.has(item.publisher)) continue;
    if (take(item)) return finish();
  }

  for (const item of ranked) {
    if (!item.desk || desks.has(item.desk)) continue;
    if (take(item)) return finish();
  }

  for (const item of ranked) {
    if (take(item)) return finish();
  }

  return finish();
}
