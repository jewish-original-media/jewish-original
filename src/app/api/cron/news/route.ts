import { authorizeCronRequest } from "@/features/ingest/auth";
import {
  classifyNewsItem,
  resolveAiProvider,
} from "@/features/ingest/ai/provider";
import { runNewsIngest } from "@/features/ingest/news/pipeline";
import {
  loadNewsExistingIndex,
  persistNewsRun,
} from "@/features/ingest/persist";
import { selectFirstNewsBatch } from "@/features/ingest/select";
import {
  createIngestReadClient,
  createIngestWriteClient,
} from "@/features/ingest/write-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = authorizeCronRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("smoke") === "1") {
    const provider = resolveAiProvider();
    if (!provider.ready) {
      return Response.json(
        { ok: false, aiReady: false, error: "ai-unconfigured" },
        { status: 503 },
      );
    }
    const smoke = await classifyNewsItem({
      publisher: "JTA",
      headline: "Diaspora communities prepare for the new year",
      host: "jta.org",
      publishedAt: new Date().toISOString(),
      sourceText: "Communal organizations announced public holiday programs.",
      defaultDesk: "jewish-world",
    });
    if (!smoke.ok) {
      return Response.json(
        { ok: false, aiReady: true, error: smoke.error },
        { status: 502 },
      );
    }
    return Response.json({
      ok: true,
      aiReady: true,
      model: smoke.model,
      output: smoke.output,
      usage: smoke.usage,
    });
  }

  const writeRequested = url.searchParams.get("write") === "1";
  const writesEnabled = process.env.INGEST_WRITES_ENABLED === "1";
  const write = writeRequested && writesEnabled;
  const existing = await loadNewsExistingIndex(createIngestReadClient()).catch(
    () => undefined,
  );
  const result = await runNewsIngest({
    dryRun: !write,
    write,
    existing,
  });

  let persisted = 0;
  if (write) {
    const persistedRun = await persistNewsRun({
      client: createIngestWriteClient(),
      run: result.run,
      decisions: result.decisions,
      firstPublish: (existing?.items.length ?? 0) === 0,
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
    selected: selectFirstNewsBatch(result.decisions).map((item) => ({
      publisher: item.publisher,
      headline: item.headline,
      desk: item.desk,
      url: item.canonicalUrl,
      context: item.jomContext,
      relevance: item.relevance,
    })),
    exceptionItems: result.decisions
      .filter((item) => item.action === "exception")
      .slice(0, 20)
      .map((item) => ({
        sourceId: item.sourceId,
        headline: item.headline,
        reason: item.reason,
      })),
  });
}
