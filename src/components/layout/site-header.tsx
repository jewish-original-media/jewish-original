import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/lib/site";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.25 4.25" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="bg-night relative z-50 text-white">
      <Container className="flex min-h-(--header-height) items-center justify-between gap-6">
        <BrandLogo priority />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              className={`hover:text-gold text-[0.7rem] font-semibold tracking-[0.14em] uppercase transition-colors duration-200 ${
                item.label === "Support" ? "text-gold" : "text-white"
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="hover:text-gold inline-flex size-11 items-center justify-center border-l border-white/20 pl-6 text-white transition-colors"
            href="/search"
            aria-label="Search Jewish Original Media"
          >
            <SearchIcon />
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            className="inline-flex size-11 items-center justify-center text-white"
            href="/search"
            aria-label="Search Jewish Original Media"
          >
            <SearchIcon />
          </Link>

          <details className="group relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-2 text-[0.7rem] font-semibold tracking-[0.14em] uppercase marker:content-none">
              <span>Menu</span>
              <span
                aria-hidden="true"
                className="relative block h-3.5 w-5 border-y border-current transition-transform group-open:rotate-90"
              >
                <span className="absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-current" />
              </span>
            </summary>

            <nav
              className="bg-night absolute top-[calc(100%+1rem)] right-0 w-[min(20rem,calc(100vw-2.5rem))] border border-white/15 p-5 shadow-2xl"
              aria-label="Mobile"
            >
              <ul className="m-0 grid list-none divide-y divide-white/10 p-0">
                {siteConfig.navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      className={`flex min-h-12 items-center justify-between text-sm font-semibold tracking-[0.12em] uppercase ${
                        item.label === "Support" ? "text-gold" : "text-white"
                      }`}
                      href={item.href}
                    >
                      {item.label}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
