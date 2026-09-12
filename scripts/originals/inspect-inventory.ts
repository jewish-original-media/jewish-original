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
  const data = await client.fetch(`{
  "people": *[_type=="person"]{_id,name,"slug":slug.current} | order(name),
  "articles": *[_type=="article"]{_id,title,"slug":slug.current,workflowStatus},
  "news": *[_type=="curatedNewsItem" && !(_id in path("drafts.**"))]{
    _id,status,publisherName,originalHeadline,sourcePublishedAt,jomContext,desk
  } | order(sourcePublishedAt desc),
  "events": count(*[_type=="event" && status=="published" && !(_id in path("drafts.**"))]),
  "history": count(*[_type=="historyEntry" && workflowStatus=="ready" && !(_id in path("drafts.**"))]),
  "podcastEpisodes": count(*[_type=="podcastEpisode" && workflowStatus=="ready" && !(_id in path("drafts.**"))])
}`);

  console.log(JSON.stringify(data, null, 2));
}

void main();
