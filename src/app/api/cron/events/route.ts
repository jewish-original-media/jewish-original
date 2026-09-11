import { authorizeCronRequest } from "@/features/ingest/auth";
import { runEventsIngest } from "@/features/ingest/events/pipeline";
import { loadEventExisting, persistEventsRun } from "@/features/ingest/persist";
import { selectFirstEventBatch } from "@/features/ingest/select";
import {
  createIngestReadClient,
  createIngestWriteClient,
} from "@/features/ingest/write-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const writeRequested = new URL(request.url).searchParams.get("write") === "1";
  const writesEnabled = process.env.INGEST_WRITES_ENABLED === "1";
  const write = writeRequested && writesEnabled;
  const existing = await loadEventExisting(createIngestReadClient()).catch(
    () => undefined,
  );
  const result = await runEventsIngest({
    dryRun: !write,
    write,
    existing,
  });

  let persisted = 0;
  if (write) {
    const persistedRun = await persistEventsRun({
      client: createIngestWriteClient(),
      run: result.run,
      decisions: result.decisions,
      firstPublish: (existing?.length ?? 0) === 0,
    });
    persisted = persistedRun.published.length;
  }

  return Response.json({
    ok: true,
    write: result.run.write,
    aiReady: result.run.aiReady,
    fetched: result.run.fetched,
    duplicates: result.run.duplicates,
    skipped: result.run.skipped,
    exceptions: result.run.exceptions,
    autoPublished: result.run.autoPublished,
    persisted,
    aiCalls: result.run.aiCalls,
    estimatedUsd: result.run.estimatedUsd,
    sources: result.run.sources,
    selected: selectFirstEventBatch(result.decisions).map((item) => ({
      title: item.title,
      organizer: item.organizer,
      startAt: item.startAt,
      timezone: item.timezone,
      url: item.eventUrl,
      context: item.jomContext,
    })),
    exceptionItems: result.decisions
      .filter((item) => item.action === "exception")
      .slice(0, 20)
      .map((item) => ({
        sourceId: item.sourceId,
        title: item.title,
        reason: item.reason,
      })),
  });
}
