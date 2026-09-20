import { NEWS_DESK_LABELS, type NewsDesk } from "@/features/ingest/config";

export const NEWS_INDEX_EMPTY =
  "We're not following a current story right now. Start with Today, or browse the History archive.";

export const NEWS_INDEX_UNAVAILABLE =
  "We couldn't load the News desk just now. Try again shortly, or start with Today.";

export type NewsIndexState = "ready" | "empty" | "unavailable";

export function newsIndexState(
  itemCount: number,
  unavailable = false,
): NewsIndexState {
  if (unavailable) return "unavailable";
  return itemCount > 0 ? "ready" : "empty";
}

export function formatNewsTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(date);
}

export function newsDeskLabel(desk: NewsDesk) {
  return NEWS_DESK_LABELS[desk];
}
