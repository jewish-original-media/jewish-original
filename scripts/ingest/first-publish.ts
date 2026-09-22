import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  classifyNewsItem,
  resolveAiProvider,
} from "../../src/features/ingest/ai/provider";
import { runEventsIngest } from "../../src/features/ingest/events/pipeline";
import {
  assertProtectedContentUnchanged,
  fetchIngestIntegrity,
} from "../../src/features/ingest/integrity";
import { runNewsIngest } from "../../src/features/ingest/news/pipeline";
import {
  persistEventsRun,
  persistNewsRun,
} from "../../src/features/ingest/persist";
import {
  contextLooksGeneric,
  newsNavEligible,
  selectFirstEventBatch,
  selectFirstNewsBatch,
  shouldShowHomepageEvents,
  shouldShowHomepageNews,
} from "../../src/features/ingest/select";
import {
  createIngestReadClient,
  createIngestWriteClient,
} from "../../src/features/ingest/write-client";

const OUTPUT = resolve("artifacts/ingest/first-publish.json");

function loadEnvFiles() {
  for (const path of [".env.local", ".env.preview.local"]) {
    try {
      for (const line of readFileSync(path, "utf8").split("\n")) {
        const [name, value] = line.split("=", 2);
        if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name))
          continue;
        if (process.env[name]) continue;
        process.env[name] = value.replace(/^["']|["']$/g, "");
      }
    } catch {
      // Optional overlay.
    }
  }
}

function previewAuthHeader() {
  const secret = process.env.CRON_SECRET || process.env.DRAFT_MODE_SECRET;
  if (!secret) {
    throw new Error("preview-auth-missing");
  }
  return { Authorization: `Bearer ${secret}` };
}

async function callPreview(path: string) {
  const base = process.env.INGEST_PREVIEW_URL;
  if (!base) throw new Error("preview-url-missing");
  const response = await fetch(new URL(path, base), {
    headers: previewAuthHeader(),
    cache: "no-store",
  });
  const body = (await response.json()) as Record<string, unknown>;
  return { status: response.status, body };
}

async function localSmoke() {
  const provider = resolveAiProvider();
  if (!provider.ready) return null;
  const result = await classifyNewsItem({
    publisher: "JTA",
    headline: "Diaspora communities prepare for the new year",
    host: "jta.org",
    publishedAt: new Date().toISOString(),
    sourceText: "Communal organizations announced public holiday programs.",
    defaultDesk: "jewish-world",
  });
  if (!result.ok) throw new Error(`ai-smoke-failed:${result.error}`);
  return {
    provider,
    output: result.output,
    model: result.model,
    usage: result.usage,
  };
}

async function main() {
  loadEnvFiles();
  const apply = process.argv.includes("--apply");
  const remote = Boolean(process.env.INGEST_PREVIEW_URL);
  const readClient = createIngestReadClient();
  const before = await fetchIngestIntegrity(readClient);
  if (before.historyPublished !== 5 || before.newsPublished !== 0) {
    throw new Error("pre-write-integrity-failed");
  }

  if (remote) {
    const smoke = await callPreview("/api/cron/news?smoke=1");
    if (smoke.status !== 200 || smoke.body.ok !== true) {
      throw new Error(`ai-smoke-failed:${smoke.status}`);
    }
    const news = await callPreview("/api/cron/news");
    const events = await callPreview("/api/cron/events");
    const newsSelected = (news.body.selected as { context?: string }[]) || [];
    if (newsSelected.some((item) => contextLooksGeneric(item.context || ""))) {
      throw new Error("generic-context-after-selection");
    }

    let written = null;
    if (apply) {
      const newsWrite = await callPreview("/api/cron/news?write=1");
      const eventWrite = await callPreview("/api/cron/events?write=1");
      const after = await fetchIngestIntegrity(readClient);
      assertProtectedContentUnchanged(before, after);
      written = {
        newsWrite: newsWrite.body,
        eventWrite: eventWrite.body,
        after,
      };
    }

    const report = {
      apply,
      remote: true,
      before,
      smoke: smoke.body,
      news: news.body,
      events: events.body,
      written,
    };
    await mkdir(resolve("artifacts/ingest"), { recursive: true });
    await writeFile(OUTPUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const smoke = await localSmoke();
  if (!smoke) throw new Error("ai-unconfigured");
  const news = await runNewsIngest({ dryRun: true, write: false });
  const events = await runEventsIngest({ dryRun: true, write: false });
  const newsSelected = selectFirstNewsBatch(news.decisions);
  const eventSelected = selectFirstEventBatch(events.decisions);
  if (newsSelected.some((item) => contextLooksGeneric(item.jomContext))) {
    throw new Error("generic-context-after-selection");
  }

  const report = {
    apply,
    remote: false,
    ai: { model: smoke.model, output: smoke.output, usage: smoke.usage },
    before,
    news: {
      fetched: news.run.fetched,
      normalized: news.run.normalized,
      skipped: news.run.skipped,
      exceptions: news.run.exceptions,
      aiCalls: news.run.aiCalls,
      estimatedUsd: news.run.estimatedUsd,
      wouldPublish: news.decisions.filter((item) => item.action === "publish")
        .length,
      selected: newsSelected,
    },
    events: {
      fetched: events.run.fetched,
      exceptions: events.run.exceptions,
      aiCalls: events.run.aiCalls,
      wouldPublish: events.decisions.filter((item) => item.action === "publish")
        .length,
      selected: eventSelected,
    },
  };

  if (!apply) {
    await mkdir(resolve("artifacts/ingest"), { recursive: true });
    await writeFile(OUTPUT, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (process.env.INGEST_WRITES_ENABLED !== "1") {
    throw new Error("writes-not-enabled");
  }
  const writeClient = createIngestWriteClient();
  const newsWrite = await persistNewsRun({
    client: writeClient,
    run: news.run,
    decisions: news.decisions,
    firstPublish: true,
  });
  const eventWrite = await persistEventsRun({
    client: writeClient,
    run: events.run,
    decisions: events.decisions,
    firstPublish: true,
  });
  const after = await fetchIngestIntegrity(writeClient);
  assertProtectedContentUnchanged(before, after);
  const finalReport = {
    ...report,
    after,
    homepageNews: shouldShowHomepageNews(after.newsPublished),
    homepageEvents: shouldShowHomepageEvents(eventWrite.published),
    newsNav: newsNavEligible(newsWrite.published),
  };
  await mkdir(resolve("artifacts/ingest"), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(finalReport, null, 2));
  console.log(JSON.stringify(finalReport, null, 2));
}

void main();
