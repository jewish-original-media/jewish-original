import Link from "next/link";

import type { PodcastEpisodeSummary } from "@/content/podcasts/types";
import {
  formatDuration,
  formatEpisodeNumber,
  formatPublishedDate,
} from "@/lib/podcasts/format";
import { podcastEpisodePath } from "@/lib/podcasts/urls";

export function EpisodeCard({ episode }: { episode: PodcastEpisodeSummary }) {
  const date = formatPublishedDate(episode.publishedAt);
  const duration = formatDuration(episode.durationSeconds);
  const number = formatEpisodeNumber(episode);
  const href = podcastEpisodePath(episode.showSlug, episode.slug);

  return (
    <article className="podcast-episode-card">
      <p className="podcast-episode-card__meta">
        {[date, duration].filter(Boolean).join(" · ")}
      </p>
      <h3 className="podcast-episode-card__title">
        <Link href={href}>{episode.title}</Link>
      </h3>
      {number ? <p className="podcast-episode-card__number">{number}</p> : null}
      {episode.guestNames.length ? (
        <p className="podcast-episode-card__guests">
          With {episode.guestNames.join(", ")}
        </p>
      ) : null}
      {episode.excerpt ? (
        <p className="podcast-episode-card__excerpt">{episode.excerpt}</p>
      ) : null}
    </article>
  );
}
