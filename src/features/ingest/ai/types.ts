import type { NewsDesk } from "../config";
import type { EventGeoBucket } from "../config";

export const NEWS_AI_KEYS = [
  "relevance",
  "desk",
  "deskConfidence",
  "topics",
  "context",
  "requiresHuman",
  "sensitive",
  "opinion",
  "injection",
  "reason",
] as const;

export type NewsAiOutput = {
  relevance: number;
  desk: NewsDesk;
  deskConfidence: number;
  topics: string[];
  context: string;
  requiresHuman: boolean;
  sensitive: boolean;
  opinion: boolean;
  injection: boolean;
  reason: string;
};

export type EventAiOutput = {
  relevance: number;
  category: string;
  geoBucket: EventGeoBucket;
  context: string;
  requiresHuman: boolean;
  injection: boolean;
  inventedFact: boolean;
  reason: string;
};

export type AiProviderStatus =
  | { ready: true; provider: "gateway"; model: string; fallbackModel: string }
  | { ready: false; reason: "unconfigured" };

export type AiCallResult<T> =
  | {
      ok: true;
      output: T;
      model: string;
      usage?: { input: number; output: number };
    }
  | { ok: false; error: string };
