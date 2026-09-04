import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Import fails later if required environment variables are absent.
}

import { PILOT_PLATFORM_MAPPINGS } from "../../src/content/podcasts/pilot-platforms";
import { PILOT_GUIDS, pilotShow } from "../../src/content/podcasts/pilot";
import {
  parsePodcastRss,
  podcastDocumentId,
  PODCAST_IMPORTER_VERSION,
  PODCAST_RSS_FEED_URL,
  showDocumentId,
  TTJS_EDITORIAL_SHOW_TITLE,
  TTJS_SHOW_SLUG,
} from "../../src/lib/podcasts/rss";
const OUTPUT_DIR = resolve("artifacts/podcasts");
const SHOW_ID = showDocumentId(TTJS_SHOW_SLUG);
const PEOPLE = [
  {
    _id: "person.meyer-grunberg",
    name: "Meyer Grunberg",
    slug: "meyer-grunberg",
  },
  { _id: "person.isaac-simon", name: "Isaac Simon", slug: "isaac-simon" },
  {
    _id: "person.kalman-gavriel",
    name: "Kalman Gavriel",
    slug: "kalman-gavriel",
  },
  {
    _id: "person.alexandra-zapruder",
    name: "Alexandra Zapruder",
    slug: "alexandra-zapruder",
  },
] as const;

const GUEST_BY_GUID: Record<string, string | undefined> = {
  "775bea33-39bf-49b4-bff3-aba9c3ca45a3": "person.kalman-gavriel",
  "0bfea698-4523-4a11-9b1b-b89f24422b88": "person.alexandra-zapruder",
};

type Action = "created" | "updated" | "skipped";

function draftId(id: string) {
  return id.startsWith("drafts.") ? id : `drafts.${id}`;
}

function requiredPerson(peopleIds: Record<string, string>, id: string) {
  const resolved = peopleIds[id];
  if (!resolved) throw new Error(`Missing person mapping: ${id}`);
  return resolved;
}

function reference(id: string) {
  return {
    _key: id.replace(/[^a-z0-9]/gi, "-").slice(-48),
    _type: "reference" as const,
    _ref: id,
    _weak: true,
    _strengthenOnPublish: { type: id.slice(0, id.indexOf(".")) },
  };
}

function snapshotHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (token && projectId && dataset) {
    return createClient({
      projectId,
      dataset,
      apiVersion: "2026-08-31",
      token,
      useCdn: false,
      perspective: "raw",
    });
  }
  return getCliClient({
    apiVersion: "2026-08-31",
    useCdn: false,
    perspective: "raw",
  });
}

function importOwnedEpisode(
  episode: {
    guid: string;
    title: string;
    slug: string;
    publishedAt: string;
    description: string;
    excerpt?: string;
    audioUrl?: string;
    durationSeconds?: number;
    season?: number;
    episodeNumber?: number;
    sourceGuestNames: string[];
    artworkUrl?: string;
    chapters: { title: string; start: string }[];
  },
  peopleIds: Record<string, string>,
  showArtworkUrl?: string,
) {
  const mapping = PILOT_PLATFORM_MAPPINGS[episode.guid];
  const guestId = GUEST_BY_GUID[episode.guid]
    ? peopleIds[GUEST_BY_GUID[episode.guid]!]
    : undefined;
  const platformLinks = [mapping?.apple, mapping?.spotify, mapping?.youtube]
    .filter(Boolean)
    .map((link) => ({
      _key: `${link?.platform}-${link?.identifier || "link"}`,
      _type: "podcastPlatformLink",
      ...link,
    }));
  const distinctArtwork =
    episode.artworkUrl && episode.artworkUrl !== showArtworkUrl
      ? episode.artworkUrl
      : undefined;

  return {
    title: episode.title,
    slug: { _type: "slug", current: episode.slug },
    show: reference(SHOW_ID),
    showSlug: TTJS_SHOW_SLUG,
    season: episode.season,
    episodeNumber: episode.episodeNumber,
    publishedAt: episode.publishedAt,
    excerpt: episode.excerpt,
    description: episode.description,
    audioUrl: episode.audioUrl,
    durationSeconds: episode.durationSeconds,
    spotifyUrl: mapping?.spotify?.url,
    appleUrl: mapping?.apple?.url,
    youtubeUrl: mapping?.youtube?.url,
    primaryMedia: "auto",
    chapters: episode.chapters.map((chapter) => ({
      _key: `${chapter.start}-${chapter.title}`
        .replace(/[^a-z0-9]+/gi, "-")
        .slice(0, 48),
      _type: "podcastChapter",
      title: chapter.title,
      start: chapter.start,
    })),
    guests: guestId ? [reference(guestId)] : [],
    hosts: [
      reference(requiredPerson(peopleIds, "person.meyer-grunberg")),
      reference(requiredPerson(peopleIds, "person.isaac-simon")),
    ],
    sourceGuestNames: episode.sourceGuestNames,
    sourceArtworkUrl: distinctArtwork,
    platformLinks,
    publicTestCandidate: true,
  };
}

function importOwnedShow(peopleIds: Record<string, string>) {
  return {
    title: TTJS_EDITORIAL_SHOW_TITLE,
    slug: { _type: "slug", current: TTJS_SHOW_SLUG },
    tagline: pilotShow.tagline,
    description: pilotShow.description,
    hosts: [
      reference(requiredPerson(peopleIds, "person.meyer-grunberg")),
      reference(requiredPerson(peopleIds, "person.isaac-simon")),
    ],
    rssUrl: pilotShow.rssUrl,
    appleUrl: pilotShow.appleUrl,
    spotifyUrl: pilotShow.spotifyUrl,
    youtubeUrl: pilotShow.youtubeUrl,
    websiteUrl: pilotShow.websiteUrl,
    sourceTitle: "Jewish Original Media",
    publicTestCandidate: true,
  };
}

function scalar(value: unknown) {
  return value == null || value === "" ? null : value;
}

function episodeFingerprint(value: Record<string, unknown>) {
  const slug = value.slug as { current?: string } | undefined;
  const chapters =
    (value.chapters as { start?: string; title?: string }[]) || [];
  const guests = (value.guests as { _ref?: string }[]) || [];
  const hosts = (value.hosts as { _ref?: string }[]) || [];
  const links =
    (value.platformLinks as { platform?: string; identifier?: string }[]) || [];
  return {
    title: scalar(value.title),
    slug: scalar(slug?.current),
    showSlug: scalar(value.showSlug),
    publishedAt: scalar(value.publishedAt),
    description: scalar(value.description),
    excerpt: scalar(value.excerpt),
    audioUrl: scalar(value.audioUrl),
    durationSeconds: scalar(value.durationSeconds),
    season: scalar(value.season),
    episodeNumber: scalar(value.episodeNumber),
    sourceGuestNames: value.sourceGuestNames || [],
    sourceArtworkUrl: scalar(value.sourceArtworkUrl),
    spotifyUrl: scalar(value.spotifyUrl),
    appleUrl: scalar(value.appleUrl),
    youtubeUrl: scalar(value.youtubeUrl),
    primaryMedia: scalar(value.primaryMedia),
    tagline: scalar(value.tagline),
    rssUrl: scalar(value.rssUrl),
    chapters: chapters.map((chapter) => `${chapter.start}|${chapter.title}`),
    guests: guests.map((guest) => guest._ref).sort(),
    hosts: hosts.map((host) => host._ref).sort(),
    platformLinks: links
      .map((link) => `${link.platform}:${link.identifier}`)
      .sort(),
  };
}

async function reconcile(
  client: ReturnType<typeof getWriteClient>,
  publishedId: string,
  type: string,
  owned: Record<string, unknown>,
  extras: Record<string, unknown>,
) {
  const id = draftId(publishedId);
  const existing = await client.getDocument(id);
  const nextHash = snapshotHash(episodeFingerprint(owned));
  const previousHash = existing
    ? snapshotHash(episodeFingerprint(existing as Record<string, unknown>))
    : undefined;

  if (existing && previousHash === nextHash) {
    return { id, action: "skipped" as Action };
  }

  if (existing) {
    await client.patch(id).set(owned).commit();
    return { id, action: "updated" as Action };
  }

  await client.create({
    _id: id,
    _type: type,
    ...owned,
    ...extras,
    workflowStatus: "imported",
  });
  return { id, action: "created" as Action };
}

async function applyPilot() {
  const response = await fetch(PODCAST_RSS_FEED_URL);
  if (!response.ok) throw new Error(`RSS fetch failed: ${response.status}`);
  const xml = await response.text();
  const checksum = createHash("sha256").update(xml).digest("hex");
  const { show, episodes } = parsePodcastRss(xml);
  const selected = PILOT_GUIDS.map((guid) => {
    const episode = episodes.find((item) => item.guid === guid);
    if (!episode) throw new Error(`Pilot guid missing from RSS: ${guid}`);
    return episode;
  });

  const client = getWriteClient();
  const people = { created: 0, reused: 0 };
  const peopleIds: Record<string, string> = {};
  for (const person of PEOPLE) {
    const existingById = await client.getDocument(person._id);
    if (existingById) {
      peopleIds[person._id] = person._id;
      people.reused += 1;
      continue;
    }
    const existingByIdentity = await client.fetch<string | null>(
      `*[_type == "person" && (slug.current == $slug || name == $name)][0]._id`,
      { slug: person.slug, name: person.name },
    );
    if (existingByIdentity) {
      peopleIds[person._id] = existingByIdentity.replace(/^drafts\./, "");
      people.reused += 1;
      continue;
    }
    await client.createIfNotExists({
      _id: person._id,
      _type: "person",
      name: person.name,
      slug: { _type: "slug", current: person.slug },
    });
    peopleIds[person._id] = person._id;
    people.created += 1;
  }

  const showResult = await reconcile(
    client,
    SHOW_ID,
    "podcastShow",
    importOwnedShow(peopleIds),
    {
      provenance: {
        originalImportIdentifier: SHOW_ID,
        identifierKind: "podcast-show-slug",
        sourceArchiveId: PODCAST_RSS_FEED_URL,
        sourceFileChecksum: checksum,
        importerVersion: PODCAST_IMPORTER_VERSION,
      },
    },
  );

  const episodeResults = [];
  for (const episode of selected) {
    const publishedId = podcastDocumentId(episode.guid);
    const result = await reconcile(
      client,
      publishedId,
      "podcastEpisode",
      importOwnedEpisode(episode, peopleIds, show.imageUrl),
      {
        provenance: {
          originalImportIdentifier: episode.guid,
          identifierKind: "rss-guid",
          sourceArchiveId: PODCAST_RSS_FEED_URL,
          sourceFileChecksum: checksum,
          originalSlug: episode.slug,
          sourceCreatedAt: episode.publishedAt,
        },
      },
    );
    episodeResults.push({
      ...result,
      guid: episode.guid,
      title: episode.title,
    });
  }

  const publishedPodcasts = await client.fetch<number>(
    `count(*[_type in ["podcastShow", "podcastEpisode"] && !(_id in path("drafts.**"))])`,
  );

  const counts = {
    peopleCreated: people.created,
    peopleReused: people.reused,
    created:
      episodeResults.filter((item) => item.action === "created").length +
      (showResult.action === "created" ? 1 : 0),
    updated:
      episodeResults.filter((item) => item.action === "updated").length +
      (showResult.action === "updated" ? 1 : 0),
    skipped:
      episodeResults.filter((item) => item.action === "skipped").length +
      (showResult.action === "skipped" ? 1 : 0),
    published: publishedPodcasts,
  };

  const report = {
    importerVersion: PODCAST_IMPORTER_VERSION,
    writes: "drafts-only",
    published: false,
    show: showResult,
    people: Object.entries(peopleIds).map(([intended, actual]) => ({
      intended,
      actual,
    })),
    episodes: episodeResults,
    counts,
  };

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    resolve(OUTPUT_DIR, "pilot-import.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
  return report;
}

async function main() {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
      pilot: { type: "boolean", default: false },
    },
  });

  const apply = values.apply || process.argv.includes("--apply");
  const pilot = values.pilot || process.argv.includes("--pilot");

  if (apply && !pilot) {
    throw new Error(
      "Full-catalog Sanity writes remain blocked. Use --apply --pilot for the four approved drafts only.",
    );
  }
  if (!apply) {
    throw new Error(
      "Dry-run the RSS feed with podcasts:rss-dry-run. This command writes only with --apply --pilot.",
    );
  }

  const report = await applyPilot();
  process.stdout.write(
    `Pilot import: created ${report.counts.created}, updated ${report.counts.updated}, skipped ${report.counts.skipped}, published ${report.counts.published}.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
