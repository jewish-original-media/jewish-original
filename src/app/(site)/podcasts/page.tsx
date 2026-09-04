import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { EpisodeCard } from "@/components/podcasts/episode-card";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { getPodcastEpisodes, getPodcastShow } from "@/content/podcasts/fetch";
import { TTJS_SHOW_SLUG } from "@/lib/podcasts/urls";
import {
  buildPodcastHomeJsonLd,
  buildPodcastHomeMetadata,
  serializeJsonLd,
} from "@/lib/seo/podcasts";

export const metadata: Metadata = buildPodcastHomeMetadata();

export default async function PodcastsPage() {
  const { isEnabled: preview } = await draftMode();
  const show = await getPodcastShow(TTJS_SHOW_SLUG, preview);
  if (!show) {
    return (
      <Section>
        <Container size="content">
          <p className="eyebrow">Podcasts</p>
          <h1 className="display-title">Podcasts are being prepared.</h1>
        </Container>
      </Section>
    );
  }

  const episodes = await getPodcastEpisodes(show.slug, preview);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildPodcastHomeJsonLd(show)),
        }}
        type="application/ld+json"
      />
      <section className="podcast-hero">
        <Container className="podcast-hero__grid">
          <div>
            <nav aria-label="Breadcrumb">
              <ol className="podcast-breadcrumb">
                <li>
                  <Link href="/">Jewish Original</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">Podcasts</li>
              </ol>
            </nav>
            <p className="podcast-kicker">The Jewish Original podcast</p>
            <h1 className="podcast-display">{show.title}</h1>
            {show.tagline ? (
              <p className="podcast-tagline">{show.tagline}</p>
            ) : null}
            <p className="podcast-lede">{show.description}</p>
            <p className="podcast-host-line">
              Hosted by {show.hosts.map((host) => host.name).join(" and ")}
            </p>
            <div className="podcast-hero-actions">
              <ButtonLink href={`/podcasts/${show.slug}`}>
                Browse episodes
              </ButtonLink>
              {show.appleUrl ? (
                <ButtonLink href={show.appleUrl} variant="secondary">
                  Apple Podcasts
                </ButtonLink>
              ) : null}
            </div>
          </div>
          {show.markSrc ? (
            <div className="podcast-mark-well">
              <Image
                alt="The Two Tall Jews Show"
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
          <p className="eyebrow">From the archive</p>
          <h2 className="podcast-section-title">
            Four episodes that open the catalog
          </h2>
          <p className="podcast-section-copy">
            This foundation uses the official public RSS archive. The complete
            catalog waits for founder-approved import. No transcripts or
            editorial summaries have been invented.
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
