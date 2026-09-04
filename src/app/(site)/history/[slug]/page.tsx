import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HistoryBody } from "@/components/history/history-body";
import { HistoryCitations } from "@/components/history/history-citations";
import { HistoryEntryCard } from "@/components/history/history-entry-card";
import {
  HistoryFeaturedMedia,
  HistoryMediaAbsent,
} from "@/components/history/history-featured-media";
import { HistoryHeroWatermark } from "@/components/history/history-hero-watermark";
import { HistoryPreviewBanner } from "@/components/history/history-preview-banner";
import { HistoryReferenceList } from "@/components/history/history-reference-list";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  getHistoryEntry,
  getPublishedHistorySlugs,
} from "@/content/history/fetch";
import { formatContentWarningList } from "@/lib/history/content-warnings";
import { formatHistoricalDate } from "@/lib/history/format-date";
import {
  buildHistoryJsonLd,
  buildHistoryMetadata,
  historyEntryUrl,
  serializeJsonLd,
} from "@/lib/seo/history";

type HistoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return await getPublishedHistorySlugs();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: HistoryPageProps): Promise<Metadata> {
  const [{ slug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const entry = await getHistoryEntry(slug, preview);
  if (!entry) {
    return {
      title: "History entry",
      robots: { index: false, follow: false },
    };
  }
  return buildHistoryMetadata(entry, preview);
}

export default async function HistoryEntryPage({ params }: HistoryPageProps) {
  const [{ slug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const entry = await getHistoryEntry(slug, preview);
  if (!entry) notFound();

  const displayDate = formatHistoricalDate(
    entry.historicalDate,
    entry.entryKind,
    entry.observanceRule,
  );
  const shareUrl = historyEntryUrl(entry.slug);
  const shareText = `${entry.title} — Jewish Original`;
  const relatedEntries = entry.relatedHistory.filter(
    (relationship) => relationship.entry,
  );
  const placeLabel = entry.places[0]?.name;

  return (
    <>
      {preview ? (
        <HistoryPreviewBanner workflowStatus={entry.workflowStatus} />
      ) : null}
      {!preview ? (
        <script
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildHistoryJsonLd(entry)),
          }}
          type="application/ld+json"
        />
      ) : null}

      <article>
        <header className="history-entry-header">
          <HistoryHeroWatermark />
          <Container className="history-entry-hero">
            <div className="history-hero-copy">
              <nav aria-label="Breadcrumb">
                <ol className="history-breadcrumb">
                  <li>
                    <Link href="/">Jewish Original</Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href="/history">History</Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li aria-current="page" className="max-w-52 truncate">
                    {entry.title}
                  </li>
                </ol>
              </nav>

              <p className="history-date-line">
                {displayDate}
                {placeLabel ? ` · ${placeLabel}` : null}
              </p>
              <h1 className="history-display">{entry.title}</h1>
              {entry.excerpt ? (
                <p className="history-lede">{entry.excerpt}</p>
              ) : null}
            </div>

            <div className="history-archive-rail">
              <p className="eyebrow">From the archive</p>
              <p className="history-archive-rail__text">
                Preserved in the Jewish Original archive and connected through
                people, place, and time.
              </p>
            </div>
          </Container>
        </header>

        {entry.primaryImage ? (
          <HistoryFeaturedMedia image={entry.primaryImage} />
        ) : (
          <HistoryMediaAbsent />
        )}

        <Section className="history-reading-section" spacing="compact">
          <Container className="history-reading-grid">
            <div>
              {entry.contentWarnings.length ? (
                <aside
                  className="history-content-note"
                  aria-label="Content note"
                >
                  <strong>Content note:</strong>{" "}
                  {entry.contentWarningNote ||
                    formatContentWarningList(entry.contentWarnings)}
                  .
                </aside>
              ) : null}

              <HistoryBody value={entry.body} />
              <HistoryCitations citations={entry.citations} preview={preview} />
              {preview && !entry.citations.length ? (
                <section
                  className="history-sources"
                  aria-labelledby="sources-pending-heading"
                >
                  <p className="eyebrow">Research trail</p>
                  <h2
                    className="history-section-title"
                    id="sources-pending-heading"
                  >
                    Sources pending review
                  </h2>
                  <p className="text-charcoal mt-4 mb-0 max-w-xl text-sm leading-6">
                    No citations are attached to this draft. Institutional
                    sources must be reviewed before publication. This note is
                    visible in preview only.
                  </p>
                </section>
              ) : null}

              <section
                className="history-closing"
                aria-labelledby="share-heading"
              >
                <h2 className="history-kicker" id="share-heading">
                  Share this history
                </h2>
                <div className="history-share-links">
                  <a
                    href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                  >
                    Email
                  </a>
                  <span aria-hidden="true" className="history-share-sep">
                    ·
                  </span>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    rel="noreferrer"
                  >
                    Facebook
                  </a>
                  <span aria-hidden="true" className="history-share-sep">
                    ·
                  </span>
                  <a
                    href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    rel="noreferrer"
                  >
                    X
                  </a>
                </div>
              </section>

              <section
                className="history-support"
                aria-labelledby="support-heading"
              >
                <h2 className="history-kicker" id="support-heading">
                  Support the work
                </h2>
                <p className="history-support__text">
                  If this history matters to you, you can{" "}
                  <Link href="/support">support Jewish Original</Link> as the
                  archive is prepared with care.
                </p>
              </section>
            </div>

            <aside className="history-metadata">
              <HistoryReferenceList
                filterType="topic"
                heading="Topics"
                items={entry.topics}
              />
              <HistoryReferenceList
                filterType="person"
                heading="People"
                items={entry.people}
              />
              <HistoryReferenceList
                filterType="place"
                heading="Places"
                items={entry.places}
              />
              <HistoryReferenceList
                filterType="region"
                heading="Geography"
                items={entry.geographicRegions}
              />
              <HistoryReferenceList
                filterType="era"
                heading="Eras"
                items={entry.eras}
              />
              <HistoryReferenceList
                filterType="organization"
                heading="Organizations"
                items={entry.organizations}
              />
            </aside>
          </Container>
        </Section>

        {relatedEntries.length ? (
          <Section className="history-related-section" spacing="compact">
            <Container>
              <p className="eyebrow">Continue through history</p>
              <h2 className="history-section-title">
                Related Jewish Original stories
              </h2>
              <div className="history-related-list">
                {relatedEntries.map((relationship) =>
                  relationship.entry ? (
                    <HistoryEntryCard
                      entry={relationship.entry}
                      key={`${relationship.relationType}-${relationship.entry._id}`}
                      variant="related"
                    />
                  ) : null,
                )}
              </div>
            </Container>
          </Section>
        ) : preview && entry.relatedHistory.length ? (
          <Section spacing="compact">
            <Container>
              <p className="text-muted m-0 max-w-2xl text-sm leading-6">
                Related draft stories are attached in the CMS but are not shown
                until those entries can be resolved in preview. Nothing extra is
                published.
              </p>
            </Container>
          </Section>
        ) : null}
      </article>
    </>
  );
}
