const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "igshid",
]);

const INDEX_PATHS = new Set([
  "",
  "/",
  "/news",
  "/news/",
  "/feed",
  "/feed/",
  "/rss",
  "/rss/",
]);

export type CanonicalUrl = {
  href: string;
  normalized: string;
  host: string;
  path: string;
};

export function canonicalizeUrl(value: string): CanonicalUrl | null {
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    parsed.protocol = "https:";
    parsed.hash = "";
    parsed.hostname = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    parsed.username = "";
    parsed.password = "";
    const params = [...parsed.searchParams.entries()].filter(
      ([key]) => !TRACKING_PARAMS.has(key.toLowerCase()),
    );
    parsed.search = "";
    params
      .sort(([left], [right]) => left.localeCompare(right))
      .forEach(([key, val]) => parsed.searchParams.append(key, val));
    let path = parsed.pathname.replace(/\/{2,}/g, "/");
    if (path.length > 1) path = path.replace(/\/$/, "");
    parsed.pathname = path || "/";
    const href = parsed.toString();
    const normalized = href.replace(/\/$/, "");
    return {
      href,
      normalized,
      host: parsed.hostname,
      path: parsed.pathname,
    };
  } catch {
    return null;
  }
}

export function isIndexUrl(url: CanonicalUrl) {
  return INDEX_PATHS.has(url.path);
}

export function hostAllowed(host: string, allowlist: readonly string[]) {
  return allowlist.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`),
  );
}
