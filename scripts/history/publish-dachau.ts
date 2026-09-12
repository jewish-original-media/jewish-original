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
  "drafts.historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const HISTORY_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const EXPECTED_SLUG = "us-liberates-dachau";
const SOURCE_BODY_CHECKSUM =
  "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00";
const EXPECTED_SOURCE_BODY =
  "On this day, American troops liberated Dachau.  In 1942, Dachau built a crematorium; The concentration camp had been in operation for over a decade, with Jewish prisoners as the significant majority. Dachau initially imprisoned political prisoners and forced them in aiding to construct the camp. While in Dachau, prisoners were subjected to biological experiments against their consent, killing or disabling hundreds of prisoners. \n\nOn the days leading up to liberation, thousands of prisoners were on a death march to Tegernsee, Germany. Upon the American arrival, prisoners greeted their rescuers  with flags from the various Allied nations. The Nazi commanders sent a swath of prisoners to Dachau before its liberation. Records estimate that 30,000 people died in Dachau before the American liberation, which managed to rescue 30,000 prisoners. ";
const APPROVED_BODY = [
  "On this day, American troops liberated the Dachau concentration camp. The camp had been in operation for more than a decade. It initially held political prisoners, who were forced to help construct and expand it. In 1942, a new crematorium complex was built there. Prisoners were also subjected to medical experiments against their will, killing or harming hundreds of people.",
  "In the days before liberation, more than 7,000 prisoners, most of them Jews, were forced on a death march toward Tegernsee, Germany. Nazi authorities also transferred large numbers of prisoners into Dachau from other camps as Allied forces advanced. When American troops arrived on April 29, 1945, they liberated approximately 32,000 prisoners. Historians estimate that at least 40,000 people died within the Dachau camp system during its twelve years of operation.",
].join("\n\n");

const DRAFT_PROJECTION = `{
  _id,
  _rev,
  title,
  "slug": slug.current,
  excerpt,
  workflowStatus,
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
  if (draft.title !== "US Liberates Dachau") {
    throw new Error("Refusing to publish an unexpected title.");
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
  if (verifiedCitations.length !== 4) {
    throw new Error("Expected four verified citations before publication.");
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
    dachauPublished: string | null;
  }>(
    `{
    "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
    "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))].slug.current,
    "dachauPublished": *[_id == $id][0]._id
  }`,
    { id: HISTORY_PUBLISHED_ID },
  );

  if (
    publishedBefore.dachauPublished &&
    publishedBefore.publishedHistory === 1 &&
    publishedBefore.publishedSlugs.join() === EXPECTED_SLUG
  ) {
    process.stdout.write(
      `${JSON.stringify({ alreadyPublished: true, ...publishedBefore }, null, 2)}\n`,
    );
    return;
  }
  if (publishedBefore.publishedHistory !== 0) {
    throw new Error(
      `Expected zero published history records before Dachau; found ${publishedBefore.publishedHistory}.`,
    );
  }

  if (!apply) {
    process.stdout.write(
      `${JSON.stringify(
        {
          apply: false,
          draftId: draft._id,
          publishedId: HISTORY_PUBLISHED_ID,
          slug: draft.slug,
          currentWorkflowStatus: draft.workflowStatus,
          nextWorkflowStatus: "ready",
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
    .set({ workflowStatus: "ready", relatedHistory })
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
    "publishedSlugs": *[_type == "historyEntry" && !(_id in path("drafts.**"))].slug.current,
    "draftHistory": count(*[_type == "historyEntry" && _id in path("drafts.**")])
  }`,
    { publishedId: HISTORY_PUBLISHED_ID },
  );

  if (
    after.publishedHistory !== 1 ||
    after.publishedSlugs.join() !== EXPECTED_SLUG
  ) {
    throw new Error(
      `Publication invariant failed: ${JSON.stringify(after.publishedSlugs)}.`,
    );
  }
  if (
    after.published?.provenance?.sourceBodyChecksum !== SOURCE_BODY_CHECKSUM
  ) {
    throw new Error("Published document source checksum changed.");
  }

  process.stdout.write(
    `${JSON.stringify({ apply: true, ...after }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
