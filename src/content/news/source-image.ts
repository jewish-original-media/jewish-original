const IMAGE_META_KEYS = [
  "og:image:secure_url",
  "og:image:url",
  "og:image",
  "twitter:image",
  "twitter:image:src",
] as const;

const META_TAG = /<meta\b[^>]*>/gi;
const MAX_IMAGE_URL_LENGTH = 4096;

function attribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(
      String.raw`\b${name}\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))`,
      "i",
    ),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function decodeHtml(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, digits: string) =>
      String.fromCodePoint(Number.parseInt(digits, 10)),
    )
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#0*39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

export function resolveHttpsImage(raw: string, pageUrl: string) {
  const decoded = decodeHtml(raw).trim();
  if (!decoded || decoded.length > MAX_IMAGE_URL_LENGTH) return undefined;

  let url: URL;
  try {
    url = new URL(decoded, pageUrl);
  } catch {
    return undefined;
  }

  if (url.protocol !== "https:" || url.username || url.password) {
    return undefined;
  }

  return url.href;
}

export function extractOpenGraphImage(html: string, pageUrl: string) {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd >= 0 ? html.slice(0, headEnd) : html;
  const tags = head.match(META_TAG) ?? [];

  for (const key of IMAGE_META_KEYS) {
    for (const tag of tags) {
      const property = (
        attribute(tag, "property") ?? attribute(tag, "name")
      )?.toLowerCase();
      if (property !== key) continue;
      const content = attribute(tag, "content");
      const image = content ? resolveHttpsImage(content, pageUrl) : undefined;
      if (image) return image;
    }
  }

  return undefined;
}
