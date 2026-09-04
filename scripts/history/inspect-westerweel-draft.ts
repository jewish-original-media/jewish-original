import { getCliClient } from "sanity/cli";

const JOOP_DRAFT_ID = "drafts.historyEntry.jom-513f6a739543db8be9034576144811f9";
const JOOP_PUBLISHED_ID = "historyEntry.jom-513f6a739543db8be9034576144811f9";
const DACHAU_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";

async function main() {
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective: "raw",
    useCdn: false,
  });

  const joop = await client.fetch(
    `*[_id == $id][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      workflowStatus,
      publicTestCandidate,
      contentWarnings,
      historicalDate,
      primaryImage,
      seo,
      body,
      citations,
      organizations,
      "topics": topics[]->{_id,name},
      "people": people[]->{_id,name},
      "places": places[]->{_id,name},
      "geographicRegions": geographicRegions[]->{_id,name},
      "eras": eras[]->{_id,name},
      "organizationDocs": organizations[]->{_id,name},
      relatedHistory[]{relationType,note,entry->{_id,title,"slug": slug.current}},
      provenance
    }`,
    { id: JOOP_DRAFT_ID },
  );
  const counts = await client.fetch(`{
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
    "joopPublished": count(*[_id == $joopPublished]),
    "dachauPublished": count(*[_id == $dachauPublished]),
    "yadVashemSource": *[_id == "source.yad-vashem"][0]{_id,name,canonicalUrl},
    "yadVashemOrg": *[_id == "organization.yad-vashem"][0]{_id,name}
  }`, {
    joopPublished: JOOP_PUBLISHED_ID,
    dachauPublished: DACHAU_PUBLISHED_ID,
  });

  process.stdout.write(`${JSON.stringify({ joop, counts }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
