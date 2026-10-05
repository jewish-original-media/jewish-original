import { historyArchiveHref } from "@/content/history/archive";

export const siteSocial = [
  {
    label: "Instagram",
    account: "On This Day in Jewish History",
    href: "https://www.instagram.com/onthisdayinjewishistory/",
    analyticsEvent: "instagram_outbound",
  },
] as const;

export const siteConfig = {
  name: "Jewish Original Media",
  shortName: "Jewish Original",
  legalName: "Jewish Original Media LLC",
  email: "hello@jewishoriginal.com",
  description:
    "A modern home for Jewish history, culture, education, connection, and identity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jewishoriginal.com",
  social: siteSocial,
  get navigation() {
    return resolvePrimaryNavigation();
  },
  get footerExplore() {
    return resolveFooterExplore();
  },
  footerUtility: [{ label: "Privacy", href: "/privacy" }],
};

export type SiteNavItem = {
  label: string;
  href: string;
  emphasis?: boolean;
  children?: readonly SiteNavChild[];
  menuKicker?: string;
  menuIntroduction?: string;
};

export type SiteNavChild = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
  analyticsEvent?: string;
};

export type HistoryMenuFacet = {
  type: "topic" | "place" | "era";
  name: string;
  slug: string;
};

type HistoryMenuSource = {
  topics: readonly { name: string; slug: string }[];
  places: readonly { name: string; slug: string }[];
  eras: readonly { name: string; slug: string }[];
};

const HISTORY_MENU_QUOTAS = {
  topic: 3,
  place: 2,
  era: 1,
} as const;

const FACET_LABELS = {
  topic: "Topic",
  place: "Place",
  era: "Era",
} as const;

function isPresent<T>(item: T | null): item is T {
  return item !== null;
}

export function selectHistoryMenuFacets(
  entries: readonly HistoryMenuSource[],
  limit = 6,
): HistoryMenuFacet[] {
  const counts = new Map<string, HistoryMenuFacet & { count: number }>();

  const add = (
    type: HistoryMenuFacet["type"],
    items: readonly { name: string; slug: string }[],
  ) => {
    for (const item of items) {
      if (!item.slug || !item.name) continue;
      const key = `${type}:${item.slug}`;
      const current = counts.get(key);
      if (current) current.count += 1;
      else {
        counts.set(key, {
          type,
          name: item.name,
          slug: item.slug,
          count: 1,
        });
      }
    }
  };

  for (const entry of entries) {
    add("topic", entry.topics);
    add("place", entry.places);
    add("era", entry.eras);
  }

  const ranked = [...counts.values()].sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.name.localeCompare(right.name);
  });
  const picked: HistoryMenuFacet[] = [];
  const used = new Set<string>();

  for (const type of ["topic", "place", "era"] as const) {
    for (const item of ranked.filter((facet) => facet.type === type)) {
      if (
        picked.filter((facet) => facet.type === type).length >=
        HISTORY_MENU_QUOTAS[type]
      ) {
        break;
      }
      if (picked.length >= limit) break;
      picked.push({ type: item.type, name: item.name, slug: item.slug });
      used.add(`${item.type}:${item.slug}`);
    }
  }

  for (const item of ranked) {
    if (picked.length >= limit) break;
    const key = `${item.type}:${item.slug}`;
    if (used.has(key)) continue;
    picked.push({ type: item.type, name: item.name, slug: item.slug });
    used.add(key);
  }

  return picked;
}

function historyMenuChildren(input?: {
  historyFacets?: readonly HistoryMenuFacet[];
  onThisDayHref?: string;
}): SiteNavChild[] {
  const onThisDay =
    input?.onThisDayHref && input.onThisDayHref !== "/history"
      ? {
          label: "On This Day",
          href: input.onThisDayHref,
          description: "Browse this calendar date",
        }
      : null;

  return [
    {
      label: "The archive",
      href: "/history",
      description: "Reviewed On This Day entries",
    },
    onThisDay,
    {
      label: "Search the archive",
      href: "/explore",
      description: "Topics, places, people, and threads",
    },
    ...(input?.historyFacets ?? []).map((facet) => ({
      label: facet.name,
      href: historyArchiveHref({
        filter: { type: facet.type, slug: facet.slug },
      }),
      description: FACET_LABELS[facet.type],
    })),
  ].filter(isPresent);
}

function instagramChild(): SiteNavChild {
  const instagram = siteSocial[0];
  return {
    label: instagram.label,
    href: instagram.href,
    description: instagram.account,
    external: true,
    analyticsEvent: instagram.analyticsEvent,
  };
}

export function resolvePrimaryNavigation(input?: {
  originalsLive?: boolean;
  newsLive?: boolean;
  eventsLive?: boolean;
  historyFacets?: readonly HistoryMenuFacet[];
  originalEssays?: readonly { title: string; slug: string }[];
  onThisDayHref?: string;
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
  const essays = (input?.originalEssays ?? [])
    .filter((essay) => essay.slug && essay.title)
    .slice(0, 3);
  const items: Array<SiteNavItem | null> = [
    {
      label: "Today",
      href: "/today",
      menuKicker: "Begin with Today",
      menuIntroduction:
        "The Jewish day, the Jewish past, and what is happening now.",
      children: todayChildren.filter(isPresent),
    },
    {
      label: "History",
      href: "/history",
      menuKicker: "The archive",
      menuIntroduction: "Searchable categories from the reviewed record.",
      children: historyMenuChildren(input),
    },
    input?.originalsLive
      ? {
          label: "Originals",
          href: "/originals",
          menuKicker: "The journal",
          menuIntroduction: "Essays from Jewish Original.",
          children: [
            {
              label: "The journal",
              href: "/originals",
              description: "Essays from Jewish Original",
            },
            ...essays.map((essay) => ({
              label: essay.title,
              href: `/originals/${essay.slug}`,
              description: "Latest essay",
            })),
          ],
        }
      : null,
    { label: "Podcasts", href: "/podcasts" },
    {
      label: "About",
      href: "/about",
      menuKicker: "The house",
      menuIntroduction: "The story, the work, and where to find us.",
      children: [
        {
          label: "Our story",
          href: "/about",
          description: "Jewish Original Media",
        },
        {
          label: "Support",
          href: "/support",
          description: "Keep the work public",
        },
        instagramChild(),
      ],
    },
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
