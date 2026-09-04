import { getCliClient } from "sanity/cli";

const SHOW_ID = "podcastShow.the-two-tall-jews-show";
const EPISODE_IDS = [
  "podcastEpisode.775bea33-39bf-49b4-bff3-aba9c3ca45a3",
  "podcastEpisode.89aba54c-5d52-4520-b129-3a7aa4da1c55",
  "podcastEpisode.0bfea698-4523-4a11-9b1b-b89f24422b88",
  "podcastEpisode.4609de6e-2e4b-40e0-84a6-34688d9265b5",
];

async function main() {
  const client = getCliClient({
    apiVersion: "2026-08-31",
    useCdn: false,
    perspective: "raw",
  });
  const config = client.config();
  const state = await client.fetch(
    `{
      "projectId": $projectId,
      "dataset": $dataset,
      "show": *[_id == $showId][0]{
        _id, title, workflowStatus, _updatedAt, _createdAt,
        "slug": slug.current, rssUrl, appleUrl, spotifyUrl, youtubeUrl,
        "hostNames": hosts[]->name
      },
      "episodes": *[_id in $episodeIds] | order(publishedAt desc) {
        _id, title, workflowStatus, _updatedAt, publishedAt,
        "slug": slug.current, audioUrl, spotifyUrl, appleUrl, youtubeUrl, youtubeId,
        excerpt, summary, reviewedTranscript, sourceArtworkUrl,
        "guestNames": guests[]->name,
        "hostNames": hosts[]->name,
        "chapterCount": count(chapters),
        "relatedHistoryCount": count(relatedHistory),
        provenance{originalImportIdentifier, identifierKind}
      },
      "publishedPodcasts": *[_type in ["podcastShow", "podcastEpisode"] && !(_id in path("drafts.**"))]{_id, _type, title, workflowStatus},
      "draftPodcasts": *[_type in ["podcastShow", "podcastEpisode"] && _id in path("drafts.**")]{_id, title, workflowStatus},
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "allPodcastIds": *[_type in ["podcastShow", "podcastEpisode"]]._id
    }`,
    {
      projectId: config.projectId,
      dataset: config.dataset,
      showId: SHOW_ID,
      episodeIds: EPISODE_IDS,
    },
  );
  process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
