import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { createClient } from "@sanity/client";

async function loadEnv() {
  const file = await readFile(".env.local", "utf8");
  for (const line of file.split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (!process.env[name])
      process.env[name] = value.replace(/^["']|["']$/g, "");
  }
}

async function main() {
  await loadEnv();
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2026-08-31",
    token: process.env.SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: "raw",
  });

  const result = await client.fetch(`{
    "bySource": *[
      _type == "historyEntry" &&
      provenance.originalImportIdentifier in [
        "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0003",
        "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0037",
        "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0104"
      ]
    ]|order(provenance.sourceRow asc){
      _id, title, "slug": slug.current, excerpt, workflowStatus,
      publicTestCandidate, entryKind, historicalDate, contentWarnings,
      reviewFlags[]{code,severity,status},
      "topics": topics[]->{_id,name},
      "people": people[]->{_id,name},
      "places": places[]->{_id,name},
      "eras": eras[]->{_id,name},
      "organizations": organizations[]->{_id,name},
      "geographicRegions": geographicRegions[]->{_id,name},
      citations[]{title,url,verificationStatus},
      primaryImage,
      seo,
      relatedHistory[]{relationType,entry->{_id,title}},
      body[]{children[]{text}},
      provenance{
        originalImportIdentifier, sourceSheet, sourceRow, sourceBody,
        sourceBodyChecksum, sourceTopicValues, sourceRegionValues,
        duplicateClusterId, duplicateClusterMembers
      }
    },
    "published": *[_type == "historyEntry" && !(_id in path("drafts.**"))]{
      _id, title, "slug": slug.current, workflowStatus
    },
    "regions": *[_type == "geographicRegion"]{_id,name,"slug": slug.current},
    "places": *[_type == "place"]{_id,name,"slug": slug.current},
    "topics": *[_type == "topic"]{_id,name,"slug": slug.current},
    "sources": *[_type == "source"]{_id,name,"slug": slug.current}
  }`);

  const packets = result.bySource.map((doc: Record<string, unknown>) => {
    const provenance = doc.provenance as
      { sourceBody?: string; sourceBodyChecksum?: string } | undefined;
    const body = ((doc.body as { children?: { text?: string }[] }[]) || [])
      .map((block) =>
        (block.children || []).map((child) => child.text || "").join(""),
      )
      .join("\n\n");
    const sourceSha = createHash("sha256")
      .update(provenance?.sourceBody || "", "utf8")
      .digest("hex");
    return {
      id: doc._id,
      title: doc.title,
      slug: doc.slug,
      workflowStatus: doc.workflowStatus,
      publicTestCandidate: doc.publicTestCandidate,
      historicalDate: doc.historicalDate,
      contentWarnings: doc.contentWarnings,
      reviewFlags: doc.reviewFlags,
      topics: doc.topics,
      people: doc.people,
      places: doc.places,
      eras: doc.eras,
      organizations: doc.organizations,
      geographicRegions: doc.geographicRegions,
      citations: doc.citations,
      hasImage: Boolean(doc.primaryImage),
      seo: doc.seo,
      relatedHistory: doc.relatedHistory,
      excerpt: doc.excerpt,
      editorialBody: body,
      sourceChecksumMatches: provenance?.sourceBodyChecksum === sourceSha,
      provenance,
    };
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        published: result.published,
        found: packets.length,
        packets,
        regions: result.regions,
        places: result.places,
        topics: result.topics,
        sources: result.sources,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
