import { randomUUID } from "node:crypto";

import {
  estimateCallUsd,
  classifyNewsItem,
  resolveAiProvider,
} from "../ai/provider";
import { ingestCaps } from "../config";
import { findNewsDuplicate, type DedupeRecord } from "../dedupe";
import { fetchSourceText } from "../fetch-source";
import { newsExpiresAt } from "../freshness";
import {
  emptySourceStats,
  logIngestRun,
  summarizeRun,
  type IngestSourceStats,
} from "../log";
import { parseRssFeed } from "../rss";
import { normalizeTitle } from "../text";
import { evaluateDeterministicNewsGates, evaluateNewsAiGates } from "./gates";
import {
  enabledNewsSources,
  JPOST_FAMILY_DAILY_CAP,
  JPOST_FAMILY_IDS,
  newsPublisherKey,
  type NewsSourceDefinition,
} from "./sources";

export type NewsExistingIndex = {
  items: DedupeRecord[];
  publishedTodayBySource: Record<string, number>;
  publishedTodayGlobal: number;
};

export type NewsCandidate = {
  sourceId: string;
  publisher: string;
  headline: string;
  canonicalUrl: string;
  normalizedUrl: string;
  sourcePublishedAt: string;
  desk: string;
  jomContext: string;
  topics: string[];
  expiresAt: string;
  relevance: number;
  deskConfidence: number;
};

export type NewsDecision = {
  action: "publish" | "exception" | "skip" | "needs-ai";
  reason: string;
  sourceId: string;
  headline: string;
  url?: string;
  candidate?: NewsCandidate;
};

export type NewsIngestOptions = {
  dryRun?: boolean;
  write?: boolean;
  now?: Date;
  existing?: NewsExistingIndex;
  sources?: readonly NewsSourceDefinition[];
  classify?: typeof classifyNewsItem;
};

export async function runNewsIngest(options: NewsIngestOptions = {}) {
  const now = options.now ?? new Date();
  const dryRun = options.dryRun !== false;
  const write = Boolean(options.write) && !dryRun;
  const provider = resolveAiProvider();
  const caps = ingestCaps();
  const existing = options.existing ?? {
    items: [],
    publishedTodayBySource: {},
    publishedTodayGlobal: 0,
  };
  const seen: DedupeRecord[] = [...existing.items];
  const publishedToday = { ...existing.publishedTodayBySource };
  let publishedGlobal = existing.publishedTodayGlobal;
  let familyJpost = JPOST_FAMILY_IDS.reduce(
    (sum, id) => sum + (publishedToday[id] ?? 0),
    0,
  );
  let aiCalls = 0;
  const decisions: NewsDecision[] = [];
  const sourceStats: IngestSourceStats[] = [];
  const started = Date.now();

  for (const source of options.sources ?? enabledNewsSources()) {
    const stats = emptySourceStats(source.id);
    const sourceStarted = Date.now();
    try {
      const fetched = await fetchSourceText(source.feedUrl);
      if (!fetched.ok) {
        stats.failures += 1;
        stats.error = fetched.error;
        sourceStats.push({ ...stats, durationMs: Date.now() - sourceStarted });
        continue;
      }

      const feed = parseRssFeed(fetched.text);
      stats.fetched = feed.items.length;
      let sourcePublished = 0;

      for (const item of feed.items) {
        const gated = evaluateDeterministicNewsGates({
          source,
          headline: item.title,
          link: item.link,
          publishedAt: item.publishedAt,
          sourceText: item.sourceText,
          now,
        });

        if (gated.action === "skip") {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: gated.reason,
            sourceId: source.id,
            headline: item.title,
            url: item.link,
          });
          continue;
        }
        if (gated.action === "exception") {
          stats.exceptions += 1;
          decisions.push({
            action: "exception",
            reason: gated.reason,
            sourceId: source.id,
            headline: item.title,
            url: item.link,
          });
          continue;
        }

        stats.normalized += 1;
        const record: DedupeRecord = {
          sourceId: source.id,
          canonicalUrl: gated.url.href,
          normalizedUrl: gated.url.normalized,
          normalizedTitle: normalizeTitle(item.title),
          sourcePublishedAt: gated.published.toISOString(),
        };
        const duplicate = findNewsDuplicate(record, seen, now);
        if (duplicate) {
          stats.duplicates += 1;
          decisions.push({
            action: "skip",
            reason: `duplicate:${duplicate.kind}`,
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }
        seen.push(record);

        if (!provider.ready) {
          stats.exceptions += 1;
          decisions.push({
            action: "needs-ai",
            reason: "ai-unconfigured",
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }
        if (aiCalls >= caps.newsAiCallsPerRun) {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: "ai-run-cap",
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }

        const classify = options.classify ?? classifyNewsItem;
        const ai = await classify({
          publisher: source.attributionLabel,
          headline: item.title,
          host: gated.url.host,
          publishedAt: gated.published.toISOString(),
          sourceText: item.sourceText,
          defaultDesk: source.defaultDesk,
        });
        aiCalls += 1;
        stats.aiCalls += 1;
        if (!ai.ok) {
          stats.exceptions += 1;
          decisions.push({
            action: "exception",
            reason: ai.error,
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }

        const aiGate = evaluateNewsAiGates({
          desk: ai.output.desk,
          ai: ai.output,
          sourceText: item.sourceText,
        });
        if (aiGate.action === "skip") {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: aiGate.reason,
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }
        if (aiGate.action === "exception") {
          stats.exceptions += 1;
          decisions.push({
            action: "exception",
            reason: aiGate.reason,
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }

        if (sourcePublished >= source.perRunCap) {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: "source-run-cap",
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }
        if ((publishedToday[source.id] ?? 0) >= source.dailyCap) {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: "source-daily-cap",
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }
        if (
          JPOST_FAMILY_IDS.includes(
            source.id as (typeof JPOST_FAMILY_IDS)[number],
          ) &&
          familyJpost >= JPOST_FAMILY_DAILY_CAP
        ) {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: "jpost-family-cap",
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }
        if (publishedGlobal >= caps.newsDailyGlobal) {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: "global-daily-cap",
            sourceId: source.id,
            headline: item.title,
            url: gated.url.href,
          });
          continue;
        }

        const candidate: NewsCandidate = {
          sourceId: source.id,
          publisher: newsPublisherKey(source),
          headline: item.title,
          canonicalUrl: gated.url.href,
          normalizedUrl: gated.url.normalized,
          sourcePublishedAt: gated.published.toISOString(),
          desk: ai.output.desk,
          jomContext: ai.output.context,
          topics: ai.output.topics,
          expiresAt: newsExpiresAt(gated.published).toISOString(),
          relevance: ai.output.relevance,
          deskConfidence: ai.output.deskConfidence,
        };
        stats.autoPublished += 1;
        sourcePublished += 1;
        publishedToday[source.id] = (publishedToday[source.id] ?? 0) + 1;
        publishedGlobal += 1;
        if (
          JPOST_FAMILY_IDS.includes(
            source.id as (typeof JPOST_FAMILY_IDS)[number],
          )
        ) {
          familyJpost += 1;
        }
        decisions.push({
          action: "publish",
          reason: "gates-passed",
          sourceId: source.id,
          headline: item.title,
          url: gated.url.href,
          candidate,
        });
      }
    } catch {
      stats.failures += 1;
      stats.error = "source-isolated-failure";
    }
    sourceStats.push({ ...stats, durationMs: Date.now() - sourceStarted });
  }

  const run = summarizeRun("news", randomUUID(), sourceStats, {
    dryRun,
    write,
    aiReady: provider.ready,
    estimatedUsd: aiCalls * estimateCallUsd(),
    durationMs: Date.now() - started,
  });
  logIngestRun(run);
  return { run, decisions, provider };
}
