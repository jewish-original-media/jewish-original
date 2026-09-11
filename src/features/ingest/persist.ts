import type { SanityClient } from "@sanity/client";

import {
  buildApprovedSourceDocuments,
  buildCuratedNewsDocument,
  buildEventDocument,
  buildEventExceptionDocument,
  buildIngestRunDocument,
  buildNewsExceptionDocument,
  buildReceiptDocument,
} from "./documents";
import type {
  EventCandidate,
  EventDecision,
  EventExisting,
} from "./events/pipeline";
import type { IngestRunLog } from "./log";
import type {
  NewsCandidate,
  NewsDecision,
  NewsExistingIndex,
} from "./news/pipeline";
import { selectFirstEventBatch, selectFirstNewsBatch } from "./select";
import {
  assertIngestWriteBatch,
  type IngestWriteDocument,
} from "./write-scope";

export type PersistNewsOptions = {
  client: SanityClient;
  run: IngestRunLog;
  decisions: NewsDecision[];
  firstPublish?: boolean;
  now?: Date;
};

export type PersistEventsOptions = {
  client: SanityClient;
  run: IngestRunLog;
  decisions: EventDecision[];
  firstPublish?: boolean;
  now?: Date;
};

export async function loadNewsExistingIndex(
  client: SanityClient,
  now = new Date(),
): Promise<NewsExistingIndex> {
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
  const rows = await client.fetch<
    {
      sourceId: string;
      sourceUrl: string;
      normalizedUrl: string;
      headline: string;
      sourcePublishedAt: string;
      publishedToday: boolean;
    }[]
  >(
    `*[_type == "curatedNewsItem" && !(_id in path("drafts.**"))]{
      "sourceId": provenance.sourceId,
      "sourceUrl": sourceUrl,
      normalizedUrl,
      "headline": originalHeadline,
      sourcePublishedAt,
      "publishedToday": sourcePublishedAt >= $startOfDay
    }`,
    { startOfDay },
  );

  const publishedTodayBySource: Record<string, number> = {};
  for (const row of rows) {
    if (!row.publishedToday || !row.sourceId) continue;
    publishedTodayBySource[row.sourceId] =
      (publishedTodayBySource[row.sourceId] ?? 0) + 1;
  }

  return {
    items: rows.map((row) => ({
      sourceId: row.sourceId || "",
      canonicalUrl: row.sourceUrl,
      normalizedUrl: row.normalizedUrl,
      normalizedTitle: row.headline,
      sourcePublishedAt: row.sourcePublishedAt,
    })),
    publishedTodayBySource,
    publishedTodayGlobal: Object.values(publishedTodayBySource).reduce(
      (sum, count) => sum + count,
      0,
    ),
  };
}

export async function loadEventExisting(
  client: SanityClient,
): Promise<EventExisting[]> {
  return client.fetch<EventExisting[]>(
    `*[_type == "event" && !(_id in path("drafts.**"))]{
      sourceUid,
      "canonicalUrl": eventUrl,
      organizer,
      title,
      startAt
    }`,
  );
}

async function commitDocuments(
  client: SanityClient,
  documents: IngestWriteDocument[],
) {
  assertIngestWriteBatch(documents);
  if (documents.length === 0) return;
  const transaction = client.transaction();
  for (const document of documents) {
    transaction.createOrReplace(document);
  }
  await transaction.commit({ visibility: "async" });
}

export async function persistNewsRun(options: PersistNewsOptions) {
  const now = options.now ?? new Date();
  const publishCandidates = options.firstPublish
    ? selectFirstNewsBatch(options.decisions)
    : options.decisions
        .filter(
          (decision): decision is NewsDecision & { candidate: NewsCandidate } =>
            decision.action === "publish" && Boolean(decision.candidate),
        )
        .map((decision) => decision.candidate);

  const exceptions = options.decisions.filter(
    (decision) => decision.action === "exception",
  );

  const documents: IngestWriteDocument[] = [
    ...buildApprovedSourceDocuments(now),
    ...publishCandidates.map((candidate) =>
      buildCuratedNewsDocument(candidate, options.run.runId, now),
    ),
    ...exceptions.map((decision) => buildNewsExceptionDocument(decision, now)),
    ...publishCandidates.map((candidate) =>
      buildReceiptDocument({
        kind: "news",
        sourceId: candidate.sourceId,
        key: candidate.canonicalUrl,
        outcome: "published",
        reason: "gates-passed",
        now,
      }),
    ),
    buildIngestRunDocument(
      {
        ...options.run,
        write: true,
        dryRun: false,
        autoPublished: publishCandidates.length,
      },
      now,
    ),
  ];

  await commitDocuments(options.client, documents);
  return {
    published: publishCandidates,
    exceptions: exceptions.length,
    documents: documents.length,
  };
}

export async function persistEventsRun(options: PersistEventsOptions) {
  const now = options.now ?? new Date();
  const publishCandidates = options.firstPublish
    ? selectFirstEventBatch(options.decisions)
    : options.decisions
        .filter(
          (
            decision,
          ): decision is EventDecision & { candidate: EventCandidate } =>
            decision.action === "publish" && Boolean(decision.candidate),
        )
        .map((decision) => decision.candidate);

  const exceptions = options.decisions.filter(
    (decision) => decision.action === "exception",
  );

  const documents: IngestWriteDocument[] = [
    ...buildApprovedSourceDocuments(now),
    ...publishCandidates.map((candidate) =>
      buildEventDocument(candidate, options.run.runId, now),
    ),
    ...exceptions.map((decision) => buildEventExceptionDocument(decision, now)),
    ...publishCandidates.map((candidate) =>
      buildReceiptDocument({
        kind: "events",
        sourceId: candidate.sourceId,
        key: candidate.sourceUid,
        outcome: "published",
        reason: "gates-passed",
        now,
      }),
    ),
    buildIngestRunDocument(
      {
        ...options.run,
        write: true,
        dryRun: false,
        autoPublished: publishCandidates.length,
      },
      now,
    ),
  ];

  await commitDocuments(options.client, documents);
  return {
    published: publishCandidates,
    exceptions: exceptions.length,
    documents: documents.length,
  };
}
