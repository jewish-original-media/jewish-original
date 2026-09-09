import { ingestThresholds } from "../config";
import { isUpcomingEvent } from "../freshness";
import { detectPromptInjection } from "../injection";
import { isDeniedEvent, isSensitiveSignal } from "../lexical";
import { canonicalizeUrl, hostAllowed } from "../url";
import { isValidIanaTimeZone } from "../ics";
import type { EventAiOutput } from "../ai/types";
import type { EventSourceDefinition } from "./sources";

export type EventAttendance = "online" | "in-person" | "hybrid";

export function deriveAttendance(
  location: string,
  url: string,
): EventAttendance | null {
  const haystack = `${location} ${url}`.toLowerCase();
  const online = /online|virtual|webinar|zoom|teams\.microsoft|livestream/.test(
    haystack,
  );
  const inPerson = Boolean(location.trim()) && !online;
  if (
    online &&
    location.trim() &&
    !/online|virtual|webinar/.test(location.toLowerCase())
  ) {
    return "hybrid";
  }
  if (online) return "online";
  if (inPerson) return "in-person";
  return null;
}

export type EventGateDecision =
  | {
      action: "continue";
      url: NonNullable<ReturnType<typeof canonicalizeUrl>>;
      start: Date;
      attendance: EventAttendance;
    }
  | { action: "skip"; reason: string }
  | { action: "exception"; reason: string };

export function evaluateDeterministicEventGates(input: {
  source: EventSourceDefinition;
  title: string;
  url: string;
  uid: string;
  startAt: string | null;
  timezone: string | null;
  location: string;
  description: string;
  status: string;
  now?: Date;
}): EventGateDecision {
  if (!input.source.enabled)
    return { action: "skip" as const, reason: "source-disabled" };
  if (input.status === "cancelled") {
    return { action: "skip" as const, reason: "cancelled" };
  }
  if (!input.uid)
    return { action: "exception" as const, reason: "missing-uid" };
  if (!input.title.trim() || input.title.trim().length < 4) {
    return { action: "exception" as const, reason: "invalid-title" };
  }
  if (!input.startAt)
    return { action: "exception" as const, reason: "missing-start" };
  const start = new Date(input.startAt);
  if (Number.isNaN(start.getTime())) {
    return { action: "exception" as const, reason: "unparseable-start" };
  }
  if (!input.timezone || !isValidIanaTimeZone(input.timezone)) {
    return { action: "exception" as const, reason: "missing-timezone" };
  }
  if (!isUpcomingEvent(start, input.now)) {
    return { action: "skip" as const, reason: "not-upcoming" };
  }

  const url = canonicalizeUrl(input.url);
  if (!url) return { action: "exception" as const, reason: "missing-url" };
  if (input.source.hosts.length && !hostAllowed(url.host, input.source.hosts)) {
    return { action: "exception" as const, reason: "host-not-allowlisted" };
  }

  const combined = `${input.title}\n${input.location}\n${input.description}`;
  if (detectPromptInjection(combined)) {
    return { action: "exception" as const, reason: "prompt-injection" };
  }
  if (isDeniedEvent(combined)) {
    return { action: "skip" as const, reason: "denied-event-type" };
  }
  if (isSensitiveSignal(combined)) {
    return { action: "exception" as const, reason: "sensitive" };
  }

  const attendance = deriveAttendance(input.location, url.href);
  if (!attendance) {
    return { action: "exception" as const, reason: "ambiguous-attendance" };
  }

  return { action: "continue" as const, url, start, attendance };
}

export function evaluateEventAiGates(ai: EventAiOutput) {
  const thresholds = ingestThresholds();
  if (ai.injection)
    return { action: "exception" as const, reason: "injection-flag" };
  if (ai.inventedFact)
    return { action: "exception" as const, reason: "invented-fact" };
  if (ai.requiresHuman)
    return { action: "exception" as const, reason: "requires-human" };
  if (ai.relevance < thresholds.eventRelevance) {
    return { action: "skip" as const, reason: "low-relevance" };
  }
  return { action: "continue" as const };
}
