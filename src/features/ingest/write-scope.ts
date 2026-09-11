export const INGEST_WRITE_TYPES = [
  "curatedNewsItem",
  "event",
  "ingestSource",
  "ingestRun",
  "ingestException",
  "ingestReceipt",
] as const;

export type IngestWriteType = (typeof INGEST_WRITE_TYPES)[number];

export const INGEST_WRITE_ID_PREFIXES = [
  "curatedNewsItem.",
  "event.",
  "ingestSource.",
  "ingestRun.",
  "ingestException.",
  "ingestReceipt.",
] as const;

export const FORBIDDEN_WRITE_TYPES = [
  "historyEntry",
  "podcastShow",
  "podcastEpisode",
  "person",
  "place",
  "organization",
  "source",
  "topic",
  "geographicRegion",
  "historicalEra",
] as const;

const FORBIDDEN_ID_MARKERS = [
  "historyEntry",
  "podcastShow",
  "podcastEpisode",
  "person.",
  "place.",
  "organization.",
] as const;

const FORBIDDEN_CONTENT_KEYS = [
  "body",
  "excerpt",
  "description",
  "sourceBody",
  "rssDescription",
  "image",
  "mainImage",
  "enclosure",
  "media",
  "contentEncoded",
] as const;

export type IngestWriteDocument = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};

export function isAllowedIngestWriteType(
  type: string,
): type is IngestWriteType {
  return (INGEST_WRITE_TYPES as readonly string[]).includes(type);
}

export function assertIngestWriteDocument(document: IngestWriteDocument) {
  if (!isAllowedIngestWriteType(document._type)) {
    throw new Error(`ingest-write-forbidden-type:${document._type}`);
  }
  if ((FORBIDDEN_WRITE_TYPES as readonly string[]).includes(document._type)) {
    throw new Error(`ingest-write-forbidden-type:${document._type}`);
  }
  if (
    !INGEST_WRITE_ID_PREFIXES.some((prefix) => document._id.startsWith(prefix))
  ) {
    throw new Error(`ingest-write-forbidden-id:${document._id}`);
  }
  if (FORBIDDEN_ID_MARKERS.some((marker) => document._id.includes(marker))) {
    throw new Error(`ingest-write-forbidden-id:${document._id}`);
  }
  for (const key of FORBIDDEN_CONTENT_KEYS) {
    if (key in document && document[key] != null) {
      throw new Error(`ingest-write-forbidden-field:${key}`);
    }
  }
}

export function assertIngestWriteBatch(documents: IngestWriteDocument[]) {
  documents.forEach(assertIngestWriteDocument);
}
