export function isPlayableAudioUrl(url?: string) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (
      /(^|\.)(apple\.com|spotify\.com|podcasts\.apple\.com|music\.amazon\.com)$/i.test(
        parsed.hostname,
      )
    ) {
      return false;
    }
    if (/\.(mp3|m4a|aac|ogg|opus|wav)(\?|$)/i.test(parsed.pathname)) {
      return true;
    }
    return /(anchor\.fm|cloudfront\.net|megaphone\.fm|simplecast\.com|transistor\.fm|buzzsprout\.com|libsyn\.com|podtrac\.com|captivate\.fm)/i.test(
      parsed.hostname,
    );
  } catch {
    return false;
  }
}
