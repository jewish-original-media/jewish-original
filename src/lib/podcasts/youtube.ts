const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function isYouTubeId(value?: string | null) {
  return Boolean(value && /^[A-Za-z0-9_-]{11}$/.test(value.trim()));
}

export function parseYouTubeId(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    if (!YOUTUBE_HOSTS.has(host)) return undefined;

    if (host.endsWith("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live") {
      const id = pathParts[1];
      return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined;
    }

    const queryId = url.searchParams.get("v");
    return queryId && /^[A-Za-z0-9_-]{11}$/.test(queryId) ? queryId : undefined;
  } catch {
    return undefined;
  }
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

export function youtubePosterUrl(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
