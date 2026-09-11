import { randomUUID } from "node:crypto";

import {
  classifyEventItem,
  estimateCallUsd,
  resolveAiProvider,
} from "../ai/provider";
import { ingestCaps } from "../config";
import { findEventDuplicate } from "../dedupe";
import { eventExpiresAt } from "../freshness";
import { fetchSourceText } from "../fetch-source";
import { nextRruleInstance, parseIcsEvents } from "../ics";
import {
  emptySourceStats,
  logIngestRun,
  summarizeRun,
  type IngestSourceStats,
} from "../log";
import { evaluateDeterministicEventGates, evaluateEventAiGates } from "./gates";
import { enabledEventSources, type EventSourceDefinition } from "./sources";

export type EventExisting = {
  sourceUid: string;
  canonicalUrl: string;
  organizer: string;
  title: string;
  startAt: string;
};

export type EventCandidate = {
  sourceId: string;
  title: string;
  organizer: string;
  eventUrl: string;
  sourceUid: string;
  startAt: string;
  endAt: string | null;
  timezone: string;
  attendanceMode: "online" | "in-person" | "hybrid";
  venueName: string;
  city?: string;
  region?: string;
  country?: string;
  geoBucket: string;
  onlineUrl?: string;
  jomContext: string;
  expiresAt: string;
  model?: string;
};

export type EventDecision = {
  action: "publish" | "exception" | "skip" | "needs-ai";
  reason: string;
  sourceId: string;
  title: string;
  url?: string;
  candidate?: EventCandidate;
};

export type EventIngestOptions = {
  dryRun?: boolean;
  write?: boolean;
  now?: Date;
  existing?: EventExisting[];
  sources?: readonly EventSourceDefinition[];
  classify?: typeof classifyEventItem;
};

export async function runEventsIngest(options: EventIngestOptions = {}) {
  const now = options.now ?? new Date();
  const dryRun = options.dryRun !== false;
  const write = Boolean(options.write) && !dryRun;
  const provider = resolveAiProvider();
  const caps = ingestCaps();
  const seen = [...(options.existing ?? [])];
  let aiCalls = 0;
  const decisions: EventDecision[] = [];
  const sourceStats: IngestSourceStats[] = [];
  const started = Date.now();

  for (const source of options.sources ?? enabledEventSources()) {
    const stats = emptySourceStats(source.id);
    const sourceStarted = Date.now();
    if (!source.feedUrl) {
      sourceStats.push(stats);
      continue;
    }
    try {
      const fetched = await fetchSourceText(source.feedUrl);
      if (!fetched.ok) {
        stats.failures += 1;
        stats.error = fetched.error;
        sourceStats.push({ ...stats, durationMs: Date.now() - sourceStarted });
        continue;
      }

      const events = parseIcsEvents(fetched.text);
      stats.fetched = events.length;
      let sourcePublished = 0;

      for (const event of events) {
        const next = nextRruleInstance(event, now);
        const startAt = next?.startAt ?? event.startAt;
        const endAt = next?.endAt ?? event.endAt;
        const gated = evaluateDeterministicEventGates({
          source,
          title: event.title,
          url: event.url || source.canonicalSite,
          uid: event.uid,
          startAt,
          timezone: event.timezone,
          location: event.location,
          description: event.description,
          status: event.status,
          now,
        });

        if (gated.action === "skip") {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: gated.reason,
            sourceId: source.id,
            title: event.title,
            url: event.url,
          });
          continue;
        }
        if (gated.action === "exception") {
          stats.exceptions += 1;
          decisions.push({
            action: "exception",
            reason: gated.reason,
            sourceId: source.id,
            title: event.title,
            url: event.url,
          });
          continue;
        }

        stats.normalized += 1;
        const duplicate = findEventDuplicate(
          {
            sourceUid: event.uid,
            canonicalUrl: gated.url.href,
            organizer: source.defaultOrganizer,
            title: event.title,
            startAt: gated.start.toISOString(),
          },
          seen,
        );
        if (duplicate) {
          stats.duplicates += 1;
          decisions.push({
            action: "skip",
            reason: `duplicate:${duplicate.kind}`,
            sourceId: source.id,
            title: event.title,
            url: gated.url.href,
          });
          continue;
        }
        seen.push({
          sourceUid: event.uid,
          canonicalUrl: gated.url.href,
          organizer: source.defaultOrganizer,
          title: event.title,
          startAt: gated.start.toISOString(),
        });

        if (!provider.ready) {
          stats.exceptions += 1;
          decisions.push({
            action: "needs-ai",
            reason: "ai-unconfigured",
            sourceId: source.id,
            title: event.title,
            url: gated.url.href,
          });
          continue;
        }
        if (aiCalls >= caps.eventsAiCallsPerRun) {
          stats.skipped += 1;
          decisions.push({
            action: "skip",
            reason: "ai-run-cap",
            sourceId: source.id,
            title: event.title,
            url: gated.url.href,
          });
          continue;
        }

        const classify = options.classify ?? classifyEventItem;
        const ai = await classify({
          title: event.title,
          organizer: source.defaultOrganizer,
          location: event.location,
          startAt: gated.start.toISOString(),
          timezone: event.timezone || "UTC",
          sourceText: event.description,
        });
        aiCalls += 1;
        stats.aiCalls += 1;
        if (!ai.ok) {
          stats.exceptions += 1;
          decisions.push({
            action: "exception",
            reason: ai.error,
            sourceId: source.id,
            title: event.title,
            url: gated.url.href,
          });
          continue;
        }
        const aiGate = evaluateEventAiGates(ai.output);
        if (aiGate.action !== "continue") {
          if (aiGate.action === "skip") stats.skipped += 1;
          else stats.exceptions += 1;
          decisions.push({
            action: aiGate.action,
            reason: aiGate.reason,
            sourceId: source.id,
            title: event.title,
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
            title: event.title,
            url: gated.url.href,
          });
          continue;
        }

        const candidate: EventCandidate = {
          sourceId: source.id,
          title: event.title,
          organizer: source.defaultOrganizer,
          eventUrl: gated.url.href,
          sourceUid: event.uid,
          startAt: gated.start.toISOString(),
          endAt: endAt,
          timezone: event.timezone || "UTC",
          attendanceMode: gated.attendance,
          venueName: gated.attendance === "online" ? "" : event.location,
          country: source.defaultCountry,
          geoBucket:
            gated.attendance === "online" ? "online" : ai.output.geoBucket,
          onlineUrl:
            gated.attendance === "in-person" ? undefined : gated.url.href,
          jomContext: ai.output.context,
          model: ai.model,
          expiresAt: eventExpiresAt(
            gated.start,
            endAt ? new Date(endAt) : null,
          ).toISOString(),
        };
        stats.autoPublished += 1;
        sourcePublished += 1;
        decisions.push({
          action: "publish",
          reason: "gates-passed",
          sourceId: source.id,
          title: event.title,
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

  const run = summarizeRun("events", randomUUID(), sourceStats, {
    dryRun,
    write,
    aiReady: provider.ready,
    estimatedUsd: aiCalls * estimateCallUsd(),
    durationMs: Date.now() - started,
  });
  logIngestRun(run);
  return { run, decisions, provider };
}
