import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getHomepageEvents } from "@/content/events/fetch";
import { getHistoryIndex } from "@/content/history/fetch";
import { getPublishedNewsIndex } from "@/content/news/fetch";
import { getPublishedOriginalsIndex } from "@/content/originals/fetch";
import { eventsNavEligible, newsNavEligible } from "@/features/ingest/select";
import { getJewishToday } from "@/features/jewish-today";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/site";
import {
  resolveFooterExplore,
  resolvePrimaryNavigation,
  selectHistoryMenuFacets,
} from "@/lib/site";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [today, originals, news, events, history] = await Promise.all([
    getJewishToday(),
    getPublishedOriginalsIndex().catch(() => []),
    getPublishedNewsIndex().catch(() => []),
    getHomepageEvents().catch(() => []),
    getHistoryIndex(false).catch(() => []),
  ]);
  const originalsLive = originals.length > 0;
  const newsLive = newsNavEligible(news);
  const eventsLive = eventsNavEligible(events);
  const onThisDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(today.gregorianDate);
  const navigation = resolvePrimaryNavigation({
    originalsLive,
    newsLive,
    eventsLive,
    historyFacets: selectHistoryMenuFacets(history),
    originalEssays: originals.map((essay) => ({
      title: essay.title,
      slug: essay.slug,
    })),
    onThisDayHref: onThisDay
      ? `/history?month=${Number(onThisDay[2])}&day=${Number(onThisDay[3])}`
      : undefined,
  });
  const explore = resolveFooterExplore({ originalsLive, eventsLive });
  const dailyRibbon = [
    {
      eyebrow: "Today",
      label: today.gregorianLabel,
      href: "/today",
    },
    today.hebrewDate
      ? {
          eyebrow: "Hebrew day",
          label: today.hebrewDate,
          href: "/today#jewish-calendar",
        }
      : null,
    (today.holidays[0] ?? today.observances[0] ?? today.roshChodesh)
      ? {
          eyebrow: "Jewish calendar",
          label: (today.holidays[0] ??
            today.observances[0] ??
            today.roshChodesh)!.title,
          href: "/today#jewish-calendar",
        }
      : today.parashah
        ? {
            eyebrow: "This week in Torah",
            label: today.parashah.title,
            href: "/today#weekly-torah",
          }
        : null,
    today.onThisDay[0]
      ? {
          eyebrow: "On this day",
          label: today.onThisDay[0].title,
          href: `/history/${today.onThisDay[0].slug}`,
        }
      : null,
    newsLive && news[0]
      ? {
          eyebrow: "News",
          label: news[0].headline,
          href: news[0].sourceUrl,
          external: true,
          analyticsEvent: "daily_ribbon_news_outbound",
        }
      : null,
    eventsLive && events[0]
      ? {
          eyebrow: "Events",
          label: events[0].title,
          href: events[0].eventUrl,
          external: true,
          analyticsEvent: "daily_ribbon_event_outbound",
        }
      : null,
    {
      eyebrow: "Living archive",
      label: "Follow every thread",
      href: "/explore",
    },
  ].filter((item) => item !== null);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="page-shell">
        <SiteHeader
          navigation={navigation}
          ribbon={dailyRibbon}
          today={{
            gregorianLabel: today.gregorianLabel,
            hebrewDate: today.hebrewDate,
          }}
        />
        <main id="main-content">{children}</main>
        <SiteFooter explore={explore} />
      </div>
    </>
  );
}
