import type { PodcastPlatformLink } from "../../lib/podcasts/platforms";

export type PilotPlatformMapping = {
  guid: string;
  apple?: PodcastPlatformLink;
  spotify?: PodcastPlatformLink;
  youtube?: PodcastPlatformLink;
  unresolved: string[];
};

export const PILOT_PLATFORM_MAPPINGS: Record<string, PilotPlatformMapping> = {
  "775bea33-39bf-49b4-bff3-aba9c3ca45a3": {
    guid: "775bea33-39bf-49b4-bff3-aba9c3ca45a3",
    apple: {
      platform: "apple",
      url: "https://podcasts.apple.com/us/podcast/sitting-down-with-kalman-gavriel-the-jerusalem-scribe/id1521741221?i=1000641079552",
      identifier: "1000641079552",
      source: "apple-itunes-lookup",
      verified: true,
    },
    spotify: {
      platform: "spotify",
      url: "https://podcasters.spotify.com/pod/show/jewishoriginalmedia/episodes/Sitting-Down-With-Kalman-Gavriel--The-Jerusalem-Scribe-e2e7kch",
      identifier: "e2e7kch",
      source: "official-rss-link",
      verified: true,
    },
    unresolved: [
      "No verified official TTJS YouTube episode URL.",
      "No open.spotify.com/episode identifier was published by Spotify.",
    ],
  },
  "89aba54c-5d52-4520-b129-3a7aa4da1c55": {
    guid: "89aba54c-5d52-4520-b129-3a7aa4da1c55",
    apple: {
      platform: "apple",
      url: "https://podcasts.apple.com/us/podcast/season-3-finale-looking-ahead-to-2023/id1521741221?i=1000598554798",
      identifier: "1000598554798",
      source: "apple-itunes-lookup",
      verified: true,
    },
    spotify: {
      platform: "spotify",
      url: "https://podcasters.spotify.com/pod/show/jewishoriginalmedia/episodes/SEASON-3-FINALE---LOOKING-AHEAD-TO-2023-e1uke7t",
      identifier: "e1uke7t",
      source: "official-rss-link",
      verified: true,
    },
    unresolved: [
      "No verified official TTJS YouTube episode URL.",
      "No open.spotify.com/episode identifier was published by Spotify.",
    ],
  },
  "0bfea698-4523-4a11-9b1b-b89f24422b88": {
    guid: "0bfea698-4523-4a11-9b1b-b89f24422b88",
    apple: {
      platform: "apple",
      url: "https://podcasts.apple.com/us/podcast/alexandra-zapruder-on-holocaust-remembrance-antisemitism/id1521741221?i=1000560053560",
      identifier: "1000560053560",
      source: "apple-itunes-lookup",
      verified: true,
    },
    spotify: {
      platform: "spotify",
      url: "https://podcasters.spotify.com/pod/show/jewishoriginalmedia/episodes/Alexandra-Zapruder-on-Holocaust-Remembrance--Antisemitism-and-the-Importance-of-Bearing-Witness-e1i9e6p",
      identifier: "e1i9e6p",
      source: "official-rss-link",
      verified: true,
    },
    unresolved: [
      "No verified official TTJS YouTube episode URL.",
      "No open.spotify.com/episode identifier was published by Spotify.",
    ],
  },
  "4609de6e-2e4b-40e0-84a6-34688d9265b5": {
    guid: "4609de6e-2e4b-40e0-84a6-34688d9265b5",
    apple: {
      platform: "apple",
      url: "https://podcasts.apple.com/us/podcast/premier-mel-brooks-annexation-music-from-the/id1521741221?i=1000481671044",
      identifier: "1000481671044",
      source: "apple-itunes-lookup",
      verified: true,
    },
    spotify: {
      platform: "spotify",
      url: "https://podcasters.spotify.com/pod/show/jewishoriginalmedia/episodes/PREMIER-Mel-Brooks--Annexation--Music-from-the-Holocaust---A-Deep-Dive-into-Tikkun-Olam-eg5iiu",
      identifier: "eg5iiu",
      source: "official-rss-link",
      verified: true,
    },
    unresolved: [
      "No verified official TTJS YouTube episode URL.",
      "No open.spotify.com/episode identifier was published by Spotify.",
    ],
  },
};
