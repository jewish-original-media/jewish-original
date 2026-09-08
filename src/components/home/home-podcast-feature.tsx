import Image from "next/image";
import Link from "next/link";

import { EpisodeCard } from "@/components/podcasts/episode-card";
import type { PodcastShow } from "@/content/podcasts/types";
import type { HomePodcastPresentation } from "@/features/homepage/podcasts";
import { formatPublishedDate } from "@/lib/podcasts/format";
import { podcastEpisodePath } from "@/lib/podcasts/urls";

import styles from "@/app/home.module.css";

type HomePodcastFeatureProps = {
  show: PodcastShow | null;
  status: "live" | "preparing" | "unavailable";
  podcasts: HomePodcastPresentation;
};

export function HomePodcastFeature({
  show,
  status,
  podcasts,
}: HomePodcastFeatureProps) {
  const markSrc = show?.markSrc || "/brand/ttjs-mark.png";

  return (
    <section
      className={`${styles.band} ${styles.podcasts}`}
      aria-label="Podcasts"
    >
      <div className={styles.bandInner}>
        <p className={styles.sectionLabel}>Podcasts</p>
        <div className={styles.podcastLayout}>
          <div className={styles.showBlock}>
            {status === "live" && show ? (
              <Image
                alt={show.title}
                className={styles.showMark}
                height={96}
                src={markSrc}
                width={108}
              />
            ) : null}
            <h2 className={styles.showTitle}>
              {status === "live" && show
                ? show.title
                : "Podcasts are being prepared."}
            </h2>
            {status === "unavailable" ? (
              <p className={styles.unavailableNote} role="status">
                Podcasts are briefly unavailable.
              </p>
            ) : null}
            {status === "preparing" ? (
              <p className={styles.unavailableNote}>
                The Two Tall Jews Show archive is in editorial review. Published
                episode pages will appear here after founder approval.
              </p>
            ) : null}
            {status === "live" && show?.tagline ? (
              <p className={styles.showTagline}>{show.tagline}</p>
            ) : null}
            {status === "live" && show ? (
              <p className={styles.platformList}>
                {show.appleUrl ? (
                  <a
                    className="editorial-link"
                    href={show.appleUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Apple Podcasts
                  </a>
                ) : null}
                {show.spotifyUrl ? (
                  <a
                    className="editorial-link"
                    href={show.spotifyUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Spotify
                  </a>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className={styles.podcastMedia}>
            {status === "live" && podcasts.lead ? (
              <>
                <p className={styles.latestLabel}>Latest episode</p>
                <div className={styles.podcastLead}>
                  <EpisodeCard episode={podcasts.lead} />
                </div>
              </>
            ) : null}
            {status === "live" && !podcasts.lead ? (
              <p className={styles.unavailableNote}>
                Published episodes will appear here after editorial review.
              </p>
            ) : null}
            {podcasts.more.length > 0 ? (
              <ol className={styles.episodeRail}>
                {podcasts.more.map((episode) => (
                  <li key={episode._id}>
                    <Link
                      href={podcastEpisodePath(episode.showSlug, episode.slug)}
                    >
                      <span className={styles.episodeRailDate}>
                        {formatPublishedDate(episode.publishedAt)}
                      </span>
                      {episode.title}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : null}
            <p className={styles.historyPath}>
              <Link
                className={`editorial-link ${styles.podcastPath}`}
                href="/podcasts"
              >
                View all episodes
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
