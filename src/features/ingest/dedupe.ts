import { ingestThresholds } from "./config";
import { jaccardSimilarity, normalizeTitle } from "./text";

export type DedupeRecord = {
  sourceId: string;
  canonicalUrl: string;
  normalizedUrl: string;
  normalizedTitle: string;
  sourcePublishedAt?: string;
};

export type DedupeHit = {
  kind: "canonical-url" | "normalized-url" | "publisher-title" | "fuzzy-title";
  against: string;
};

export function newsDedupeKey(record: DedupeRecord) {
  return {
    canonicalUrl: record.canonicalUrl,
    normalizedUrl: record.normalizedUrl,
    publisherTitle: `${record.sourceId}::${normalizeTitle(record.normalizedTitle)}`,
  };
}

export function findNewsDuplicate(
  candidate: DedupeRecord,
  existing: readonly DedupeRecord[],
  now = new Date(),
): DedupeHit | null {
  const thresholds = ingestThresholds();
  const keys = newsDedupeKey(candidate);

  for (const item of existing) {
    if (item.canonicalUrl === keys.canonicalUrl) {
      return { kind: "canonical-url", against: item.canonicalUrl };
    }
    if (item.normalizedUrl === keys.normalizedUrl) {
      return { kind: "normalized-url", against: item.normalizedUrl };
    }
    if (
      item.sourceId === candidate.sourceId &&
      normalizeTitle(item.normalizedTitle) ===
        normalizeTitle(candidate.normalizedTitle)
    ) {
      return { kind: "publisher-title", against: item.canonicalUrl };
    }
  }

  for (const item of existing) {
    if (item.sourceId !== candidate.sourceId) continue;
    if (
      jaccardSimilarity(candidate.normalizedTitle, item.normalizedTitle) <
      thresholds.newsFuzzyTitle
    ) {
      continue;
    }
    if (
      !withinHours(item.sourcePublishedAt, candidate.sourcePublishedAt, 36, now)
    ) {
      continue;
    }
    return { kind: "fuzzy-title", against: item.canonicalUrl };
  }

  return null;
}

export function findEventDuplicate(
  candidate: {
    sourceUid: string;
    canonicalUrl: string;
    organizer: string;
    title: string;
    startAt: string;
  },
  existing: readonly {
    sourceUid: string;
    canonicalUrl: string;
    organizer: string;
    title: string;
    startAt: string;
  }[],
) {
  for (const item of existing) {
    if (item.sourceUid && item.sourceUid === candidate.sourceUid) {
      return { kind: "source-uid" as const, against: item.sourceUid };
    }
    if (item.canonicalUrl && item.canonicalUrl === candidate.canonicalUrl) {
      return { kind: "canonical-url" as const, against: item.canonicalUrl };
    }
    if (
      normalizeTitle(item.organizer) === normalizeTitle(candidate.organizer) &&
      normalizeTitle(item.title) === normalizeTitle(candidate.title) &&
      minuteKey(item.startAt) === minuteKey(candidate.startAt)
    ) {
      return {
        kind: "organizer-title-start" as const,
        against: item.sourceUid || item.canonicalUrl,
      };
    }
  }
  return null;
}

function withinHours(
  left: string | undefined,
  right: string | undefined,
  hours: number,
  now: Date,
) {
  const a = left ? Date.parse(left) : Number.NaN;
  const b = right ? Date.parse(right) : now.getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= hours * 60 * 60 * 1000;
}

function minuteKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16);
}
