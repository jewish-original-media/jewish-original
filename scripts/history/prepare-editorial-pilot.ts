import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";

import { getCliClient } from "sanity/cli";

import {
  convertSourceBody,
  reconstructSourceBody,
} from "../../src/lib/history/source-body";

const BODY_CONVERSION_SOURCE_IDS = new Set([
  "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0002",
  "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0005",
  "jom-history:xlsx-f163dbda3fd82eb1:Form:row-0037",
  "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0042",
]);

const RECURRING_SOURCE_ID = "jom-history:xlsx-f163dbda3fd82eb1:Import:row-0033";

type ManifestRecord = {
  sourceId: string;
  title: string;
};

type PilotDocument = {
  _id: string;
  title: string;
  entryKind?: string;
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
  provenance?: {
    originalImportIdentifier?: string;
    sourceBody?: string;
    sourceBodyChecksum?: string;
    bodyConversionVersion?: string;
    bodyConversionSeparators?: string[];
    initialEditorialBodyChecksum?: string;
    sourceBodyParagraphCount?: number;
  };
  observanceRule?: {
    observanceKey?: string;
    calendarSystem?: string;
    nominalHebrewMonth?: string;
    nominalHebrewDay?: number;
    adjustmentPolicy?: string;
    calculationProvider?: string;
    beginsAtSunset?: boolean;
    rule?: string;
    note?: string;
  };
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

function checksum(value: unknown) {
  return sha256(JSON.stringify(stableValue(value)));
}

async function main() {
  const { values } = parseArgs({
    options: {
      apply: { type: "boolean", default: false },
      manifest: {
        type: "string",
        default: "artifacts/history-workbook/first-20-manifest.json",
      },
      report: {
        type: "string",
        default: "artifacts/history-editorial/editorial-pilot-report.json",
      },
    },
  });
  const manifest = JSON.parse(
    await readFile(resolve(values.manifest), "utf8"),
  ) as ManifestRecord[];
  if (manifest.length !== 20) {
    throw new Error(
      `Expected 20 approved records, received ${manifest.length}.`,
    );
  }

  const sourceIds = manifest.map((record) => record.sourceId);
  const client = getCliClient({
    apiVersion: "2026-08-31",
    perspective: "raw",
    useCdn: false,
  });
  const documents = await client.fetch<PilotDocument[]>(
    '*[_type == "historyEntry" && _id in path("drafts.**") && provenance.originalImportIdentifier in $sourceIds]{_id,title,entryKind,body,observanceRule,provenance{originalImportIdentifier,sourceBody,sourceBodyChecksum,bodyConversionVersion,bodyConversionSeparators,initialEditorialBodyChecksum,sourceBodyParagraphCount}}',
    { sourceIds },
  );
  if (documents.length !== 20) {
    throw new Error(`Expected 20 Sanity drafts, received ${documents.length}.`);
  }

  const outcomes: {
    documentId: string;
    sourceId: string;
    title: string;
    entryKind: string;
    bodyConversion: "notSelected" | "create" | "unchanged";
    paragraphCount: number | null;
  }[] = [];

  for (const document of documents) {
    if (!document._id.startsWith("drafts.")) {
      throw new Error(`Refusing to mutate non-draft ${document._id}.`);
    }
    const sourceId = document.provenance?.originalImportIdentifier;
    if (!sourceId || !sourceIds.includes(sourceId)) {
      throw new Error(`Missing approved source ID on ${document._id}.`);
    }

    const entryKind =
      sourceId === RECURRING_SOURCE_ID
        ? "recurringObservance"
        : "historicalEvent";
    const set: Record<string, unknown> = { entryKind };
    let bodyConversion: "notSelected" | "create" | "unchanged" = "notSelected";
    let paragraphCount: number | null = null;

    if (BODY_CONVERSION_SOURCE_IDS.has(sourceId)) {
      const sourceBody = document.provenance?.sourceBody;
      if (!sourceBody) {
        throw new Error(`Selected conversion has no source body: ${sourceId}.`);
      }
      if (sha256(sourceBody) !== document.provenance?.sourceBodyChecksum) {
        throw new Error(`Source body checksum mismatch: ${sourceId}.`);
      }
      const conversion = convertSourceBody(sourceBody);
      if (
        reconstructSourceBody(conversion.blocks, conversion.separators) !==
        sourceBody
      ) {
        throw new Error(`Body conversion is not reversible: ${sourceId}.`);
      }
      const currentText = (document.body || [])
        .flatMap((block) => block.children || [])
        .map((span) => span.text)
        .join("");
      const alreadyConverted =
        document.provenance?.bodyConversionVersion === conversion.version &&
        checksum(document.body || []) === checksum(conversion.blocks) &&
        checksum(document.provenance?.bodyConversionSeparators || []) ===
          checksum(conversion.separators);
      if (!alreadyConverted && currentText !== sourceBody) {
        throw new Error(
          `Editorial body differs from the imported source; refusing to overwrite ${sourceId}.`,
        );
      }
      set.body = conversion.blocks;
      set["provenance.bodyConversionVersion"] = conversion.version;
      set["provenance.bodyConversionSeparators"] = conversion.separators;
      set["provenance.initialEditorialBodyChecksum"] = checksum(
        conversion.blocks,
      );
      set["provenance.sourceBodyParagraphCount"] = conversion.blocks.length;
      bodyConversion = alreadyConverted ? "unchanged" : "create";
      paragraphCount = conversion.blocks.length;
    }

    if (sourceId === RECURRING_SOURCE_ID) {
      set.observanceRule = {
        observanceKey: "yom-hazikaron",
        calendarSystem: "hebrew",
        nominalHebrewMonth: "Iyyar",
        nominalHebrewDay: 4,
        adjustmentPolicy: "externalProvider",
        calculationProvider: "hebcal",
        beginsAtSunset: true,
        rule: "Normally observed on 4 Iyyar; the statutory observed date can move in proximity to that date.",
        note: "Model verified against the Knesset overview and Hebcal holiday documentation. No Gregorian occurrence is stored as canonical.",
      };
    }

    if (values.apply) {
      await client.patch(document._id).set(set).commit();
    }
    outcomes.push({
      documentId: document._id,
      sourceId,
      title: document.title,
      entryKind,
      bodyConversion,
      paragraphCount,
    });
  }

  const publishedCount = await client.fetch<number>(
    'count(*[_type == "historyEntry" && !(_id in path("drafts.**"))])',
  );
  if (publishedCount !== 0) {
    throw new Error(
      `Expected zero published history records, found ${publishedCount}.`,
    );
  }

  const report = {
    mode: values.apply ? "apply" : "dry-run",
    generatedAt: new Date().toISOString(),
    counts: {
      approvedDrafts: outcomes.length,
      bodyConversionsSelected: outcomes.filter(
        (outcome) => outcome.bodyConversion !== "notSelected",
      ).length,
      bodyConversionsCreated: outcomes.filter(
        (outcome) => outcome.bodyConversion === "create",
      ).length,
      recurringObservances: outcomes.filter(
        (outcome) => outcome.entryKind === "recurringObservance",
      ).length,
      publishedHistory: publishedCount,
    },
    outcomes: outcomes.sort((left, right) =>
      left.sourceId.localeCompare(right.sourceId),
    ),
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
  process.stderr.write(`Editorial pilot preparation failed: ${message}\n`);
  process.exitCode = 1;
});
