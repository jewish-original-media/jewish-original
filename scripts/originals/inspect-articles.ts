import { readFileSync } from "node:fs";

import { createClient } from "@sanity/client";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const [name, value] = line.split("=", 2);
  if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
  if (process.env[name]) continue;
  process.env[name] = value.replace(/^["']|["']$/g, "");
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-08-31",
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false,
});

async function main() {
  const data = await client.fetch(`*[_type=="article"]{
    _id,
    title,
    workflowStatus,
    publishedAt,
    excerpt,
    "slug": slug.current,
    "authors": authors[]->name,
    "mediaAlt": featuredMedia.alt,
    "mediaRights": featuredMedia.rightsStatus,
    "hasAsset": defined(featuredMedia.asset)
  } | order(publishedAt desc)`);
  console.log(JSON.stringify(data, null, 2));
}

void main();
