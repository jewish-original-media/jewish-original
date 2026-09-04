import { getCliClient } from "sanity/cli";

async function main() {
  const perspective = process.argv.includes("--drafts") ? "drafts" : "raw";
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective,
    useCdn: false,
  });
  const document = await client.fetch(
    '*[_type == "historyEntry" && slug.current == "us-liberates-dachau"][0]{_id,title,slug,excerpt,entryKind,workflowStatus,publicTestCandidate,contentWarnings,historicalDate,hebrewDate,observanceRule,body,citations,primaryImage,seo,topics[]->{_id,name,"slug": slug.current},people[]->{_id,name},places[]->{_id,name},geographicRegions[]->{_id,name},eras[]->{_id,name},organizations[]->{_id,name},relatedHistory[]{relationType,note,entry->{_id,title}},provenance}',
  );
  process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
