"use client";

import { useState } from "react";

import {
  youtubeEmbedUrl,
  youtubePosterUrl,
  youtubeWatchUrl,
} from "@/lib/podcasts/youtube";

type YouTubeFacadeProps = {
  videoId: string;
  title: string;
};

export function YouTubeFacade({ videoId, title }: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);
  const watchUrl = youtubeWatchUrl(videoId);

  if (playing) {
    return (
      <div className="podcast-media-frame">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="podcast-media-frame__embed"
          src={`${youtubeEmbedUrl(videoId)}&autoplay=1`}
          title={`YouTube video: ${title}`}
        />
      </div>
    );
  }

  return (
    <div className="podcast-media-frame">
      <button
        className="podcast-youtube-facade"
        onClick={() => setPlaying(true)}
        type="button"
      >
        {/* External poster is decorative; the button name is the accessible name. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="podcast-youtube-facade__poster"
          decoding="async"
          height={360}
          src={youtubePosterUrl(videoId)}
          width={480}
        />
        <span className="podcast-youtube-facade__play" aria-hidden="true">
          Play
        </span>
        <span className="sr-only">Play video: {title}</span>
      </button>
      <p className="podcast-media-caption">
        <a href={watchUrl} rel="noreferrer" target="_blank">
          Open on YouTube
        </a>
      </p>
    </div>
  );
}
