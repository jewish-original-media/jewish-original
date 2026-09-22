import Image from "next/image";

import type { PodcastArtwork } from "@/content/podcasts/types";
import { resolvePrimaryMedia } from "@/lib/podcasts/primary-media";
import { youtubeWatchUrl } from "@/lib/podcasts/youtube";

import { EpisodePlatformLinks } from "./episode-platform-links";
import { YouTubeFacade } from "./youtube-facade";

type EpisodeMediaProps = {
  title: string;
  youtubeId?: string;
  youtubeUrl?: string;
  artwork?: PodcastArtwork;
  audioUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  primaryMedia?: "auto" | "youtube" | "audio";
};

export function EpisodeMedia({
  title,
  youtubeId,
  youtubeUrl,
  artwork,
  audioUrl,
  spotifyUrl,
  appleUrl,
  primaryMedia,
}: EpisodeMediaProps) {
  const primary = resolvePrimaryMedia({
    primaryMedia,
    youtubeId,
    audioUrl,
  });
  const officialYouTubeUrl = youtubeId
    ? youtubeUrl || youtubeWatchUrl(youtubeId)
    : undefined;

  return (
    <div className="podcast-media">
      {primary === "youtube" && youtubeId ? (
        <YouTubeFacade title={title} videoId={youtubeId} />
      ) : null}

      {primary === "audio" && artwork ? (
        <figure className="podcast-media-figure">
          <div className="podcast-media-frame">
            <Image
              alt={artwork.alt}
              className="podcast-media-frame__image"
              fill
              sizes="(max-width: 1440px) min(100vw, 70rem), 70rem"
              src={artwork.url}
            />
          </div>
        </figure>
      ) : null}

      {primary === "audio" && audioUrl ? (
        <AudioPlayer src={audioUrl} title={title} />
      ) : null}

      <EpisodePlatformLinks
        appleUrl={appleUrl}
        audioUrl={audioUrl}
        primary={primary}
        spotifyUrl={spotifyUrl}
        youtubeUrl={officialYouTubeUrl}
      />
    </div>
  );
}

function AudioPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="podcast-audio" id="podcast-audio">
      <p className="podcast-kicker">Listen</p>
      <audio controls preload="none" src={src}>
        <a href={src}>Download audio for {title}</a>
      </audio>
    </div>
  );
}

export function PodcastMediaAbsent() {
  return (
    <div className="podcast-section-break" aria-hidden="true">
      <span className="podcast-gold-rule" />
    </div>
  );
}
