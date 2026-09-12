import type { NewsDesk } from "@/features/ingest/config";

export type CuratedNewsCard = {
  id: string;
  publisher: string;
  headline: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  jomContext: string;
  desk: NewsDesk;
  topics: string[];
};
