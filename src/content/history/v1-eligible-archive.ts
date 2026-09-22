import ledger from "../../../docs/history/v1-completion-ledger.json";

import type { HistoryEntrySummary } from "./types";

export const HISTORY_V1_SOURCE_ROWS = 332;
export const HISTORY_V1_UNIQUE_STORIES = 298;
export const HISTORY_V1_DUPLICATE_SOURCE_ROWS = 34;
export const HISTORY_V1_CURRENT_PUBLISHED = 9;

export const DUPLICATE_LEDGER_STATUS = "duplicate_linked_to_canonical";
export const RECURRING_LEDGER_STATUS = "unique_recurring_or_undated";

export type HistoryV1LedgerStatus =
  | "published"
  | "ready_for_publication"
  | "unique_canonical_queued"
  | "unique_unreviewed"
  | "unique_in_fact_check"
  | "unique_needs_research"
  | "unique_recurring_or_undated"
  | "duplicate_linked_to_canonical";

export type HistoryV1LedgerRow = {
  sourceId: string;
  sheet: string;
  row: number;
  title: string;
  eventDate: string;
  draftId: string;
  v1Status: HistoryV1LedgerStatus;
  clusterId: string | null;
  blocker: string | null;
  knownAnomalies: string[];
};

export type HistoryV1CompletionLedger = {
  workbookRows: number;
  uniqueStories: number;
  sourceRowsLinkedAsDuplicates: number;
  buckets: {
    uniqueStoriesPublished: number;
    uniqueStoriesReadyForPublication: number;
    uniqueStoriesCanonicalQueued: number;
    uniqueStoriesUnreviewed: number;
    uniqueStoriesInFactCheck: number;
    uniqueStoriesNeedingResearch: number;
    uniqueRecurringOrUndated: number;
    duplicateSourceRowsLinked: number;
  };
  rows: HistoryV1LedgerRow[];
};

export function getHistoryV1CompletionLedger(): HistoryV1CompletionLedger {
  return ledger as HistoryV1CompletionLedger;
}

export function isUniqueHistoryV1Story(row: HistoryV1LedgerRow) {
  return row.v1Status !== DUPLICATE_LEDGER_STATUS;
}

export function uniqueHistoryV1Rows(
  rows: readonly HistoryV1LedgerRow[] = getHistoryV1CompletionLedger().rows,
) {
  return rows.filter(isUniqueHistoryV1Story);
}

export function parseHistoryLedgerDate(eventDate: string) {
  if (!eventDate) return null;
  const iso = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    };
  }
  const numeric = eventDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (numeric) {
    return {
      year: Number(numeric[3]),
      month: Number(numeric[1]),
      day: Number(numeric[2]),
    };
  }
  return null;
}

function publishedHistoryId(draftId: string) {
  return draftId.replace(/^drafts\./, "");
}

function slugForLedgerRow(row: HistoryV1LedgerRow) {
  const slug = row.title
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `history-${row.sheet}-${row.row}`;
}

export function historySummaryFromLedgerRow(
  row: HistoryV1LedgerRow,
  options: { afterEditorialReview?: boolean } = {},
): HistoryEntrySummary {
  const afterReview = options.afterEditorialReview === true;
  const parts = parseHistoryLedgerDate(row.eventDate);
  const recurring = row.v1Status === RECURRING_LEDGER_STATUS;
  const verifiedGregorian = afterReview && Boolean(parts) && !recurring;

  return {
    _id: afterReview ? publishedHistoryId(row.draftId) : row.draftId,
    title: row.title,
    slug: slugForLedgerRow(row),
    excerpt: row.title,
    entryKind: recurring ? "recurringObservance" : "historicalEvent",
    historicalDate:
      verifiedGregorian && parts
        ? {
            calendarSystem: "gregorian",
            precision: "day",
            start: parts,
          }
        : parts
          ? {
              calendarSystem: "other",
              precision: "day",
              start: parts,
            }
          : {
              calendarSystem: "other",
              precision: "unknown",
            },
    topics: [],
    people: [],
    places: [],
    eras: [],
    organizations: [],
    geographicRegions: [],
  };
}

export function currentPublishedHistoryEntries() {
  return uniqueHistoryV1Rows()
    .filter((row) => row.v1Status === "published")
    .map((row) =>
      historySummaryFromLedgerRow(
        { ...row, draftId: publishedHistoryId(row.draftId) },
        {
          afterEditorialReview: true,
        },
      ),
    );
}

export function eligibleHistoryEntriesAfterReview() {
  return uniqueHistoryV1Rows().map((row) =>
    historySummaryFromLedgerRow(row, { afterEditorialReview: true }),
  );
}
