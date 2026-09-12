import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="page-shell">
        <SiteHeader />
        <main id="main-content">
          <Section>
            <Container size="content">
              <p className="eyebrow">404</p>
              <h1 className="display-title">This page is not available yet.</h1>
              <p className="editorial-lede">
                Jewish Original Media is building its archive carefully. Return
                home for the current experience.
              </p>
              <Link className="button button--primary mt-8" href="/">
                Return home
              </Link>
            </Container>
          </Section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
