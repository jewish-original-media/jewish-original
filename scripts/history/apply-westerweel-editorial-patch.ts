import { getCliClient } from "sanity/cli";

const HISTORY_DRAFT_ID =
  "drafts.historyEntry.jom-513f6a739543db8be9034576144811f9";
const HISTORY_PUBLISHED_ID =
  "historyEntry.jom-513f6a739543db8be9034576144811f9";
const DACHAU_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const SOURCE_BODY_CHECKSUM =
  "f2578f96248d2ea97d0b0edaa00af88ad29dc1d0078e00863f2d9a6914560ba3";
const EXPECTED_SOURCE_BODY =
  "On this day, Nazis murdered Joop Westerweel, a Righteous Among the Nations - a non-Jewish ally who had a mission to help Jewish people during the Holocaust. He was raised in a Christian household and grew up with the values of pacifism. \n\nAfter expulsion from the Dutch East Indies for refusing to join the army, he became a teacher at a progressive school in Bilthoven, a small village in the Netherlands. While teaching, Westerweel worked with Jewish refugee children who came to Holland in the 1930s to escape the Nazi regime. In 1940, he moved to Rotterdam and became the principal of a Montessori school. He met a group of Jewish pioneers who wanted to learn about agriculture before moving to Israel. When the Nazis started to round up Jews more rapidly, Westerweel tried to hide his Jewish friends. But, as the Nazis would typically find hidden Jews, he came up with an escape route for the Jews to get to Spain, then get to Israel. Joop and his group smuggled 150 to 200 Jewish people during the Second World War. \n\nOn March 14, 1944, the Nazis arrested Joop while he was trying to smuggle out two Jewish women; They sent Joop Westerweel to the Vught concentration camp. On June 16, 1964, Joop and his wife, Wilhelmina, were recognized as Righteous Among the Nations by Yad Vashem for their efforts to save Jews during the Holocaust. \n";

const APPROVED_TITLE = "Joop Westerweel Is Murdered at Vught";
const APPROVED_SLUG = "joop-westerweel-murdered";
const APPROVED_BODY_PARAGRAPHS = [
  "On this day, German authorities executed Joop Westerweel at the Vught concentration camp. Westerweel, a Dutch teacher and pacifist, had helped hide Jewish youth and organize escape routes out of the occupied Netherlands. He was arrested on March 11, 1944, at the Belgian border while escorting two Jewish women.",
  "In 1964, Yad Vashem recognized Westerweel and his wife, Wilhelmina, as Righteous Among the Nations.",
] as const;
const APPROVED_EXCERPT =
  "On this day, August 11, 1944, German authorities executed Joop Westerweel at Vught for helping Jews escape Nazi deportation.";
const APPROVED_SEO_TITLE =
  "Joop Westerweel Is Murdered at Vught — August 11, 1944 | Jewish Original";
const APPROVED_SEO_DESCRIPTION =
  "On August 11, 1944, Joop Westerweel was executed at Vught for helping Jews escape Nazi persecution and deportation.";
const APPROVED_EDITORIAL_NOTE =
  "Founder-approved editorial patch applied 2026-09-03. Ready for founder publication approval. Not published.";

const ids = {
  source: {
    yadVashem: "source.yad-vashem",
    kampVught: "source.nationaal-monument-kamp-vught",
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

function editorialParagraph(text: string, index: number) {
  return {
    _key: `westerweel-editorial-p${index + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `westerweel-editorial-s${index + 1}`,
        _type: "span",
        marks: [],
        text,
      },
    ],
  };
}

function bodyText(blocks: { children?: { text?: string }[] }[]) {
  return blocks
    .map((block) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .join("\n\n");
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
  "topics": topics[]->{_id,name},
  "people": people[]->{_id,name},
  "places": places[]->{_id,name},
  "geographicRegions": geographicRegions[]->{_id,name},
  "eras": eras[]->{_id,name},
  "organizations": organizations[]->{_id,name},
  relatedHistory[]{relationType,entry->{_id,title,"slug": slug.current}},
  provenance
}`;

async function main() {
  const apply = process.argv.includes("--apply");
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective: "raw",
    useCdn: false,
  });

  const before = await client.fetch(`*[_id == $id][0]${DRAFT_PROJECTION}`, {
    id: HISTORY_DRAFT_ID,
  });

  if (!before) {
    throw new Error(`Missing unpublished draft ${HISTORY_DRAFT_ID}.`);
  }
  if (before.provenance?.sourceBody !== EXPECTED_SOURCE_BODY) {
    throw new Error(
      "Immutable source body does not match the imported original.",
    );
  }
  if (before.provenance?.sourceBodyChecksum !== SOURCE_BODY_CHECKSUM) {
    throw new Error("Source body checksum changed; refusing to patch.");
  }

  const publishedJoop = await client.fetch<number>(
    'count(*[_id == $id && !(_id in path("drafts.**"))])',
    { id: HISTORY_PUBLISHED_ID },
  );
  if (publishedJoop) {
    throw new Error(
      "Westerweel history entry is already published; refusing to patch.",
    );
  }

  const kampVughtSource = {
    _id: ids.source.kampVught,
    _type: "source",
    name: "Nationaal Monument Kamp Vught",
    slug: {
      _type: "slug",
      current: "nationaal-monument-kamp-vught",
    },
    aliases: ["Kamp Vught", "Herzogenbusch"],
    sourceType: "institution",
    canonicalUrl: "https://www.nmkampvught.nl/",
    trustNote:
      "Official Dutch memorial for Kamp Vught. Used for the Westerweel execution date and camp imprisonment, not for an unverified rescue total.",
  };

  const citations = [
    {
      _key: "citation-yad-vashem-westerweel",
      _type: "citation",
      source: reference(ids.source.yadVashem),
      title: "Johan (Joop) Westerweel",
      author: "Yad Vashem",
      publication: "Teachers Who Rescued Jews During the Holocaust",
      kind: "website",
      url: "https://www.yadvashem.org/yv/en/exhibitions/righteous-teachers/westerweel.asp",
      accessedAt: "2026-09-03",
      bibliographicDetail:
        "Verified support for the 11 August 1944 execution at Vught, the 11 March 1944 arrest at the Belgian border with two Jewish women, Westerweel’s teaching and rescue work, and the 16 June 1964 Righteous Among the Nations recognition with Wilhelmina.",
      verificationStatus: "verified",
    },
    {
      _key: "citation-kamp-vught-westerweel",
      _type: "citation",
      source: reference(ids.source.kampVught),
      title: "Johan Gerard Westerweel",
      author: "Nationaal Monument Kamp Vught",
      publication: "Nationaal Monument Kamp Vught",
      kind: "website",
      url: "https://www.nmkampvught.nl/ontdekken/het-verhaal/vermoord-in-vught/westerweel-johan-gerard/",
      accessedAt: "2026-09-03",
      bibliographicDetail:
        "Official memorial record for execution at Kamp Vught on 11 August 1944 and imprisonment after the March 1944 arrest.",
      verificationStatus: "verified",
    },
  ];

  const editorialPatch = {
    title: APPROVED_TITLE,
    excerpt: APPROVED_EXCERPT,
    body: APPROVED_BODY_PARAGRAPHS.map(editorialParagraph),
    "historicalDate.calendarSystem": "gregorian",
    "historicalDate.conversionNote":
      "Founder-approved correction from imported calendarSystem other to gregorian for the exact CE date 1944-08-11.",
    organizations: [],
    citations,
    seo: {
      _type: "seo",
      title: APPROVED_SEO_TITLE,
      description: APPROVED_SEO_DESCRIPTION,
    },
    workflowStatus: "ready",
    editorialNotes: APPROVED_EDITORIAL_NOTE,
  };

  if (apply) {
    await client.createIfNotExists({
      _id: kampVughtSource._id,
      _type: kampVughtSource._type,
    });
    await client
      .patch(kampVughtSource._id)
      .set(kampVughtSource)
      .commit({ autoGenerateArrayKeys: false });
    await client.delete(`drafts.${kampVughtSource._id}`).catch(() => undefined);

    await client
      .patch(HISTORY_DRAFT_ID)
      .set(editorialPatch)
      .commit({ autoGenerateArrayKeys: false });
  }

  const after = await client.fetch(`*[_id == $id][0]${DRAFT_PROJECTION}`, {
    id: HISTORY_DRAFT_ID,
  });
  const counts = await client.fetch<{
    publishedHistory: number;
    joopPublished: number;
    dachauPublished: number;
  }>(
    `{
      "publishedHistory": count(*[_type == "historyEntry" && !(_id in path("drafts.**"))]),
      "joopPublished": count(*[_id == $joopPublished]),
      "dachauPublished": count(*[_id == $dachauPublished])
    }`,
    {
      joopPublished: HISTORY_PUBLISHED_ID,
      dachauPublished: DACHAU_PUBLISHED_ID,
    },
  );
  const editorialText = bodyText(after.body || []);
  const expectedEditorial = APPROVED_BODY_PARAGRAPHS.join("\n\n");
  const verification = {
    mode: apply ? "apply" : "dry-run",
    publishedHistoryDocuments: counts.publishedHistory,
    joopPublished: counts.joopPublished,
    dachauPublished: counts.dachauPublished,
    sourceBodyUnchanged:
      after.provenance?.sourceBody === EXPECTED_SOURCE_BODY &&
      after.provenance?.sourceBodyChecksum === SOURCE_BODY_CHECKSUM,
    provenanceUnchanged:
      JSON.stringify(after.provenance) === JSON.stringify(before.provenance),
    editorialBodyMatches: editorialText === expectedEditorial,
    excerptMatches: after.excerpt === APPROVED_EXCERPT,
    titleMatches: after.title === APPROVED_TITLE,
    slugUnchanged: after.slug === APPROVED_SLUG,
    seoTitleMatches: after.seo?.title === APPROVED_SEO_TITLE,
    seoDescriptionMatches:
      after.seo?.description === APPROVED_SEO_DESCRIPTION,
    calendarSystem: after.historicalDate?.calendarSystem,
    dateUnchanged:
      after.historicalDate?.start?.year === 1944 &&
      after.historicalDate?.start?.month === 8 &&
      after.historicalDate?.start?.day === 11,
    workflowStatus: after.workflowStatus,
    hasImage: Boolean(after.primaryImage),
    organizations: after.organizations,
    people: after.people,
    places: after.places,
    topics: after.topics,
    eras: after.eras,
    geographicRegions: after.geographicRegions,
    contentWarnings: after.contentWarnings,
    citations: after.citations,
    relatedHistory: after.relatedHistory,
  };

  if (
    apply &&
    (!verification.sourceBodyUnchanged ||
      !verification.provenanceUnchanged ||
      !verification.editorialBodyMatches ||
      !verification.titleMatches ||
      after.historicalDate?.calendarSystem !== "gregorian" ||
      after.workflowStatus !== "ready" ||
      (after.organizations || []).length !== 0 ||
      counts.publishedHistory !== 1 ||
      counts.joopPublished !== 0 ||
      counts.dachauPublished !== 1)
  ) {
    throw new Error(`Patch verification failed: ${JSON.stringify(verification)}`);
  }

  process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
