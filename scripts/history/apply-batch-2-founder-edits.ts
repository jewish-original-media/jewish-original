import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Token checks below fail closed.
}

function createHistoryClient(apply: boolean) {
  if (apply) {
    if (process.env.SANITY_API_WRITE_TOKEN) {
      return createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: "2026-08-31",
        token: process.env.SANITY_API_WRITE_TOKEN,
        useCdn: false,
        perspective: "raw",
      });
    }

    return getCliClient({
      apiVersion: "2026-08-31",
      perspective: "raw",
      useCdn: false,
    });
  }

  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2026-08-31",
    token: process.env.SANITY_API_READ_TOKEN,
    useCdn: false,
    perspective: "raw",
  });
}

const BIALYSTOK_DRAFT_ID =
  "drafts.historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638";
const WILLENBERG_DRAFT_ID =
  "drafts.historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c";
const TRIPOLI_DRAFT_ID =
  "drafts.historyEntry.jom-d68726d23439a8e6135c869acacfd547";
const DACHAU_PUBLISHED_ID = "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const JOOP_PUBLISHED_ID = "historyEntry.jom-513f6a739543db8be9034576144811f9";

const SOURCE_CHECKSUMS = {
  bialystok: "b046934661a0214fb443a2835ce8e0a463b1227bee4094f4e700568a5873a930",
  willenberg:
    "12f1127a816e2e187661bde4c52a743f62a3e3233b0509c020e15dab047e262a",
  tripoli: "ee3b09857951bcaf588de88869a5c0fe3d98a0fb48e9f0da157f8b3e7d4e08e9",
} as const;

const BIALYSTOK_BODY = [
  "On this day, German authorities confined about 50,000 Jews from Bialystok and the surrounding region in a ghetto. It had two sections, divided by the Biala River. Most Jews there were forced to work, many in textile factories.",
  "In February 1943, the Germans deported about 10,000 Jews from the ghetto to Treblinka. In August 1943 they moved to destroy the ghetto. Jewish fighters staged an uprising; more than a hundred escaped and reached partisan groups in nearby forests. Soviet forces took the city in July 1944.",
].join("\n\n");

const WILLENBERG_PARAGRAPHS = [
  "On this day, Samuel Willenberg died in Israel at the age of 93. Born in Częstochowa, Poland, he was deported to Treblinka in 1942 and forced to work there. On August 2, 1943, he took part in the prisoner revolt and escaped.",
  "He later settled in Israel, where he wrote and created sculptures about what he had witnessed. Yad Vashem remembered him as one of the last survivors of Treblinka.",
];

const TRIPOLI_PARAGRAPHS = [
  "On this day, anti-Jewish riots broke out in Tripoli, then under British military administration. Over three days, rioters killed about 120 Jews and wounded hundreds more in the city and nearby towns. They destroyed synagogues and looted hundreds of homes and businesses.",
  "By the eve of World War II, more than 30,000 Jews lived in Libya, and about a quarter of Tripoli’s population was Jewish. The 1945 riots did not empty Libya of its Jewish community; further attacks followed in 1948 and after 1967.",
];

const TRIPOLI_EXCERPT =
  "On this day, November 5, 1945, anti-Jewish riots broke out in Tripoli. Over three days, about 120 Jews were killed in the city and nearby towns.";
const TRIPOLI_SEO_DESCRIPTION =
  "On November 5, 1945, anti-Jewish riots broke out in Tripoli, killing about 120 Jews over three days.";

const DRAFT_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  workflowStatus,
  primaryImage,
  body,
  seo,
  editorialNotes,
  citations[]{verificationStatus,title,url},
  provenance{originalImportIdentifier,sourceSheet,sourceRow,sourceBody,sourceBodyChecksum}
}`;

function bodyText(blocks: { children?: { text?: string }[] }[] | undefined) {
  return (blocks || [])
    .map((block) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .join("\n\n");
}

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function editorialParagraph(prefix: string, text: string, index: number) {
  return {
    _key: `${prefix}-editorial-p${index + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `${prefix}-editorial-s${index + 1}`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function assertUnpublishedSource(
  draft: {
    provenance?: {
      sourceBody?: string;
      sourceBodyChecksum?: string;
    };
  },
  checksum: string,
  label: string,
) {
  if (draft.provenance?.sourceBodyChecksum !== checksum) {
    throw new Error(`${label}: source checksum changed; refusing to edit.`);
  }
  if (sha256(draft.provenance?.sourceBody || "") !== checksum) {
    throw new Error(`${label}: stored source body no longer matches checksum.`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = createHistoryClient(apply);

  const before = await client.fetch(
    `{
    "bialystok": *[_id == $bialystok][0]${DRAFT_PROJECTION},
    "willenberg": *[_id == $willenberg][0]${DRAFT_PROJECTION},
    "tripoli": *[_id == $tripoli][0]${DRAFT_PROJECTION},
    "counts": {
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))] | order(slug.current) .slug.current,
      "dachau": *[_id == $dachau][0]{_id, title, "slug": slug.current, provenance{sourceBodyChecksum}},
      "joop": *[_id == $joop][0]{_id, title, "slug": slug.current, provenance{sourceBodyChecksum}},
      "publishedBatch2": *[_id in [
        "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
        "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
        "historyEntry.jom-d68726d23439a8e6135c869acacfd547",
        "historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc"
      ]]._id
    }
  }`,
    {
      bialystok: BIALYSTOK_DRAFT_ID,
      willenberg: WILLENBERG_DRAFT_ID,
      tripoli: TRIPOLI_DRAFT_ID,
      dachau: DACHAU_PUBLISHED_ID,
      joop: JOOP_PUBLISHED_ID,
    },
  );

  if (!before.bialystok || !before.willenberg || !before.tripoli) {
    throw new Error("Missing one or more Batch 2 drafts.");
  }
  if (before.counts.publishedHistory !== 2) {
    throw new Error(
      `Expected published History count 2; found ${before.counts.publishedHistory}.`,
    );
  }
  if (before.counts.publishedBatch2.length) {
    throw new Error("A Batch 2 or deferred draft is already published.");
  }
  if (
    before.counts.dachau?.slug !== "us-liberates-dachau" ||
    before.counts.joop?.slug !== "joop-westerweel-murdered"
  ) {
    throw new Error("Dachau or Joop published identity changed.");
  }

  for (const draft of [before.bialystok, before.willenberg, before.tripoli]) {
    if (draft.workflowStatus !== "ready") {
      throw new Error(`${draft._id} is not ready.`);
    }
    if (draft.primaryImage) {
      throw new Error(`${draft._id} has an image attached.`);
    }
  }

  assertUnpublishedSource(
    before.bialystok,
    SOURCE_CHECKSUMS.bialystok,
    "Bialystok",
  );
  assertUnpublishedSource(
    before.willenberg,
    SOURCE_CHECKSUMS.willenberg,
    "Willenberg",
  );
  assertUnpublishedSource(before.tripoli, SOURCE_CHECKSUMS.tripoli, "Tripoli");

  if (before.bialystok.slug !== "bialystok-ghetto-established") {
    throw new Error("Bialystok slug changed; refusing to edit.");
  }
  if (bodyText(before.bialystok.body) !== BIALYSTOK_BODY) {
    throw new Error("Bialystok body changed; refusing to edit.");
  }
  if (before.willenberg.slug !== "samuel-willenberg-dies") {
    throw new Error("Willenberg slug changed; refusing to edit.");
  }
  if (before.tripoli.slug !== "anti-jewish-riots-tripoli") {
    throw new Error("Tripoli slug changed; refusing to edit.");
  }

  const verified = (draft: { citations?: { verificationStatus?: string }[] }) =>
    (draft.citations || []).filter(
      (citation) => citation.verificationStatus === "verified",
    ).length;

  if (verified(before.bialystok) !== 2) {
    throw new Error("Bialystok is missing verified citations.");
  }
  if (verified(before.willenberg) !== 3) {
    throw new Error("Willenberg is missing verified citations.");
  }
  if (verified(before.tripoli) !== 3) {
    throw new Error("Tripoli is missing verified citations.");
  }

  if (apply) {
    await client
      .patch(BIALYSTOK_DRAFT_ID)
      .set({
        title: "Bialystok Ghetto Is Sealed",
        "seo.title":
          "Bialystok Ghetto Is Sealed — August 1, 1941 | Jewish Original",
        editorialNotes:
          "Founder publication edit 2026-09-04: public title changed to Bialystok Ghetto Is Sealed. Slug unchanged. Source body unchanged.",
      })
      .commit();

    await client
      .patch(WILLENBERG_DRAFT_ID)
      .set({
        body: WILLENBERG_PARAGRAPHS.map((text, index) =>
          editorialParagraph("willenberg", text, index),
        ),
        editorialNotes:
          "Founder publication edit 2026-09-04: second paragraph uses created sculptures / witnessed. Source body unchanged.",
      })
      .commit({ autoGenerateArrayKeys: false });

    await client
      .patch(TRIPOLI_DRAFT_ID)
      .set({
        excerpt: TRIPOLI_EXCERPT,
        "seo.description": TRIPOLI_SEO_DESCRIPTION,
        body: TRIPOLI_PARAGRAPHS.map((text, index) =>
          editorialParagraph("tripoli", text, index),
        ),
        editorialNotes:
          "Founder publication edit 2026-09-04: public layer uses about 120 because verified sources differ slightly between 120 and 121. Stored workbook 140 remains unused. Source body unchanged.",
      })
      .commit({ autoGenerateArrayKeys: false });
  }

  const after = await client.fetch(
    `{
    "bialystok": *[_id == $bialystok][0]${DRAFT_PROJECTION},
    "willenberg": *[_id == $willenberg][0]${DRAFT_PROJECTION},
    "tripoli": *[_id == $tripoli][0]${DRAFT_PROJECTION},
    "counts": {
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "dachauChecksum": *[_id == $dachau][0].provenance.sourceBodyChecksum,
      "joopChecksum": *[_id == $joop][0].provenance.sourceBodyChecksum,
      "publishedBatch2": *[_id in [
        "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
        "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
        "historyEntry.jom-d68726d23439a8e6135c869acacfd547",
        "historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc"
      ]]._id
    }
  }`,
    {
      bialystok: BIALYSTOK_DRAFT_ID,
      willenberg: WILLENBERG_DRAFT_ID,
      tripoli: TRIPOLI_DRAFT_ID,
      dachau: DACHAU_PUBLISHED_ID,
      joop: JOOP_PUBLISHED_ID,
    },
  );

  const verification = {
    mode: apply ? "apply" : "dry-run",
    publishedHistory: after.counts.publishedHistory,
    stillDraftOnly: after.counts.publishedBatch2.length === 0,
    dachauUnchanged:
      after.counts.dachauChecksum ===
      "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00",
    joopUnchanged:
      after.counts.joopChecksum ===
      "f2578f96248d2ea97d0b0edaa00af88ad29dc1d0078e00863f2d9a6914560ba3",
    bialystok: {
      title: after.bialystok.title,
      slug: after.bialystok.slug,
      seoTitle: after.bialystok.seo?.title,
      bodyUnchanged: bodyText(after.bialystok.body) === BIALYSTOK_BODY,
      sourceUnchanged:
        after.bialystok.provenance?.sourceBodyChecksum ===
          SOURCE_CHECKSUMS.bialystok &&
        after.bialystok.provenance?.sourceBody ===
          before.bialystok.provenance?.sourceBody,
      workflowStatus: after.bialystok.workflowStatus,
    },
    willenberg: {
      title: after.willenberg.title,
      bodyMatches:
        bodyText(after.willenberg.body) === WILLENBERG_PARAGRAPHS.join("\n\n"),
      sourceUnchanged:
        after.willenberg.provenance?.sourceBodyChecksum ===
          SOURCE_CHECKSUMS.willenberg &&
        after.willenberg.provenance?.sourceBody ===
          before.willenberg.provenance?.sourceBody,
      workflowStatus: after.willenberg.workflowStatus,
    },
    tripoli: {
      excerpt: after.tripoli.excerpt,
      seoDescription: after.tripoli.seo?.description,
      bodyMatches:
        bodyText(after.tripoli.body) === TRIPOLI_PARAGRAPHS.join("\n\n"),
      sourceUnchanged:
        after.tripoli.provenance?.sourceBodyChecksum ===
          SOURCE_CHECKSUMS.tripoli &&
        after.tripoli.provenance?.sourceBody ===
          before.tripoli.provenance?.sourceBody,
      workflowStatus: after.tripoli.workflowStatus,
    },
  };

  if (apply) {
    const failed =
      after.counts.publishedHistory !== 2 ||
      after.counts.publishedBatch2.length ||
      !verification.dachauUnchanged ||
      !verification.joopUnchanged ||
      after.bialystok.title !== "Bialystok Ghetto Is Sealed" ||
      after.bialystok.slug !== "bialystok-ghetto-established" ||
      after.bialystok.seo?.title !==
        "Bialystok Ghetto Is Sealed — August 1, 1941 | Jewish Original" ||
      !verification.bialystok.bodyUnchanged ||
      !verification.bialystok.sourceUnchanged ||
      !verification.willenberg.bodyMatches ||
      !verification.willenberg.sourceUnchanged ||
      after.tripoli.excerpt !== TRIPOLI_EXCERPT ||
      after.tripoli.seo?.description !== TRIPOLI_SEO_DESCRIPTION ||
      !verification.tripoli.bodyMatches ||
      !verification.tripoli.sourceUnchanged ||
      after.bialystok.workflowStatus !== "ready" ||
      after.willenberg.workflowStatus !== "ready" ||
      after.tripoli.workflowStatus !== "ready";
    if (failed) {
      throw new Error(
        `Founder-edit verification failed: ${JSON.stringify(verification)}`,
      );
    }
  }

  process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
