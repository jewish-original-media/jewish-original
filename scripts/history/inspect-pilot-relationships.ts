import { getCliClient } from "sanity/cli";

async function main() {
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective: "raw",
    useCdn: false,
  });
  const sourceIds = [
    "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0002",
    "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0005",
    "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0037",
    "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0042",
  ];
  const documents = await client.fetch(
    '*[_type == "historyEntry" && _id in path("drafts.**") && provenance.originalImportIdentifier in $sourceIds]{_id,title,"slug": slug.current,publicTestCandidate,contentWarnings,"topics": topics[]->{_id,name},"people": people[]->{_id,name},"places": places[]->{_id,name},"regions": geographicRegions[]->{_id,name},"eras": eras[]->{_id,name},"organizations": organizations[]->{_id,name},"citationCount": count(citations),"relatedCount": count(relatedHistory),provenance{originalImportIdentifier}}',
    { sourceIds },
  );
  const entities = await client.fetch(
    'count(*[_id in path("drafts.**") && _type in ["person","place","geographicRegion","topic","historicalEra","organization","source"]])',
  );
  process.stdout.write(
    `${JSON.stringify({ entityDrafts: entities, documents }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
