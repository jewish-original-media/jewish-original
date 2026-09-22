import { TrackedAnchor } from "@/components/analytics/tracked-anchor";

type EpisodePlatformLinksProps = {
  appleUrl?: string;
  audioUrl?: string;
  primary: "youtube" | "audio" | "none";
  spotifyUrl?: string;
  youtubeUrl?: string;
};

export function EpisodePlatformLinks({
  appleUrl,
  audioUrl,
  primary,
  spotifyUrl,
  youtubeUrl,
}: EpisodePlatformLinksProps) {
  const listen = [
    primary === "youtube" && audioUrl
      ? { href: audioUrl, label: "Jewish Original" }
      : null,
    spotifyUrl ? { href: spotifyUrl, label: "Spotify" } : null,
    appleUrl ? { href: appleUrl, label: "Apple Podcasts" } : null,
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  if (!youtubeUrl && listen.length === 0) return null;

  return (
    <nav aria-label="Watch and listen" className="podcast-platform-links">
      {youtubeUrl ? (
        <div>
          <p className="podcast-kicker">Watch</p>
          <TrackedAnchor
            event="podcast_listen"
            href={youtubeUrl}
            rel="noreferrer"
            target="_blank"
          >
            YouTube
          </TrackedAnchor>
        </div>
      ) : null}
      {listen.length ? (
        <div>
          <p className="podcast-kicker">Listen</p>
          <p className="podcast-platform-links__row">
            {listen.map((item, index) => (
              <span key={item.href}>
                {index > 0 ? (
                  <span aria-hidden="true" className="podcast-share-sep">
                    ·
                  </span>
                ) : null}
                <TrackedAnchor
                  event="podcast_listen"
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                </TrackedAnchor>
              </span>
            ))}
          </p>
        </div>
      ) : null}
    </nav>
  );
}
