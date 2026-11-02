export type PortableTextLike = {
  _type?: string;
  children?: { text?: string }[];
};

export type BodyAuditState =
  | "missing"
  | "excerptOnly"
  | "sourceEquivalent"
  | "shorterThanSource"
  | "substantiveUnverified";

export type BodyCompleteness =
  "fullText" | "sourceBodyImported" | "needsReview" | "excerptOnly";

export function portableTextToPlainText(
  body: PortableTextLike[] | undefined,
): string {
  return (body || [])
    .filter((block) => block._type === "block" || !block._type)
    .map((block) =>
      (block.children || []).map((child) => child.text || "").join(""),
    )
    .join("\n\n");
}

export function normalizeBodyText(value: string | undefined): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function auditOwnedBody({
  body,
  excerpt,
  sourceBody,
}: {
  body?: PortableTextLike[];
  excerpt?: string;
  sourceBody?: string;
}): {
  state: BodyAuditState;
  bodyCharacters: number;
  excerptCharacters: number;
  sourceCharacters: number;
} {
  const bodyText = normalizeBodyText(portableTextToPlainText(body));
  const excerptText = normalizeBodyText(excerpt);
  const sourceText = normalizeBodyText(sourceBody);
  const measurements = {
    bodyCharacters: bodyText.length,
    excerptCharacters: excerptText.length,
    sourceCharacters: sourceText.length,
  };

  if (!bodyText) return { state: "missing", ...measurements };
  if (excerptText && bodyText === excerptText) {
    return { state: "excerptOnly", ...measurements };
  }
  if (sourceText && bodyText === sourceText) {
    return { state: "sourceEquivalent", ...measurements };
  }
  if (sourceText && bodyText.length < sourceText.length * 0.9) {
    return { state: "shorterThanSource", ...measurements };
  }

  return { state: "substantiveUnverified", ...measurements };
}
