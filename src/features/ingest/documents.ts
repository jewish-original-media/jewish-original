import { INGEST_WINDOWS } from "./config";
import type { EventCandidate } from "./events/pipeline";
import {
  EVENT_SOURCE_REGISTRY,
  type EventSourceDefinition,
} from "./events/sources";
import {
  eventDocumentId,
  exceptionDocumentId,
  ingestRunDocumentId,
  ingestSourceDocumentId,
  newsDocumentId,
  receiptDocumentId,
} from "./ids";
import type { IngestRunLog } from "./log";
import type { NewsCandidate, NewsDecision } from "./news/pipeline";
import {
  NEWS_SOURCE_REGISTRY,
  type NewsSourceDefinition,
} from "./news/sources";
import type { IngestWriteDocument } from "./write-scope";

function daysFromNow(days: number, now = new Date()) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function buildNewsSourceDocument(
  source: NewsSourceDefinition,
  extras?: { lastSuccessAt?: string; lastFetchedCount?: number },
): IngestWriteDocument {
  return {
    _id: ingestSourceDocumentId("news", source.id),
    _type: "ingestSource",
    name: source.name,
    kind: "news",
    sourceType: source.sourceType,
    feedUrl: source.feedUrl,
    canonicalSite: source.canonicalSite,
    attributionLabel: source.attributionLabel,
    enabled: source.enabled,
    defaultDesk: source.defaultDesk,
    perRunCap: source.perRunCap,
    dailyCap: source.dailyCap,
    hostAllowlist: [...source.hosts],
    notes: source.notes,
    lastSuccessAt: extras?.lastSuccessAt,
    lastFetchedCount: extras?.lastFetchedCount,
  };
}

export function buildEventSourceDocument(
  source: EventSourceDefinition,
  extras?: { lastSuccessAt?: string; lastFetchedCount?: number },
): IngestWriteDocument {
  return {
    _id: ingestSourceDocumentId("events", source.id),
    _type: "ingestSource",
    name: source.name,
    kind: "events",
    sourceType: source.sourceType,
    feedUrl: source.feedUrl,
    canonicalSite: source.canonicalSite,
    attributionLabel: source.attributionLabel,
    enabled: source.enabled,
    perRunCap: source.perRunCap,
    hostAllowlist: [...source.hosts],
    notes: source.notes,
    lastSuccessAt: extras?.lastSuccessAt,
    lastFetchedCount: extras?.lastFetchedCount,
  };
}

export function buildApprovedSourceDocuments(now = new Date()) {
  const fetchedAt = now.toISOString();
  return [
    ...NEWS_SOURCE_REGISTRY.map((source) =>
      buildNewsSourceDocument(source, { lastSuccessAt: fetchedAt }),
    ),
    ...EVENT_SOURCE_REGISTRY.map((source) =>
      buildEventSourceDocument(source, { lastSuccessAt: fetchedAt }),
    ),
  ];
}

export function buildCuratedNewsDocument(
  candidate: NewsCandidate,
  runId: string,
  now = new Date(),
): IngestWriteDocument {
  return {
    _id: newsDocumentId(candidate.sourceId, candidate.canonicalUrl),
    _type: "curatedNewsItem",
    publisherName: candidate.publisher,
    ingestSource: {
      _type: "reference",
      _ref: ingestSourceDocumentId("news", candidate.sourceId),
    },
    originalHeadline: candidate.headline,
    sourceUrl: candidate.canonicalUrl,
    normalizedUrl: candidate.normalizedUrl,
    sourcePublishedAt: candidate.sourcePublishedAt,
    jomContext: candidate.jomContext,
    desk: candidate.desk,
    topics: candidate.topics,
    status: "published",
    expiresAt: candidate.expiresAt,
    provenance: {
      sourceId: candidate.sourceId,
      fetchedAt: now.toISOString(),
    },
    ingest: {
      runId,
      model: candidate.model,
      relevance: candidate.relevance,
      deskConfidence: candidate.deskConfidence,
    },
  };
}

export function buildEventDocument(
  candidate: EventCandidate,
  runId: string,
  now = new Date(),
): IngestWriteDocument {
  return {
    _id: eventDocumentId(candidate.sourceId, candidate.sourceUid),
    _type: "event",
    title: candidate.title,
    organizer: candidate.organizer,
    eventUrl: candidate.eventUrl,
    sourceUid: candidate.sourceUid,
    startAt: candidate.startAt,
    endAt: candidate.endAt,
    timezone: candidate.timezone,
    attendanceMode: candidate.attendanceMode,
    venueName: candidate.venueName,
    city: candidate.city,
    region: candidate.region,
    country: candidate.country,
    geoBucket: candidate.geoBucket,
    onlineUrl: candidate.onlineUrl,
    jomContext: candidate.jomContext,
    eventStatus: "scheduled",
    status: "published",
    expiresAt: candidate.expiresAt,
    ingestSource: {
      _type: "reference",
      _ref: ingestSourceDocumentId("events", candidate.sourceId),
    },
    provenance: {
      sourceId: candidate.sourceId,
      fetchedAt: now.toISOString(),
      runId,
    },
  };
}

export function buildNewsExceptionDocument(
  decision: Pick<NewsDecision, "sourceId" | "headline" | "url" | "reason">,
  now = new Date(),
): IngestWriteDocument {
  const key = `${decision.sourceId}:${decision.url || decision.headline}`;
  return {
    _id: exceptionDocumentId("news", key),
    _type: "ingestException",
    kind: "news",
    sourceId: decision.sourceId,
    headline: decision.headline,
    url: decision.url,
    reason: decision.reason,
    status: "open",
    expiresAt: daysFromNow(INGEST_WINDOWS.exceptionDays, now),
  };
}

export function buildEventExceptionDocument(
  decision: {
    sourceId: string;
    title: string;
    url?: string;
    reason: string;
  },
  now = new Date(),
): IngestWriteDocument {
  const key = `${decision.sourceId}:${decision.url || decision.title}`;
  return {
    _id: exceptionDocumentId("events", key),
    _type: "ingestException",
    kind: "events",
    sourceId: decision.sourceId,
    headline: decision.title,
    url: decision.url,
    reason: decision.reason,
    status: "open",
    expiresAt: daysFromNow(INGEST_WINDOWS.exceptionDays, now),
  };
}

export function buildReceiptDocument(input: {
  kind: "news" | "events";
  sourceId: string;
  key: string;
  outcome: string;
  reason: string;
  now?: Date;
}): IngestWriteDocument {
  const now = input.now ?? new Date();
  return {
    _id: receiptDocumentId(input.kind, input.key),
    _type: "ingestReceipt",
    kind: input.kind,
    sourceId: input.sourceId,
    key: input.key,
    outcome: input.outcome,
    reason: input.reason,
    expiresAt: daysFromNow(INGEST_WINDOWS.receiptDays, now),
  };
}

export function buildIngestRunDocument(
  run: IngestRunLog,
  now = new Date(),
): IngestWriteDocument {
  return {
    _id: ingestRunDocumentId(run.runId),
    _type: "ingestRun",
    job: run.job,
    runId: run.runId,
    dryRun: run.dryRun,
    aiReady: run.aiReady,
    fetched: run.fetched,
    autoPublished: run.autoPublished,
    exceptions: run.exceptions,
    duplicates: run.duplicates,
    aiCalls: run.aiCalls,
    estimatedUsd: run.estimatedUsd,
    finishedAt: now.toISOString(),
  };
}
