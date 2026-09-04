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

function createWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (token) {
    return createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: "2026-08-31",
      token,
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

const RECORDS = [
  {
    key: "bialystok",
    draftId: "drafts.historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
    publishedId: "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
    slug: "bialystok-ghetto-established",
    title: "Bialystok Ghetto Is Sealed",
    checksum:
      "b046934661a0214fb443a2835ce8e0a463b1227bee4094f4e700568a5873a930",
    verifiedCitations: 2,
    body: [
      "On this day, German authorities confined about 50,000 Jews from Bialystok and the surrounding region in a ghetto. It had two sections, divided by the Biala River. Most Jews there were forced to work, many in textile factories.",
      "In February 1943, the Germans deported about 10,000 Jews from the ghetto to Treblinka. In August 1943 they moved to destroy the ghetto. Jewish fighters staged an uprising; more than a hundred escaped and reached partisan groups in nearby forests. Soviet forces took the city in July 1944.",
    ].join("\n\n"),
  },
  {
    key: "willenberg",
    draftId: "drafts.historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
    publishedId: "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
    slug: "samuel-willenberg-dies",
    title: "Samuel Willenberg Dies",
    checksum:
      "12f1127a816e2e187661bde4c52a743f62a3e3233b0509c020e15dab047e262a",
    verifiedCitations: 3,
    body: [
      "On this day, Samuel Willenberg died in Israel at the age of 93. Born in Częstochowa, Poland, he was deported to Treblinka in 1942 and forced to work there. On August 2, 1943, he took part in the prisoner revolt and escaped.",
      "He later settled in Israel, where he wrote and created sculptures about what he had witnessed. Yad Vashem remembered him as one of the last survivors of Treblinka.",
    ].join("\n\n"),
  },
  {
    key: "tripoli",
    draftId: "drafts.historyEntry.jom-d68726d23439a8e6135c869acacfd547",
    publishedId: "historyEntry.jom-d68726d23439a8e6135c869acacfd547",
    slug: "anti-jewish-riots-tripoli",
    title: "Anti-Jewish Riots Break Out in Tripoli, Libya",
    checksum:
      "ee3b09857951bcaf588de88869a5c0fe3d98a0fb48e9f0da157f8b3e7d4e08e9",
    verifiedCitations: 3,
    body: [
      "On this day, anti-Jewish riots broke out in Tripoli, then under British military administration. Over three days, rioters killed about 120 Jews and wounded hundreds more in the city and nearby towns. They destroyed synagogues and looted hundreds of homes and businesses.",
      "By the eve of World War II, more than 30,000 Jews lived in Libya, and about a quarter of Tripoli’s population was Jewish. The 1945 riots did not empty Libya of its Jewish community; further attacks followed in 1948 and after 1967.",
    ].join("\n\n"),
  },
] as const;

const ALLOWED_SLUGS = [
  "anti-jewish-riots-tripoli",
  "bialystok-ghetto-established",
  "joop-westerweel-murdered",
  "samuel-willenberg-dies",
  "us-liberates-dachau",
];

const BLOCKED_SOURCE_IDS = [
  "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0011",
  "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0042",
  "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0111",
];

const DACHAU_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const JOOP_PUBLISHED_ID =
  "historyEntry.jom-513f6a739543db8be9034576144811f9";
const DACHAU_CHECKSUM =
  "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00";
const JOOP_CHECKSUM =
  "f2578f96248d2ea97d0b0edaa00af88ad29dc1d0078e00863f2d9a6914560ba3";

const DRAFT_PROJECTION = `{
  _id,
  _rev,
  title,
  "slug": slug.current,
  excerpt,
  workflowStatus,
  primaryImage,
  reviewFlags[]{severity,status,code},
  body[]{children[]{text}},
  citations[]{verificationStatus,title,url},
  relatedHistory,
  seo,
  provenance{sourceBody,sourceBodyChecksum,originalImportIdentifier,sourceSheet,sourceRow}
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

function publishedIdFromSource(sourceId: string) {
  return `historyEntry.jom-${sha256(sourceId).slice(0, 32)}`;
}

function weakenRelated(
  items:
    | {
        entry?: {
          _key?: string;
          _ref?: string;
          _type?: string;
          _weak?: boolean;
        };
      }[]
    | undefined,
) {
  return (items || []).map((item) => ({
    ...item,
    entry: item.entry?._ref
      ? {
          _type: "reference",
          _ref: item.entry._ref,
          _key: item.entry._key,
          _weak: true,
        }
      : item.entry,
  }));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = createWriteClient();
  const blockedPublishedIds = BLOCKED_SOURCE_IDS.map(publishedIdFromSource);

  const before = await client.fetch(`{
    "bialystok": *[_id == $bialystok][0]${DRAFT_PROJECTION},
    "willenberg": *[_id == $willenberg][0]${DRAFT_PROJECTION},
    "tripoli": *[_id == $tripoli][0]${DRAFT_PROJECTION},
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
    "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))] | order(slug.current) .slug.current,
    "dachau": *[_id == $dachau][0]{_id, title, "slug": slug.current, provenance{sourceBodyChecksum}},
    "joop": *[_id == $joop][0]{_id, title, "slug": slug.current, provenance{sourceBodyChecksum}},
    "blockedPublished": *[_id in $blockedIds]._id
  }`, {
    bialystok: RECORDS[0].draftId,
    willenberg: RECORDS[1].draftId,
    tripoli: RECORDS[2].draftId,
    dachau: DACHAU_PUBLISHED_ID,
    joop: JOOP_PUBLISHED_ID,
    blockedIds: blockedPublishedIds,
  });

  const drafts = {
    bialystok: before.bialystok,
    willenberg: before.willenberg,
    tripoli: before.tripoli,
  };

  const alreadyPublished =
    before.publishedHistory === 5 &&
    [...(before.publishedSlugs || [])].sort().join() === ALLOWED_SLUGS.join();

  if (alreadyPublished) {
    process.stdout.write(
      `${JSON.stringify({ alreadyPublished: true, publishedSlugs: before.publishedSlugs }, null, 2)}\n`,
    );
    return;
  }

  if (before.publishedHistory !== 2) {
    throw new Error(
      `Expected published History count 2 before Batch 2; found ${before.publishedHistory}.`,
    );
  }
  if (before.blockedPublished.length) {
    throw new Error(
      `Refusing to publish; blocked drafts are already public: ${before.blockedPublished.join(", ")}`,
    );
  }
  if (
    before.dachau?.slug !== "us-liberates-dachau" ||
    before.dachau?.provenance?.sourceBodyChecksum !== DACHAU_CHECKSUM
  ) {
    throw new Error("Dachau changed; refusing to publish.");
  }
  if (
    before.joop?.slug !== "joop-westerweel-murdered" ||
    before.joop?.provenance?.sourceBodyChecksum !== JOOP_CHECKSUM
  ) {
    throw new Error("Joop changed; refusing to publish.");
  }

  for (const record of RECORDS) {
    const draft = drafts[record.key];
    if (!draft) throw new Error(`Missing draft ${record.draftId}.`);
    if (draft.slug !== record.slug) {
      throw new Error(`Unexpected slug for ${record.key}: ${draft.slug}.`);
    }
    if (draft.title !== record.title) {
      throw new Error(`Unexpected title for ${record.key}: ${draft.title}.`);
    }
    if (draft.workflowStatus !== "ready") {
      throw new Error(`${record.key} is not ready.`);
    }
    if (draft.primaryImage) {
      throw new Error(`${record.key} has an image attached.`);
    }
    if (draft.provenance?.sourceBodyChecksum !== record.checksum) {
      throw new Error(`${record.key} source checksum changed.`);
    }
    if (sha256(draft.provenance?.sourceBody || "") !== record.checksum) {
      throw new Error(`${record.key} source body no longer matches checksum.`);
    }
    if (bodyText(draft.body) !== record.body) {
      throw new Error(`${record.key} editorial body is not the founder-final text.`);
    }
    const verified = (draft.citations || []).filter(
      (citation: { verificationStatus?: string }) =>
        citation.verificationStatus === "verified",
    );
    if (verified.length !== record.verifiedCitations) {
      throw new Error(`${record.key} verified citation count changed.`);
    }
    const blocking = (draft.reviewFlags || []).filter(
      (flag: { severity?: string; status?: string }) =>
        flag.severity === "blocking" && flag.status === "open",
    );
    if (blocking.length) {
      throw new Error(`${record.key} still has open blocking flags.`);
    }
  }

  if (drafts.bialystok.seo?.title !==
    "Bialystok Ghetto Is Sealed — August 1, 1941 | Jewish Original") {
    throw new Error("Bialystok SEO title is not the founder-final text.");
  }
  if (
    drafts.tripoli.excerpt !==
      "On this day, November 5, 1945, anti-Jewish riots broke out in Tripoli. Over three days, about 120 Jews were killed in the city and nearby towns." ||
    drafts.tripoli.seo?.description !==
      "On November 5, 1945, anti-Jewish riots broke out in Tripoli, killing about 120 Jews over three days."
  ) {
    throw new Error("Tripoli excerpt/SEO is not the founder-final text.");
  }

  if (!apply) {
    process.stdout.write(
      `${JSON.stringify(
        {
          apply: false,
          publishedHistoryBefore: before.publishedHistory,
          publishedSlugsBefore: before.publishedSlugs,
          ready: RECORDS.map((record) => ({
            draftId: record.draftId,
            publishedId: record.publishedId,
            title: drafts[record.key].title,
            slug: drafts[record.key].slug,
            workflowStatus: drafts[record.key].workflowStatus,
            checksum: drafts[record.key].provenance?.sourceBodyChecksum,
          })),
        },
        null,
        2,
      )}\n`,
    );
    return;
  }

  for (const record of RECORDS) {
    const draft = drafts[record.key];
    await client
      .patch(record.draftId)
      .set({ relatedHistory: weakenRelated(draft.relatedHistory) })
      .commit({ autoGenerateArrayKeys: false });

    await client.action({
      actionType: "sanity.action.document.publish",
      draftId: record.draftId,
      publishedId: record.publishedId,
    });
  }

  const after = await client.fetch(`{
    "published": *[_id in $publishedIds] | order(slug.current asc) {
      _id, _createdAt, _updatedAt, title, "slug": slug.current, workflowStatus,
      provenance{sourceBodyChecksum,originalImportIdentifier,sourceSheet,sourceRow}
    },
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
    "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))] | order(slug.current) .slug.current,
    "unexpectedPublished": *[_type == "historyEntry" && !(_id in path("drafts.**")) && !(slug.current in $allowedSlugs)]{_id, title, "slug": slug.current},
    "dachauChecksum": *[_id == $dachau][0].provenance.sourceBodyChecksum,
    "joopChecksum": *[_id == $joop][0].provenance.sourceBodyChecksum,
    "blockedPublished": *[_id in $blockedIds]._id
  }`, {
    publishedIds: RECORDS.map((record) => record.publishedId),
    allowedSlugs: ALLOWED_SLUGS,
    dachau: DACHAU_PUBLISHED_ID,
    joop: JOOP_PUBLISHED_ID,
    blockedIds: blockedPublishedIds,
  });

  const publishedSlugs = [...(after.publishedSlugs || [])].sort();
  if (after.publishedHistory !== 5 || publishedSlugs.join() !== ALLOWED_SLUGS.join()) {
    throw new Error(
      `Publication invariant failed: ${JSON.stringify(after.publishedSlugs)}.`,
    );
  }
  if (after.unexpectedPublished.length || after.blockedPublished.length) {
    throw new Error(
      `Publication leaked other drafts: ${JSON.stringify({
        unexpectedPublished: after.unexpectedPublished,
        blockedPublished: after.blockedPublished,
      })}`,
    );
  }
  if (after.dachauChecksum !== DACHAU_CHECKSUM) {
    throw new Error("Dachau checksum changed during publication.");
  }
  if (after.joopChecksum !== JOOP_CHECKSUM) {
    throw new Error("Joop checksum changed during publication.");
  }
  for (const record of RECORDS) {
    const published = after.published.find(
      (item: { _id: string }) => item._id === record.publishedId,
    );
    if (!published) throw new Error(`Missing published ${record.key}.`);
    if (published.provenance?.sourceBodyChecksum !== record.checksum) {
      throw new Error(`${record.key} published checksum changed.`);
    }
    if (published.workflowStatus !== "ready") {
      throw new Error(`${record.key} published workflow is not ready.`);
    }
  }

  process.stdout.write(`${JSON.stringify({ apply: true, ...after }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
