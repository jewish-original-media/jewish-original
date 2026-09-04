import { getCliClient } from "sanity/cli";

async function main() {
  const client = getCliClient({
    apiVersion: "2026-08-31",
    useCdn: false,
    perspective: "raw",
  });
  const config = client.config();
  const docs = await client.fetch(`{
    "projectId": "${config.projectId}",
    "dataset": "${config.dataset}",
    "draftShows": *[_type == "podcastShow" && _id in path("drafts.**")]{
      _id, title, "slug": slug.current, workflowStatus, "hostNames": hosts[]->name
    },
    "draftEpisodes": *[_type == "podcastEpisode" && _id in path("drafts.**")] | order(publishedAt desc) {
      _id, title, "slug": slug.current, publishedAt, workflowStatus,
      "showRef": show._ref, showSlug,
      "hostNames": hosts[]->name,
      "guestNames": guests[]->name,
      "hasAudio": defined(audioUrl),
      "hasSpotify": defined(spotifyUrl),
      "hasApple": defined(appleUrl),
      "hasYouTube": defined(youtubeUrl) || defined(youtubeId),
      "hasSourceArtwork": defined(sourceArtworkUrl),
      "hasFeaturedImage": defined(featuredImage.asset),
      "hasSummary": defined(summary),
      "hasTranscript": defined(reviewedTranscript),
      "chapterCount": count(chapters),
      "relatedHistoryCount": count(relatedHistory),
      "guid": provenance.originalImportIdentifier
    },
    "publishedPodcasts": count(*[_type in ["podcastShow", "podcastEpisode"] && !(_id in path("drafts.**"))]),
    "draftPodcasts": count(*[_type in ["podcastShow", "podcastEpisode"] && _id in path("drafts.**")]),
    "allPodcastIds": *[_type in ["podcastShow", "podcastEpisode"]]._id,
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))])
  }`);
  process.stdout.write(`${JSON.stringify(docs, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
