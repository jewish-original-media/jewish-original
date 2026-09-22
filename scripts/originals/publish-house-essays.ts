import { createReadStream } from "node:fs";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

import { convertSourceBody } from "../../src/lib/history/source-body";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Token check below fails closed.
}

const MEYER_ID = "person.meyer-grunberg";
const ISAAC_ID = "person.isaac-simon";
const FEATURE_PUBLISHED_AT = "2026-09-12T04:05:00.000Z";
const SUPPORTING_PUBLISHED_AT = "2026-09-12T04:00:00.000Z";

const PATH_FORWARD = {
  id: "article.our-path-forward",
  title: "Our Path Forward",
  slug: "our-path-forward",
  excerpt:
    "Jewish Original Media started as a response: to loss, to longing, to the silence we felt in the spaces we loved.",
  body: [
    "Jewish Original Media started as a response: to loss, to longing, to the silence we felt in the spaces we loved.",
    "We don’t ask what’s going viral. We ask what’s worth remembering in 100 years.",
    "Each piece of content is stitched with kavod (honor), with chutzpah (courage), and with a fierce love of our people.",
    "We believe Jewish creativity is not just heritage. It’s a living engine of renewal. That’s our path forward.",
  ].join("\n\n"),
  seoDescription:
    "The founding essay of Jewish Original Media: remember, rebuild, and create.",
};

const WHAT_DRIVES_US = {
  id: "article.what-drives-us",
  title: "What Drives Us",
  slug: "what-drives-us",
  excerpt:
    "We’re two friends who couldn’t stay quiet. What began as conversations on Jewish meaning became a home for the Jewish story in real time.",
  body: [
    "We’re two friends who couldn’t stay quiet. What began as conversations on Jewish meaning — across coffees, comment sections, and Shabbat tables — became a home for the Jewish story in real time.",
    "This isn’t a brand. It’s a movement of memory. We don’t just write headlines. We listen to whispers of history, translate the poetry of our people, and beam it back into the scrolls of your feed.",
    "We’re not in this for clicks. We’re in it for legacy.",
  ].join("\n\n"),
  seoDescription:
    "Meyer Grunberg and Isaac Simon on why Jewish Original Media exists.",
};

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

function authorRefs() {
  return [
    {
      _type: "reference" as const,
      _ref: MEYER_ID,
      _key: "author-meyer",
    },
    {
      _type: "reference" as const,
      _ref: ISAAC_ID,
      _key: "author-isaac",
    },
  ];
}

function essayDocument(
  essay: typeof PATH_FORWARD,
  publishedAt: string,
  featuredMedia?: Record<string, unknown>,
) {
  return {
    _id: essay.id,
    _type: "article",
    title: essay.title,
    slug: { _type: "slug", current: essay.slug },
    authors: authorRefs(),
    excerpt: essay.excerpt,
    body: convertSourceBody(essay.body).blocks,
    publishedAt,
    workflowStatus: "published",
    featuredMedia,
    seo: {
      title: essay.title,
      description: essay.seoDescription,
    },
    editorialNotes:
      "Founder-approved About copy, first published on /about, issued as an Original without invented sentences.",
  };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = createWriteClient();

  const people = await client.fetch<{ _id: string }[]>(
    `*[_id in [$meyer, $isaac]]{_id}`,
    { meyer: MEYER_ID, isaac: ISAAC_ID },
  );
  if (people.length !== 2) {
    throw new Error(
      "Meyer Grunberg and Isaac Simon person records are required.",
    );
  }

  let featuredMedia: Record<string, unknown> | undefined;
  if (apply) {
    const image = await client.assets.upload(
      "image",
      createReadStream(resolve("public/media/founder/meyer-isaac-steps.webp")),
      { filename: "meyer-isaac-steps.webp" },
    );
    featuredMedia = {
      _type: "editorialImage",
      asset: { _type: "reference", _ref: image._id },
      alt: "Meyer Grunberg and Isaac Simon on Jerusalem limestone steps",
      caption: "Meyer Grunberg and Isaac Simon. Jerusalem.",
      visualKind: "photograph",
      creditLine: "Jewish Original Media",
      rightsHolder: "Jewish Original Media",
      rightsStatus: "cleared",
      permittedUses: ["website"],
      evidenceNote:
        "Class A founder-owned photograph already used on /about. Uploaded for the house essay only.",
    };
  }

  const documents = [
    essayDocument(PATH_FORWARD, FEATURE_PUBLISHED_AT, featuredMedia),
    essayDocument(WHAT_DRIVES_US, SUPPORTING_PUBLISHED_AT),
  ];

  if (!apply) {
    console.log(
      JSON.stringify(
        {
          apply: false,
          titles: documents.map((document) => document.title),
          source: "founder-approved About copy",
        },
        null,
        2,
      ),
    );
    return;
  }

  for (const document of documents) {
    await client.createOrReplace(document);
  }

  console.log(
    JSON.stringify(
      {
        apply: true,
        published: documents.map((document) => ({
          id: document._id,
          slug: document.slug.current,
        })),
      },
      null,
      2,
    ),
  );
}

void main();
