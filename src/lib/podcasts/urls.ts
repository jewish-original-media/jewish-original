export const TTJS_SHOW_SLUG = "the-two-tall-jews-show";

export function podcastsHomePath() {
  return "/podcasts";
}

export function podcastShowPath(showSlug: string) {
  return `/podcasts/${showSlug}`;
}

export function podcastEpisodePath(showSlug: string, episodeSlug: string) {
  return `/podcasts/${showSlug}/${episodeSlug}`;
}
