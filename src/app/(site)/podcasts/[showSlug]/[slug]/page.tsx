import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodeCard } from "@/components/podcasts/episode-card";
import {
  EpisodeMedia,
  PodcastMediaAbsent,
} from "@/components/podcasts/episode-media";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  getPodcastEpisode,
  getPublishedPodcastSlugs,
} from "@/content/podcasts/fetch";
import {
  formatDuration,
  formatEpisodeNumber,
  formatPublishedDate,
} from "@/lib/podcasts/format";
import {
  buildPodcastEpisodeJsonLd,
  buildPodcastEpisodeMetadata,
  podcastEpisodeUrl,
  serializeJsonLd,
} from "@/lib/seo/podcasts";

type EpisodePageProps = {
  params: Promise<{ showSlug: string; slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return await getPublishedPodcastSlugs();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const [{ showSlug, slug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const episode = await getPodcastEpisode(showSlug, slug, preview);
  if (!episode) {
    return { title: "Episode", robots: { index: false, follow: false } };
  }
  return buildPodcastEpisodeMetadata(episode);
}

export default async function PodcastEpisodePage({ params }: EpisodePageProps) {
  const [{ showSlug, slug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const episode = await getPodcastEpisode(showSlug, slug, preview);
  if (!episode) notFound();

  const date = formatPublishedDate(episode.publishedAt);
  const duration = formatDuration(episode.durationSeconds);
  const number = formatEpisodeNumber(episode);
  const shareUrl = podcastEpisodeUrl(episode.showSlug, episode.slug);
  const shareText = `${episode.title} — ${episode.showTitle}`;
  const hasMedia = Boolean(
    episode.youtubeId || episode.artwork || episode.audioUrl,
  );

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildPodcastEpisodeJsonLd(episode)),
        }}
        type="application/ld+json"
      />
      <article>
        <header className="podcast-episode-header">
          <Container className="podcast-episode-hero">
            <nav aria-label="Breadcrumb">
              <ol className="podcast-breadcrumb">
                <li>
                  <Link href="/">Jewish Original</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/podcasts">Podcasts</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/podcasts/${episode.showSlug}`}>
                    {episode.showTitle}
                  </Link>
                </li>
              </ol>
            </nav>
            <p className="podcast-date-line">
              {[date, duration, number].filter(Boolean).join(" · ")}
            </p>
            <h1 className="podcast-episode-display">{episode.title}</h1>
            {episode.excerpt ? (
              <p className="podcast-lede">{episode.excerpt}</p>
            ) : null}
            {episode.guestNames.length ? (
              <p className="podcast-host-line">
                With {episode.guestNames.join(", ")}
              </p>
            ) : null}
          </Container>
        </header>

        {hasMedia ? (
          <div className="podcast-featured-band">
            <Container>
              <EpisodeMedia
                artwork={episode.artwork}
                audioUrl={episode.audioUrl}
                title={episode.title}
                youtubeId={episode.youtubeId}
              />
            </Container>
          </div>
        ) : (
          <PodcastMediaAbsent />
        )}

        <Section className="podcast-reading-section" spacing="compact">
          <Container size="content">
            {episode.description ? (
              <section>
                <h2 className="podcast-section-title">About this episode</h2>
                <div className="podcast-prose">
                  {episode.description.split(/\n\n+/).map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {episode.chapters.length ? (
              <section className="podcast-block">
                <h2 className="podcast-section-title">Chapters</h2>
                <ol className="podcast-chapter-list">
                  {episode.chapters.map((chapter) => (
                    <li key={`${chapter.start}-${chapter.title}`}>
                      <span>{chapter.start}</span>
                      <span>{chapter.title}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {episode.summary ? (
              <section className="podcast-block">
                <h2 className="podcast-section-title">Summary</h2>
                <p className="podcast-prose">{episode.summary}</p>
              </section>
            ) : null}

            {episode.reviewedTranscript ? (
              <section className="podcast-block">
                <h2 className="podcast-section-title">Transcript</h2>
                <div className="podcast-transcript">
                  {episode.reviewedTranscript}
                </div>
              </section>
            ) : null}

            {episode.topics.length ? (
              <section className="podcast-block">
                <h2 className="podcast-section-title">Topics</h2>
                <ul className="podcast-reference-list">
                  {episode.topics.map((topic) => (
                    <li key={topic.slug}>{topic.name}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {episode.relatedHistory.some((item) => item.entry) ? (
              <section className="podcast-block">
                <h2 className="podcast-section-title">Related History</h2>
                <ul className="podcast-related-list">
                  {episode.relatedHistory.map((item) =>
                    item.entry ? (
                      <li key={item.entry.slug}>
                        <Link href={`/history/${item.entry.slug}`}>
                          {item.entry.title}
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </section>
            ) : null}

            <section className="podcast-block">
              <h2 className="podcast-section-title">Share</h2>
              <div className="podcast-share-links">
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                >
                  Email
                </a>
                <span aria-hidden="true" className="podcast-share-sep">
                  ·
                </span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Facebook
                </a>
                <span aria-hidden="true" className="podcast-share-sep">
                  ·
                </span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  X
                </a>
              </div>
            </section>

            <section className="podcast-support">
              <h2 className="podcast-section-title">Support</h2>
              <p className="podcast-section-copy">
                Jewish Original is building durable episode pages around this
                archive. There is no payment form on this page.
              </p>
              <ButtonLink href="/support" variant="secondary">
                Support Jewish Original
              </ButtonLink>
            </section>
          </Container>
        </Section>

        {episode.relatedEpisodes.length ? (
          <Section className="podcast-related-section" spacing="compact">
            <Container>
              <p className="eyebrow">More from the show</p>
              <h2 className="podcast-section-title">Other episodes</h2>
              <div className="podcast-episode-list">
                {episode.relatedEpisodes.map((related) => (
                  <EpisodeCard episode={related} key={related._id} />
                ))}
              </div>
            </Container>
          </Section>
        ) : null}
      </article>
    </>
  );
}
