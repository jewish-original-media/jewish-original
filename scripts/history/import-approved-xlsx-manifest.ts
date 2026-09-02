import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-08-31";
const IMPORTER_VERSION = "2.0.0";
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

type Candidate = {
  sourceId: string;
  identifierKind: "generatedWorkbookCoordinate";
  sheet: "Form" | "Import";
  table: string;
  row: number;
  title: string;
  body: string;
  eventDate: string;
  sourceDateValue: string;
  region: string;
  topic: string;
  legacySlug: string | null;
  legacyItemId: string | null;
  legacyCollectionId: string | null;
  anomalies: string[];
  rawRecordChecksum: string;
  sourceBodyChecksum: string;
};

type ManifestRecord = {
  sourceId: string;
  sheet: "Form" | "Import";
  table: string;
  row: number;
  title: string;
  eventDate: string;
  reasonSelected: string;
  knownAnomalies: string[];
  duplicateCluster: string | null;
  expectedWorkflowStatus: "imported" | "needsReview" | "duplicateCandidate";
};

type DuplicateEvidence = {
  left: string;
  right: string;
  classification: string;
  sameDate: boolean;
  titleSimilarity: number;
  titleTokenSimilarity: number;
  bodySimilarity: number;
};

type DuplicateCluster = {
  clusterId: string;
  members: {
    sourceId: string;
    sheet: string;
    row: number;
    title: string;
    eventDate: string;
  }[];
  classifications: Record<string, number>;
  evidence: DuplicateEvidence[];
  editorialDecision: "pending";
};

type WorkbookAudit = {
  source: {
    fileName: string;
    sha256: string;
    modified: false;
  };
};

type ReviewFlag = {
  _key: string;
  _type: "reviewFlag";
  code: string;
  field: string;
  severity: "info" | "warning" | "blocking";
  evidence: string;
  detector: "importer";
  status: "open";
};

type HistoryDocument = {
  _id: string;
  _type: "historyEntry";
  title: string;
  slug: { _type: "slug"; current: string };
  body?: {
    _key: string;
    _type: "block";
    style: "normal";
    markDefs: [];
    children: {
      _key: string;
      _type: "span";
      marks: [];
      text: string;
    }[];
  }[];
  historicalDate: {
    _type: "historicalDate";
    start?: {
      _type: "datePart";
      year: number;
      month: number;
      day: number;
    };
    precision: "day" | "unknown";
    qualifier: "exact";
    calendarSystem: "other";
    sourceValue: string;
  };
  workflowStatus: ManifestRecord["expectedWorkflowStatus"];
  reviewFlags: ReviewFlag[];
  provenance: {
    _type: "provenance";
    originalImportIdentifier: string;
    identifierKind: Candidate["identifierKind"];
    sourceArchiveId: string;
    sourceFileChecksum: string;
    sourceSheet: string;
    sourceRow: number;
    legacyItemId?: string;
    legacyCollectionId?: string;
    originalSlug?: string;
    duplicateClusterId?: string;
    duplicateClusterMembers?: string[];
    sourceTopicValues?: string[];
    sourceRegionValues?: string[];
    sourceBody?: string;
    importRunId: string;
    importerVersion: string;
    rawRecordChecksum: string;
    sourceBodyChecksum: string;
    importDocumentChecksum: string;
    importedAt: string;
  };
};

type ExistingDocument = {
  _id: string;
  provenance?: {
    originalImportIdentifier?: string;
    rawRecordChecksum?: string;
    sourceBodyChecksum?: string;
    importDocumentChecksum?: string;
    sourceBody?: string;
  };
  workflowStatus?: string;
  reviewFlags?: { code?: string }[];
  body?: { children?: { text?: string }[] }[];
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

function stableChecksum(value: unknown) {
  return sha256(JSON.stringify(stableValue(value)));
}

function documentId(sourceId: string) {
  return `drafts.historyEntry.jom-${sha256(sourceId).slice(0, 32)}`;
}

function publishedId(draftId: string) {
  return draftId.replace(/^drafts\./, "");
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function generatedSlug(candidate: Candidate) {
  if (candidate.legacySlug) return candidate.legacySlug;
  const base = slugify(candidate.title) || "history-entry";
  return `${base}-${candidate.sheet.toLowerCase()}-${String(candidate.row).padStart(4, "0")}`;
}

function portableText(body: string): HistoryDocument["body"] {
  if (!body) return undefined;
  return [
    {
      _key: sha256(`block:${body}`).slice(0, 12),
      _type: "block",
      style: "normal",
      markDefs: [],
      children: [
        {
          _key: sha256(`span:${body}`).slice(0, 12),
          _type: "span",
          marks: [],
          text: body,
        },
      ],
    },
  ];
}

function historicalDate(
  candidate: Candidate,
): HistoryDocument["historicalDate"] {
  const match = /^(-?\d{1,6})-(\d{2})-(\d{2})$/.exec(candidate.eventDate);
  if (!match) {
    return {
      _type: "historicalDate",
      precision: "unknown",
      qualifier: "exact",
      calendarSystem: "other",
      sourceValue: candidate.sourceDateValue,
    };
  }

  return {
    _type: "historicalDate",
    start: {
      _type: "datePart",
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3]),
    },
    precision: "day",
    qualifier: "exact",
    calendarSystem: "other",
    sourceValue: candidate.sourceDateValue,
  };
}

function flag(
  code: string,
  field: string,
  severity: ReviewFlag["severity"],
  evidence: string,
): ReviewFlag {
  return {
    _key: sha256(`${code}:${field}:${evidence}`).slice(0, 12),
    _type: "reviewFlag",
    code,
    field,
    severity,
    evidence,
    detector: "importer",
    status: "open",
  };
}

function anomalyFlag(code: string): ReviewFlag {
  const definitions: Record<string, [string, ReviewFlag["severity"], string]> =
    {
      BODY_MISSING: [
        "body",
        "blocking",
        "The canonical source body is blank. No prose was invented.",
      ],
      DATE_MISSING: [
        "historicalDate",
        "blocking",
        "The canonical source has no fixed event-date value. No date was inferred.",
      ],
      MERGED_UNRELATED_BODY: [
        "body",
        "blocking",
        "The canonical source body appears to contain unrelated merged material. The complete source text was preserved unchanged.",
      ],
    };
  const definition = definitions[code] || [
    "provenance",
    "warning",
    `The staging extractor raised ${code}. Human review is required.`,
  ];
  return flag(code, definition[0], definition[1], definition[2]);
}

function duplicateFlag(cluster: DuplicateCluster): ReviewFlag {
  const members = cluster.members
    .map(
      (member) =>
        `${member.sourceId} (${member.title}; ${member.eventDate || "no fixed date"})`,
    )
    .join("; ");
  const relationships = Object.entries(cluster.classifications)
    .map(([classification, count]) => `${classification}: ${count}`)
    .join(", ");
  return flag(
    "DUPLICATE_CANDIDATE",
    "title",
    "blocking",
    `Cluster ${cluster.clusterId}. Members: ${members}. Evidence classifications: ${relationships}. No merge or version choice was made.`,
  );
}

function reviewFlags(
  candidate: Candidate,
  cluster: DuplicateCluster | undefined,
) {
  const flags = candidate.anomalies.map(anomalyFlag);
  if (cluster) flags.push(duplicateFlag(cluster));
  if (candidate.topic) {
    flags.push(
      flag(
        "TOPIC_MAPPING_REQUIRED",
        "topics",
        "warning",
        `Source topic ${JSON.stringify(candidate.topic)} was preserved in provenance and not automatically mapped to taxonomy.`,
      ),
    );
  }
  if (candidate.region) {
    flags.push(
      flag(
        "REGION_MAPPING_REQUIRED",
        "geographicRegions",
        "warning",
        `Source region ${JSON.stringify(candidate.region)} was preserved in provenance and not automatically mapped to geography.`,
      ),
    );
  }
  flags.push(
    flag(
      "CITATIONS_REQUIRED",
      "citations",
      "warning",
      "The canonical source has no structured citation ledger. URLs in source prose remain unchanged and require editorial review.",
    ),
  );
  return flags;
}

function buildDocument(
  candidate: Candidate,
  manifest: ManifestRecord,
  cluster: DuplicateCluster | undefined,
  workbookChecksum: string,
  runId: string,
  importedAt: string,
): HistoryDocument {
  const stableDocument = {
    _id: documentId(candidate.sourceId),
    _type: "historyEntry" as const,
    title: candidate.title,
    slug: { _type: "slug" as const, current: generatedSlug(candidate) },
    body: portableText(candidate.body),
    historicalDate: historicalDate(candidate),
    workflowStatus: manifest.expectedWorkflowStatus,
    reviewFlags: reviewFlags(candidate, cluster),
    provenance: {
      _type: "provenance" as const,
      originalImportIdentifier: candidate.sourceId,
      identifierKind: candidate.identifierKind,
      sourceArchiveId: `jom-on-this-day-xlsx-${workbookChecksum.slice(0, 16)}`,
      sourceFileChecksum: workbookChecksum,
      sourceSheet: candidate.sheet,
      sourceRow: candidate.row,
      legacyItemId: candidate.legacyItemId || undefined,
      legacyCollectionId: candidate.legacyCollectionId || undefined,
      originalSlug: candidate.legacySlug || undefined,
      duplicateClusterId: cluster?.clusterId,
      duplicateClusterMembers: cluster?.members.map(
        (member) => member.sourceId,
      ),
      sourceTopicValues: candidate.topic ? [candidate.topic] : undefined,
      sourceRegionValues: candidate.region ? [candidate.region] : undefined,
      sourceBody: candidate.body || undefined,
      importerVersion: IMPORTER_VERSION,
      rawRecordChecksum: candidate.rawRecordChecksum,
      sourceBodyChecksum: candidate.sourceBodyChecksum,
    },
  };
  const importDocumentChecksum = stableChecksum(stableDocument);

  return {
    ...stableDocument,
    provenance: {
      ...stableDocument.provenance,
      importRunId: runId,
      importDocumentChecksum,
      importedAt,
    },
  };
}

async function readJson<T>(path: string) {
  return JSON.parse(await readFile(resolve(path), "utf8")) as T;
}

async function readJsonLines<T>(path: string) {
  return (await readFile(resolve(path), "utf8"))
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function stringsIn(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, child]) => [key, ...stringsIn(child)],
    );
  }
  return [];
}

async function main() {
  const { values } = parseArgs({
    options: {
      candidates: {
        type: "string",
        default: "artifacts/history-workbook/candidates.jsonl",
      },
      manifest: {
        type: "string",
        default: "artifacts/history-workbook/first-20-manifest.json",
      },
      clusters: {
        type: "string",
        default: "artifacts/history-workbook/duplicate-clusters.json",
      },
      audit: {
        type: "string",
        default: "artifacts/history-workbook/workbook-audit.json",
      },
      report: {
        type: "string",
        default: "artifacts/history-workbook/sanity-import-report.json",
      },
      "run-id": { type: "string", default: "approved-first20-20260831" },
      apply: { type: "boolean", default: false },
    },
  });

  const [candidates, manifest, clusters, audit] = await Promise.all([
    readJsonLines<Candidate>(values.candidates),
    readJson<ManifestRecord[]>(values.manifest),
    readJson<DuplicateCluster[]>(values.clusters),
    readJson<WorkbookAudit>(values.audit),
  ]);

  if (manifest.length !== 20) {
    throw new Error(
      `Approved manifest must contain exactly 20 records, got ${manifest.length}.`,
    );
  }
  if (new Set(manifest.map((record) => record.sourceId)).size !== 20) {
    throw new Error("Approved manifest contains duplicate source IDs.");
  }

  const candidateById = new Map(
    candidates.map((candidate) => [candidate.sourceId, candidate]),
  );
  const clusterById = new Map(
    clusters.map((cluster) => [cluster.clusterId, cluster]),
  );
  const selected = manifest.map((record) => {
    const candidate = candidateById.get(record.sourceId);
    if (!candidate)
      throw new Error(`Missing staged candidate ${record.sourceId}.`);
    if (
      candidate.title !== record.title ||
      candidate.eventDate !== record.eventDate ||
      candidate.sheet !== record.sheet ||
      candidate.row !== record.row
    ) {
      throw new Error(`Manifest drift detected for ${record.sourceId}.`);
    }
    if (
      stableChecksum([...candidate.anomalies].sort()) !==
      stableChecksum([...record.knownAnomalies].sort())
    ) {
      throw new Error(
        `Manifest anomaly drift detected for ${record.sourceId}.`,
      );
    }
    if (
      !record.sourceId.includes(`xlsx-${audit.source.sha256.slice(0, 16)}:`)
    ) {
      throw new Error(`Workbook checksum mismatch for ${record.sourceId}.`);
    }
    if (EMAIL_PATTERN.test(stringsIn(candidate).join("\n"))) {
      throw new Error(`Probable private email detected in ${record.sourceId}.`);
    }
    const cluster = record.duplicateCluster
      ? clusterById.get(record.duplicateCluster)
      : undefined;
    if (record.duplicateCluster && !cluster) {
      throw new Error(`Missing duplicate evidence ${record.duplicateCluster}.`);
    }
    if (
      cluster &&
      !cluster.members.some((member) => member.sourceId === record.sourceId)
    ) {
      throw new Error(`Cluster membership mismatch for ${record.sourceId}.`);
    }
    return { candidate, cluster, manifest: record };
  });

  const importedAt = new Date().toISOString();
  const documents = selected.map(({ candidate, cluster, manifest: record }) =>
    buildDocument(
      candidate,
      record,
      cluster,
      audit.source.sha256,
      values["run-id"],
      importedAt,
    ),
  );
  if (documents.some((document) => !document._id.startsWith("drafts."))) {
    throw new Error("Refusing to write a non-draft document ID.");
  }

  const client = getCliClient({
    apiVersion: API_VERSION,
    useCdn: false,
    perspective: "raw",
  });
  const ids = documents.map((document) => document._id);
  const existing = await client.fetch<ExistingDocument[]>(
    "*[_id in $ids]{_id, workflowStatus, reviewFlags[]{code}, provenance{originalImportIdentifier, rawRecordChecksum, sourceBodyChecksum, importDocumentChecksum, sourceBody}, body[]{children[]{text}}}",
    { ids },
  );
  const existingById = new Map(
    existing.map((document) => [document._id, document]),
  );
  const outcomes = documents.map((document) => {
    const current = existingById.get(document._id);
    const sourceConflict = Boolean(
      current &&
      (current.provenance?.originalImportIdentifier !==
        document.provenance.originalImportIdentifier ||
        current.provenance?.rawRecordChecksum !==
          document.provenance.rawRecordChecksum ||
        current.provenance?.sourceBodyChecksum !==
          document.provenance.sourceBodyChecksum),
    );
    const action = sourceConflict ? "conflict" : current ? "skip" : "create";
    return {
      sourceId: document.provenance.originalImportIdentifier,
      documentId: document._id,
      title: document.title,
      workflowStatus: document.workflowStatus,
      duplicateCluster: document.provenance.duplicateClusterId || null,
      flags: document.reviewFlags.map((item) => item.code),
      rawRecordChecksum: document.provenance.rawRecordChecksum,
      sourceBodyChecksum: document.provenance.sourceBodyChecksum,
      importDocumentChecksum: document.provenance.importDocumentChecksum,
      preservedEditorialChanges: Boolean(
        current &&
        current.provenance?.importDocumentChecksum !==
          document.provenance.importDocumentChecksum,
      ),
      action,
    };
  });

  const conflicts = outcomes.filter((outcome) => outcome.action === "conflict");
  if (conflicts.length) {
    throw new Error(
      `Refusing to overwrite ${conflicts.length} existing draft(s) whose source identity or checksums changed.`,
    );
  }

  if (values.apply) {
    for (const outcome of outcomes) {
      if (outcome.action === "skip") continue;
      const document = documents.find(
        (candidate) => candidate._id === outcome.documentId,
      );
      if (!document) throw new Error(`Missing document ${outcome.documentId}.`);
      await client.createOrReplace(document);
    }
  }

  const imported = await client.fetch<ExistingDocument[]>(
    "*[_id in $ids]{_id, workflowStatus, reviewFlags[]{code}, provenance{originalImportIdentifier, rawRecordChecksum, sourceBodyChecksum, importDocumentChecksum, sourceBody}, body[]{children[]{text}}}",
    { ids },
  );
  const importedById = new Map(
    imported.map((document) => [document._id, document]),
  );
  const verificationFailures: string[] = [];

  if (values.apply && imported.length !== 20) {
    verificationFailures.push(
      `Expected 20 drafts, fetched ${imported.length}.`,
    );
  }
  for (const document of documents) {
    const fetched = importedById.get(document._id);
    if (!values.apply && !fetched) continue;
    if (!fetched) {
      verificationFailures.push(`Missing draft ${document._id}.`);
      continue;
    }
    if (
      fetched.provenance?.originalImportIdentifier !==
      document.provenance.originalImportIdentifier
    ) {
      verificationFailures.push(`Source ID mismatch for ${document._id}.`);
    }
    if (
      fetched.provenance?.rawRecordChecksum !==
        document.provenance.rawRecordChecksum ||
      fetched.provenance?.sourceBodyChecksum !==
        document.provenance.sourceBodyChecksum
    ) {
      verificationFailures.push(
        `Source checksum mismatch for ${document._id}.`,
      );
    }
    const outcome = outcomes.find((item) => item.documentId === document._id);
    if (
      outcome?.action === "create" &&
      fetched.provenance?.importDocumentChecksum !==
        document.provenance.importDocumentChecksum
    ) {
      verificationFailures.push(
        `Initial import checksum mismatch for ${document._id}.`,
      );
    }
    if (
      outcome?.action === "create" &&
      fetched.workflowStatus !== document.workflowStatus
    ) {
      verificationFailures.push(`Workflow mismatch for ${document._id}.`);
    }
    const expectedFlags = document.reviewFlags.map((item) => item.code).sort();
    const actualFlags = (fetched.reviewFlags || [])
      .map((item) => item.code || "")
      .sort();
    if (
      outcome?.action === "create" &&
      stableChecksum(expectedFlags) !== stableChecksum(actualFlags)
    ) {
      verificationFailures.push(`Review-flag mismatch for ${document._id}.`);
    }
    const fetchedSourceBody = fetched.provenance?.sourceBody ?? undefined;
    if (
      fetchedSourceBody !== document.provenance.sourceBody ||
      (outcome?.action === "create" &&
        document.provenance.sourceBody &&
        fetched.body?.[0]?.children?.[0]?.text !==
          document.provenance.sourceBody)
    ) {
      verificationFailures.push(`Source-body mismatch for ${document._id}.`);
    }
  }

  const piiEmailMatches = imported
    .flatMap(stringsIn)
    .filter((value) => EMAIL_PATTERN.test(value));
  if (piiEmailMatches.length) {
    verificationFailures.push(
      `Detected ${piiEmailMatches.length} probable email values in imported drafts.`,
    );
  }

  const publishedCount = await client.fetch<number>("count(*[_id in $ids])", {
    ids: ids.map(publishedId),
  });
  if (publishedCount !== 0) {
    verificationFailures.push(
      `Expected zero published records, found ${publishedCount}.`,
    );
  }
  const datasetCounts = await client.fetch<{
    historyDrafts: number;
    publishedHistory: number;
    entities: number;
  }>(
    '{"historyDrafts": count(*[_id in path("drafts.**") && _type == "historyEntry"]), "publishedHistory": count(*[!(_id in path("drafts.**")) && _type == "historyEntry"]), "entities": count(*[_type in ["person","place","geographicRegion","topic","historicalEra","organization","source"]])}',
  );
  const actionCounts = outcomes.reduce<Record<string, number>>(
    (counts, outcome) => {
      counts[outcome.action] = (counts[outcome.action] || 0) + 1;
      return counts;
    },
    {},
  );
  const workflowCounts = outcomes.reduce<Record<string, number>>(
    (counts, outcome) => {
      counts[outcome.workflowStatus] =
        (counts[outcome.workflowStatus] || 0) + 1;
      return counts;
    },
    {},
  );
  const report = {
    mode: values.apply ? "apply" : "dry-run",
    runId: values["run-id"],
    importerVersion: IMPORTER_VERSION,
    generatedAt: importedAt,
    workbookChecksum: audit.source.sha256,
    safeguards: {
      approvedManifestRecords: manifest.length,
      publishedDocumentsWritten: 0,
      automaticMerges: false,
      historicalCorrectionsApplied: false,
      proseRewritten: false,
      imageRightsAssigned: false,
      probableEmailValuesDetected: piiEmailMatches.length,
    },
    counts: {
      input: outcomes.length,
      actions: actionCounts,
      workflow: workflowCounts,
      dataset: datasetCounts,
      publishedSelectedRecords: publishedCount,
      verificationFailures: verificationFailures.length,
    },
    outcomes,
    verificationFailures,
  };
  const reportPath = resolve(values.report);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({ report: reportPath, counts: report.counts }, null, 2)}\n`,
  );
  if (verificationFailures.length) {
    throw new Error(
      `Import verification failed: ${verificationFailures.join(" ")}`,
    );
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Approved XLSX import failed: ${message}\n`);
  process.exitCode = 1;
});
