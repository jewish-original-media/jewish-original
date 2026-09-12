export type IngestSourceStats = {
  source: string;
  fetched: number;
  normalized: number;
  duplicates: number;
  rejected: number;
  skipped: number;
  autoPublished: number;
  exceptions: number;
  failures: number;
  aiCalls: number;
  durationMs: number;
  error?: string;
};

export type IngestRunLog = {
  job: "news" | "events";
  runId: string;
  dryRun: boolean;
  write: boolean;
  aiReady: boolean;
  sources: IngestSourceStats[];
  fetched: number;
  normalized: number;
  duplicates: number;
  rejected: number;
  skipped: number;
  autoPublished: number;
  exceptions: number;
  failures: number;
  aiCalls: number;
  estimatedUsd: number;
  durationMs: number;
};

export function emptySourceStats(source: string): IngestSourceStats {
  return {
    source,
    fetched: 0,
    normalized: 0,
    duplicates: 0,
    rejected: 0,
    skipped: 0,
    autoPublished: 0,
    exceptions: 0,
    failures: 0,
    aiCalls: 0,
    durationMs: 0,
  };
}

export function summarizeRun(
  job: IngestRunLog["job"],
  runId: string,
  sources: IngestSourceStats[],
  extras: Pick<
    IngestRunLog,
    "dryRun" | "write" | "aiReady" | "estimatedUsd" | "durationMs"
  >,
): IngestRunLog {
  const totals = sources.reduce(
    (acc, source) => {
      acc.fetched += source.fetched;
      acc.normalized += source.normalized;
      acc.duplicates += source.duplicates;
      acc.rejected += source.rejected;
      acc.skipped += source.skipped;
      acc.autoPublished += source.autoPublished;
      acc.exceptions += source.exceptions;
      acc.failures += source.failures;
      acc.aiCalls += source.aiCalls;
      return acc;
    },
    {
      fetched: 0,
      normalized: 0,
      duplicates: 0,
      rejected: 0,
      skipped: 0,
      autoPublished: 0,
      exceptions: 0,
      failures: 0,
      aiCalls: 0,
    },
  );

  return {
    job,
    runId,
    sources,
    ...totals,
    ...extras,
  };
}

export function logIngestRun(run: IngestRunLog) {
  console.info(JSON.stringify(run));
}
