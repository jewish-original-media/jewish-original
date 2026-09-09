export const NEWS_DESKS = [
  "jewish-world",
  "israel",
  "culture",
  "heritage",
] as const;

export type NewsDesk = (typeof NEWS_DESKS)[number];

export const NEWS_DESK_LABELS: Record<NewsDesk, string> = {
  "jewish-world": "Jewish World",
  israel: "Israel",
  culture: "Culture",
  heritage: "Heritage",
};

export const EVENT_GEO_BUCKETS = [
  "online",
  "israel",
  "united-states",
  "international",
] as const;

export type EventGeoBucket = (typeof EVENT_GEO_BUCKETS)[number];

export const INGEST_THRESHOLDS = {
  newsRelevance: 0.78,
  newsDeskConfidence: 0.72,
  newsSkipRelevance: 0.45,
  newsFuzzyTitle: 0.86,
  eventRelevance: 0.8,
  eventDeskConfidence: 0.72,
} as const;

export const INGEST_WINDOWS = {
  newsFreshHours: 36,
  heritageFreshHours: 24 * 7,
  homepageNewsDays: 7,
  newsIndexDays: 14,
  newsExpiresDays: 14,
  receiptDays: 30,
  exceptionDays: 14,
  eventHorizonDays: 90,
  homepageEventMin: 2,
} as const;

export const INGEST_CAPS = {
  homepageNews: 5,
  homepageNewsPrefer: 3,
  homepageNewsPerPublisher: 2,
  homepageEvents: 3,
  newsDailyGlobal: 18,
  newsAiCallsPerRun: 24,
  eventsAiCallsPerRun: 12,
  firstPublishNews: 10,
  firstPublishEvents: 10,
} as const;

export const INGEST_BUDGET = {
  warningUsd: 10,
  hardUsd: 20,
  targetUsd: 5,
  estimatedTokensPerCall: 900,
} as const;

export const INGEST_FETCH = {
  timeoutMs: 10_000,
  userAgent:
    "JewishOriginalMedia/1.0 (editorial ingest; +https://jewishoriginal.com)",
} as const;

export const INGEST_CONTEXT = {
  minLength: 40,
  maxLength: 320,
  sourceTextMax: 400,
} as const;

export const DEFAULT_AI_PROVIDER = "gateway" as const;
export const DEFAULT_AI_MODEL = "openai/gpt-4.1-nano";
export const FALLBACK_AI_MODEL = "openai/gpt-4o-mini";

export function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function ingestThresholds() {
  return {
    newsRelevance: readNumberEnv(
      "NEWS_RELEVANCE_THRESHOLD",
      INGEST_THRESHOLDS.newsRelevance,
    ),
    newsDeskConfidence: readNumberEnv(
      "NEWS_DESK_CONFIDENCE_THRESHOLD",
      INGEST_THRESHOLDS.newsDeskConfidence,
    ),
    newsSkipRelevance: readNumberEnv(
      "NEWS_SKIP_RELEVANCE_THRESHOLD",
      INGEST_THRESHOLDS.newsSkipRelevance,
    ),
    newsFuzzyTitle: readNumberEnv(
      "NEWS_FUZZY_TITLE_THRESHOLD",
      INGEST_THRESHOLDS.newsFuzzyTitle,
    ),
    eventRelevance: readNumberEnv(
      "EVENT_RELEVANCE_THRESHOLD",
      INGEST_THRESHOLDS.eventRelevance,
    ),
  };
}

export function ingestCaps() {
  return {
    ...INGEST_CAPS,
    newsDailyGlobal: readNumberEnv(
      "NEWS_DAILY_GLOBAL_CAP",
      INGEST_CAPS.newsDailyGlobal,
    ),
    newsAiCallsPerRun: readNumberEnv(
      "NEWS_AI_MAX_CALLS_PER_RUN",
      INGEST_CAPS.newsAiCallsPerRun,
    ),
    eventsAiCallsPerRun: readNumberEnv(
      "EVENTS_AI_MAX_CALLS_PER_RUN",
      INGEST_CAPS.eventsAiCallsPerRun,
    ),
    homepageNewsPerPublisher: readNumberEnv(
      "NEWS_HOMEPAGE_PER_PUBLISHER",
      INGEST_CAPS.homepageNewsPerPublisher,
    ),
  };
}
