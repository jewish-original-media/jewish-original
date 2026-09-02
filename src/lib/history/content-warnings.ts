const labels: Record<string, string> = {
  antisemiticViolence: "antisemitic violence",
  graphicViolence: "graphic violence",
  genocide: "genocide or mass death",
  death: "death",
  terrorism: "terrorism",
};

export function formatContentWarningLabel(warning: string) {
  return labels[warning] || warning;
}

export function formatContentWarningList(warnings: string[]) {
  return warnings
    .filter((warning) => warning !== "death" || !warnings.includes("genocide"))
    .map(formatContentWarningLabel)
    .join(", ");
}
