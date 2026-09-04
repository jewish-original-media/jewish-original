import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { PILOT_GUIDS } from "../../src/content/podcasts/pilot";
import {
  findDuplicateGuids,
  parsePodcastRss,
  podcastDocumentId,
  PODCAST_IMPORTER_VERSION,
  PODCAST_RSS_FEED_URL,
  showDocumentId,
  TTJS_EDITORIAL_SHOW_TITLE,
  TTJS_SHOW_SLUG,
  TTJS_SOURCE_SHOW_TITLE,
} from "../../src/lib/podcasts/rss";

const OUTPUT_DIR = resolve("artifacts/podcasts");

async function main() {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
    },
  });

  if (values.apply) {
    throw new Error(
      "Podcast Sanity writes are blocked pending founder approval. Run the dry-run only.",
    );
  }

  const response = await fetch(PODCAST_RSS_FEED_URL);
  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status}`);
  }
  const xml = await response.text();
  const checksum = createHash("sha256").update(xml).digest("hex");
  const { show, episodes } = parsePodcastRss(xml);
  const duplicates = findDuplicateGuids(episodes);
  const flagCounts = episodes.reduce<Record<string, number>>((counts, episode) => {
    for (const flag of episode.flags) {
      counts[flag.code] = (counts[flag.code] || 0) + 1;
    }
    return counts;
  }, {});

  const report = {
    importerVersion: PODCAST_IMPORTER_VERSION,
    fetchedAt: new Date().toISOString(),
    rssUrl: PODCAST_RSS_FEED_URL,
    sourceChecksum: checksum,
    writes: "blocked",
    show: {
      editorialTitle: TTJS_EDITORIAL_SHOW_TITLE,
      sourceTitle: show.sourceTitle,
      sourceTitleMatchesFeed: show.sourceTitle === TTJS_SOURCE_SHOW_TITLE,
      proposedDocumentId: showDocumentId(TTJS_SHOW_SLUG),
      description: show.description,
      imageUrl: show.imageUrl,
    },
    counts: {
      items: episodes.length,
      full: episodes.filter((episode) => episode.episodeType === "full").length,
      trailers: episodes.filter((episode) => episode.episodeType === "trailer")
        .length,
      withAudio: episodes.filter((episode) => episode.audioUrl).length,
      withEpisodeNumber: episodes.filter((episode) => episode.episodeNumber)
        .length,
      withYouTubeInDescription: episodes.filter(
        (episode) => episode.sourceYouTubeIds.length,
      ).length,
      withConfirmedEpisodeVideo: 0,
      emailsRedacted: episodes.reduce(
        (sum, episode) => sum + episode.redactedEmailCount,
        0,
      ),
      duplicateGuids: duplicates.length,
    },
    flagCounts,
    duplicates,
    missingMaterials: [
      "Official TTJS episode YouTube IDs are not in the RSS feed.",
      "No transcripts are present in the source feed.",
      "No reviewed summaries are present.",
      "Guest person records have not been created.",
      "History relationships have not been editor-approved.",
      "Episode artwork rights have not been ledgered beyond the official feed.",
    ],
    pilot: PILOT_GUIDS.map((guid) => {
      const episode = episodes.find((item) => item.guid === guid);
      return episode
        ? {
            guid,
            documentId: podcastDocumentId(guid),
            title: episode.title,
            slug: episode.slug,
            publishedAt: episode.publishedAt,
            flags: episode.flags,
          }
        : { guid, missing: true };
    }),
    episodes: episodes.map((episode) => ({
      guid: episode.guid,
      documentId: podcastDocumentId(episode.guid),
      title: episode.title,
      slug: episode.slug,
      publishedAt: episode.publishedAt,
      season: episode.season,
      episodeNumber: episode.episodeNumber,
      durationSeconds: episode.durationSeconds,
      sourceGuestNames: episode.sourceGuestNames,
      chapters: episode.chapters.length,
      flags: episode.flags,
    })),
  };

  await mkdir(resolve(OUTPUT_DIR, "restricted"), { recursive: true });
  await writeFile(resolve(OUTPUT_DIR, "restricted/raw-rss.xml"), xml, "utf8");
  await writeFile(
    resolve(OUTPUT_DIR, "rss-dry-run.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(
    `Podcast RSS dry-run: ${episodes.length} items, ${duplicates.length} duplicate guids, writes blocked.\n`,
  );
  process.stdout.write(`Report: ${resolve(OUTPUT_DIR, "rss-dry-run.json")}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
