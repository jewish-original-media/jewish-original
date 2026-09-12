import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getJewishToday } from "@/features/jewish-today";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/site";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const today = await getJewishToday();

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="page-shell">
        <SiteHeader
          today={{
            gregorianLabel: today.gregorianLabel,
            hebrewDate: today.hebrewDate,
          }}
        />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
