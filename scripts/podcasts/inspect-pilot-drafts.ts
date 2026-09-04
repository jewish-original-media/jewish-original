import { getCliClient } from "sanity/cli";

async function main() {
  const client = getCliClient({
    apiVersion: "2026-08-31",
    useCdn: false,
    perspective: "raw",
  });
  const docs = await client.fetch(`{
    "people": *[_id in [
      "person.meyer-grunberg",
      "person.isaac-simon",
      "person.kalman-gavriel",
      "person.alexandra-zapruder"
    ]]{_id, _createdAt},
    "draftShowIds": *[_id == "drafts.podcastShow.the-two-tall-jews-show"]._id,
    "draftEpisodeIds": *[_type == "podcastEpisode" && _id in path("drafts.**")]._id,
    "publishedPodcasts": count(*[_type in ["podcastShow", "podcastEpisode"] && !(_id in path("drafts.**"))]),
    "draftPodcasts": count(*[_type in ["podcastShow", "podcastEpisode"] && _id in path("drafts.**")])
  }`);
  process.stdout.write(`${JSON.stringify(docs, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
