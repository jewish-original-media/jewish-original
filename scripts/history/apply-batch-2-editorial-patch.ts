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
const DACHAU_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const JOOP_PUBLISHED_ID =
  "historyEntry.jom-513f6a739543db8be9034576144811f9";

const SOURCE_IDS = {
  bialystok: "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0003",
  willenberg: "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0037",
  tripoli: "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0104",
} as const;

const SOURCE_CHECKSUMS = {
  bialystok:
    "b046934661a0214fb443a2835ce8e0a463b1227bee4094f4e700568a5873a930",
  willenberg:
    "12f1127a816e2e187661bde4c52a743f62a3e3233b0509c020e15dab047e262a",
  tripoli: "ee3b09857951bcaf588de88869a5c0fe3d98a0fb48e9f0da157f8b3e7d4e08e9",
} as const;

const ids = {
  topic: {
    antisemitism: "topic.antisemitism",
    holocaust: "topic.holocaust",
    israel: "topic.israel",
    worldWarII: "topic.world-war-ii",
  },
  region: {
    africa: "geographicRegion.africa",
    europe: "geographicRegion.europe",
    israel: "geographicRegion.israel",
  },
  person: {
    samuelWillenberg: "person.samuel-willenberg",
  },
  place: {
    bialystokGhetto: "place.bialystok-ghetto",
    treblinka: "place.treblinka-extermination-camp",
    tripoli: "place.tripoli",
  },
  era: {
    worldWarII: "historicalEra.world-war-ii",
  },
  source: {
    ap: "source.associated-press",
    jta: "source.jewish-telegraphic-agency",
    ushmm: "source.united-states-holocaust-memorial-museum",
    yadVashem: "source.yad-vashem",
  },
  history: {
    willenberg: "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
  },
} as const;

type Reference = {
  _key: string;
  _type: "reference";
  _ref: string;
  _weak: true;
  _strengthenOnPublish: { type: string };
};

function reference(id: string): Reference {
  const type = id.slice(0, id.indexOf("."));
  return {
    _key: id.replace(/[^a-z0-9]/gi, "-").slice(-48),
    _type: "reference",
    _ref: id,
    _weak: true,
    _strengthenOnPublish: { type },
  };
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

const DRAFT_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  excerpt,
  workflowStatus,
  publicTestCandidate,
  contentWarnings,
  historicalDate,
  body,
  citations[]{
    _key,
    title,
    url,
    verificationStatus,
    bibliographicDetail,
    "source": source->{_id,name,canonicalUrl}
  },
  primaryImage,
  seo,
  editorialNotes,
  reviewFlags[]{_key,code,severity,status,field,evidence,detector,resolution},
  "topics": topics[]->{_id,name},
  "people": people[]->{_id,name},
  "places": places[]->{_id,name},
  "geographicRegions": geographicRegions[]->{_id,name},
  "eras": eras[]->{_id,name},
  "organizations": organizations[]->{_id,name},
  relatedHistory[]{relationType,entry->{_id,title,"slug": slug.current}},
  provenance
}`;

const bialystok = {
  title: "Bialystok Ghetto Established",
  slug: "bialystok-ghetto-established",
  paragraphs: [
    "On this day, German authorities confined about 50,000 Jews from Bialystok and the surrounding region in a ghetto. It had two sections, divided by the Biala River. Most Jews there were forced to work, many in textile factories.",
    "In February 1943, the Germans deported about 10,000 Jews from the ghetto to Treblinka. In August 1943 they moved to destroy the ghetto. Jewish fighters staged an uprising; more than a hundred escaped and reached partisan groups in nearby forests. Soviet forces took the city in July 1944.",
  ],
  excerpt:
    "On this day, August 1, 1941, German authorities confined about 50,000 Jews in the Bialystok ghetto.",
  seoTitle: "Bialystok Ghetto Established — August 1, 1941 | Jewish Original",
  seoDescription:
    "On August 1, 1941, German authorities confined about 50,000 Jews in the Bialystok ghetto.",
  note: "Founder-approved Batch 2 editorial patch applied 2026-09-04. Ready for founder publication approval. Not published.",
};

const willenberg = {
  title: "Samuel Willenberg Dies",
  slug: "samuel-willenberg-dies",
  paragraphs: [
    "On this day, Samuel Willenberg died in Israel at the age of 93. Born in Częstochowa, Poland, he was deported to Treblinka in 1942 and forced to work there. On August 2, 1943, he took part in the prisoner revolt and escaped.",
    "He later settled in Israel, where he wrote and made sculpture about what he had seen. Yad Vashem remembered him as one of the last survivors of Treblinka.",
  ],
  excerpt:
    "On this day, February 19, 2016, Samuel Willenberg, a survivor of Treblinka and of its 1943 revolt, died in Israel at 93.",
  seoTitle: "Samuel Willenberg Dies — February 19, 2016 | Jewish Original",
  seoDescription:
    "On February 19, 2016, Samuel Willenberg, a Treblinka survivor who escaped in the 1943 revolt, died in Israel.",
  note: "Founder-approved Batch 2 editorial patch applied 2026-09-04. Ready for founder publication approval. Not published.",
};

const tripoli = {
  title: "Anti-Jewish Riots Break Out in Tripoli, Libya",
  slug: "anti-jewish-riots-tripoli",
  paragraphs: [
    "On this day, anti-Jewish riots broke out in Tripoli, then under British military administration. Over three days, rioters killed 120 Jews and wounded hundreds more in the city and nearby towns. They destroyed synagogues and looted hundreds of homes and businesses.",
    "By the eve of World War II, more than 30,000 Jews lived in Libya, and about a quarter of Tripoli’s population was Jewish. The 1945 riots did not empty Libya of its Jewish community; further attacks followed in 1948 and after 1967.",
  ],
  excerpt:
    "On this day, November 5, 1945, anti-Jewish riots broke out in Tripoli. Over three days, 120 Jews were murdered in the city and nearby towns.",
  seoTitle:
    "Anti-Jewish Riots Break Out in Tripoli — November 5, 1945 | Jewish Original",
  seoDescription:
    "On November 5, 1945, anti-Jewish riots in Tripoli killed 120 Jews over three days.",
  note: "Batch 2 editorial patch applied 2026-09-04 after founder-review research. Uses Yad Vashem’s 120-dead figure rather than the stored 140. Ready for founder publication approval. Not published.",
};

const entities: Record<string, unknown>[] = [
  {
    _id: ids.region.africa,
    _type: "geographicRegion",
    name: "Africa",
    slug: { _type: "slug", current: "africa" },
    regionType: "continent",
    description:
      "Created for the Tripoli 1945 History draft. Matches the imported Africa source-geography token.",
  },
  {
    _id: ids.place.bialystokGhetto,
    _type: "place",
    name: "Bialystok ghetto",
    slug: { _type: "slug", current: "bialystok-ghetto" },
    aliases: ["Białystok ghetto", "Bialystok"],
    placeType: "campOrGhetto",
    modernJurisdiction: "Białystok, Poland",
    historicalContext:
      "German-established ghetto in Bialystok, sealed in August 1941 and destroyed in August 1943.",
    regions: [reference(ids.region.europe)],
  },
  {
    _id: ids.place.tripoli,
    _type: "place",
    name: "Tripoli",
    slug: { _type: "slug", current: "tripoli" },
    aliases: ["Tripoli, Libya"],
    placeType: "city",
    modernJurisdiction: "Libya",
    historicalContext:
      "Libyan capital; site of the November 1945 anti-Jewish riots under British military administration.",
    regions: [reference(ids.region.africa)],
  },
  {
    _id: ids.source.ap,
    _type: "source",
    name: "Associated Press",
    slug: { _type: "slug", current: "associated-press" },
    aliases: ["AP"],
    sourceType: "publication",
    canonicalUrl: "https://apnews.com/",
    trustNote:
      "Wire service used for the verified 19 February 2016 Willenberg death notice.",
  },
  {
    _id: ids.source.jta,
    _type: "source",
    name: "Jewish Telegraphic Agency",
    slug: { _type: "slug", current: "jewish-telegraphic-agency" },
    aliases: ["JTA"],
    sourceType: "publication",
    canonicalUrl: "https://www.jta.org/",
    trustNote:
      "Contemporaneous 11 November 1945 report of the Tripolitania riots.",
  },
];

function resolveFlags(
  flags:
    | {
        _key?: string;
        code?: string;
        severity?: string;
        status?: string;
        field?: string;
        evidence?: string;
        detector?: string;
      }[]
    | undefined,
  resolution: string,
) {
  return (flags || []).map((flag) => ({
    ...flag,
    status: "resolved",
    resolution,
    reviewedBy: "history-batch-2-editorial-patch",
    reviewedAt: "2026-09-04T04:00:00Z",
  }));
}

function assertUnpublishedSource(
  draft: {
    provenance?: {
      originalImportIdentifier?: string;
      sourceBody?: string;
      sourceBodyChecksum?: string;
    };
  },
  sourceId: string,
  checksum: string,
  label: string,
) {
  if (draft.provenance?.originalImportIdentifier !== sourceId) {
    throw new Error(`${label}: unexpected source ID.`);
  }
  if (draft.provenance?.sourceBodyChecksum !== checksum) {
    throw new Error(`${label}: source checksum changed; refusing to patch.`);
  }
  if (sha256(draft.provenance?.sourceBody || "") !== checksum) {
    throw new Error(`${label}: stored source body no longer matches checksum.`);
  }
}

async function main() {
  const apply = process.argv.includes("--apply");
  const client = createHistoryClient(apply);

  const before = await client.fetch(`{
    "bialystok": *[_id == $bialystok][0]${DRAFT_PROJECTION},
    "willenberg": *[_id == $willenberg][0]${DRAFT_PROJECTION},
    "tripoli": *[_id == $tripoli][0]${DRAFT_PROJECTION},
    "counts": {
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "dachau": *[_id == $dachau][0]{_id, title, "slug": slug.current, workflowStatus, provenance{sourceBodyChecksum}},
      "joop": *[_id == $joop][0]{_id, title, "slug": slug.current, workflowStatus, provenance{sourceBodyChecksum}},
      "publishedBlocked": *[_id in [
        "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
        "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
        "historyEntry.jom-d68726d23439a8e6135c869acacfd547",
        "historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc"
      ]]._id
    }
  }`, {
    bialystok: BIALYSTOK_DRAFT_ID,
    willenberg: WILLENBERG_DRAFT_ID,
    tripoli: TRIPOLI_DRAFT_ID,
    dachau: DACHAU_PUBLISHED_ID,
    joop: JOOP_PUBLISHED_ID,
  });

  if (!before.bialystok || !before.willenberg || !before.tripoli) {
    throw new Error("Missing one or more Batch 2 drafts.");
  }
  if (before.counts.publishedHistory !== 2) {
    throw new Error(
      `Expected published History count 2; found ${before.counts.publishedHistory}.`,
    );
  }
  if (before.counts.publishedBlocked.length) {
    throw new Error("A Batch 2 or deferred draft is already published.");
  }
  if (
    before.counts.dachau?.slug !== "us-liberates-dachau" ||
    before.counts.joop?.slug !== "joop-westerweel-murdered"
  ) {
    throw new Error("Dachau or Joop published identity changed; refusing to patch.");
  }

  assertUnpublishedSource(
    before.bialystok,
    SOURCE_IDS.bialystok,
    SOURCE_CHECKSUMS.bialystok,
    "Bialystok",
  );
  assertUnpublishedSource(
    before.willenberg,
    SOURCE_IDS.willenberg,
    SOURCE_CHECKSUMS.willenberg,
    "Willenberg",
  );
  assertUnpublishedSource(
    before.tripoli,
    SOURCE_IDS.tripoli,
    SOURCE_CHECKSUMS.tripoli,
    "Tripoli",
  );

  const patches = {
    bialystok: {
      title: bialystok.title,
      slug: { _type: "slug", current: bialystok.slug },
      excerpt: bialystok.excerpt,
      body: bialystok.paragraphs.map((text, index) =>
        editorialParagraph("bialystok", text, index),
      ),
      "historicalDate.calendarSystem": "gregorian",
      "historicalDate.conversionNote":
        "Editorial correction from imported calendarSystem other to gregorian for the exact CE date 1941-08-01.",
      contentWarnings: ["antisemiticViolence", "genocide", "death"],
      topics: [
        reference(ids.topic.worldWarII),
        reference(ids.topic.holocaust),
        reference(ids.topic.antisemitism),
      ],
      places: [reference(ids.place.bialystokGhetto)],
      geographicRegions: [reference(ids.region.europe)],
      eras: [reference(ids.era.worldWarII)],
      organizations: [],
      people: [],
      publicTestCandidate: true,
      relatedHistory: [
        {
          _key: "related-willenberg-treblinka",
          _type: "relatedHistoryItem",
          relationType: "related",
          note: "February 1943 deportations from Bialystok went to Treblinka, where Samuel Willenberg was imprisoned.",
          entry: reference(ids.history.willenberg),
        },
      ],
      citations: [
        {
          _key: "citation-ushmm-bialystok",
          _type: "citation",
          source: reference(ids.source.ushmm),
          title: "Bialystok",
          author: "United States Holocaust Memorial Museum",
          publication: "Holocaust Encyclopedia",
          kind: "website",
          url: "https://encyclopedia.ushmm.org/content/en/article/bialystok",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Primary support for confinement of about 50,000 Jews, the two ghetto sections divided by the Biala River, textile forced labor, the February 1943 deportation of about 10,000 Jews to Treblinka, the August 1943 uprising and escapes, and Soviet capture of the city in July 1944.",
          verificationStatus: "verified",
        },
        {
          _key: "citation-yad-vashem-bialystok",
          _type: "citation",
          source: reference(ids.source.yadVashem),
          title: "Bialystok",
          author: "Yad Vashem",
          publication: "Shoah Resource Center",
          kind: "website",
          url: "https://www.yadvashem.org/odot_pdf/Microsoft%20Word%20-%206011.pdf",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Support for restriction of 50,000 Bialystok Jews to a ghetto on August 1, 1941, and for the prewar Jewish population of the city.",
          verificationStatus: "verified",
        },
      ],
      seo: {
        _type: "seo",
        title: bialystok.seoTitle,
        description: bialystok.seoDescription,
      },
      workflowStatus: "ready",
      editorialNotes: bialystok.note,
      reviewFlags: resolveFlags(
        before.bialystok.reviewFlags,
        "Topics, geography, and verified USHMM / Yad Vashem citations attached. Source body unchanged.",
      ),
    },
    willenberg: {
      title: willenberg.title,
      slug: { _type: "slug", current: willenberg.slug },
      excerpt: willenberg.excerpt,
      body: willenberg.paragraphs.map((text, index) =>
        editorialParagraph("willenberg", text, index),
      ),
      "historicalDate.calendarSystem": "gregorian",
      "historicalDate.conversionNote":
        "Editorial correction from imported calendarSystem other to gregorian for the exact CE date 2016-02-19.",
      contentWarnings: ["antisemiticViolence", "genocide", "death"],
      topics: [
        reference(ids.topic.israel),
        reference(ids.topic.worldWarII),
        reference(ids.topic.holocaust),
        reference(ids.topic.antisemitism),
      ],
      people: [reference(ids.person.samuelWillenberg)],
      places: [reference(ids.place.treblinka)],
      geographicRegions: [
        reference(ids.region.israel),
        reference(ids.region.europe),
      ],
      eras: [reference(ids.era.worldWarII)],
      organizations: [],
      publicTestCandidate: true,
      citations: [
        {
          _key: "citation-yad-vashem-willenberg",
          _type: "citation",
          source: reference(ids.source.yadVashem),
          title: "One of the Last Survivors of Treblinka Passes Away",
          author: "Yad Vashem",
          publication: "Yad Vashem",
          kind: "website",
          url: "https://www.yadvashem.org/blog/one-of-the-last-survivors-of-treblinka-passes-away.html",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Institutional remembrance of Samuel Willenberg as one of the last survivors of Treblinka, an artist and author who escaped during the August 1943 revolt.",
          verificationStatus: "verified",
        },
        {
          _key: "citation-ushmm-treblinka",
          _type: "citation",
          source: reference(ids.source.ushmm),
          title: "Treblinka",
          author: "United States Holocaust Memorial Museum",
          publication: "Holocaust Encyclopedia",
          kind: "website",
          url: "https://encyclopedia.ushmm.org/content/en/article/treblinka",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Support for the August 2, 1943 prisoner revolt and escape. The public death notice does not use USHMM’s camp death-toll figure.",
          verificationStatus: "verified",
        },
        {
          _key: "citation-ap-willenberg",
          _type: "citation",
          source: reference(ids.source.ap),
          title: "Death of Treblinka revolt survivor signals post-witness era",
          author: "Associated Press",
          publication: "AP News",
          kind: "website",
          url: "https://apnews.com/general-news-4a90900b1e7340cb83efab37a1ea99b4",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Contemporaneous confirmation that Willenberg died in Israel at 93. The public body uses Yad Vashem’s “one of the last survivors of Treblinka” wording rather than “last known survivor of the revolt.”",
          verificationStatus: "verified",
        },
      ],
      seo: {
        _type: "seo",
        title: willenberg.seoTitle,
        description: willenberg.seoDescription,
      },
      workflowStatus: "ready",
      editorialNotes: willenberg.note,
      reviewFlags: resolveFlags(
        before.willenberg.reviewFlags,
        "Short death notice applied. Verified Yad Vashem, USHMM, and AP citations attached. Source body unchanged.",
      ),
    },
    tripoli: {
      title: tripoli.title,
      slug: { _type: "slug", current: tripoli.slug },
      excerpt: tripoli.excerpt,
      body: tripoli.paragraphs.map((text, index) =>
        editorialParagraph("tripoli", text, index),
      ),
      "historicalDate.calendarSystem": "gregorian",
      "historicalDate.conversionNote":
        "Editorial correction from imported calendarSystem other to gregorian for the exact CE date 1945-11-05.",
      contentWarnings: ["antisemiticViolence", "death"],
      topics: [reference(ids.topic.antisemitism)],
      places: [reference(ids.place.tripoli)],
      geographicRegions: [reference(ids.region.africa)],
      eras: [],
      organizations: [],
      people: [],
      publicTestCandidate: true,
      relatedHistory: [],
      citations: [
        {
          _key: "citation-yad-vashem-libya",
          _type: "citation",
          source: reference(ids.source.yadVashem),
          title: "The Jews of Libya",
          author: "Sheryl Silver Ochayon",
          publication: "Yad Vashem",
          kind: "website",
          url: "https://www.yadvashem.org/articles/general/the-jews-of-libya.html",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Primary support for the three-day November 1945 pogrom, 120 Jews murdered, hundreds wounded, synagogues destroyed, more than 30,000 Jews in Libya on the eve of World War II, Tripoli about one-quarter Jewish in 1941, and later 1948 and 1967 violence.",
          verificationStatus: "verified",
        },
        {
          _key: "citation-yad-vashem-libya-src",
          _type: "citation",
          source: reference(ids.source.yadVashem),
          title: "Libya",
          author: "Yad Vashem",
          publication: "Shoah Resource Center",
          kind: "website",
          url: "https://www.yadvashem.org/odot_pdf/Microsoft%20Word%20-%206407.pdf",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Companion institutional summary of the November 1945 three-day pogrom (121 murdered) and later emigration to Israel.",
          verificationStatus: "verified",
        },
        {
          _key: "citation-jta-tripoli-1945",
          _type: "citation",
          source: reference(ids.source.jta),
          title:
            "Further Outbreaks in Tripolitania Feared; Public Demonstrations Prohibited in Egypt",
          author: "Jewish Telegraphic Agency",
          publication: "JTA Daily News Bulletin",
          kind: "website",
          url: "https://www.jta.org/archive/ed-outbreaks-in-tripolitania-feared-public-demonstrations-prohibited-in-egypt",
          publicationDate: "1945-11-11",
          accessedAt: "2026-09-04",
          bibliographicDetail:
            "Contemporaneous report of the Tripolitania riots, more than 100 Jews killed, and the British-controlled administration’s aftermath measures. Early counts were incomplete.",
          verificationStatus: "verified",
        },
      ],
      seo: {
        _type: "seo",
        title: tripoli.seoTitle,
        description: tripoli.seoDescription,
      },
      workflowStatus: "ready",
      editorialNotes: tripoli.note,
      reviewFlags: resolveFlags(
        before.tripoli.reviewFlags,
        "Antisemitism and Africa geography attached. Yad Vashem 120-dead figure used instead of the stored 140. Source body unchanged.",
      ),
    },
  };

  if (apply) {
    for (const entity of entities) {
      const entityId = String(entity._id);
      await client.createIfNotExists({
        _id: entityId,
        _type: String(entity._type),
      });
      await client
        .patch(entityId)
        .set(entity)
        .commit({ autoGenerateArrayKeys: false });
      await client.delete(`drafts.${entityId}`).catch(() => undefined);
    }

    await client
      .patch(BIALYSTOK_DRAFT_ID)
      .set(patches.bialystok)
      .commit({ autoGenerateArrayKeys: false });
    await client
      .patch(WILLENBERG_DRAFT_ID)
      .set(patches.willenberg)
      .commit({ autoGenerateArrayKeys: false });
    await client
      .patch(TRIPOLI_DRAFT_ID)
      .set(patches.tripoli)
      .commit({ autoGenerateArrayKeys: false });
  }

  const after = await client.fetch(`{
    "bialystok": *[_id == $bialystok][0]${DRAFT_PROJECTION},
    "willenberg": *[_id == $willenberg][0]${DRAFT_PROJECTION},
    "tripoli": *[_id == $tripoli][0]${DRAFT_PROJECTION},
    "counts": {
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "dachauChecksum": *[_id == $dachau][0].provenance.sourceBodyChecksum,
      "joopChecksum": *[_id == $joop][0].provenance.sourceBodyChecksum,
      "publishedBlocked": *[_id in [
        "historyEntry.jom-4ca89a7117bf6f1832bd1b87fa279638",
        "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
        "historyEntry.jom-d68726d23439a8e6135c869acacfd547",
        "historyEntry.jom-3cc6eb0e579ceb50b4abe057c31456cc"
      ]]._id
    }
  }`, {
    bialystok: BIALYSTOK_DRAFT_ID,
    willenberg: WILLENBERG_DRAFT_ID,
    tripoli: TRIPOLI_DRAFT_ID,
    dachau: DACHAU_PUBLISHED_ID,
    joop: JOOP_PUBLISHED_ID,
  });

  const verification = {
    mode: apply ? "apply" : "dry-run",
    publishedHistory: after.counts.publishedHistory,
    publishedBlocked: after.counts.publishedBlocked,
    dachauUnchanged:
      after.counts.dachauChecksum ===
      "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00",
    joopUnchanged:
      after.counts.joopChecksum ===
      "f2578f96248d2ea97d0b0edaa00af88ad29dc1d0078e00863f2d9a6914560ba3",
    bialystok: {
      sourceUnchanged:
        after.bialystok.provenance?.sourceBodyChecksum ===
          SOURCE_CHECKSUMS.bialystok &&
        after.bialystok.provenance?.sourceBody ===
          before.bialystok.provenance?.sourceBody,
      title: after.bialystok.title,
      slug: after.bialystok.slug,
      workflowStatus: after.bialystok.workflowStatus,
      editorialMatches:
        bodyText(after.bialystok.body) === bialystok.paragraphs.join("\n\n"),
      calendarSystem: after.bialystok.historicalDate?.calendarSystem,
      hasImage: Boolean(after.bialystok.primaryImage),
    },
    willenberg: {
      sourceUnchanged:
        after.willenberg.provenance?.sourceBodyChecksum ===
          SOURCE_CHECKSUMS.willenberg &&
        after.willenberg.provenance?.sourceBody ===
          before.willenberg.provenance?.sourceBody,
      title: after.willenberg.title,
      slug: after.willenberg.slug,
      workflowStatus: after.willenberg.workflowStatus,
      editorialMatches:
        bodyText(after.willenberg.body) ===
        willenberg.paragraphs.join("\n\n"),
      calendarSystem: after.willenberg.historicalDate?.calendarSystem,
      hasImage: Boolean(after.willenberg.primaryImage),
    },
    tripoli: {
      sourceUnchanged:
        after.tripoli.provenance?.sourceBodyChecksum ===
          SOURCE_CHECKSUMS.tripoli &&
        after.tripoli.provenance?.sourceBody ===
          before.tripoli.provenance?.sourceBody,
      title: after.tripoli.title,
      slug: after.tripoli.slug,
      workflowStatus: after.tripoli.workflowStatus,
      editorialMatches:
        bodyText(after.tripoli.body) === tripoli.paragraphs.join("\n\n"),
      calendarSystem: after.tripoli.historicalDate?.calendarSystem,
      hasImage: Boolean(after.tripoli.primaryImage),
    },
  };

  if (apply) {
    const failed =
      after.counts.publishedHistory !== 2 ||
      after.counts.publishedBlocked.length ||
      !verification.dachauUnchanged ||
      !verification.joopUnchanged ||
      !verification.bialystok.sourceUnchanged ||
      !verification.willenberg.sourceUnchanged ||
      !verification.tripoli.sourceUnchanged ||
      !verification.bialystok.editorialMatches ||
      !verification.willenberg.editorialMatches ||
      !verification.tripoli.editorialMatches ||
      after.bialystok.workflowStatus !== "ready" ||
      after.willenberg.workflowStatus !== "ready" ||
      after.tripoli.workflowStatus !== "ready";
    if (failed) {
      throw new Error(`Patch verification failed: ${JSON.stringify(verification)}`);
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
