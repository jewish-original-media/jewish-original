import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedNewsIndex } from "@/content/news/fetch";
import { getPublishedOriginalsIndex } from "@/content/originals/fetch";
import { newsNavEligible } from "@/features/ingest/select";
import { getJewishToday } from "@/features/jewish-today";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/site";
import { resolveFooterExplore, resolvePrimaryNavigation } from "@/lib/site";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [today, originals, news] = await Promise.all([
    getJewishToday(),
    getPublishedOriginalsIndex().catch(() => []),
    getPublishedNewsIndex().catch(() => []),
  ]);
  const originalsLive = originals.length > 0;
  const newsLive = newsNavEligible(news);
  const navigation = resolvePrimaryNavigation({ originalsLive, newsLive });
  const explore = resolveFooterExplore({ originalsLive });

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
