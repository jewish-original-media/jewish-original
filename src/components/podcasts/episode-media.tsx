import Image from "next/image";

import type { PodcastArtwork } from "@/content/podcasts/types";

import { YouTubeFacade } from "./youtube-facade";

type EpisodeMediaProps = {
  title: string;
  youtubeId?: string;
  artwork?: PodcastArtwork;
  audioUrl?: string;
};

export function EpisodeMedia({
  title,
  youtubeId,
  artwork,
  audioUrl,
}: EpisodeMediaProps) {
  if (youtubeId) {
    return (
      <div className="podcast-media">
        <YouTubeFacade title={title} videoId={youtubeId} />
        {audioUrl ? <AudioPlayer src={audioUrl} title={title} /> : null}
      </div>
    );
  }

  if (artwork) {
    return (
      <div className="podcast-media">
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
        {audioUrl ? <AudioPlayer src={audioUrl} title={title} /> : null}
      </div>
    );
  }

  if (audioUrl) {
    return (
      <div className="podcast-media podcast-media--audio-only">
        <AudioPlayer src={audioUrl} title={title} />
      </div>
    );
  }

  return null;
}

function AudioPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="podcast-audio">
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
