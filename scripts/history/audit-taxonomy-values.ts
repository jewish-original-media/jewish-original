import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type Candidate = {
  sourceId: string;
  sheet: "Form" | "Import";
  topic: string;
  region: string;
};

function sortedCounts(values: string[]) {
  const counts = values.reduce<Record<string, number>>((result, value) => {
    const key = value || "(blank)";
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  return Object.fromEntries(
    Object.entries(counts).sort(
      ([leftValue, leftCount], [rightValue, rightCount]) =>
        rightCount - leftCount || leftValue.localeCompare(rightValue),
    ),
  );
}

function tokens(value: string) {
  return value
    .split(/[,;/]/)
    .map((token) => token.trim().replace(/,+$/, "").trim())
    .filter(Boolean);
}

async function main() {
  const sourcePath = resolve("artifacts/history-workbook/candidates.jsonl");
  const outputPath = resolve(
    "artifacts/history-taxonomy/source-value-audit.json",
  );
  const candidates = (await readFile(sourcePath, "utf8"))
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Candidate);

  const report = {
    generatedAt: new Date().toISOString(),
    source: "canonical XLSX sanitized candidates",
    candidateCount: candidates.length,
    sourceFamilies: sortedCounts(candidates.map((record) => record.sheet)),
    topics: {
      rawDistinct: new Set(candidates.map((record) => record.topic)).size,
      rawValues: sortedCounts(candidates.map((record) => record.topic)),
      tokenDistinct: new Set(
        candidates.flatMap((record) => tokens(record.topic)),
      ).size,
      tokenValues: sortedCounts(
        candidates.flatMap((record) => tokens(record.topic)),
      ),
    },
    geography: {
      rawDistinct: new Set(candidates.map((record) => record.region)).size,
      rawValues: sortedCounts(candidates.map((record) => record.region)),
      tokenDistinct: new Set(
        candidates.flatMap((record) => tokens(record.region)),
      ).size,
      tokenValues: sortedCounts(
        candidates.flatMap((record) => tokens(record.region)),
      ),
    },
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `${JSON.stringify(
      {
        outputPath,
        candidateCount: report.candidateCount,
        topicRawDistinct: report.topics.rawDistinct,
        topicTokenDistinct: report.topics.tokenDistinct,
        geographyRawDistinct: report.geography.rawDistinct,
        geographyTokenDistinct: report.geography.tokenDistinct,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Taxonomy audit failed: ${message}\n`);
  process.exitCode = 1;
});
