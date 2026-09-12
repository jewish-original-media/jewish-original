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
  // Token check below fails closed.
}

const PATCHES = [
  {
    id: "curatedNewsItem.jta.cc84783297e74f56",
    expectedHeadline:
      "Jewish groups to protest against antisemitism outside United Nations",
    jomContext:
      "Jewish organizations are planning a demonstration outside the United Nations against antisemitism.",
  },
  {
    id: "curatedNewsItem.jta.2fcc727d8e9951c6",
    expectedHeadline:
      "A case pitting Indiana Jews against an abortion ban heads back to court",
    jomContext:
      "Indiana is trying to reverse a ruling that its abortion ban infringes on Jewish religious freedom.",
  },
  {
    id: "curatedNewsItem.jpost-diaspora.cdb5c6697737e620",
    expectedHeadline:
      "How a new tool in Lithuania helps people read letters from their Jewish ancestors",
    jomContext:
      "A new tool in Lithuania helps people read letters from their Jewish ancestors.",
  },
  {
    id: "curatedNewsItem.jpost-diaspora.87974ed6f89cc449",
    expectedHeadline:
      "Empty shelves, shattered warehouses: Ukraine's Jews prepare for fifth Rosh Hashanah at war",
    jomContext:
      "Ukraine’s Jewish community is preparing for a fifth wartime Rosh Hashanah amid damaged warehouses and empty shelves.",
  },
] as const;

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
  const ids = PATCHES.map((patch) => patch.id);
  const current = await client.fetch<
    { _id: string; originalHeadline: string; jomContext: string }[]
  >(`*[_id in $ids]{_id, originalHeadline, jomContext}`, { ids });

  const planned = PATCHES.map((patch) => {
    const item = current.find((entry) => entry._id === patch.id);
    if (!item) throw new Error(`Missing news item ${patch.id}`);
    if (item.originalHeadline !== patch.expectedHeadline) {
      throw new Error(`Headline changed for ${patch.id}`);
    }
    return {
      id: patch.id,
      from: item.jomContext,
      to: patch.jomContext,
    };
  });

  if (!apply) {
    console.log(JSON.stringify({ apply: false, planned }, null, 2));
    return;
  }

  for (const patch of PATCHES) {
    await client.patch(patch.id).set({ jomContext: patch.jomContext }).commit();
  }

  console.log(
    JSON.stringify(
      { apply: true, updated: PATCHES.map((patch) => patch.id) },
      null,
      2,
    ),
  );
}

void main();
