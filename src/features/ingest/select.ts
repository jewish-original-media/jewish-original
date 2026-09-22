import { ingestCaps } from "./config";
import type { EventCandidate, EventDecision } from "./events/pipeline";
import type { NewsCandidate, NewsDecision } from "./news/pipeline";

const GENERIC_CONTEXT = [
  /this (article|story|piece|report|post) (discusses|covers|explores|highlights|examines)/i,
  /stay (informed|updated|tuned)/i,
  /in today'?s (news|headlines)/i,
  /click (here|through)/i,
  /it is important to note/i,
  /as (an? )?(ai|language model)/i,
  /readers should (know|understand) that this/i,
  /highlights (ongoing efforts|the intersection)/i,
  /according to reports\.?$/i,
];

export function contextLooksGeneric(context: string) {
  return GENERIC_CONTEXT.some((pattern) => pattern.test(context));
}

export function selectFirstNewsBatch(
  decisions: readonly NewsDecision[],
  options?: { limit?: number; maxPerPublisher?: number },
) {
  const caps = ingestCaps();
  const limit = options?.limit ?? caps.firstPublishNews;
  const maxPerPublisher = options?.maxPerPublisher ?? 2;
  const publishable = decisions
    .filter(
      (decision): decision is NewsDecision & { candidate: NewsCandidate } =>
        decision.action === "publish" && Boolean(decision.candidate),
    )
    .filter((decision) => !contextLooksGeneric(decision.candidate.jomContext))
    .sort((left, right) => {
      const leftScore =
        left.candidate.relevance * 0.6 + left.candidate.deskConfidence * 0.4;
      const rightScore =
        right.candidate.relevance * 0.6 + right.candidate.deskConfidence * 0.4;
      if (rightScore !== leftScore) return rightScore - leftScore;
      return (
        Date.parse(right.candidate.sourcePublishedAt) -
        Date.parse(left.candidate.sourcePublishedAt)
      );
    });

  const selected: NewsCandidate[] = [];
  const publishers = new Map<string, number>();
  const desks = new Set<string>();

  for (const decision of publishable) {
    const used = publishers.get(decision.candidate.publisher) ?? 0;
    if (used >= maxPerPublisher) continue;
    if (
      selected.length >= 4 &&
      desks.has(decision.candidate.desk) &&
      desks.size < 3
    ) {
      continue;
    }
    selected.push(decision.candidate);
    publishers.set(decision.candidate.publisher, used + 1);
    desks.add(decision.candidate.desk);
    if (selected.length >= limit) break;
  }

  return selected;
}

export function selectFirstEventBatch(
  decisions: readonly EventDecision[],
  options?: { limit?: number },
) {
  const caps = ingestCaps();
  const limit = options?.limit ?? caps.firstPublishEvents;
  return decisions
    .filter(
      (decision): decision is EventDecision & { candidate: EventCandidate } =>
        decision.action === "publish" && Boolean(decision.candidate),
    )
    .filter((decision) => !contextLooksGeneric(decision.candidate.jomContext))
    .map((decision) => decision.candidate)
    .slice(0, limit);
}

export function shouldShowHomepageNews(count: number) {
  return count >= 3;
}

export function shouldShowHomepageEvents(
  items: readonly { organizer: string; geoBucket?: string }[],
) {
  if (items.length < 2) return false;
  const geos = new Set(items.map((item) => item.geoBucket).filter(Boolean));
  const organizers = new Set(items.map((item) => item.organizer));
  return geos.size >= 2 && organizers.size >= 2;
}

export function newsNavEligible(items: readonly { publisher: string }[]) {
  const publishers = new Set(items.map((item) => item.publisher));
  return items.length >= 5 && publishers.size >= 3;
}
