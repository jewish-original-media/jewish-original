import { authorizeCronRequest } from "@/features/ingest/auth";
import { runEventsIngest } from "@/features/ingest/events/pipeline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const writeRequested = new URL(request.url).searchParams.get("write") === "1";
  const writesEnabled = process.env.INGEST_WRITES_ENABLED === "1";
  const result = await runEventsIngest({
    dryRun: !(writeRequested && writesEnabled),
    write: writeRequested && writesEnabled,
  });

  return Response.json({
    ok: true,
    write: result.run.write,
    aiReady: result.run.aiReady,
    fetched: result.run.fetched,
    duplicates: result.run.duplicates,
    skipped: result.run.skipped,
    exceptions: result.run.exceptions,
    autoPublished: result.run.autoPublished,
    aiCalls: result.run.aiCalls,
    estimatedUsd: result.run.estimatedUsd,
    sources: result.run.sources,
  });
}
