export type PrimaryMediaKind = "youtube" | "audio" | "none";
export type PrimaryMediaOverride = "auto" | "youtube" | "audio";

export function resolvePrimaryMedia(options: {
  primaryMedia?: PrimaryMediaOverride | string;
  youtubeId?: string;
  audioUrl?: string;
}): PrimaryMediaKind {
  const youtubeId = options.youtubeId?.trim();
  const audioUrl = options.audioUrl?.trim();
  const override = options.primaryMedia || "auto";

  if (override === "youtube" && youtubeId) return "youtube";
  if (override === "audio" && audioUrl) return "audio";
  if (youtubeId) return "youtube";
  if (audioUrl) return "audio";
  return "none";
}
