export function decodeMarkup(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 10)),
    )
    .trim();
}

export function htmlToPlainText(value: string) {
  return decodeMarkup(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeTitle(value: string) {
  return collapseWhitespace(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleTokens(value: string) {
  return normalizeTitle(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

export function jaccardSimilarity(left: string, right: string) {
  const a = new Set(titleTokens(left));
  const b = new Set(titleTokens(right));
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  return intersection / (a.size + b.size - intersection);
}

export function truncateSourceText(value: string, max = 400) {
  const text = collapseWhitespace(htmlToPlainText(value));
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function isAllCapsSpam(value: string) {
  const letters = value.replace(/[^A-Za-z]/g, "");
  if (letters.length < 12) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length >= 0.92;
}

export function twelveWordOverlap(left: string, right: string) {
  const a = collapseWhitespace(left).toLowerCase().split(" ");
  const b = collapseWhitespace(right).toLowerCase().split(" ");
  if (a.length < 12 || b.length < 12) return false;
  const haystack = b.join(" ");
  for (let index = 0; index <= a.length - 12; index += 1) {
    const phrase = a.slice(index, index + 12).join(" ");
    if (haystack.includes(phrase)) return true;
  }
  return false;
}

export function sentenceCount(value: string) {
  return collapseWhitespace(value)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean).length;
}
