import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

import { createClient } from "@sanity/client";
import { parse } from "csv-parse/sync";

const IMPORTER_VERSION = "1.0.0";
const SOURCE_SHEET = "Legacy CMS Import";
const PROHIBITED_HEADERS = new Set([
  "Email",
  "Email Address",
  "Contributor Email",
  "Responder Email",
]);
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const APPROVED_IMAGE_RIGHTS = new Set(["cleared", "publicDomain", "licensed"]);

const legacyHeaders = [
  "Name",
  "Slug",
  "Collection ID",
  "Item ID",
  "Created On",
  "Updated On",
  "Published On",
  "Post Body",
  "Post Summary",
  "Region Tag and Image",
  "Main Image",
  "Topic",
  "Resources",
  "Day (Select)",
  "Month (Select)",
  "Year (Ref. Field)",
  "Century",
] as const;

type LegacyHeader = (typeof legacyHeaders)[number];
type LegacyRow = Record<LegacyHeader, string>;

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

type ImportOutcome = {
  sourceIdentifier: string;
  sourceRow: number;
  title: string;
  documentId?: string;
  action: "create" | "update" | "skip" | "blocked";
  workflowStatus: "imported" | "duplicateCandidate";
  rawRecordChecksum: string;
  sourceBodyChecksum: string;
  flags: string[];
  reason?: string;
};

type PortableTextBlock = {
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
};

type HistoryDraft = {
  _id: string;
  _type: "historyEntry";
  title: string;
  slug: { _type: "slug"; current: string };
  body?: PortableTextBlock[];
  excerpt?: string;
  historicalDate?: {
    _type: "historicalDate";
    start?: { _type: "datePart"; year: number; month: number; day: number };
    precision: "day" | "unknown";
    qualifier: "exact";
    calendarSystem: "other";
    sourceValue: string;
  };
  workflowStatus: "imported" | "duplicateCandidate";
  reviewFlags?: ReviewFlag[];
  provenance: {
    _type: "provenance";
    originalImportIdentifier: string;
    identifierKind: "generatedFrozenRow";
    sourceArchiveId: string;
    sourceFileChecksum: string;
    sourceSheet: string;
    sourceRow: number;
    legacyItemId?: string;
    legacyCollectionId?: string;
    originalSlug: string;
    sourceTopicValues?: string[];
    sourceRegionValues?: string[];
    sourceBody?: string;
    sourceCreatedAt?: string;
    sourceUpdatedAt?: string;
    sourcePublishedAt?: string;
    importRunId: string;
    importerVersion: string;
    rawRecordChecksum: string;
    sourceBodyChecksum: string;
    importedAt: string;
  };
};

const monthNumbers: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function normalized(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

function cleanStructuralWhitespace(value: string) {
  return value.replace(/\r\n?/g, "\n").trim();
}

function sourceRecordChecksum(row: LegacyRow) {
  return sha256(
    JSON.stringify(legacyHeaders.map((header) => [header, row[header] ?? ""])),
  );
}

function sourceIdentifier(row: LegacyRow, sourceRow: number) {
  return [
    "jom-history",
    "legacy-cms",
    row["Collection ID"].trim() || "unknown-collection",
    `row-${sourceRow}`,
  ].join(":");
}

function documentId(identifier: string) {
  return `drafts.historyEntry.jom-${sha256(identifier).slice(0, 32)}`;
}

function portableTextFromSource(body: string): PortableTextBlock[] | undefined {
  if (!body) return undefined;

  return body.split(/\n{2,}/).map((paragraph, index) => ({
    _key: sha256(`block:${index}:${paragraph}`).slice(0, 12),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: sha256(`span:${index}:${paragraph}`).slice(0, 12),
        _type: "span",
        marks: [],
        text: paragraph,
      },
    ],
  }));
}

function expectedCentury(year: number) {
  const ordinal = Math.floor((year - 1) / 100) + 1;
  const mod100 = ordinal % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[
          ordinal % 10
        ] || "th";
  return `${ordinal}${suffix}`;
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

function parseHistoricalDate(row: LegacyRow, flags: ReviewFlag[]) {
  const dayValue = row["Day (Select)"].trim();
  const monthValue = row["Month (Select)"].trim();
  const yearValue = row["Year (Ref. Field)"].trim();
  const sourceValue = [dayValue, monthValue, yearValue]
    .filter(Boolean)
    .join(" ");

  if (!dayValue && !monthValue && !yearValue) {
    flags.push(
      flag(
        "DATE_MISSING",
        "historicalDate",
        "blocking",
        "The source row has no day, month, or year.",
      ),
    );
    return {
      _type: "historicalDate" as const,
      precision: "unknown" as const,
      qualifier: "exact" as const,
      calendarSystem: "other" as const,
      sourceValue,
    };
  }

  const day = Number(dayValue);
  const month = monthNumbers[monthValue.toLocaleLowerCase("en-US")];
  const year = Number(yearValue);
  const dateIsStructurallyValid =
    Number.isInteger(day) &&
    day >= 1 &&
    day <= 31 &&
    month !== undefined &&
    Number.isInteger(year);

  if (!dateIsStructurallyValid) {
    flags.push(
      flag(
        "DATE_MALFORMED",
        "historicalDate",
        "blocking",
        `Unparseable source date components: day=${JSON.stringify(dayValue)}, month=${JSON.stringify(monthValue)}, year=${JSON.stringify(yearValue)}.`,
      ),
    );
    return {
      _type: "historicalDate" as const,
      precision: "unknown" as const,
      qualifier: "exact" as const,
      calendarSystem: "other" as const,
      sourceValue,
    };
  }

  const sourceCentury = row.Century.trim();
  if (!sourceCentury) {
    flags.push(
      flag(
        "CENTURY_MISSING",
        "historicalDate",
        "warning",
        "The source century is blank; no value was inferred into editorial data.",
      ),
    );
  } else if (normalized(sourceCentury) !== normalized(expectedCentury(year))) {
    flags.push(
      flag(
        "CENTURY_CONFLICT",
        "historicalDate",
        "warning",
        `Source century ${JSON.stringify(sourceCentury)} conflicts with the conventional ordinal century for year ${year}. No correction was made.`,
      ),
    );
  }

  return {
    _type: "historicalDate" as const,
    start: { _type: "datePart" as const, year, month, day },
    precision: "day" as const,
    qualifier: "exact" as const,
    calendarSystem: "other" as const,
    sourceValue,
  };
}

function lifecycleTimestamp(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const timestamp = new Date(trimmed);
  return Number.isNaN(timestamp.valueOf())
    ? undefined
    : timestamp.toISOString();
}

function duplicateKeys(rows: LegacyRow[]) {
  const titleDateCounts = new Map<string, number>();
  const slugCounts = new Map<string, number>();

  for (const row of rows) {
    const date = [
      row["Year (Ref. Field)"],
      row["Month (Select)"],
      row["Day (Select)"],
    ].join("-");
    const titleDate = `${normalized(row.Name)}|${normalized(date)}`;
    const slug = normalized(row.Slug);
    titleDateCounts.set(titleDate, (titleDateCounts.get(titleDate) || 0) + 1);
    slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
  }

  return { titleDateCounts, slugCounts };
}

function buildDraft(
  row: LegacyRow,
  sourceRow: number,
  fileChecksum: string,
  archiveId: string,
  importRunId: string,
  importedAt: string,
  duplicates: ReturnType<typeof duplicateKeys>,
) {
  const identifier = sourceIdentifier(row, sourceRow);
  const body = cleanStructuralWhitespace(row["Post Body"]);
  const title = cleanStructuralWhitespace(row.Name);
  const flags: ReviewFlag[] = [];
  const dateKey = normalized(
    [row["Year (Ref. Field)"], row["Month (Select)"], row["Day (Select)"]].join(
      "-",
    ),
  );
  const titleDateKey = `${normalized(row.Name)}|${dateKey}`;
  const slugKey = normalized(row.Slug);
  const isDuplicateCandidate =
    (duplicates.titleDateCounts.get(titleDateKey) || 0) > 1 ||
    (duplicates.slugCounts.get(slugKey) || 0) > 1;

  if (!body) {
    flags.push(
      flag("BODY_MISSING", "body", "blocking", "The source body is blank."),
    );
  }
  const outboundSourceValues = [
    title,
    row.Slug,
    body,
    row["Post Summary"],
    row["Region Tag and Image"],
    row.Topic,
  ];
  if (outboundSourceValues.some((value) => EMAIL_PATTERN.test(value))) {
    return {
      blockedReason:
        "A probable email address was detected in a candidate outbound field. The row was not transformed or sent to Sanity.",
      flags,
      identifier,
      title,
    };
  }
  if (!row.Topic.trim()) {
    flags.push(
      flag("TOPIC_MISSING", "topics", "warning", "The source topic is blank."),
    );
  } else {
    flags.push(
      flag(
        "TOPIC_MAPPING_REQUIRED",
        "topics",
        "warning",
        `Source topic ${JSON.stringify(row.Topic.trim())} requires an approved taxonomy mapping.`,
      ),
    );
  }
  if (row["Region Tag and Image"].trim()) {
    flags.push(
      flag(
        "REGION_MAPPING_REQUIRED",
        "geographicRegions",
        "warning",
        "The source region value requires an approved geographic mapping.",
      ),
    );
  }
  if (/https?:\/\/|www\./i.test(body)) {
    flags.push(
      flag(
        "BODY_CONTAINS_URL",
        "citations",
        "warning",
        "Source prose contains one or more URLs that require citation review.",
      ),
    );
  }
  if (/\b(insert|image:|caption:|sources?:|cw:)\b/i.test(body)) {
    flags.push(
      flag(
        "EDITORIAL_INSTRUCTION_IN_BODY",
        "body",
        "warning",
        "Source prose appears to contain an editorial instruction. It was preserved unchanged.",
      ),
    );
  }
  if (isDuplicateCandidate) {
    flags.push(
      flag(
        "DUPLICATE_CANDIDATE",
        "title",
        "blocking",
        "Another source row shares this normalized title/date or slug. No merge was attempted.",
      ),
    );
  }

  const historicalDate = parseHistoricalDate(row, flags);
  const rawRecordChecksum = sourceRecordChecksum(row);
  const sourceBodyChecksum = sha256(body);
  const draft: HistoryDraft = {
    _id: documentId(identifier),
    _type: "historyEntry",
    title,
    slug: { _type: "slug", current: row.Slug.trim() },
    body: portableTextFromSource(body),
    excerpt: row["Post Summary"].trim() || undefined,
    historicalDate,
    workflowStatus: isDuplicateCandidate ? "duplicateCandidate" : "imported",
    reviewFlags: flags.length ? flags : undefined,
    provenance: {
      _type: "provenance",
      originalImportIdentifier: identifier,
      identifierKind: "generatedFrozenRow",
      sourceArchiveId: archiveId,
      sourceFileChecksum: fileChecksum,
      sourceSheet: SOURCE_SHEET,
      sourceRow,
      legacyItemId: row["Item ID"].trim() || undefined,
      legacyCollectionId: row["Collection ID"].trim() || undefined,
      originalSlug: row.Slug.trim(),
      sourceTopicValues: row.Topic.trim() ? [row.Topic.trim()] : undefined,
      sourceRegionValues: row["Region Tag and Image"].trim()
        ? [row["Region Tag and Image"].trim()]
        : undefined,
      sourceBody: body || undefined,
      sourceCreatedAt: lifecycleTimestamp(row["Created On"]),
      sourceUpdatedAt: lifecycleTimestamp(row["Updated On"]),
      sourcePublishedAt: lifecycleTimestamp(row["Published On"]),
      importRunId,
      importerVersion: IMPORTER_VERSION,
      rawRecordChecksum,
      sourceBodyChecksum,
      importedAt,
    },
  };

  return { draft, flags, identifier, title };
}

function assertLegacyHeaders(headers: string[]) {
  const prohibited = headers.filter((header) => PROHIBITED_HEADERS.has(header));
  if (prohibited.length) {
    throw new Error(
      `Refusing legacy import because PII columns are present: ${prohibited.join(", ")}`,
    );
  }

  const missing = legacyHeaders.filter((header) => !headers.includes(header));
  const unexpected = headers.filter(
    (header) => !legacyHeaders.includes(header as LegacyHeader),
  );
  if (missing.length || unexpected.length) {
    throw new Error(
      `Unexpected legacy CSV schema. Missing: ${missing.join(", ") || "none"}. Unexpected: ${unexpected.join(", ") || "none"}.`,
    );
  }
}

async function selectedIdentifiers(manifestPath: string | undefined) {
  if (!manifestPath) return undefined;
  const parsed = JSON.parse(await readFile(resolve(manifestPath), "utf8")) as {
    sourceIdentifiers?: unknown;
  };
  if (
    !Array.isArray(parsed.sourceIdentifiers) ||
    !parsed.sourceIdentifiers.every((value) => typeof value === "string")
  ) {
    throw new Error("Manifest must contain a sourceIdentifiers string array.");
  }
  return new Set(parsed.sourceIdentifiers);
}

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: "string" },
      manifest: { type: "string" },
      report: {
        type: "string",
        default: "artifacts/history-import-report.json",
      },
      apply: { type: "boolean", default: false },
      "run-id": { type: "string" },
    },
  });

  if (!values.source) {
    throw new Error(
      "Pass the canonical CSV with --source /absolute/path/file.csv",
    );
  }

  const sourcePath = resolve(values.source);
  const sourceBuffer = await readFile(sourcePath);
  const sourceText = sourceBuffer.toString("utf8").replace(/^\uFEFF/, "");
  const records = parse(sourceText, {
    bom: true,
    columns: true,
    relax_quotes: false,
    skip_empty_lines: false,
  }) as LegacyRow[];
  const headers = parse(sourceText, {
    bom: true,
    to_line: 1,
  })[0] as string[];
  assertLegacyHeaders(headers);

  const fileChecksum = sha256(sourceBuffer);
  const archiveId = `legacy-cms-${fileChecksum.slice(0, 12)}`;
  const runId =
    values["run-id"] ||
    `history-${new Date()
      .toISOString()
      .replaceAll(/[-:.TZ]/g, "")
      .slice(0, 14)}`;
  const importedAt = new Date().toISOString();
  const manifest = await selectedIdentifiers(values.manifest);
  const duplicates = duplicateKeys(records);
  const transformed = records.map((row, index) =>
    buildDraft(
      row,
      index + 2,
      fileChecksum,
      archiveId,
      runId,
      importedAt,
      duplicates,
    ),
  );
  const inScope = transformed.filter(
    (record) => !manifest || manifest.has(record.identifier),
  );
  const unknownManifestIds = manifest
    ? [...manifest].filter(
        (identifier) =>
          !transformed.some((record) => record.identifier === identifier),
      )
    : [];

  if (unknownManifestIds.length) {
    throw new Error(
      `Manifest contains identifiers not found in source: ${unknownManifestIds.join(", ")}`,
    );
  }

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (values.apply && !token) {
    throw new Error("SANITY_API_WRITE_TOKEN is required with --apply.");
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const canCompareDataset = Boolean(projectId && dataset && token);
  const client = canCompareDataset
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2026-08-31",
        token,
        useCdn: false,
        perspective: "raw",
      })
    : undefined;
  const drafts = inScope.flatMap((record) =>
    "draft" in record && record.draft ? [record.draft] : [],
  );
  const existing = client
    ? await client.fetch<
        {
          _id: string;
          rawRecordChecksum?: string;
          sourceBodyChecksum?: string;
        }[]
      >(
        '*[_id in $ids]{_id, "rawRecordChecksum": provenance.rawRecordChecksum, "sourceBodyChecksum": provenance.sourceBodyChecksum}',
        { ids: drafts.map((draft) => draft._id) },
      )
    : [];
  const existingById = new Map(
    existing.map((document) => [document._id, document]),
  );
  const outcomes: ImportOutcome[] = [];

  for (const record of inScope) {
    if ("blockedReason" in record) {
      outcomes.push({
        sourceIdentifier: record.identifier,
        sourceRow: Number(
          record.identifier.split(":").at(-1)?.replace("row-", ""),
        ),
        title: record.title,
        action: "blocked",
        workflowStatus: "imported",
        rawRecordChecksum: "",
        sourceBodyChecksum: "",
        flags: record.flags.map((item) => item.code),
        reason: record.blockedReason,
      });
      continue;
    }

    const existingDocument = existingById.get(record.draft._id);
    const action =
      existingDocument?.rawRecordChecksum ===
        record.draft.provenance.rawRecordChecksum &&
      existingDocument?.sourceBodyChecksum ===
        record.draft.provenance.sourceBodyChecksum
        ? "skip"
        : existingDocument
          ? "update"
          : "create";

    if (values.apply && action !== "skip") {
      if (!record.draft._id.startsWith("drafts.")) {
        throw new Error(`Refusing to write non-draft ID ${record.draft._id}`);
      }
      await client!.createOrReplace(record.draft);
    }

    outcomes.push({
      sourceIdentifier: record.identifier,
      sourceRow: record.draft.provenance.sourceRow,
      title: record.title,
      documentId: record.draft._id,
      action,
      workflowStatus: record.draft.workflowStatus,
      rawRecordChecksum: record.draft.provenance.rawRecordChecksum,
      sourceBodyChecksum: record.draft.provenance.sourceBodyChecksum,
      flags: record.flags.map((item) => item.code),
    });
  }

  const actionCounts = outcomes.reduce<Record<string, number>>(
    (counts, outcome) => {
      counts[outcome.action] = (counts[outcome.action] || 0) + 1;
      return counts;
    },
    {},
  );
  const flagCounts = outcomes
    .flatMap((outcome) => outcome.flags)
    .reduce<Record<string, number>>((counts, code) => {
      counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {});
  const report = {
    importerVersion: IMPORTER_VERSION,
    mode: values.apply ? "apply" : "dry-run",
    runId,
    generatedAt: importedAt,
    source: {
      fileName: basename(sourcePath),
      sha256: fileChecksum,
      sheet: SOURCE_SHEET,
      rows: records.length,
      identifierKind: "generatedFrozenRow",
      stableIdWarning:
        "The source Item ID column is empty. Generated IDs are deterministic only for the frozen row ordering and must not be represented as source-provided IDs.",
    },
    selection: {
      manifest: values.manifest ? basename(values.manifest) : null,
      rows: inScope.length,
    },
    safeguards: {
      rawFileCopied: false,
      piiHeadersRejected: [...PROHIBITED_HEADERS],
      outboundFieldEmailDetection: true,
      proseRewritten: false,
      historicalCorrectionsApplied: false,
      automaticMerges: false,
      publishedDocumentsWritten: false,
      approvedImageRights: [...APPROVED_IMAGE_RIGHTS],
    },
    datasetComparison: canCompareDataset
      ? "authenticated-draft-comparison"
      : "not-run-without-write-token",
    counts: {
      input: inScope.length,
      ...actionCounts,
      flags: flagCounts,
    },
    outcomes,
  };

  const reportPath = resolve(values.report);
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify({ report: reportPath, counts: report.counts }, null, 2)}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`History import failed: ${message}\n`);
  process.exitCode = 1;
});
