import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { createClient } from "@sanity/client";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const [name, value] = line.split("=", 2);
  if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
  if (!process.env[name]) process.env[name] = value.replace(/^["']|["']$/g, "");
}

const SOURCE_CHECKSUM =
  "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00";
const SOURCE_BODY =
  "On this day, American troops liberated Dachau.  In 1942, Dachau built a crematorium; The concentration camp had been in operation for over a decade, with Jewish prisoners as the significant majority. Dachau initially imprisoned political prisoners and forced them in aiding to construct the camp. While in Dachau, prisoners were subjected to biological experiments against their consent, killing or disabling hundreds of prisoners. \n\nOn the days leading up to liberation, thousands of prisoners were on a death march to Tegernsee, Germany. Upon the American arrival, prisoners greeted their rescuers  with flags from the various Allied nations. The Nazi commanders sent a swath of prisoners to Dachau before its liberation. Records estimate that 30,000 people died in Dachau before the American liberation, which managed to rescue 30,000 prisoners. ";
const APPROVED = [
  "On this day, American troops liberated the Dachau concentration camp. The camp had been in operation for more than a decade. It initially held political prisoners, who were forced to help construct and expand it. In 1942, a new crematorium complex was built there. Prisoners were also subjected to medical experiments against their will, killing or harming hundreds of people.",
  "In the days before liberation, more than 7,000 prisoners, most of them Jews, were forced on a death march toward Tegernsee, Germany. Nazi authorities also transferred large numbers of prisoners into Dachau from other camps as Allied forces advanced. When American troops arrived on April 29, 1945, they liberated approximately 32,000 prisoners. Historians estimate that at least 40,000 people died within the Dachau camp system during its twelve years of operation.",
];
const APPROVED_EXCERPT =
  "On April 29, 1945, American troops liberated the Dachau concentration camp, freeing approximately 32,000 prisoners after twelve years of Nazi imprisonment, forced labor, medical experimentation, and mass death.";
const APPROVED_SEO_TITLE =
  "US Liberates Dachau on April 29, 1945 | Jewish Original";
const APPROVED_SEO_DESCRIPTION =
  "On April 29, 1945, American troops liberated approximately 32,000 prisoners from Dachau. Learn the history of the camp, its victims, and its liberation.";

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2026-08-31",
    token: process.env.SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: "raw",
  });

  const draft =
    await client.fetch(`*[_id in ["drafts.historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc", "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc"]]|order(_id desc)[0]{
    _id, title, excerpt, workflowStatus, publicTestCandidate,
    "slug": slug.current,
    historicalDate,
    seo,
    body[]{children[]{text}},
    citations[]{title, url, verificationStatus, source->{_id,name}},
    places[]->{_id,name},
    primaryImage,
    provenance{sourceBody,sourceBodyChecksum}
  }`);
  const published = await client.fetch(
    `*[_id == "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc"][0]._id`,
  );
  const publishedCount = await client.fetch(
    `count(*[_type == "historyEntry" && !(_id in path("drafts.**"))])`,
  );
  const totalHistory = await client.fetch(`count(*[_type == "historyEntry"])`);
  const bodyText = (draft?.body || [])
    .map((block: { children?: { text?: string }[] }) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .join("\n\n");
  const sourceSha = createHash("sha256")
    .update(draft?.provenance?.sourceBody || "", "utf8")
    .digest("hex");

  process.stdout.write(
    `${JSON.stringify(
      {
        draftId: draft?._id || null,
        publishedId: published || null,
        publishedHistoryCount: publishedCount,
        totalHistoryDocumentsIncludingDrafts: totalHistory,
        workflowStatus: draft?.workflowStatus,
        publicTestCandidate: draft?.publicTestCandidate,
        slug: draft?.slug,
        calendarSystem: draft?.historicalDate?.calendarSystem,
        hasImage: Boolean(draft?.primaryImage),
        sourceBodyUnchanged: draft?.provenance?.sourceBody === SOURCE_BODY,
        sourceChecksumMatches:
          draft?.provenance?.sourceBodyChecksum === SOURCE_CHECKSUM &&
          sourceSha === SOURCE_CHECKSUM,
        editorialBodyUnchanged: bodyText === APPROVED.join("\n\n"),
        excerptUnchanged: draft?.excerpt === APPROVED_EXCERPT,
        seoTitleUnchanged: draft?.seo?.title === APPROVED_SEO_TITLE,
        seoDescriptionUnchanged:
          draft?.seo?.description === APPROVED_SEO_DESCRIPTION,
        citationCount: draft?.citations?.length || 0,
        verifiedCitationCount: (draft?.citations || []).filter(
          (citation: { verificationStatus?: string }) =>
            citation.verificationStatus === "verified",
        ).length,
        citationSources: (draft?.citations || []).map(
          (citation: { source?: { name?: string }; title?: string }) =>
            citation.source?.name || citation.title,
        ),
        places: (draft?.places || []).map(
          (place: { name?: string }) => place.name,
        ),
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
