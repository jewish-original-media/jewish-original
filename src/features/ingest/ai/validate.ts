import {
  EVENT_GEO_BUCKETS,
  INGEST_CONTEXT,
  NEWS_DESKS,
  type NewsDesk,
} from "../config";
import { contextLooksUnsafe, detectPromptInjection } from "../injection";
import { sentenceCount, twelveWordOverlap } from "../text";
import type { EventAiOutput, NewsAiOutput } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    typeof value === "string" &&
    value.trim() &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }
  return null;
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : null;
}

const DESK_ALIASES: Record<string, NewsDesk> = {
  "jewish-world": "jewish-world",
  "jewish world": "jewish-world",
  israel: "israel",
  culture: "culture",
  heritage: "heritage",
};

function asDesk(value: unknown) {
  const raw = asString(value)?.toLowerCase();
  return raw ? (DESK_ALIASES[raw] ?? null) : null;
}

export function parseJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```json\s*|\s*```$/g, "");
  const parsed: unknown = JSON.parse(trimmed);
  if (!isRecord(parsed)) throw new Error("not-object");
  return parsed;
}

export function validateNewsAiOutput(
  raw: unknown,
  sourceText = "",
): { ok: true; output: NewsAiOutput } | { ok: false; error: string } {
  if (!isRecord(raw)) return { ok: false, error: "schema-not-object" };

  const relevance = asNumber(raw.relevance);
  const deskConfidence = asNumber(raw.deskConfidence);
  const desk = asDesk(raw.desk);
  const context = asString(raw.context);
  const reason = asString(raw.reason) || "";
  const requiresHuman = asBoolean(raw.requiresHuman);
  const sensitive = asBoolean(raw.sensitive);
  const opinion = asBoolean(raw.opinion);
  const injection = asBoolean(raw.injection);
  const topics = Array.isArray(raw.topics)
    ? raw.topics
        .filter((topic): topic is string => typeof topic === "string")
        .slice(0, 3)
    : [];

  if (
    relevance === null ||
    deskConfidence === null ||
    !desk ||
    !context ||
    requiresHuman === null ||
    sensitive === null ||
    opinion === null ||
    injection === null
  ) {
    return { ok: false, error: "missing-fields" };
  }
  if (!NEWS_DESKS.includes(desk as NewsDesk)) {
    return { ok: false, error: "invalid-desk" };
  }
  if (
    relevance < 0 ||
    relevance > 1 ||
    deskConfidence < 0 ||
    deskConfidence > 1
  ) {
    return { ok: false, error: "score-range" };
  }
  if (
    context.length < INGEST_CONTEXT.minLength ||
    context.length > INGEST_CONTEXT.maxLength
  ) {
    return { ok: false, error: "context-length" };
  }
  if (sentenceCount(context) < 1 || sentenceCount(context) > 2) {
    return { ok: false, error: "context-sentences" };
  }
  if (
    !/\b(reports?|according to|says|said)\b/i.test(context) &&
    !/\b[A-Z]/.test(context)
  ) {
    return { ok: false, error: "context-voice" };
  }
  if (/\bwe (found|investigated|reported)\b/i.test(context)) {
    return { ok: false, error: "first-person-claim" };
  }
  if (contextLooksUnsafe(context) || detectPromptInjection(context)) {
    return { ok: false, error: "unsafe-context" };
  }
  if (sourceText && twelveWordOverlap(context, sourceText)) {
    return { ok: false, error: "excerpt-overlap" };
  }
  if (injection) return { ok: false, error: "injection-flag" };

  return {
    ok: true,
    output: {
      relevance,
      desk: desk as NewsDesk,
      deskConfidence,
      topics,
      context,
      requiresHuman,
      sensitive,
      opinion,
      injection,
      reason,
    },
  };
}

export function validateEventAiOutput(
  raw: unknown,
): { ok: true; output: EventAiOutput } | { ok: false; error: string } {
  if (!isRecord(raw)) return { ok: false, error: "schema-not-object" };
  const relevance = asNumber(raw.relevance);
  const context = asString(raw.context);
  const geoBucket = asString(raw.geoBucket);
  const category = asString(raw.category) || "program";
  const requiresHuman = asBoolean(raw.requiresHuman);
  const injection = asBoolean(raw.injection);
  const inventedFact = asBoolean(raw.inventedFact);
  const reason = asString(raw.reason) || "";

  if (
    relevance === null ||
    !context ||
    !geoBucket ||
    requiresHuman === null ||
    injection === null ||
    inventedFact === null
  ) {
    return { ok: false, error: "missing-fields" };
  }
  if (!EVENT_GEO_BUCKETS.includes(geoBucket as EventAiOutput["geoBucket"])) {
    return { ok: false, error: "invalid-geo" };
  }
  if (relevance < 0 || relevance > 1)
    return { ok: false, error: "score-range" };
  if (
    context.length < INGEST_CONTEXT.minLength ||
    context.length > INGEST_CONTEXT.maxLength
  ) {
    return { ok: false, error: "context-length" };
  }
  if (contextLooksUnsafe(context) || injection) {
    return { ok: false, error: "unsafe-context" };
  }

  return {
    ok: true,
    output: {
      relevance,
      category,
      geoBucket: geoBucket as EventAiOutput["geoBucket"],
      context,
      requiresHuman,
      injection,
      inventedFact,
      reason,
    },
  };
}
