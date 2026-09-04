import { readFileSync } from "node:fs";

import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

import { PILOT_PLATFORM_MAPPINGS } from "../../src/content/podcasts/pilot-platforms";
import { PILOT_GUIDS } from "../../src/content/podcasts/pilot";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Token resolution fails closed below.
}

const SHOW_DRAFT_ID = "drafts.podcastShow.the-two-tall-jews-show";
const SHOW_PUBLISHED_ID = "podcastShow.the-two-tall-jews-show";

const PILOTS = [
  {
    guid: "775bea33-39bf-49b4-bff3-aba9c3ca45a3",
    draftId: "drafts.podcastEpisode.775bea33-39bf-49b4-bff3-aba9c3ca45a3",
    publishedId: "podcastEpisode.775bea33-39bf-49b4-bff3-aba9c3ca45a3",
    title: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
    slug: "sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
    guest: "Kalman Gavriel",
    expectChapters: false,
    expectDistinctArtwork: true,
  },
  {
    guid: "89aba54c-5d52-4520-b129-3a7aa4da1c55",
    draftId: "drafts.podcastEpisode.89aba54c-5d52-4520-b129-3a7aa4da1c55",
    publishedId: "podcastEpisode.89aba54c-5d52-4520-b129-3a7aa4da1c55",
    title: "SEASON 3 FINALE - LOOKING AHEAD TO 2023",
    slug: "season-3-finale-looking-ahead-to-2023",
    guest: undefined,
    expectChapters: false,
    expectDistinctArtwork: false,
  },
  {
    guid: "0bfea698-4523-4a11-9b1b-b89f24422b88",
    draftId: "drafts.podcastEpisode.0bfea698-4523-4a11-9b1b-b89f24422b88",
    publishedId: "podcastEpisode.0bfea698-4523-4a11-9b1b-b89f24422b88",
    title:
      "Alexandra Zapruder on Holocaust Remembrance, Antisemitism and the Importance of Bearing Witness",
    slug: "alexandra-zapruder-on-holocaust-remembrance-antisemitism-and-the-importance-of-bearing-witness",
    guest: "Alexandra Zapruder",
    expectChapters: false,
    expectDistinctArtwork: true,
  },
  {
    guid: "4609de6e-2e4b-40e0-84a6-34688d9265b5",
    draftId: "drafts.podcastEpisode.4609de6e-2e4b-40e0-84a6-34688d9265b5",
    publishedId: "podcastEpisode.4609de6e-2e4b-40e0-84a6-34688d9265b5",
    title:
      "PREMIER: Mel Brooks, Annexation, Music from the Holocaust, & A Deep Dive into Tikkun Olam",
    slug: "premier-mel-brooks-annexation-music-from-the-holocaust-a-deep-dive-into-tikkun-olam",
    guest: undefined,
    expectChapters: true,
    expectDistinctArtwork: false,
  },
] as const;

const EPISODE_PROJECTION = `{
  _id,
  _type,
  title,
  "slug": slug.current,
  showSlug,
  "showRef": show._ref,
  publishedAt,
  excerpt,
  description,
  audioUrl,
  youtubeUrl,
  youtubeId,
  spotifyUrl,
  appleUrl,
  primaryMedia,
  sourceArtworkUrl,
  featuredImage,
  workflowStatus,
  summary,
  reviewedTranscript,
  rawTranscript,
  publicTestCandidate,
  "guestNames": guests[]->name,
  "hostNames": hosts[]->name,
  "sourceGuestNames": sourceGuestNames,
  "chapterCount": count(chapters),
  "relatedHistoryCount": count(relatedHistory),
  "topicCount": count(topics),
  provenance{originalImportIdentifier, identifierKind, sourceArchiveId},
  platformLinks[]{platform, identifier, verified, source}
}`;

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

function requireField(label: string, value: unknown) {
  if (value == null || value === "") {
    throw new Error(`${label} is missing.`);
  }
}

async function inspect(client: ReturnType<typeof getWriteClient>) {
  const config = client.config();
  if (config.projectId !== "ijrhuwb0") {
    throw new Error(`Unexpected project ${config.projectId}.`);
  }
  if (config.dataset !== "development") {
    throw new Error(`Unexpected dataset ${config.dataset}.`);
  }

  const state = await client.fetch(`{
    "draftShows": *[_type == "podcastShow" && _id in path("drafts.**")]{_id, title, workflowStatus, "slug": slug.current},
    "draftEpisodes": *[_type == "podcastEpisode" && _id in path("drafts.**")]{_id, title, workflowStatus, "slug": slug.current},
    "publishedPodcasts": *[_type in ["podcastShow", "podcastEpisode"] && !(_id in path("drafts.**"))]{_id, _type, title},
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
    "allPodcastIds": *[_type in ["podcastShow", "podcastEpisode"]]._id
  }`);

  if (state.draftShows.length !== 1) {
    throw new Error(`Expected 1 show draft; found ${state.draftShows.length}.`);
  }
  if (state.draftEpisodes.length !== 4) {
    throw new Error(
      `Expected 4 episode drafts; found ${state.draftEpisodes.length}.`,
    );
  }
  if (state.publishedPodcasts.length !== 0) {
    throw new Error(
      `Expected 0 published podcast documents; found ${state.publishedPodcasts.length}.`,
    );
  }
  const historyPublished = state.publishedHistory as number;

  const show = await client.fetch(
    `*[_id == $id][0]{
      _id, _type, title, "slug": slug.current, tagline, description,
      workflowStatus, rssUrl, appleUrl, spotifyUrl, youtubeUrl, websiteUrl,
      "hostNames": hosts[]->name,
      provenance{originalImportIdentifier, identifierKind, sourceArchiveId}
    }`,
    { id: SHOW_DRAFT_ID },
  );
  if (!show) throw new Error(`Missing show draft ${SHOW_DRAFT_ID}.`);
  if (show.title !== "The Two Tall Jews Show") {
    throw new Error(`Unexpected show title: ${show.title}`);
  }
  if (show.slug !== "the-two-tall-jews-show") {
    throw new Error(`Unexpected show slug: ${show.slug}`);
  }
  requireField("show description", show.description);
  requireField("show RSS", show.rssUrl);
  if (
    JSON.stringify(show.hostNames) !==
    JSON.stringify(["Meyer Grunberg", "Isaac Simon"])
  ) {
    throw new Error(`Unexpected show hosts: ${JSON.stringify(show.hostNames)}`);
  }

  const episodes = [];
  for (const pilot of PILOTS) {
    if (!PILOT_GUIDS.includes(pilot.guid)) {
      throw new Error(`Pilot guid not in approved set: ${pilot.guid}`);
    }
    const episode = await client.fetch(`*[_id == $id][0]${EPISODE_PROJECTION}`, {
      id: pilot.draftId,
    });
    if (!episode) throw new Error(`Missing episode draft ${pilot.draftId}.`);
    if (episode.title !== pilot.title) {
      throw new Error(`Title mismatch for ${pilot.guid}: ${episode.title}`);
    }
    if (episode.slug !== pilot.slug) {
      throw new Error(`Slug mismatch for ${pilot.guid}: ${episode.slug}`);
    }
    if (episode.showRef !== SHOW_PUBLISHED_ID) {
      throw new Error(`Show reference mismatch for ${pilot.guid}.`);
    }
    requireField(`${pilot.slug} publishedAt`, episode.publishedAt);
    requireField(`${pilot.slug} excerpt`, episode.excerpt);
    requireField(`${pilot.slug} description`, episode.description);
    requireField(`${pilot.slug} audioUrl`, episode.audioUrl);
    if (episode.youtubeUrl || episode.youtubeId) {
      throw new Error(`Unofficial YouTube attached to ${pilot.slug}.`);
    }
    const mapping = PILOT_PLATFORM_MAPPINGS[pilot.guid];
    if (episode.spotifyUrl !== mapping?.spotify?.url) {
      throw new Error(`Spotify mapping changed on ${pilot.slug}.`);
    }
    if (episode.appleUrl !== mapping?.apple?.url) {
      throw new Error(`Apple mapping changed on ${pilot.slug}.`);
    }
    if (
      JSON.stringify(episode.hostNames) !==
      JSON.stringify(["Meyer Grunberg", "Isaac Simon"])
    ) {
      throw new Error(`Unexpected hosts on ${pilot.slug}.`);
    }
    if (pilot.guest) {
      if (!episode.guestNames?.includes(pilot.guest)) {
        throw new Error(`Missing guest ${pilot.guest} on ${pilot.slug}.`);
      }
    } else if (episode.guestNames?.length) {
      throw new Error(`Unexpected guests on ${pilot.slug}.`);
    }
    if (episode.summary || episode.reviewedTranscript) {
      throw new Error(`Invented summary/transcript on ${pilot.slug}.`);
    }
    if (episode.relatedHistoryCount) {
      throw new Error(`Invented History relationship on ${pilot.slug}.`);
    }
    if (pilot.expectChapters && !episode.chapterCount) {
      throw new Error(`Expected chapters on ${pilot.slug}.`);
    }
    if (!pilot.expectChapters && episode.chapterCount) {
      throw new Error(`Unexpected chapters on ${pilot.slug}.`);
    }
    if (pilot.expectDistinctArtwork && !episode.sourceArtworkUrl) {
      throw new Error(`Expected source artwork on ${pilot.slug}.`);
    }
    if (episode.featuredImage?.asset) {
      throw new Error(
        `Rights-uncleared featured image present on ${pilot.slug}; stop rather than publish it.`,
      );
    }
    if (episode.provenance?.originalImportIdentifier !== pilot.guid) {
      throw new Error(`RSS GUID provenance missing on ${pilot.slug}.`);
    }
    episodes.push({
      id: episode._id,
      title: episode.title,
      slug: episode.slug,
      publishedAt: episode.publishedAt,
      workflowStatus: episode.workflowStatus,
      guestNames: episode.guestNames || [],
      chapterCount: episode.chapterCount,
      hasAudio: Boolean(episode.audioUrl),
      hasSpotify: Boolean(episode.spotifyUrl),
      hasApple: Boolean(episode.appleUrl),
      hasYouTube: Boolean(episode.youtubeUrl || episode.youtubeId),
      hasSummary: Boolean(episode.summary),
      hasTranscript: Boolean(episode.reviewedTranscript),
      relatedHistoryCount: episode.relatedHistoryCount,
    });
  }

  const unexpectedIds = (state.allPodcastIds as string[]).filter(
    (id) =>
      id !== SHOW_DRAFT_ID && !PILOTS.some((pilot) => pilot.draftId === id),
  );
  if (unexpectedIds.length) {
    throw new Error(`Unexpected podcast documents: ${unexpectedIds.join(", ")}`);
  }

  return {
    projectId: config.projectId,
    dataset: config.dataset,
    publishedHistory: historyPublished,
    show: {
      id: show._id,
      title: show.title,
      slug: show.slug,
      workflowStatus: show.workflowStatus,
      hostNames: show.hostNames,
    },
    episodes,
    counts: {
      draftShows: state.draftShows.length,
      draftEpisodes: state.draftEpisodes.length,
      publishedPodcasts: state.publishedPodcasts.length,
    },
  };
}

async function publishDocument(
  client: ReturnType<typeof getWriteClient>,
  draftId: string,
  publishedId: string,
) {
  await client.patch(draftId).set({ workflowStatus: "ready" }).commit();
  await client.action({
    actionType: "sanity.action.document.publish",
    draftId,
    publishedId,
  });
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = getWriteClient();
  const review = await inspect(client);

  if (!apply) {
    process.stdout.write(
      `${JSON.stringify({ apply: false, ...review }, null, 2)}\n`,
    );
    return;
  }

  await publishDocument(client, SHOW_DRAFT_ID, SHOW_PUBLISHED_ID);
  const publishedShow = await client.getDocument(SHOW_PUBLISHED_ID);
  if (!publishedShow) {
    throw new Error("Show publish did not create a published document.");
  }

  for (const pilot of PILOTS) {
    await publishDocument(client, pilot.draftId, pilot.publishedId);
  }

  const after = await client.fetch(`{
    "publishedShow": *[_id == $showId][0]{_id, title, workflowStatus, _updatedAt},
    "publishedEpisodes": *[_type == "podcastEpisode" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      _id, title, workflowStatus, _updatedAt, publishedAt
    },
    "draftPodcasts": *[_type in ["podcastShow", "podcastEpisode"] && _id in path("drafts.**")]{_id, workflowStatus},
    "publishedPodcastCount": count(*[_type in ["podcastShow", "podcastEpisode"] && !(_id in path("drafts.**"))]),
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))])
  }`, { showId: SHOW_PUBLISHED_ID });

  if (after.publishedPodcastCount !== 5) {
    throw new Error(
      `Expected 5 published podcast documents; found ${after.publishedPodcastCount}.`,
    );
  }
  if (after.publishedEpisodes.length !== 4) {
    throw new Error(
      `Expected 4 published episodes; found ${after.publishedEpisodes.length}.`,
    );
  }
  if (after.publishedHistory !== review.publishedHistory) {
    throw new Error(
      `History published count changed during podcast publish: ${review.publishedHistory} → ${after.publishedHistory}.`,
    );
  }

  process.stdout.write(
    `${JSON.stringify({ apply: true, review, after }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
