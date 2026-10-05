import "server-only";

import { unstable_cache } from "next/cache";

import { INGEST_FETCH } from "@/features/ingest/config";

import { extractOpenGraphImage } from "./source-image";

const HEAD_BYTES = 96_000;
const MISS_TTL_MS = 10 * 60 * 1000;
const recentMisses = new Map<string, number>();

const cachedSourcePreviewImage = unstable_cache(
  async (sourceUrl: string) => {
    const image = await loadSourcePreviewImage(sourceUrl);
    if (!image) throw new Error("source-image-unavailable");
    return image;
  },
  ["news-source-preview-image"],
  { revalidate: 60 * 60 * 6, tags: ["news"] },
);

async function readHtmlPrefix(response: Response) {
  if (!response.body) return (await response.text()).slice(0, HEAD_BYTES);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let received = 0;

  try {
    while (received < HEAD_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (/<\/head>/i.test(html)) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  return html;
}

async function loadSourcePreviewImage(sourceUrl: string) {
  const page = new URL(sourceUrl);
  if (page.protocol !== "https:") return undefined;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), INGEST_FETCH.timeoutMs);

  try {
    const response = await fetch(page.href, {
      cache: "no-store",
      headers: {
        Accept: "text/html",
        "User-Agent": INGEST_FETCH.userAgent,
      },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!response.ok) return undefined;
    const html = await readHtmlPrefix(response);
    return extractOpenGraphImage(html, response.url || page.href);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveSourcePreviewImage(sourceUrl: string) {
  if (!sourceUrl.startsWith("https://")) return undefined;

  const missedAt = recentMisses.get(sourceUrl);
  if (missedAt && Date.now() - missedAt < MISS_TTL_MS) return undefined;

  try {
    return await cachedSourcePreviewImage(sourceUrl);
  } catch {
    recentMisses.set(sourceUrl, Date.now());
    return undefined;
  }
}
