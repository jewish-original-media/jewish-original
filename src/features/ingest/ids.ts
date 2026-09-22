import { createHash } from "node:crypto";

export function stableHash(value: string, length = 16) {
  return createHash("sha256").update(value).digest("hex").slice(0, length);
}

export function newsDocumentId(sourceId: string, canonicalUrl: string) {
  return `curatedNewsItem.${sourceId}.${stableHash(canonicalUrl)}`;
}

export function eventDocumentId(sourceId: string, sourceUid: string) {
  return `event.${sourceId}.${stableHash(sourceUid)}`;
}

export function receiptDocumentId(kind: "news" | "events", key: string) {
  return `ingestReceipt.${kind}.${stableHash(key)}`;
}

export function exceptionDocumentId(kind: "news" | "events", key: string) {
  return `ingestException.${kind}.${stableHash(key)}`;
}

export function ingestSourceDocumentId(
  kind: "news" | "events",
  sourceId: string,
) {
  return `ingestSource.${kind}.${sourceId}`;
}

export function ingestRunDocumentId(runId: string) {
  return `ingestRun.${runId}`;
}
