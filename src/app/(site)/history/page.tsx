import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";

import { HistoryEntryCard } from "@/components/history/history-entry-card";
import { HistoryPreviewBanner } from "@/components/history/history-preview-banner";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  getHistoryFilterLabel,
  getHistoryIndex,
} from "@/content/history/fetch";
import type { HistoryFilter } from "@/content/history/types";

export const metadata: Metadata = {
  title: "Jewish History",
  description:
    "Explore Jewish history through carefully preserved stories, people, places, and primary research trails.",
  alternates: { canonical: "/history" },
  openGraph: {
    type: "website",
    title: "Jewish History",
    description:
      "Carefully preserved Jewish history, connected across time, place, and people.",
    url: "/history",
  },
};

function activeFilter(
  searchParams: Record<string, string | string[] | undefined>,
): HistoryFilter | undefined {
  for (const type of ["topic", "region", "person"] as const) {
    const value = searchParams[type];
    if (typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
      return { type, slug: value };
    }
  }
  return undefined;
}

export default async function HistoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ isEnabled: preview }, resolvedSearchParams] = await Promise.all([
    draftMode(),
    searchParams,
  ]);
  const filter = activeFilter(resolvedSearchParams);
  const [entries, filterEntity] = await Promise.all([
    getHistoryIndex(preview, filter),
    filter ? getHistoryFilterLabel(preview, filter) : Promise.resolve(null),
  ]);
  const filterName = filterEntity?.name || filter?.slug;

  return (
    <>
      {preview ? <HistoryPreviewBanner /> : null}
      <Section className="history-index-intro relative overflow-hidden">
        <div
          className="bg-gold/60 absolute top-0 left-[clamp(1.25rem,10vw,9rem)] h-28 w-px"
          aria-hidden="true"
        />
        <Container className="relative grid gap-10 pt-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.55fr)] lg:items-end">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="text-muted m-0 flex list-none gap-2 p-0 text-xs font-semibold tracking-[0.12em] uppercase">
                <li>
                  <Link href="/">Jewish Original</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">History</li>
              </ol>
            </nav>
            <p className="eyebrow mt-10">History is the foundation</p>
            <h1 className="display-title">Jewish history, held with care.</h1>
            <p className="editorial-lede">
              Stories are preserved in their original voice, strengthened
              through research, and connected across people, place, and time.
            </p>
          </div>
          <p className="border-gold text-charcoal m-0 border-l-2 pl-6 font-serif text-lg leading-8">
            This collection begins deliberately: a small reviewed foundation
            before the wider archive is opened.
          </p>
        </Container>
      </Section>

      <Section spacing="compact">
        <Container>
          <div className="border-ink mb-10 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 className="m-0 font-serif text-3xl font-normal">
                {filter ? `Filtered by ${filterName}` : "History entries"}
              </h2>
            </div>
            {filter ? (
              <Link className="text-navy text-sm font-semibold" href="/history">
                Clear filter
              </Link>
            ) : null}
          </div>

          {entries.length ? (
            <div className="grid gap-10">
              {entries.map((entry) => (
                <HistoryEntryCard entry={entry} key={entry._id} />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl py-10">
              <p className="text-charcoal m-0 font-serif text-2xl leading-10">
                {filter
                  ? "No reviewed entries currently match this filter."
                  : "The first public collection is in editorial review. No draft or unresolved history is exposed here."}
              </p>
              {filter ? (
                <Link className="button button--secondary mt-7" href="/history">
                  View all history
                </Link>
              ) : null}
            </div>
          )}
        </Container>
      </Section>

      <Section className="bg-sand/38 border-gold/25 border-y" spacing="compact">
        <Container>
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
            <p className="eyebrow">Discovery foundation</p>
            <div className="grid gap-7 sm:grid-cols-3">
              {[
                [
                  "By date",
                  "A durable path toward today-in-history and calendar browsing.",
                ],
                [
                  "By connection",
                  "People, places, and organizations as reusable relationships.",
                ],
                [
                  "By context",
                  "Topics and eras that deepen discovery without flattening history.",
                ],
              ].map(([title, description]) => (
                <div key={title}>
                  <h3 className="m-0 text-base font-semibold">{title}</h3>
                  <p className="text-muted mt-2 mb-0 text-sm leading-6">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
