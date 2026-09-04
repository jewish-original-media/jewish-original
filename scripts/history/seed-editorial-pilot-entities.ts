import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

import { getCliClient } from "sanity/cli";

type Reference = {
  _key: string;
  _type: "reference";
  _ref: string;
  _weak: true;
  _strengthenOnPublish: { type: string };
};

type EntityDocument = {
  _id: string;
  _type: string;
  [key: string]: unknown;
};

type HistoryDocument = {
  _id: string;
  slug?: { current?: string };
  publicTestCandidate?: boolean;
  contentWarnings?: string[];
  topics?: Reference[];
  people?: Reference[];
  places?: Reference[];
  geographicRegions?: Reference[];
  eras?: Reference[];
  organizations?: Reference[];
  citations?: Record<string, unknown>[];
  relatedHistory?: Record<string, unknown>[];
  provenance?: { originalImportIdentifier?: string };
};

const ids = {
  topic: {
    antisemitism: "topic.antisemitism",
    holocaust: "topic.holocaust",
    israel: "topic.israel",
    worldWarII: "topic.world-war-ii",
  },
  region: {
    europe: "geographicRegion.europe",
    israel: "geographicRegion.israel",
  },
  person: {
    joopWesterweel: "person.joop-westerweel",
    samuelWillenberg: "person.samuel-willenberg",
    theodorHerzl: "person.theodor-herzl",
  },
  place: {
    budapest: "place.budapest",
    dachau: "place.dachau-concentration-camp",
    mountHerzl: "place.mount-herzl",
    treblinka: "place.treblinka-extermination-camp",
    vught: "place.vught-concentration-camp",
  },
  era: {
    worldWarII: "historicalEra.world-war-ii",
  },
  organization: {
    yadVashem: "organization.yad-vashem",
  },
  source: {
    openDemocracy: "source.open-democracy",
  },
  history: {
    dachau: "historyEntry.jom-ab8c4bd07d8ae253cd22238945c379dc",
    westerweel: "historyEntry.jom-513f6a739543db8be9034576144811f9",
    willenberg: "historyEntry.jom-eeb6299e20e45397ffe278ce0930d45c",
  },
} as const;

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

const entities: EntityDocument[] = [
  {
    _id: ids.topic.antisemitism,
    _type: "topic",
    name: "Antisemitism",
    slug: { _type: "slug", current: "antisemitism" },
    status: "active",
    scopeNote: "Exact source token. No broader parent is assigned.",
  },
  {
    _id: ids.topic.holocaust,
    _type: "topic",
    name: "Holocaust",
    slug: { _type: "slug", current: "holocaust" },
    status: "active",
    scopeNote:
      "Exact source token. Related to but not contained by World War II.",
    relatedTopics: [reference(ids.topic.worldWarII)],
  },
  {
    _id: ids.topic.israel,
    _type: "topic",
    name: "Israel",
    slug: { _type: "slug", current: "israel" },
    status: "active",
    scopeNote:
      "Exact source topic token. Distinct from the Israel geographic region and from Zionism.",
  },
  {
    _id: ids.topic.worldWarII,
    _type: "topic",
    name: "World War II",
    slug: { _type: "slug", current: "world-war-ii" },
    aliases: ["WWII"],
    status: "active",
    scopeNote: "Unambiguous expansion of the source abbreviation WWII.",
    relatedTopics: [reference(ids.topic.holocaust)],
  },
  {
    _id: ids.region.europe,
    _type: "geographicRegion",
    name: "Europe",
    slug: { _type: "slug", current: "europe" },
    regionType: "continent",
  },
  {
    _id: ids.region.israel,
    _type: "geographicRegion",
    name: "Israel",
    slug: { _type: "slug", current: "israel" },
    regionType: "country",
  },
  {
    _id: ids.person.joopWesterweel,
    _type: "person",
    name: "Joop Westerweel",
    slug: { _type: "slug", current: "joop-westerweel" },
  },
  {
    _id: ids.person.samuelWillenberg,
    _type: "person",
    name: "Samuel Willenberg",
    slug: { _type: "slug", current: "samuel-willenberg" },
  },
  {
    _id: ids.person.theodorHerzl,
    _type: "person",
    name: "Theodor Herzl",
    slug: { _type: "slug", current: "theodor-herzl" },
    aliases: ["Theodore Herzl"],
  },
  {
    _id: ids.place.dachau,
    _type: "place",
    name: "Dachau concentration camp",
    slug: { _type: "slug", current: "dachau-concentration-camp" },
    aliases: ["Dachau"],
    placeType: "campOrGhetto",
    regions: [reference(ids.region.europe)],
  },
  {
    _id: ids.place.vught,
    _type: "place",
    name: "Vught concentration camp",
    slug: { _type: "slug", current: "vught-concentration-camp" },
    placeType: "campOrGhetto",
    regions: [reference(ids.region.europe)],
  },
  {
    _id: ids.place.treblinka,
    _type: "place",
    name: "Treblinka extermination camp",
    slug: { _type: "slug", current: "treblinka-extermination-camp" },
    aliases: ["Treblinka"],
    placeType: "campOrGhetto",
    regions: [reference(ids.region.europe)],
  },
  {
    _id: ids.place.budapest,
    _type: "place",
    name: "Budapest",
    slug: { _type: "slug", current: "budapest" },
    placeType: "city",
    regions: [reference(ids.region.europe)],
  },
  {
    _id: ids.place.mountHerzl,
    _type: "place",
    name: "Mount Herzl",
    slug: { _type: "slug", current: "mount-herzl" },
    placeType: "site",
    regions: [reference(ids.region.israel)],
  },
  {
    _id: ids.era.worldWarII,
    _type: "historicalEra",
    name: "World War II",
    slug: { _type: "slug", current: "world-war-ii" },
    start: { _type: "datePart", year: 1939 },
    end: { _type: "datePart", year: 1945 },
    boundaryNote:
      "Conventional global year boundary; article relationships remain editorial.",
  },
  {
    _id: ids.organization.yadVashem,
    _type: "organization",
    name: "Yad Vashem",
    slug: { _type: "slug", current: "yad-vashem" },
    organizationType: "cultural",
  },
  {
    _id: ids.source.openDemocracy,
    _type: "source",
    name: "openDemocracy",
    slug: { _type: "slug", current: "open-democracy" },
    sourceType: "publication",
    canonicalUrl: "https://www.opendemocracy.net/",
    trustNote:
      "Created because a specific article URL is explicitly listed in the imported source body. Individual citations remain unreviewed.",
  },
];

const relationships: Record<
  string,
  {
    slug: string;
    contentWarnings?: string[];
    topics?: string[];
    people?: string[];
    places?: string[];
    regions?: string[];
    eras?: string[];
    organizations?: string[];
    citations?: Record<string, unknown>[];
    relatedHistory?: { id: string; relationType: string; note: string }[];
  }
> = {
  "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0002": {
    slug: "us-liberates-dachau",
    contentWarnings: ["antisemiticViolence", "genocide", "death"],
    topics: [ids.topic.worldWarII, ids.topic.holocaust, ids.topic.antisemitism],
    places: [ids.place.dachau],
    regions: [ids.region.europe],
    eras: [ids.era.worldWarII],
    relatedHistory: [
      {
        id: ids.history.westerweel,
        relationType: "related",
        note: "Pilot editorial connection through Holocaust rescue and resistance.",
      },
      {
        id: ids.history.willenberg,
        relationType: "related",
        note: "Pilot editorial connection through Holocaust history.",
      },
    ],
  },
  "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0005": {
    slug: "joop-westerweel-murdered",
    contentWarnings: ["antisemiticViolence", "death"],
    topics: [ids.topic.worldWarII, ids.topic.holocaust, ids.topic.antisemitism],
    people: [ids.person.joopWesterweel],
    places: [ids.place.vught],
    regions: [ids.region.europe],
    eras: [ids.era.worldWarII],
    organizations: [ids.organization.yadVashem],
    relatedHistory: [
      {
        id: ids.history.dachau,
        relationType: "related",
        note: "Pilot editorial connection through Holocaust rescue and resistance.",
      },
    ],
  },
  "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0037": {
    slug: "samuel-willenberg-dies",
    contentWarnings: ["antisemiticViolence", "genocide", "death"],
    topics: [
      ids.topic.israel,
      ids.topic.worldWarII,
      ids.topic.holocaust,
      ids.topic.antisemitism,
    ],
    people: [ids.person.samuelWillenberg],
    places: [ids.place.treblinka],
    regions: [ids.region.israel, ids.region.europe],
    eras: [ids.era.worldWarII],
    relatedHistory: [
      {
        id: ids.history.dachau,
        relationType: "related",
        note: "Pilot editorial connection through Holocaust history.",
      },
    ],
  },
  "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0042": {
    slug: "theodore-herzl-birthday",
    people: [ids.person.theodorHerzl],
    places: [ids.place.budapest, ids.place.mountHerzl],
    citations: [
      {
        _key: "source-opendemocracy",
        _type: "citation",
        source: reference(ids.source.openDemocracy),
        publication: "openDemocracy",
        kind: "website",
        url: "https://www.opendemocracy.net/en/north-africa-west-asia/theodor-herzl-and-trajectory-of-zionism/",
        note: "Explicitly listed in the imported source body; not fact-checked.",
        verificationStatus: "unreviewed",
      },
      {
        _key: "source-wikipedia",
        _type: "citation",
        publication: "Wikipedia",
        kind: "website",
        url: "https://en.wikipedia.org/wiki/Theodor_Herzl",
        note: "Explicitly listed in the imported source body; not fact-checked.",
        verificationStatus: "unreviewed",
      },
      {
        _key: "source-tripadvisor",
        _type: "citation",
        publication: "Tripadvisor",
        kind: "website",
        url: "https://www.tripadvisor.ca/Attraction_Review-g293983-d320835-Reviews-Mount_Herzl_National_Cemetery-Jerusalem_Jerusalem_District.html",
        note: "Explicitly listed in the imported source body; not fact-checked.",
        verificationStatus: "unreviewed",
      },
    ],
  },
};

function stable(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map(stable));
  if (value && typeof value === "object") {
    return JSON.stringify(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stable(child)]),
    );
  }
  return JSON.stringify(value);
}

function references(values: string[] | undefined) {
  return values?.map(reference) || [];
}

async function main() {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
      report: {
        type: "string",
        default: "artifacts/history-editorial/entity-seed-report.json",
      },
    },
  });
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective: "raw",
    useCdn: false,
  });
  const sourceIds = Object.keys(relationships);
  const historyDocuments = await client.fetch<HistoryDocument[]>(
    '*[_type == "historyEntry" && _id in path("drafts.**") && provenance.originalImportIdentifier in $sourceIds]{_id,slug,publicTestCandidate,contentWarnings,topics,people,places,geographicRegions,eras,organizations,citations,relatedHistory,provenance{originalImportIdentifier}}',
    { sourceIds },
  );
  if (historyDocuments.length !== sourceIds.length) {
    throw new Error(
      `Expected ${sourceIds.length} selected drafts, found ${historyDocuments.length}.`,
    );
  }

  const existingEntities = await client.fetch<EntityDocument[]>(
    "*[_id in $ids]",
    { ids: entities.map((entity) => entity._id) },
  );
  const existingEntityIds = new Set(
    existingEntities.map((entity) => entity._id),
  );

  const entityOutcomes = entities.map((entity) => ({
    documentId: entity._id,
    type: entity._type,
    action: existingEntityIds.has(entity._id) ? "skip" : "create",
  }));
  const relationshipOutcomes: {
    documentId: string;
    sourceId: string;
    action: "set" | "skip";
  }[] = [];

  if (values.apply) {
    for (const entity of entities) {
      await client.createIfNotExists(entity);
      await client.delete(`drafts.${entity._id}`).catch(() => undefined);
    }
  }

  for (const document of historyDocuments) {
    const sourceId = document.provenance?.originalImportIdentifier;
    if (!sourceId) throw new Error(`Missing source ID on ${document._id}.`);
    const relationship = relationships[sourceId];
    if (!relationship) {
      throw new Error(`No approved relationship plan for ${sourceId}.`);
    }
    const expectedRelationships = {
      slug: { _type: "slug", current: relationship.slug },
      contentWarnings: relationship.contentWarnings || [],
      topics: references(relationship.topics),
      people: references(relationship.people),
      places: references(relationship.places),
      geographicRegions: references(relationship.regions),
      eras: references(relationship.eras),
      organizations: references(relationship.organizations),
      citations: relationship.citations || [],
      relatedHistory: (relationship.relatedHistory || []).map((item) => ({
        _key: item.id.replace(/[^a-z0-9]/gi, "-").slice(-48),
        _type: "relatedHistoryItem",
        entry: reference(item.id),
        relationType: item.relationType,
        note: item.note,
        origin: "editorial",
      })),
    };
    const expected = {
      ...expectedRelationships,
      publicTestCandidate: true,
    };
    const currentRelationships = {
      slug: document.slug,
      contentWarnings: document.contentWarnings || [],
      topics: document.topics || [],
      people: document.people || [],
      places: document.places || [],
      geographicRegions: document.geographicRegions || [],
      eras: document.eras || [],
      organizations: document.organizations || [],
      citations: document.citations || [],
      relatedHistory: document.relatedHistory || [],
    };
    const relationshipsMatch =
      stable(currentRelationships) === stable(expectedRelationships);
    const alreadySet =
      relationshipsMatch && document.publicTestCandidate === true;
    const hasEditorialRelationships =
      (document.topics?.length || 0) +
        (document.people?.length || 0) +
        (document.places?.length || 0) +
        (document.geographicRegions?.length || 0) +
        (document.eras?.length || 0) +
        (document.organizations?.length || 0) +
        (document.citations?.length || 0) >
      0;
    const slugIsExpected = document.slug?.current === relationship.slug;
    const generatedOrLegacySlug =
      document.slug?.current?.includes(
        `-${sourceId.includes(":Form:") ? "form" : "import"}-`,
      ) || sourceId.includes(":Import:");
    if (
      !relationshipsMatch &&
      !slugIsExpected &&
      (hasEditorialRelationships || !generatedOrLegacySlug)
    ) {
      throw new Error(
        `Refusing to overwrite existing editorial relationships or slug on ${document._id}.`,
      );
    }
    if (values.apply && !alreadySet) {
      await client.patch(document._id).set(expected).commit();
    }
    relationshipOutcomes.push({
      documentId: document._id,
      sourceId,
      action: alreadySet ? "skip" : "set",
    });
  }

  const publishedCounts = await client.fetch<{
    entities: number;
    history: number;
  }>(
    '{"entities": count(*[!(_id in path("drafts.**")) && _type in ["person","place","geographicRegion","topic","historicalEra","organization","source"]]), "history": count(*[!(_id in path("drafts.**")) && _type == "historyEntry"])}',
  );
  if (publishedCounts.history) {
    throw new Error(
      `Expected draft-only history writes; found ${publishedCounts.history} published history records.`,
    );
  }

  const report = {
    mode: values.apply ? "apply" : "dry-run",
    generatedAt: new Date().toISOString(),
    safeguards: {
      ambiguousTopicMappingsApplied: false,
      geographyInferredFromLegacyProse: false,
      relatedHistoryGenerated: false,
      publishedHistoryDocumentsCreated: 0,
      publishedReferenceDocumentsAllowed: true,
    },
    counts: {
      entityDrafts: entities.length,
      entityCreates: entityOutcomes.filter(
        (outcome) => outcome.action === "create",
      ).length,
      selectedHistoryDrafts: relationshipOutcomes.length,
      relationshipSets: relationshipOutcomes.filter(
        (outcome) => outcome.action === "set",
      ).length,
      publishedEntities: publishedCounts.entities,
      publishedHistory: publishedCounts.history,
    },
    entityOutcomes,
    relationshipOutcomes,
  };
  const reportPath = resolve(values.report);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({ reportPath, counts: report.counts }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Editorial entity seed failed: ${message}\n`);
  process.exitCode = 1;
});
