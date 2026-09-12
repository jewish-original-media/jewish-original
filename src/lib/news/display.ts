import { NEWS_DESK_LABELS, type NewsDesk } from "@/features/ingest/config";

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
