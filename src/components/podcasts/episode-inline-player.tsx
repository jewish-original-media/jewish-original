"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { PodcastEpisodeSummary } from "@/content/podcasts/types";
import { isPlayableAudioUrl } from "@/lib/podcasts/playable-media";
import { youtubeWatchUrl } from "@/lib/podcasts/youtube";

import { YouTubeFacade } from "./youtube-facade";

const PLAY_EVENT = "jom:podcast-play";

export function EpisodeInlinePlayer({
  episode,
}: {
  episode: PodcastEpisodeSummary;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerId = useId();
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const audioUrl = isPlayableAudioUrl(episode.audioUrl)
    ? episode.audioUrl
    : undefined;
  const youtubeHref = episode.youtubeId
    ? episode.youtubeUrl || youtubeWatchUrl(episode.youtubeId)
    : undefined;

  useEffect(() => {
    const onPlay = (event: Event) => {
      const playingId = (event as CustomEvent<string>).detail;
      if (playingId === episode._id) return;
      audioRef.current?.pause();
      setYoutubeOpen(false);
    };
    window.addEventListener(PLAY_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_EVENT, onPlay);
  }, [episode._id]);

  function announcePlay() {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: episode._id }));
  }

  if (audioUrl) {
    return (
      <div className="podcast-inline-player">
        <p className="podcast-kicker" id={`${playerId}-label`}>
          Listen
        </p>
        <audio
          aria-labelledby={`${playerId}-label`}
          controls
          onPlay={announcePlay}
          preload="none"
          ref={audioRef}
          src={audioUrl}
        >
          <a href={audioUrl}>Open audio for {episode.title}</a>
        </audio>
      </div>
    );
  }

  if (episode.youtubeId) {
    return (
      <div className="podcast-inline-player">
        {youtubeOpen ? (
          <YouTubeFacade title={episode.title} videoId={episode.youtubeId} />
        ) : (
          <button
            className="button button--secondary"
            onClick={() => {
              announcePlay();
              setYoutubeOpen(true);
            }}
            type="button"
          >
            Load video
          </button>
        )}
        {youtubeHref ? (
          <p className="podcast-inline-player__fallback">
            <a href={youtubeHref} rel="noreferrer" target="_blank">
              Watch on YouTube
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  const fallback = episode.appleUrl || episode.spotifyUrl;
  if (!fallback) {
    return (
      <p className="podcast-inline-player__fallback">
        Audio is not attached to this published episode.
      </p>
    );
  }

  return (
    <p className="podcast-inline-player__fallback">
      Listen on{" "}
      {episode.appleUrl ? (
        <a href={episode.appleUrl} rel="noreferrer" target="_blank">
          Apple Podcasts
        </a>
      ) : null}
      {episode.appleUrl && episode.spotifyUrl ? " or " : null}
      {episode.spotifyUrl ? (
        <a href={episode.spotifyUrl} rel="noreferrer" target="_blank">
          Spotify
        </a>
      ) : null}
      .
    </p>
  );
}
