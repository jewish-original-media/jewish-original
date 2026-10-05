export function menuTone(href: string) {
  if (href.startsWith("/today")) return "today";
  if (href.startsWith("/history")) return "history";
  if (href.startsWith("/originals")) return "originals";
  if (href.startsWith("/about")) return "about";
  return "general";
}
