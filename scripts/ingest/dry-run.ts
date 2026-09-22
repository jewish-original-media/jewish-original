import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { runEventsIngest } from "../../src/features/ingest/events/pipeline";
import { EVENT_SOURCE_REGISTRY } from "../../src/features/ingest/events/sources";
import { fetchSourceText } from "../../src/features/ingest/fetch-source";
import { parseIcsEvents } from "../../src/features/ingest/ics";
import { runNewsIngest } from "../../src/features/ingest/news/pipeline";
import { NEWS_SOURCE_REGISTRY } from "../../src/features/ingest/news/sources";
import { parseRssFeed } from "../../src/features/ingest/rss";

const OUTPUT = resolve("artifacts/ingest/dry-run.json");

async function validateNewsFeeds() {
  const rows = [];
  for (const source of NEWS_SOURCE_REGISTRY) {
    const fetched = await fetchSourceText(source.feedUrl);
    if (!fetched.ok) {
      rows.push({
        id: source.id,
        url: source.feedUrl,
        ok: false,
        error: fetched.error,
        status: fetched.status,
      });
      continue;
    }
    const feed = parseRssFeed(fetched.text);
    rows.push({
      id: source.id,
      url: source.feedUrl,
      ok: true,
      contentType: fetched.contentType,
      items: feed.items.length,
      withDates: feed.items.filter((item) => item.publishedAt).length,
      withLinks: feed.items.filter((item) => item.link).length,
    });
  }
  return rows;
}

async function validateEventFeeds() {
  const rows = [];
  for (const source of EVENT_SOURCE_REGISTRY.filter((item) => item.feedUrl)) {
    const fetched = await fetchSourceText(source.feedUrl!);
    if (!fetched.ok) {
      rows.push({
        id: source.id,
        url: source.feedUrl,
        ok: false,
        error: fetched.error,
        status: fetched.status,
      });
      continue;
    }
    const events = parseIcsEvents(fetched.text);
    rows.push({
      id: source.id,
      url: source.feedUrl,
      ok: true,
      contentType: fetched.contentType,
      events: events.length,
      withTimezone: events.filter((event) => event.timezone).length,
      withUrl: events.filter((event) => event.url).length,
    });
  }
  return rows;
}

async function main() {
  const newsFeeds = await validateNewsFeeds();
  const eventFeeds = await validateEventFeeds();
  const news = await runNewsIngest({ dryRun: true, write: false });
  const events = await runEventsIngest({ dryRun: true, write: false });

  const report = {
    generatedAt: new Date().toISOString(),
    sanityWrites: false,
    aiReady: news.provider.ready,
    newsFeeds,
    eventFeeds,
    news: {
      run: news.run,
      wouldPublish: news.decisions.filter((item) => item.action === "publish")
        .length,
      wouldException: news.decisions.filter(
        (item) => item.action === "exception",
      ).length,
      wouldSkip: news.decisions.filter((item) => item.action === "skip").length,
      needsAi: news.decisions.filter((item) => item.action === "needs-ai")
        .length,
    },
    events: {
      run: events.run,
      wouldPublish: events.decisions.filter((item) => item.action === "publish")
        .length,
      wouldException: events.decisions.filter(
        (item) => item.action === "exception",
      ).length,
      wouldSkip: events.decisions.filter((item) => item.action === "skip")
        .length,
      needsAi: events.decisions.filter((item) => item.action === "needs-ai")
        .length,
    },
  };

  await mkdir(resolve("artifacts/ingest"), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

void main();
