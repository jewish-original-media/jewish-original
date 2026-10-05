export const siteConfig = {
  name: "Jewish Original Media",
  shortName: "Jewish Original",
  legalName: "Jewish Original Media LLC",
  email: "hello@jewishoriginal.com",
  description:
    "A modern home for Jewish history, culture, education, connection, and identity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jewishoriginal.com",
  navigation: [
    {
      label: "Today",
      href: "/today",
      children: [
        { label: "Today’s overview", href: "/today" },
        { label: "Jewish calendar", href: "/today#jewish-calendar" },
        { label: "This week in Torah", href: "/today#weekly-torah" },
        { label: "On This Day", href: "/today#today-in-history" },
      ],
    },
    { label: "Explore", href: "/explore" },
    { label: "History", href: "/history" },
    { label: "Podcasts", href: "/podcasts" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support", emphasis: true },
  ],
  footerExplore: [
    { label: "Explore", href: "/explore" },
    { label: "Today", href: "/today" },
    { label: "History", href: "/history" },
    { label: "Podcasts", href: "/podcasts" },
    { label: "News", href: "/news" },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ],
  footerUtility: [{ label: "Privacy", href: "/privacy" }],
} as const;

export type SiteNavItem = {
  label: string;
  href: string;
  emphasis?: boolean;
  children?: readonly SiteNavChild[];
};

export type SiteNavChild = {
  label: string;
  href: string;
  description?: string;
};

function isPresent<T>(item: T | null): item is T {
  return item !== null;
}

export function resolvePrimaryNavigation(input?: {
  originalsLive?: boolean;
  newsLive?: boolean;
  eventsLive?: boolean;
}): SiteNavItem[] {
  const todayChildren: Array<SiteNavChild | null> = [
    {
      label: "Today’s overview",
      href: "/today",
      description: "The Gregorian and Hebrew day",
    },
    {
      label: "Jewish calendar",
      href: "/today#jewish-calendar",
      description: "Holidays and observances",
    },
    {
      label: "This week in Torah",
      href: "/today#weekly-torah",
      description: "The weekly portion and readings",
    },
    {
      label: "On This Day",
      href: "/today#today-in-history",
      description: "Reviewed historical anniversaries",
    },
    input?.newsLive
      ? {
          label: "News",
          href: "/news",
          description: "What we’re following",
        }
      : null,
    input?.eventsLive
      ? {
          label: "Events",
          href: "/events",
          description: "What’s happening next",
        }
      : null,
  ];
  const items: Array<SiteNavItem | null> = [
    {
      label: "Today",
      href: "/today",
      children: todayChildren.filter(isPresent),
    },
    { label: "Explore", href: "/explore" },
    { label: "History", href: "/history" },
    input?.originalsLive ? { label: "Originals", href: "/originals" } : null,
    { label: "Podcasts", href: "/podcasts" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/support", emphasis: true },
  ];
  return items.filter(isPresent);
}

export function resolveFooterExplore(input?: {
  originalsLive?: boolean;
  eventsLive?: boolean;
}): SiteNavItem[] {
  const items: Array<SiteNavItem | null> = [
    { label: "Explore", href: "/explore" },
    { label: "Today", href: "/today" },
    { label: "History", href: "/history" },
    input?.originalsLive ? { label: "Originals", href: "/originals" } : null,
    { label: "Podcasts", href: "/podcasts" },
    { label: "News", href: "/news" },
    input?.eventsLive ? { label: "Events", href: "/events" } : null,
    { label: "About", href: "/about" },
    { label: "Support", href: "/support" },
  ];
  return items.filter(isPresent);
}
