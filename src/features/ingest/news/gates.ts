import { ingestThresholds, type NewsDesk } from "../config";
import { isNewsFresh, parsePublicationDate } from "../freshness";
import { detectPromptInjection } from "../injection";
import {
  headlineIsValid,
  isObviouslyIrrelevant,
  isOpinionSignal,
  isSensitiveSignal,
} from "../lexical";
import { isAllCapsSpam } from "../text";
import {
  canonicalizeUrl,
  hostAllowed,
  isIndexUrl,
  type CanonicalUrl,
} from "../url";
import type { NewsAiOutput } from "../ai/types";
import type { NewsSourceDefinition } from "./sources";

export type NewsGateDecision =
  | { action: "continue"; url: CanonicalUrl; published: Date }
  | { action: "skip"; reason: string }
  | { action: "exception"; reason: string };

export type NewsAiGateDecision =
  | { action: "continue" }
  | { action: "skip"; reason: string }
  | { action: "exception"; reason: string };

export function evaluateDeterministicNewsGates(input: {
  source: NewsSourceDefinition;
  headline: string;
  link: string;
  publishedAt: string | null;
  sourceText: string;
  now?: Date;
}): NewsGateDecision {
  if (!input.source.enabled)
    return { action: "skip", reason: "source-disabled" };

  const headline = input.headline.trim();
  if (!headlineIsValid(headline) || isAllCapsSpam(headline)) {
    return { action: "skip", reason: "invalid-headline" };
  }

  const url = canonicalizeUrl(input.link);
  if (!url) return { action: "exception", reason: "invalid-url" };
  if (!hostAllowed(url.host, input.source.hosts)) {
    return { action: "exception", reason: "host-not-allowlisted" };
  }
  if (isIndexUrl(url)) return { action: "skip", reason: "index-url" };

  const published = parsePublicationDate(input.publishedAt ?? undefined);
  if (!published) return { action: "exception", reason: "unparseable-date" };

  if (!isNewsFresh(published, input.source.defaultDesk, input.now)) {
    return { action: "skip", reason: "stale" };
  }

  const combined = `${headline}\n${input.sourceText}\n${url.href}`;
  if (detectPromptInjection(combined)) {
    return { action: "exception", reason: "prompt-injection" };
  }
  if (isOpinionSignal(headline, url.href)) {
    return { action: "exception", reason: "opinion" };
  }
  if (isSensitiveSignal(combined)) {
    return { action: "exception", reason: "sensitive" };
  }
  if (isObviouslyIrrelevant(combined)) {
    return { action: "skip", reason: "irrelevant-lexical" };
  }

  return { action: "continue", url, published };
}

export function evaluateNewsAiGates(input: {
  desk: NewsDesk;
  ai: NewsAiOutput;
  sourceText: string;
}): NewsAiGateDecision {
  const thresholds = ingestThresholds();
  if (input.ai.injection)
    return { action: "exception", reason: "injection-flag" };
  if (input.ai.sensitive) return { action: "exception", reason: "sensitive" };
  if (input.ai.opinion) return { action: "exception", reason: "opinion" };
  if (input.ai.requiresHuman)
    return { action: "exception", reason: "requires-human" };
  if (input.ai.relevance < thresholds.newsSkipRelevance) {
    return { action: "skip", reason: "low-relevance" };
  }
  if (input.ai.relevance < thresholds.newsRelevance) {
    return { action: "exception", reason: "low-confidence" };
  }
  if (input.ai.deskConfidence < thresholds.newsDeskConfidence) {
    return { action: "exception", reason: "low-desk-confidence" };
  }
  if (!input.ai.desk) return { action: "exception", reason: "missing-desk" };
  return { action: "continue" };
}
