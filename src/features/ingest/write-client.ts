import { createClient, type SanityClient } from "@sanity/client";

export function createIngestWriteClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is required for ingest writes.");
  }
  if (!projectId || !dataset) {
    throw new Error("Sanity project configuration is missing.");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-31",
    token,
    useCdn: false,
    perspective: "raw",
  });
}

export function createIngestReadClient(): SanityClient {
  const token =
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_READ_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!token || !projectId || !dataset) {
    throw new Error("Sanity read configuration is missing.");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion: "2026-08-31",
    token,
    useCdn: false,
    perspective: "raw",
  });
}
