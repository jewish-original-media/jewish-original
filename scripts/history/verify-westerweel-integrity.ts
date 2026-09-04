import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { createClient } from "@sanity/client";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const [name, value] = line.split("=", 2);
  if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
  if (!process.env[name]) process.env[name] = value.replace(/^["']|["']$/g, "");
}

const JOOP_SOURCE_CHECKSUM =
  "f2578f96248d2ea97d0b0edaa00af88ad29dc1d0078e00863f2d9a6914560ba3";
const JOOP_SOURCE_BODY =
  "On this day, Nazis murdered Joop Westerweel, a Righteous Among the Nations - a non-Jewish ally who had a mission to help Jewish people during the Holocaust. He was raised in a Christian household and grew up with the values of pacifism. \n\nAfter expulsion from the Dutch East Indies for refusing to join the army, he became a teacher at a progressive school in Bilthoven, a small village in the Netherlands. While teaching, Westerweel worked with Jewish refugee children who came to Holland in the 1930s to escape the Nazi regime. In 1940, he moved to Rotterdam and became the principal of a Montessori school. He met a group of Jewish pioneers who wanted to learn about agriculture before moving to Israel. When the Nazis started to round up Jews more rapidly, Westerweel tried to hide his Jewish friends. But, as the Nazis would typically find hidden Jews, he came up with an escape route for the Jews to get to Spain, then get to Israel. Joop and his group smuggled 150 to 200 Jewish people during the Second World War. \n\nOn March 14, 1944, the Nazis arrested Joop while he was trying to smuggle out two Jewish women; They sent Joop Westerweel to the Vught concentration camp. On June 16, 1964, Joop and his wife, Wilhelmina, were recognized as Righteous Among the Nations by Yad Vashem for their efforts to save Jews during the Holocaust. \n";
const APPROVED = [
  "On this day, German authorities executed Joop Westerweel at the Vught concentration camp. Westerweel, a Dutch teacher and pacifist, had helped hide Jewish youth and organize escape routes out of the occupied Netherlands. He was arrested on March 11, 1944, at the Belgian border while escorting two Jewish women.",
  "In 1964, Yad Vashem recognized Westerweel and his wife, Wilhelmina, as Righteous Among the Nations.",
];
const APPROVED_TITLE = "Joop Westerweel Is Murdered at Vught";
const APPROVED_EXCERPT =
  "On this day, August 11, 1944, German authorities executed Joop Westerweel at Vught for helping Jews escape Nazi deportation.";
const APPROVED_SEO_TITLE =
  "Joop Westerweel Is Murdered at Vught — August 11, 1944 | Jewish Original";
const APPROVED_SEO_DESCRIPTION =
  "On August 11, 1944, Joop Westerweel was executed at Vught for helping Jews escape Nazi persecution and deportation.";
const DACHAU_SOURCE_CHECKSUM =
  "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00";

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2026-08-31",
    token: process.env.SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: "raw",
  });

  const result = await client.fetch(`{
    "joop": *[_id in ["drafts.historyEntry.jom-513f6a739543db8be9034576144811f9", "historyEntry.jom-513f6a739543db8be9034576144811f9"]]|order(_id)[0]{
      _id, title, excerpt, workflowStatus, publicTestCandidate,
      "slug": slug.current,
      historicalDate,
      seo,
      contentWarnings,
      editorialNotes,
      body[]{children[]{text}},
      citations[]{title, url, verificationStatus, source->{_id,name}},
      people[]->{_id,name},
      places[]->{_id,name},
      topics[]->{_id,name},
      eras[]->{_id,name},
      geographicRegions[]->{_id,name},
      organizations[]->{_id,name},
      primaryImage,
      provenance{sourceBody,sourceBodyChecksum,originalImportIdentifier,rawRecordChecksum,importDocumentChecksum}
    },
    "dachau": *[_id == "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc"][0]{
      _id, title, "slug": slug.current, workflowStatus,
      provenance{sourceBodyChecksum}
    },
    "publishedHistoryCount": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
    "publishedTitles": *[_type == "historyEntry" && !(_id in path("drafts.**"))]{title, "slug": slug.current, workflowStatus},
    "joopPublished": *[_id == "historyEntry.jom-513f6a739543db8be9034576144811f9"][0]._id,
    "bialystokPublished": *[_id == "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638"][0]._id,
    "willenbergPublished": *[_id == "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c"][0]._id,
    "rulfPublished": *[_id == "historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc"][0]._id,
    "bialystokDraft": *[_id == "drafts.historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638"][0]{title, workflowStatus},
    "willenbergDraft": *[_id == "drafts.historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c"][0]{title, workflowStatus},
    "rulfDraft": *[_id == "drafts.historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc"][0]{title, workflowStatus}
  }`);

  const joop = result.joop;
  const bodyText = (joop?.body || [])
    .map((block: { children?: { text?: string }[] }) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .join("\n\n");
  const sourceSha = createHash("sha256")
    .update(joop?.provenance?.sourceBody || "", "utf8")
    .digest("hex");

  process.stdout.write(
    `${JSON.stringify(
      {
        draftId: joop?._id || null,
        joopPublishedId: result.joopPublished || null,
        publishedHistoryCount: result.publishedHistoryCount,
        publishedTitles: result.publishedTitles,
        workflowStatus: joop?.workflowStatus,
        publicTestCandidate: joop?.publicTestCandidate,
        title: joop?.title,
        slug: joop?.slug,
        calendarSystem: joop?.historicalDate?.calendarSystem,
        hasImage: Boolean(joop?.primaryImage),
        organizations: (joop?.organizations || []).map(
          (organization: { name?: string }) => organization.name,
        ),
        people: (joop?.people || []).map((person: { name?: string }) => person.name),
        places: (joop?.places || []).map((place: { name?: string }) => place.name),
        topics: (joop?.topics || []).map((topic: { name?: string }) => topic.name),
        sourceBodyUnchanged: joop?.provenance?.sourceBody === JOOP_SOURCE_BODY,
        sourceChecksumMatches:
          joop?.provenance?.sourceBodyChecksum === JOOP_SOURCE_CHECKSUM &&
          sourceSha === JOOP_SOURCE_CHECKSUM,
        editorialBodyMatches: bodyText === APPROVED.join("\n\n"),
        titleMatches: joop?.title === APPROVED_TITLE,
        excerptMatches: joop?.excerpt === APPROVED_EXCERPT,
        seoTitleMatches: joop?.seo?.title === APPROVED_SEO_TITLE,
        seoDescriptionMatches:
          joop?.seo?.description === APPROVED_SEO_DESCRIPTION,
        citationCount: joop?.citations?.length || 0,
        verifiedCitationCount: (joop?.citations || []).filter(
          (citation: { verificationStatus?: string }) =>
            citation.verificationStatus === "verified",
        ).length,
        citations: (joop?.citations || []).map(
          (citation: {
            source?: { name?: string };
            title?: string;
            url?: string;
            verificationStatus?: string;
          }) => ({
            title: citation.title,
            source: citation.source?.name,
            url: citation.url,
            verificationStatus: citation.verificationStatus,
          }),
        ),
        dachauUnchanged:
          result.dachau?._id ===
            "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc" &&
          result.dachau?.slug === "us-liberates-dachau" &&
          result.dachau?.workflowStatus === "ready" &&
          result.dachau?.provenance?.sourceBodyChecksum ===
            DACHAU_SOURCE_CHECKSUM,
        batchUnpublished: {
          bialystok: !result.bialystokPublished && Boolean(result.bialystokDraft),
          willenberg:
            !result.willenbergPublished && Boolean(result.willenbergDraft),
          rulf: !result.rulfPublished && Boolean(result.rulfDraft),
        },
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
