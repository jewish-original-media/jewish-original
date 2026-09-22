import { INGEST_WINDOWS } from "./config";
import type { NewsDesk } from "./config";

export function parsePublicationDate(value: string | undefined | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Date.parse(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return new Date(parsed);
}

export function hoursSince(date: Date, now = new Date()) {
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
}

export function newsFreshnessWindow(desk: NewsDesk) {
  return desk === "heritage"
    ? INGEST_WINDOWS.heritageFreshHours
    : INGEST_WINDOWS.newsFreshHours;
}

export function isNewsFresh(
  publishedAt: Date,
  desk: NewsDesk,
  now = new Date(),
) {
  const age = hoursSince(publishedAt, now);
  return age >= 0 && age <= newsFreshnessWindow(desk);
}

export function newsExpiresAt(publishedAt: Date) {
  const expires = new Date(publishedAt);
  expires.setUTCDate(expires.getUTCDate() + INGEST_WINDOWS.newsExpiresDays);
  return expires;
}

export function isWithinDays(date: Date, days: number, now = new Date()) {
  const age = now.getTime() - date.getTime();
  return age >= 0 && age <= days * 24 * 60 * 60 * 1000;
}

export function isUpcomingEvent(
  startAt: Date,
  now = new Date(),
  horizonDays = INGEST_WINDOWS.eventHorizonDays,
) {
  if (startAt.getTime() <= now.getTime()) return false;
  const horizon = now.getTime() + horizonDays * 24 * 60 * 60 * 1000;
  return startAt.getTime() <= horizon;
}

export function eventExpiresAt(startAt: Date, endAt?: Date | null) {
  if (endAt) return endAt;
  const expires = new Date(startAt);
  expires.setUTCDate(expires.getUTCDate() + 1);
  return expires;
}
