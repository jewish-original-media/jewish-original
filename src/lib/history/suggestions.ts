import type { HistoryArchiveFacets } from "@/content/history/types";

export const HISTORY_SUGGESTION_LIMIT = 6;

export type HistorySuggestionKind = "topic" | "person" | "place" | "region";

export type HistorySuggestion = {
  kind: HistorySuggestionKind;
  name: string;
  slug: string;
};

const KIND_ORDER: HistorySuggestionKind[] = [
  "topic",
  "person",
  "place",
  "region",
];

export const HISTORY_SUGGESTION_LABELS: Record<HistorySuggestionKind, string> =
  {
    topic: "Topic",
    person: "Person",
    place: "Place",
    region: "Region",
  };

function scoreName(name: string, needle: string) {
  if (name === needle) return 4;
  if (name.startsWith(needle)) return 3;
  if (name.includes(` ${needle}`)) return 2;
  if (name.includes(needle)) return 1;
  return 0;
}

export function suggestHistoryArchiveTerms(
  query: string,
  facets: HistoryArchiveFacets,
  limit = HISTORY_SUGGESTION_LIMIT,
): HistorySuggestion[] {
  const needle = query.trim().toLocaleLowerCase("en");
  if (needle.length < 1) return [];

  const pools: HistorySuggestion[] = KIND_ORDER.flatMap((kind) => {
    const items =
      kind === "topic"
        ? facets.topics
        : kind === "person"
          ? facets.people
          : kind === "place"
            ? facets.places
            : facets.regions;
    return items
      .filter((item) => item.name && item.slug)
      .map((item) => ({ kind, name: item.name, slug: item.slug }));
  });

  return pools
    .map((item) => ({
      item,
      score: scoreName(item.name.toLocaleLowerCase("en"), needle),
    }))
    .filter((row) => row.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      const kindDelta =
        KIND_ORDER.indexOf(left.item.kind) -
        KIND_ORDER.indexOf(right.item.kind);
      if (kindDelta !== 0) return kindDelta;
      return left.item.name.localeCompare(right.item.name);
    })
    .slice(0, limit)
    .map((row) => row.item);
}
