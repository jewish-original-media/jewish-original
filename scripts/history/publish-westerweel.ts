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
  // The token check below fails closed.
}

const HISTORY_DRAFT_ID =
  "drafts.historyEntry.jom-513f6a739543db8be9034576144811f9";
const HISTORY_PUBLISHED_ID =
  "historyEntry.jom-513f6a739543db8be9034576144811f9";
const DACHAU_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const EXPECTED_SLUG = "joop-westerweel-murdered";
const EXPECTED_TITLE = "Joop Westerweel Is Murdered at Vught";
const SOURCE_BODY_CHECKSUM =
  "f2578f96248d2ea97d0b0edaa00af88ad29dc1d0078e00863f2d9a6914560ba3";
const EXPECTED_SOURCE_BODY =
  "On this day, Nazis murdered Joop Westerweel, a Righteous Among the Nations - a non-Jewish ally who had a mission to help Jewish people during the Holocaust. He was raised in a Christian household and grew up with the values of pacifism. \n\nAfter expulsion from the Dutch East Indies for refusing to join the army, he became a teacher at a progressive school in Bilthoven, a small village in the Netherlands. While teaching, Westerweel worked with Jewish refugee children who came to Holland in the 1930s to escape the Nazi regime. In 1940, he moved to Rotterdam and became the principal of a Montessori school. He met a group of Jewish pioneers who wanted to learn about agriculture before moving to Israel. When the Nazis started to round up Jews more rapidly, Westerweel tried to hide his Jewish friends. But, as the Nazis would typically find hidden Jews, he came up with an escape route for the Jews to get to Spain, then get to Israel. Joop and his group smuggled 150 to 200 Jewish people during the Second World War. \n\nOn March 14, 1944, the Nazis arrested Joop while he was trying to smuggle out two Jewish women; They sent Joop Westerweel to the Vught concentration camp. On June 16, 1964, Joop and his wife, Wilhelmina, were recognized as Righteous Among the Nations by Yad Vashem for their efforts to save Jews during the Holocaust. \n";
const APPROVED_BODY = [
  "On this day, German authorities executed Joop Westerweel at the Vught concentration camp. Westerweel, a Dutch teacher and pacifist, had helped hide Jewish youth and organize escape routes out of the occupied Netherlands. He was arrested on March 11, 1944, at the Belgian border while escorting two Jewish women.",
  "In 1964, Yad Vashem recognized Westerweel and his wife, Wilhelmina, as Righteous Among the Nations.",
].join("\n\n");

const BLOCKED_PUBLISHED_IDS = [
  "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
  "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
  "historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc",
];

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
  provenance{sourceBody,sourceBodyChecksum}
}`;

function bodyText(blocks: { children?: { text?: string }[] }[] | undefined) {
  return (blocks || [])
    .map((block) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .join("\n\n");
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

async function main() {
  const apply = process.argv.includes("--apply");
  const client = createWriteClient();

  const draft = await client.fetch(`*[_id == $id][0]${DRAFT_PROJECTION}`, {
    id: HISTORY_DRAFT_ID,
  });
  if (!draft) {
    throw new Error(`Missing draft ${HISTORY_DRAFT_ID}.`);
  }
  if (draft.slug !== EXPECTED_SLUG) {
    throw new Error(`Refusing to publish unexpected slug ${draft.slug}.`);
  }
  if (draft.title !== EXPECTED_TITLE) {
    throw new Error("Refusing to publish an unexpected title.");
  }
  if (draft.workflowStatus !== "ready") {
    throw new Error(
      `Refusing to publish while workflowStatus is ${draft.workflowStatus}.`,
    );
  }
  if (draft.primaryImage) {
    throw new Error("Refusing to publish; an image is attached.");
  }
  if (draft.provenance?.sourceBody !== EXPECTED_SOURCE_BODY) {
    throw new Error(
      "Immutable source body does not match the imported original.",
    );
  }
  if (draft.provenance?.sourceBodyChecksum !== SOURCE_BODY_CHECKSUM) {
    throw new Error("Source body checksum changed; refusing to publish.");
  }
  if (bodyText(draft.body) !== APPROVED_BODY) {
    throw new Error("Editorial body changed; refusing to publish.");
  }
  const verifiedCitations = (draft.citations || []).filter(
    (citation: { verificationStatus?: string }) =>
      citation.verificationStatus === "verified",
  );
  if (verifiedCitations.length !== 2) {
    throw new Error("Expected two verified citations before publication.");
  }
  const blockingFlags = (draft.reviewFlags || []).filter(
    (flag: { severity?: string; status?: string }) =>
      flag.severity === "blocking" && flag.status === "open",
  );
  if (blockingFlags.length) {
    throw new Error("Open blocking review flags remain; refusing to publish.");
  }

  const publishedBefore = await client.fetch<{
    publishedHistory: number;
    publishedSlugs: string[];
    joopPublished: string | null;
    dachauPublished: string | null;
    blockedPublished: string[];
  }>(
    `{
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))].slug.current,
      "joopPublished": *[_id == $joopId][0]._id,
      "dachauPublished": *[_id == $dachauId][0]._id,
      "blockedPublished": *[_id in $blockedIds]._id
    }`,
    {
      joopId: HISTORY_PUBLISHED_ID,
      dachauId: DACHAU_PUBLISHED_ID,
      blockedIds: BLOCKED_PUBLISHED_IDS,
    },
  );

  if (publishedBefore.blockedPublished.length) {
    throw new Error(
      `Refusing to publish; blocked drafts are already public: ${publishedBefore.blockedPublished.join(", ")}`,
    );
  }
  if (!publishedBefore.dachauPublished) {
    throw new Error("Dachau must remain the first published History article.");
  }
  if (
    publishedBefore.joopPublished &&
    publishedBefore.publishedHistory === 2 &&
    publishedBefore.publishedSlugs.includes(EXPECTED_SLUG)
  ) {
    process.stdout.write(
      `${JSON.stringify({ alreadyPublished: true, ...publishedBefore }, null, 2)}\n`,
    );
    return;
  }
  if (publishedBefore.publishedHistory !== 1) {
    throw new Error(
      `Expected exactly one published History record before Joop; found ${publishedBefore.publishedHistory}.`,
    );
  }
  if (publishedBefore.joopPublished) {
    throw new Error("Joop is already published in an unexpected collection state.");
  }

  if (!apply) {
    process.stdout.write(
      `${JSON.stringify(
        {
          apply: false,
          draftId: draft._id,
          publishedId: HISTORY_PUBLISHED_ID,
          slug: draft.slug,
          workflowStatus: draft.workflowStatus,
          publishedHistoryBefore: publishedBefore.publishedHistory,
          publishedSlugsBefore: publishedBefore.publishedSlugs,
        },
        null,
        2,
      )}\n`,
    );
    return;
  }

  const relatedHistory = (draft.relatedHistory || []).map(
    (item: {
      entry?: {
        _key?: string;
        _ref?: string;
        _type?: string;
        _weak?: boolean;
      };
    }) => ({
      ...item,
      entry: item.entry?._ref
        ? {
            _type: "reference",
            _ref: item.entry._ref,
            _key: item.entry._key,
            _weak: true,
          }
        : item.entry,
    }),
  );

  await client
    .patch(HISTORY_DRAFT_ID)
    .set({ relatedHistory })
    .commit({ autoGenerateArrayKeys: false });

  await client.action({
    actionType: "sanity.action.document.publish",
    draftId: HISTORY_DRAFT_ID,
    publishedId: HISTORY_PUBLISHED_ID,
  });

  const after = await client.fetch(
    `{
      "published": *[_id == $publishedId][0]{
        _id, _createdAt, _updatedAt, title, "slug": slug.current, workflowStatus,
        provenance{sourceBodyChecksum}
      },
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))] | order(slug.current) .slug.current,
      "dachauPublished": *[_id == $dachauId][0]._id,
      "blockedPublished": *[_id in $blockedIds]._id,
      "draftHistory": count(*[_type == "historyEntry" && _id in path("drafts.**")])
    }`,
    {
      publishedId: HISTORY_PUBLISHED_ID,
      dachauId: DACHAU_PUBLISHED_ID,
      blockedIds: BLOCKED_PUBLISHED_IDS,
    },
  );

  const publishedSlugs = [...(after.publishedSlugs || [])].sort();
  if (
    after.publishedHistory !== 2 ||
    publishedSlugs.join() !== "joop-westerweel-murdered,us-liberates-dachau"
  ) {
    throw new Error(
      `Publication invariant failed: ${JSON.stringify(after.publishedSlugs)}.`,
    );
  }
  if (after.blockedPublished.length) {
    throw new Error(
      `Publication leaked other drafts: ${after.blockedPublished.join(", ")}`,
    );
  }
  if (!after.dachauPublished) {
    throw new Error("Dachau disappeared during Joop publication.");
  }
  if (after.published?.provenance?.sourceBodyChecksum !== SOURCE_BODY_CHECKSUM) {
    throw new Error("Published document source checksum changed.");
  }
  if (after.published?.workflowStatus !== "ready") {
    throw new Error("Published Joop is not workflow ready.");
  }

  process.stdout.write(`${JSON.stringify({ apply: true, ...after }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
