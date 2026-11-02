import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createClient } from "@sanity/client";

import {
  auditOwnedBody,
  type BodyCompleteness,
  type PortableTextLike,
} from "../../src/lib/content/body-completeness";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Environment validation below fails closed.
}

type OwnedDocument = {
  _id: string;
  _type: "historyEntry" | "article";
  title?: string;
  slug?: string;
  workflowStatus?: string;
  excerpt?: string;
  body?: PortableTextLike[];
  bodyCompleteness?: BodyCompleteness;
  provenance?: {
    sourceBody?: string;
    bodyConversionVersion?: string;
    sourceBodyParagraphCount?: number;
  };
};

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!projectId || !dataset || !token) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_READ_TOKEN are required.",
    );
  }

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2026-11-01",
    perspective: "raw",
    useCdn: false,
  });
  const documents = await client.fetch<OwnedDocument[]>(
    `*[_type in ["historyEntry", "article"]] | order(_type asc, title asc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      workflowStatus,
      excerpt,
      body[]{_type, children[]{text}},
      bodyCompleteness,
      provenance{sourceBody, bodyConversionVersion, sourceBodyParagraphCount}
    }`,
  );

  const records = documents.map((document) => {
    const audit = auditOwnedBody({
      body: document.body,
      excerpt: document.excerpt,
      sourceBody: document.provenance?.sourceBody,
    });
    const isDraft = document._id.startsWith("drafts.");
    const isPublicStatus =
      document.workflowStatus === "ready" ||
      document.workflowStatus === "published";
    const issues = [
      audit.state === "missing" ? "missing-body" : null,
      audit.state === "excerptOnly" ? "body-equals-excerpt" : null,
      audit.state === "shorterThanSource" ? "body-shorter-than-source" : null,
      isPublicStatus && document.bodyCompleteness !== "fullText"
        ? "public-status-without-full-text-confirmation"
        : null,
    ].filter((issue): issue is string => Boolean(issue));

    return {
      id: document._id,
      type: document._type,
      title: document.title,
      slug: document.slug,
      isDraft,
      workflowStatus: document.workflowStatus,
      bodyCompleteness: document.bodyCompleteness || "unset",
      auditState: audit.state,
      bodyCharacters: audit.bodyCharacters,
      excerptCharacters: audit.excerptCharacters,
      sourceCharacters: audit.sourceCharacters,
      paragraphBlocks: document.body?.length || 0,
      sourceParagraphs:
        document.provenance?.sourceBodyParagraphCount ??
        (document.provenance?.sourceBody
          ? document.provenance.sourceBody.split(/\r?\n\s*\r?\n/).length
          : 0),
      bodyConversionVersion:
        document.provenance?.bodyConversionVersion || "unset",
      issues,
    };
  });
  const issueCounts = records
    .flatMap((record) => record.issues)
    .reduce<Record<string, number>>((counts, issue) => {
      counts[issue] = (counts[issue] || 0) + 1;
      return counts;
    }, {});
  const report = {
    generatedAt: new Date().toISOString(),
    projectId,
    dataset,
    totals: {
      documents: records.length,
      history: records.filter((record) => record.type === "historyEntry")
        .length,
      originals: records.filter((record) => record.type === "article").length,
      drafts: records.filter((record) => record.isDraft).length,
      recordsWithIssues: records.filter((record) => record.issues.length)
        .length,
    },
    issueCounts,
    records,
  };
  const reportPath = resolve("artifacts/content-audit/full-text-audit.json");
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        reportPath,
        totals: report.totals,
        issueCounts,
      },
      null,
      2,
    ),
  );
}

void main();
