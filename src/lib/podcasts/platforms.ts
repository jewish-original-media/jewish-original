export type PodcastPlatform = "youtube" | "spotify" | "apple";

export type PodcastPlatformLink = {
  platform: PodcastPlatform;
  url: string;
  identifier?: string;
  source: string;
  verified: boolean;
};

const APPLE_HOSTS = new Set(["podcasts.apple.com", "itunes.apple.com"]);

export function canonicalizeAppleEpisodeUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!APPLE_HOSTS.has(url.hostname.toLowerCase())) return undefined;
    const episodeId = url.searchParams.get("i");
    if (!episodeId || !/^\d{8,}$/.test(episodeId)) return undefined;
    url.search = "";
    url.searchParams.set("i", episodeId);
    url.hash = "";
    return url.toString();
  } catch {
    return undefined;
  }
}

export function parseAppleEpisodeId(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!APPLE_HOSTS.has(url.hostname.toLowerCase())) return undefined;
    const episodeId = url.searchParams.get("i");
    return episodeId && /^\d{8,}$/.test(episodeId) ? episodeId : undefined;
  } catch {
    return undefined;
  }
}

export function parseSpotifyEpisodeCode(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (
      host !== "podcasters.spotify.com" &&
      host !== "creators.spotify.com" &&
      host !== "anchor.fm"
    ) {
      return undefined;
    }
    const match = url.pathname.match(/-([a-z0-9]+)$/i);
    return match?.[1];
  } catch {
    return undefined;
  }
}

export function isOfficialSpotifyEpisodePage(value?: string | null) {
  return Boolean(parseSpotifyEpisodeCode(value));
}

export function parseOpenSpotifyEpisodeId(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.hostname.toLowerCase() !== "open.spotify.com") return undefined;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] !== "episode" || !parts[1]) return undefined;
    return /^[A-Za-z0-9]{22}$/.test(parts[1]) ? parts[1] : undefined;
  } catch {
    return undefined;
  }
}
