import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

const utilityLinks = [
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-gold bg-night border-t-4 text-white">
      <Container className="grid gap-12 py-14 md:grid-cols-[1.2fr_0.8fr] md:py-20">
        <div>
          <BrandLogo placement="footer" />
          <p className="mt-6 max-w-md font-serif text-base leading-7 text-white/72">
            A modern home for Jewish history, culture, education, connection,
            and identity.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:justify-self-end">
          <div>
            <p className="text-gold mb-4 text-[0.68rem] font-bold tracking-[0.16em] uppercase">
              Explore
            </p>
            <ul className="m-0 grid list-none gap-2 p-0 text-sm text-white/78">
              {siteConfig.navigation.slice(1, 5).map((item) => (
                <li key={item.href}>
                  <Link className="hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-gold mb-4 text-[0.68rem] font-bold tracking-[0.16em] uppercase">
              Organization
            </p>
            <ul className="m-0 grid list-none gap-2 p-0 text-sm text-white/78">
              {siteConfig.navigation.slice(5).map((item) => (
                <li key={item.href}>
                  <Link className="hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="hover:text-white" href="/podcasts">
                  The Two Tall Jews Show
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="text-gold mb-4 text-[0.68rem] font-bold tracking-[0.16em] uppercase">
              Legal
            </p>
            <ul className="m-0 grid list-none gap-2 p-0 text-sm text-white/78">
              {utilityLinks.map((item) => (
                <li key={item.href}>
                  <Link className="hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/12">
        <Container className="flex flex-col gap-2 py-5 text-xs text-white/58 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Jewish Original Media. All rights
            reserved.
          </p>
          <p>Jewish history. Jewish connection. Jewish continuity.</p>
        </Container>
      </div>
    </footer>
  );
}
