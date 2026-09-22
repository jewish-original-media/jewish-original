const INJECTION_PATTERNS = [
  /ignore (all|any|previous|prior) instructions/i,
  /system prompt/i,
  /you are now/i,
  /override (the )?(system|instructions|rules)/i,
  /reveal (the )?(api key|secret|cron)/i,
  /set publication status/i,
  /change (the )?threshold/i,
  /output code/i,
  /```/,
  /javascript:/i,
];

export function detectPromptInjection(value: string) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}

export function contextLooksUnsafe(value: string) {
  return (
    detectPromptInjection(value) ||
    /https?:\/\//i.test(value) ||
    /@/.test(value) ||
    /api[_-]?key/i.test(value) ||
    /cron_secret/i.test(value) ||
    /```/.test(value) ||
    /<\//.test(value)
  );
}
