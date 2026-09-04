export function parseDurationToSeconds(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const parts = trimmed.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return undefined;
  if (parts.length === 3 && parts[0] !== undefined && parts[1] !== undefined && parts[2] !== undefined) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
    return parts[0] * 60 + parts[1];
  }
  return undefined;
}

export function formatDuration(seconds?: number) {
  if (seconds === undefined || seconds < 0) return undefined;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  if (hours) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

export function formatPublishedDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatEpisodeNumber(options: {
  season?: number;
  episodeNumber?: number;
}) {
  if (options.season && options.episodeNumber) {
    return `Season ${options.season} · Episode ${options.episodeNumber}`;
  }
  if (options.episodeNumber) {
    return `Episode ${options.episodeNumber}`;
  }
  if (options.season) {
    return `Season ${options.season}`;
  }
  return undefined;
}

export function excerptFromDescription(description: string, max = 220) {
  const compact = description.replace(/\s+/g, " ").trim();
  if (!compact) return undefined;
  if (compact.length <= max) return compact;
  const sentence = compact.match(/(.+?[.!?])(\s|$)/)?.[1];
  if (sentence && sentence.length <= max) return sentence;
  return `${compact.slice(0, max - 1).trimEnd()}…`;
}
