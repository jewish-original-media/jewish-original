import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EpisodeCard } from "@/components/podcasts/episode-card";
import { PodcastPreviewBanner } from "@/components/podcasts/podcast-preview-banner";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import {
  getPodcastEpisodes,
  getPodcastShow,
  getPublishedPodcastShowSlugs,
} from "@/content/podcasts/fetch";
import {
  buildPodcastShowJsonLd,
  buildPodcastShowMetadata,
  serializeJsonLd,
} from "@/lib/seo/podcasts";

type ShowPageProps = {
  params: Promise<{ showSlug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    return await getPublishedPodcastShowSlugs();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ShowPageProps): Promise<Metadata> {
  const [{ showSlug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const show = await getPodcastShow(showSlug, preview);
  if (!show) {
    return { title: "Podcast", robots: { index: false, follow: false } };
  }
  const metadata = buildPodcastShowMetadata(show);
  return preview
    ? { ...metadata, robots: { index: false, follow: false } }
    : metadata;
}

export default async function PodcastShowPage({ params }: ShowPageProps) {
  const [{ showSlug }, { isEnabled: preview }] = await Promise.all([
    params,
    draftMode(),
  ]);
  const show = await getPodcastShow(showSlug, preview);
  if (!show) notFound();
  const episodes = await getPodcastEpisodes(show.slug, preview);

  return (
    <>
      {preview ? <PodcastPreviewBanner /> : null}
      {!preview ? (
        <script
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildPodcastShowJsonLd(show, episodes)),
          }}
          type="application/ld+json"
        />
      ) : null}
      <section className="podcast-hero podcast-hero--show">
        <Container className="podcast-hero__grid">
          <div>
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
                <li aria-current="page">{show.title}</li>
              </ol>
            </nav>
            <p className="podcast-kicker">Podcast series</p>
            <h1 className="podcast-display">{show.title}</h1>
            {show.tagline ? (
              <p className="podcast-tagline">{show.tagline}</p>
            ) : null}
            <p className="podcast-lede">{show.description}</p>
            <p className="podcast-host-line">
              Hosted by {show.hosts.map((host) => host.name).join(" and ")}
            </p>
            <div className="podcast-hero-actions">
              {show.appleUrl ? (
                <ButtonLink href={show.appleUrl}>Apple Podcasts</ButtonLink>
              ) : null}
              {show.spotifyUrl ? (
                <ButtonLink href={show.spotifyUrl} variant="secondary">
                  Spotify
                </ButtonLink>
              ) : null}
            </div>
          </div>
          {show.markSrc ? (
            <div className="podcast-mark-well">
              <Image
                alt={show.title}
                className="podcast-mark"
                height={320}
                priority
                src={show.markSrc}
                width={360}
              />
            </div>
          ) : null}
        </Container>
      </section>

      <Section className="podcast-archive-section" spacing="compact">
        <Container>
          <p className="eyebrow">Episode archive</p>
          <h2 className="podcast-section-title">Listen in</h2>
          <p className="podcast-section-copy">
            {preview
              ? `${episodes.length} imported draft episode${episodes.length === 1 ? "" : "s"} are visible in preview only.`
              : `${episodes.length} published episode${episodes.length === 1 ? "" : "s"} from The Two Tall Jews Show.`}{" "}
            Empty summaries, transcripts, and History links stay hidden until
            editors add them.
          </p>
          <div className="podcast-episode-list">
            {episodes.map((episode) => (
              <EpisodeCard episode={episode} key={episode._id} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
