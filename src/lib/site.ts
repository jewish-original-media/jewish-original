export const siteConfig = {
  name: "Jewish Original Media",
  shortName: "Jewish Original",
  legalName: "Jewish Original Media LLC",
  email: "hello@jewishoriginal.com",
  description:
    "A modern home for Jewish history, culture, education, connection, and identity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jewishoriginal.com",
  navigation: [
    { label: "Today", href: "/today" },
    { label: "History", href: "/history" },
    { label: "Podcasts", href: "/podcasts" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support", emphasis: true },
  ],
  footerExplore: [
    { label: "Today", href: "/today" },
    { label: "History", href: "/history" },
    { label: "Podcasts", href: "/podcasts" },
    { label: "News", href: "/news" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ],
  footerUtility: [{ label: "Privacy", href: "/privacy" }],
} as const;

export type SiteNavItem = {
  label: string;
  href: string;
  emphasis?: boolean;
};

export function resolvePrimaryNavigation(input?: {
  originalsLive?: boolean;
  newsLive?: boolean;
}): SiteNavItem[] {
  return [
    { label: "Today", href: "/today" },
    { label: "History", href: "/history" },
    input?.originalsLive ? { label: "Originals", href: "/originals" } : null,
    { label: "Podcasts", href: "/podcasts" },
    input?.newsLive ? { label: "News", href: "/news" } : null,
    { label: "About", href: "/about" },
    { label: "Support", href: "/support", emphasis: true },
  ].filter((item): item is SiteNavItem => item !== null);
}

export function resolveFooterExplore(input?: {
  originalsLive?: boolean;
}): SiteNavItem[] {
  return [
    { label: "Today", href: "/today" },
    { label: "History", href: "/history" },
    input?.originalsLive ? { label: "Originals", href: "/originals" } : null,
    { label: "Podcasts", href: "/podcasts" },
    { label: "News", href: "/news" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ].filter((item): item is SiteNavItem => item !== null);
}
