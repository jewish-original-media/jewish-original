import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { createClient } from "@sanity/client";

import {
  auditOwnedBody,
  type BodyCompleteness,
} from "../../src/lib/content/body-completeness";
import {
  convertSourceBody,
  reconstructSourceBody,
} from "../../src/lib/history/source-body";

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
  _rev: string;
  _createdAt?: string;
  _updatedAt?: string;
  title?: string;
  excerpt?: string;
  body?: {
    _type?: string;
    markDefs?: unknown[];
    children?: { text?: string; marks?: string[] }[];
  }[];
  bodyCompleteness?: BodyCompleteness;
  provenance?: {
    sourceBody?: string;
    sourceBodyChecksum?: string;
    bodyConversionVersion?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function isUnformattedSingleBlock(document: OwnedDocument) {
  if (document.body?.length !== 1) return false;
  const block = document.body[0];
  return (
    (block?.markDefs?.length || 0) === 0 &&
    (block?.children || []).every((child) => (child.marks?.length || 0) === 0)
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const readToken = process.env.SANITY_API_READ_TOKEN;
  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !dataset || !readToken) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_READ_TOKEN are required.",
    );
  }
  if (apply && !writeToken) {
    throw new Error("SANITY_API_WRITE_TOKEN is required with --apply.");
  }

  const client = createClient({
    projectId,
    dataset,
    token: apply ? writeToken : readToken,
    apiVersion: "2026-11-01",
    perspective: "raw",
    useCdn: false,
  });
  const documents = await client.fetch<OwnedDocument[]>(
    `*[_type in ["historyEntry", "article"]] | order(_type asc, title asc) {
      ...
    }`,
  );
  const drafts = documents.filter((document) =>
    document._id.startsWith("drafts."),
  );

  const plans = drafts.map((document) => {
    const audit = auditOwnedBody({
      body: document.body,
      excerpt: document.excerpt,
      sourceBody: document.provenance?.sourceBody,
    });
    let bodyCompleteness: BodyCompleteness =
      document.bodyCompleteness || "needsReview";
    if (audit.state === "excerptOnly") bodyCompleteness = "excerptOnly";
    if (audit.state === "sourceEquivalent" && bodyCompleteness !== "fullText") {
      bodyCompleteness = "sourceBodyImported";
    }

    const sourceBody = document.provenance?.sourceBody;
    const conversion =
      sourceBody &&
      audit.state === "sourceEquivalent" &&
      isUnformattedSingleBlock(document) &&
      sourceBody.split(/\r?\n\s*\r?\n/).filter((paragraph) => paragraph.trim())
        .length > 1
        ? convertSourceBody(sourceBody)
        : undefined;
    if (
      conversion &&
      reconstructSourceBody(conversion.blocks, conversion.separators) !==
        sourceBody
    ) {
      throw new Error(`Body conversion is not reversible for ${document._id}.`);
    }

    const set: Record<string, unknown> = {};
    if (document.bodyCompleteness !== bodyCompleteness) {
      set.bodyCompleteness = bodyCompleteness;
    }
    if (conversion) {
      set.body = conversion.blocks;
      set["provenance.bodyConversionVersion"] = conversion.version;
      set["provenance.bodyConversionSeparators"] = conversion.separators;
      set["provenance.sourceBodyParagraphCount"] = conversion.blocks.length;
    }

    return {
      id: document._id,
      title: document.title,
      type: document._type,
      auditState: audit.state,
      previousCompleteness: document.bodyCompleteness || "unset",
      nextCompleteness: bodyCompleteness,
      convertSingleBlockSource: Boolean(conversion),
      set,
      revision: document._rev,
    };
  });
  const changes = plans.filter((plan) => Object.keys(plan.set).length > 0);
  const documentIds = new Set(documents.map((document) => document._id));
  const clonePlans = documents
    .filter((document) => !document._id.startsWith("drafts."))
    .flatMap((document) => {
      const draftId = `drafts.${document._id}`;
      const sourceBody = document.provenance?.sourceBody;
      const sourceChecksum = document.provenance?.sourceBodyChecksum;
      const audit = auditOwnedBody({
        body: document.body,
        excerpt: document.excerpt,
        sourceBody,
      });
      if (
        audit.state !== "shorterThanSource" ||
        !sourceBody ||
        !sourceChecksum ||
        sha256(sourceBody) !== sourceChecksum ||
        documentIds.has(draftId)
      ) {
        return [];
      }

      const conversion = convertSourceBody(sourceBody);
      if (
        reconstructSourceBody(conversion.blocks, conversion.separators) !==
        sourceBody
      ) {
        throw new Error(
          `Body conversion is not reversible for ${document._id}.`,
        );
      }
      const content: Record<string, unknown> = { ...document };
      delete content._id;
      delete content._rev;
      delete content._createdAt;
      delete content._updatedAt;
      const create = {
        ...content,
        _id: draftId,
        _type: document._type,
        body: conversion.blocks,
        bodyCompleteness: "sourceBodyImported",
        workflowStatus:
          document._type === "historyEntry" ? "needsReview" : "review",
        provenance: {
          ...document.provenance,
          bodyConversionVersion: conversion.version,
          bodyConversionSeparators: conversion.separators,
          sourceBodyParagraphCount: conversion.blocks.length,
        },
      };

      return [
        {
          id: draftId,
          publishedId: document._id,
          title: document.title,
          type: document._type,
          sourceCharacters: audit.sourceCharacters,
          previousBodyCharacters: audit.bodyCharacters,
          paragraphCount: conversion.blocks.length,
          create,
        },
      ];
    });

  if (apply) {
    for (const plan of changes) {
      if (!plan.id.startsWith("drafts.")) {
        throw new Error(`Refusing to mutate non-draft ${plan.id}.`);
      }
      await client
        .patch(plan.id)
        .ifRevisionId(plan.revision)
        .set(plan.set)
        .commit();
    }
    for (const plan of clonePlans) {
      if (!plan.id.startsWith("drafts.")) {
        throw new Error(`Refusing to create non-draft ${plan.id}.`);
      }
      await client.createIfNotExists(plan.create);
    }
  }

  const report = {
    apply,
    generatedAt: new Date().toISOString(),
    inspectedDrafts: drafts.length,
    changedDrafts: changes.length,
    incompletePublishedWithSafeDraftPlan: clonePlans.length,
    note: apply
      ? "Only drafts were patched or created. Published records and provenance sourceBody were not modified."
      : "Dry run only. Apply remains draft-only; existing draft patches are revision-guarded.",
    plans: changes.map((plan) => ({
      id: plan.id,
      title: plan.title,
      type: plan.type,
      auditState: plan.auditState,
      previousCompleteness: plan.previousCompleteness,
      nextCompleteness: plan.nextCompleteness,
      convertSingleBlockSource: plan.convertSingleBlockSource,
    })),
    draftCreations: clonePlans.map((plan) => ({
      id: plan.id,
      publishedId: plan.publishedId,
      title: plan.title,
      type: plan.type,
      sourceCharacters: plan.sourceCharacters,
      previousBodyCharacters: plan.previousBodyCharacters,
      paragraphCount: plan.paragraphCount,
    })),
  };
  const reportPath = resolve(
    `artifacts/content-audit/full-text-migration-${apply ? "apply" : "dry-run"}.json`,
  );
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        reportPath,
        apply,
        inspectedDrafts: drafts.length,
        changedDrafts: changes.length,
        incompletePublishedWithSafeDraftPlan: clonePlans.length,
        note: report.note,
      },
      null,
      2,
    ),
  );
}

void main();
