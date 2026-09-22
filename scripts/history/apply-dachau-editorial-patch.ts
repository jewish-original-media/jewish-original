import { getCliClient } from "sanity/cli";

const HISTORY_DRAFT_ID =
  "drafts.historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const HISTORY_PUBLISHED_ID =
  "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc";
const SOURCE_BODY_CHECKSUM =
  "6cfe3c730a10af5e1a85fdcd736a407980488b6242a3498171186c92e15a2d00";
const EXPECTED_SOURCE_BODY =
  "On this day, American troops liberated Dachau.  In 1942, Dachau built a crematorium; The concentration camp had been in operation for over a decade, with Jewish prisoners as the significant majority. Dachau initially imprisoned political prisoners and forced them in aiding to construct the camp. While in Dachau, prisoners were subjected to biological experiments against their consent, killing or disabling hundreds of prisoners. \n\nOn the days leading up to liberation, thousands of prisoners were on a death march to Tegernsee, Germany. Upon the American arrival, prisoners greeted their rescuers  with flags from the various Allied nations. The Nazi commanders sent a swath of prisoners to Dachau before its liberation. Records estimate that 30,000 people died in Dachau before the American liberation, which managed to rescue 30,000 prisoners. ";

const APPROVED_BODY_PARAGRAPHS = [
  "On this day, American troops liberated the Dachau concentration camp. The camp had been in operation for more than a decade. It initially held political prisoners, who were forced to help construct and expand it. In 1942, a new crematorium complex was built there. Prisoners were also subjected to medical experiments against their will, killing or harming hundreds of people.",
  "In the days before liberation, more than 7,000 prisoners, most of them Jews, were forced on a death march toward Tegernsee, Germany. Nazi authorities also transferred large numbers of prisoners into Dachau from other camps as Allied forces advanced. When American troops arrived on April 29, 1945, they liberated approximately 32,000 prisoners. Historians estimate that at least 40,000 people died within the Dachau camp system during its twelve years of operation.",
] as const;

const APPROVED_EXCERPT =
  "On April 29, 1945, American troops liberated the Dachau concentration camp, freeing approximately 32,000 prisoners after twelve years of Nazi imprisonment, forced labor, medical experimentation, and mass death.";
const APPROVED_SEO_TITLE =
  "US Liberates Dachau on April 29, 1945 | Jewish Original";
const APPROVED_SEO_DESCRIPTION =
  "On April 29, 1945, American troops liberated approximately 32,000 prisoners from Dachau. Learn the history of the camp, its victims, and its liberation.";

const ids = {
  place: {
    dachau: "place.dachau-concentration-camp",
    tegernsee: "place.tegernsee",
  },
  region: {
    europe: "geographicRegion.europe",
  },
  source: {
    ushmm: "source.united-states-holocaust-memorial-museum",
    yadVashem: "source.yad-vashem",
    dachauMemorial: "source.kz-gedenkstaette-dachau",
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
    _key: `dachau-editorial-p${index + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `dachau-editorial-s${index + 1}`,
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

async function main() {
  const apply = process.argv.includes("--apply");
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective: "raw",
    useCdn: false,
  });

  const before = await client.fetch(
    `*[_id == $id][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      workflowStatus,
      publicTestCandidate,
      historicalDate,
      body,
      citations,
      primaryImage,
      seo,
      "topics": topics[]->{_id,name},
      "places": places[]->{_id,name},
      "geographicRegions": geographicRegions[]->{_id,name},
      "eras": eras[]->{_id,name},
      "organizations": organizations[]->{_id,name},
      provenance{sourceBody,sourceBodyChecksum,sourceTopicValues,sourceRegionValues,originalImportIdentifier,rawRecordChecksum}
    }`,
    { id: HISTORY_DRAFT_ID },
  );

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

  const publishedHistory = await client.fetch<number>(
    'count(*[_id == $id && !(_id in path("drafts.**"))])',
    { id: HISTORY_PUBLISHED_ID },
  );
  if (publishedHistory) {
    throw new Error(
      "Dachau history entry is already published; refusing to patch.",
    );
  }

  const entities: Record<string, unknown>[] = [
    {
      _id: ids.place.tegernsee,
      _type: "place",
      name: "Tegernsee",
      slug: { _type: "slug", current: "tegernsee" },
      placeType: "city",
      modernJurisdiction: "Bavaria, Germany",
      historicalContext:
        "Bavarian town named in the April 1945 death march from Dachau.",
      regions: [reference(ids.region.europe)],
    },
    {
      _id: ids.source.ushmm,
      _type: "source",
      name: "United States Holocaust Memorial Museum",
      slug: {
        _type: "slug",
        current: "united-states-holocaust-memorial-museum",
      },
      aliases: ["USHMM", "Holocaust Encyclopedia"],
      sourceType: "institution",
      canonicalUrl: "https://encyclopedia.ushmm.org/",
      trustNote:
        "Primary institutional encyclopedia for the approved Dachau death-toll and liberation wording.",
    },
    {
      _id: ids.source.yadVashem,
      _type: "source",
      name: "Yad Vashem",
      slug: { _type: "slug", current: "yad-vashem" },
      sourceType: "institution",
      canonicalUrl: "https://www.yadvashem.org/",
      trustNote:
        "Shoah Resource Center / collections entries reviewed for the Dachau article.",
    },
    {
      _id: ids.source.dachauMemorial,
      _type: "source",
      name: "KZ-Gedenkstätte Dachau",
      slug: { _type: "slug", current: "kz-gedenkstaette-dachau" },
      aliases: ["Dachau Memorial", "Dachau Concentration Camp Memorial Site"],
      sourceType: "institution",
      canonicalUrl: "https://www.kz-gedenkstaette-dachau.de/",
      trustNote:
        "Official memorial site for the Dachau camp and its satellite system.",
    },
  ];

  const citations = [
    {
      _key: "citation-ushmm-dachau",
      _type: "citation",
      source: reference(ids.source.ushmm),
      title: "Dachau",
      author: "United States Holocaust Memorial Museum",
      publication: "Holocaust Encyclopedia",
      kind: "website",
      url: "https://encyclopedia.ushmm.org/content/en/article/dachau",
      publicationDate: "2024-10-16",
      accessedAt: "2026-09-01",
      bibliographicDetail:
        "Primary support for the camp’s 1933–1945 operation, political-prisoner origins, 1942 crematoria area, medical experiments, and the estimate that at least 40,000 prisoners died.",
      verificationStatus: "verified",
    },
    {
      _key: "citation-ushmm-liberation",
      _type: "citation",
      source: reference(ids.source.ushmm),
      title: "Liberation of Dachau",
      author: "United States Holocaust Memorial Museum",
      publication: "Holocaust Encyclopedia",
      kind: "website",
      url: "https://encyclopedia.ushmm.org/content/en/timeline-event/holocaust/1942-1945/liberation-of-dachau",
      accessedAt: "2026-09-01",
      bibliographicDetail:
        "Primary support for April 29, 1945 liberation of approximately 32,000 prisoners and the April 26 death march of more than 7,000 prisoners, mostly Jews, toward Tegernsee.",
      verificationStatus: "verified",
    },
    {
      _key: "citation-yad-vashem-dachau",
      _type: "citation",
      source: reference(ids.source.yadVashem),
      title: "Dachau",
      author: "Yad Vashem",
      publication: "Shoah Resource Center / Collections",
      kind: "website",
      url: "https://collections.yadvashem.org/en/about/o6242",
      accessedAt: "2026-09-01",
      bibliographicDetail:
        "Reviewed with the companion encyclopedia entry https://collections.yadvashem.org/en/about/o161 for camp history, medical experiments, the Tegernsee march, and liberation by the U.S. Seventh Army.",
      verificationStatus: "verified",
    },
    {
      _key: "citation-dachau-memorial-history",
      _type: "citation",
      source: reference(ids.source.dachauMemorial),
      title: "Dachau Concentration Camp 1933–1945",
      author: "KZ-Gedenkstätte Dachau",
      publication: "Dachau Concentration Camp Memorial Site",
      kind: "website",
      url: "https://www.kz-gedenkstaette-dachau.de/en/historical-site/dachau-concentration-camp-1933-1945/",
      accessedAt: "2026-09-01",
      bibliographicDetail:
        "Official memorial chronology for the camp, incoming transfers, evacuations, and U.S. Army liberation on April 29, 1945.",
      verificationStatus: "verified",
    },
  ];

  const editorialPatch = {
    excerpt: APPROVED_EXCERPT,
    body: APPROVED_BODY_PARAGRAPHS.map(editorialParagraph),
    "historicalDate.calendarSystem": "gregorian",
    "historicalDate.conversionNote":
      "Founder-approved correction from imported calendarSystem other to gregorian for the exact CE date 1945-04-29.",
    places: [reference(ids.place.dachau), reference(ids.place.tegernsee)],
    citations,
    seo: {
      _type: "seo",
      title: APPROVED_SEO_TITLE,
      description: APPROVED_SEO_DESCRIPTION,
    },
  };

  if (apply) {
    for (const entity of entities) {
      const entityId = String(entity._id);
      await client.createIfNotExists({
        ...(entity as { _id: string; _type: string }),
      });
      await client
        .patch(entityId)
        .set(entity)
        .commit({ autoGenerateArrayKeys: false });
      await client.delete(`drafts.${entityId}`).catch(() => undefined);
    }

    await client
      .patch(HISTORY_DRAFT_ID)
      .set(editorialPatch)
      .commit({ autoGenerateArrayKeys: false });
  }

  const after = await client.fetch(
    `*[_id == $id][0]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      workflowStatus,
      publicTestCandidate,
      historicalDate,
      body,
      citations[]{
        _key,
        title,
        url,
        verificationStatus,
        "source": source->{_id,name,canonicalUrl}
      },
      primaryImage,
      seo,
      "topics": topics[]->{_id,name},
      "places": places[]->{_id,name},
      "geographicRegions": geographicRegions[]->{_id,name},
      "eras": eras[]->{_id,name},
      "organizations": organizations[]->{_id,name},
      provenance{sourceBody,sourceBodyChecksum,sourceTopicValues,sourceRegionValues,originalImportIdentifier,rawRecordChecksum}
    }`,
    { id: HISTORY_DRAFT_ID },
  );
  const publishedAfter = await client.fetch<number>(
    'count(*[_type == "historyEntry" && !(_id in path("drafts.**"))])',
  );
  const editorialText = bodyText(after.body || []);
  const expectedEditorial = APPROVED_BODY_PARAGRAPHS.join("\n\n");
  const verification = {
    mode: apply ? "apply" : "dry-run",
    publishedHistoryDocuments: publishedAfter,
    sourceBodyUnchanged:
      after.provenance?.sourceBody === EXPECTED_SOURCE_BODY &&
      after.provenance?.sourceBodyChecksum === SOURCE_BODY_CHECKSUM,
    editorialBodyMatches: editorialText === expectedEditorial,
    excerptMatches: after.excerpt === APPROVED_EXCERPT,
    seoTitleMatches: after.seo?.title === APPROVED_SEO_TITLE,
    seoDescriptionMatches: after.seo?.description === APPROVED_SEO_DESCRIPTION,
    calendarSystem: after.historicalDate?.calendarSystem,
    title: after.title,
    slug: after.slug,
    workflowStatus: after.workflowStatus,
    hasImage: Boolean(after.primaryImage),
    organizations: after.organizations,
    places: after.places,
    topics: after.topics,
    eras: after.eras,
    geographicRegions: after.geographicRegions,
    citations: after.citations,
  };

  if (
    apply &&
    (!verification.sourceBodyUnchanged ||
      !verification.editorialBodyMatches ||
      after.historicalDate?.calendarSystem !== "gregorian" ||
      publishedAfter !== 0)
  ) {
    throw new Error(
      `Patch verification failed: ${JSON.stringify(verification)}`,
    );
  }

  process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
