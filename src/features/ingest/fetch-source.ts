import { INGEST_FETCH } from "./config";

export type FetchResult =
  | { ok: true; text: string; contentType: string; status: number }
  | { ok: false; error: string; status?: number };

export async function fetchSourceText(
  url: string,
  timeoutMs = INGEST_FETCH.timeoutMs,
): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept:
          "application/rss+xml, application/xml, text/xml, text/calendar, */*",
        "User-Agent": INGEST_FETCH.userAgent,
      },
      cache: "no-store",
    });
    const text = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        error: `http-${response.status}`,
        status: response.status,
      };
    }
    return {
      ok: true,
      text,
      contentType: response.headers.get("content-type") || "",
      status: response.status,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "timeout"
        : "fetch-failed";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}
