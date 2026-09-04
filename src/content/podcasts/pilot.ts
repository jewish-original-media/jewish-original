import type { PodcastEpisode, PodcastShow } from "./types";

const hosts = [
  { name: "Meyer Grunberg", slug: "meyer-grunberg" },
  { name: "Isaac Simon", slug: "isaac-simon" },
];

export const pilotShow: PodcastShow = {
  _id: "podcastShow.the-two-tall-jews-show",
  title: "The Two Tall Jews Show",
  slug: "the-two-tall-jews-show",
  tagline: "Judaism, Israel, & All the Nuance In Between.",
  description:
    "A Jewish Original Media production - Isaac and Meyer are here to dive deeper into the aspects, dates, concepts, people, places, and opinions about Judaism and Jewish History that we can't full cover in our daily posts, on a bi-weekly basis.",
  hosts,
  markSrc: "/brand/ttjs-mark.png",
  rssUrl: "https://anchor.fm/s/29786d14/podcast/rss",
  appleUrl:
    "https://podcasts.apple.com/us/podcast/jewish-original-media/id1521741221",
  spotifyUrl: "https://open.spotify.com/show/4zOBjBbKwHzWrwtWKIGC5N",
  youtubeUrl: "https://www.youtube.com/@two.tall.jews",
  websiteUrl: "https://jewishoriginal.com",
};

const kalman: PodcastEpisode = {
  _id: "podcastEpisode.775bea33-39bf-49b4-bff3-aba9c3ca45a3",
  title: "Sitting Down With: Kalman Gavriel, The Jerusalem Scribe",
  slug: "sitting-down-with-kalman-gavriel-the-jerusalem-scribe",
  showSlug: pilotShow.slug,
  showTitle: pilotShow.title,
  excerpt:
    'Welcome to a new series we are calling "Sitting Down With..." where we speak for 20 minutes (max) with unique and well-spoken individuals in Israel.',
  publishedAt: "2024-01-09T20:16:56.000Z",
  durationSeconds: 1072,
  season: 4,
  episodeNumber: 1,
  guestNames: ["Kalman Gavriel"],
  artwork: {
    url: "https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_episode/6857581/6857581-1704830495482-4a47ea2910f5e.jpg",
    alt: "Episode artwork for Sitting Down With: Kalman Gavriel, The Jerusalem Scribe.",
  },
  description:
    'Welcome to a new series we are calling "Sitting Down With..." where we speak for 20 minutes (max) with unique and well-spoken individuals in Israel.\n\nFirst up is our good friend, Kalman Gavriel aka @thejerusalemscribe. Through his unique perspectives and expertise in the ancient craft, Kalman brings the Torah to life in his art. We spoke about all things Torah inspiration, Chanukah, and the different intentions Jews can have at this difficult time we find ourselves in now.\n\nFollow him on social media and make sure to visit his store in the Old City of Jerusalem on your next visit.',
  audioUrl:
    "https://anchor.fm/s/29786d14/podcast/play/81039185/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2024-0-9%2F362807089-44100-2-ec933a9b1bc46.mp3",
  chapters: [],
  topics: [],
  people: [],
  places: [],
  hosts,
  relatedHistory: [],
  relatedEpisodes: [],
  source: "local-pilot",
};

const finale: PodcastEpisode = {
  _id: "podcastEpisode.89aba54c-5d52-4520-b129-3a7aa4da1c55",
  title: "SEASON 3 FINALE - LOOKING AHEAD TO 2023",
  slug: "season-3-finale-looking-ahead-to-2023",
  showSlug: pilotShow.slug,
  showTitle: pilotShow.title,
  excerpt:
    "We talk new Gregorian calendar, Israeli politics, the battle between Light & Darkness, and plans for 2023.",
  publishedAt: "2023-02-07T22:43:52.000Z",
  durationSeconds: 2614,
  season: 3,
  episodeNumber: 56,
  guestNames: [],
  artwork: {
    url: "https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_nologo/6857581/6857581-1593555284608-e9270700c6e36.jpg",
    alt: "The Two Tall Jews Show artwork used for the Season 3 finale.",
  },
  description:
    "We talk new Gregorian calendar, Israeli politics, the battle between Light & Darkness, and plans for 2023. See you soon for Season 4!",
  audioUrl:
    "https://anchor.fm/s/29786d14/podcast/play/64681661/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2023-1-7%2Fd3e37e3c-e89c-3d57-e3b7-ce4e93dba340.m4a",
  chapters: [],
  topics: [],
  people: [],
  places: [],
  hosts,
  relatedHistory: [],
  relatedEpisodes: [],
  source: "local-pilot",
};

const zapruder: PodcastEpisode = {
  _id: "podcastEpisode.0bfea698-4523-4a11-9b1b-b89f24422b88",
  title:
    "Alexandra Zapruder on Holocaust Remembrance, Antisemitism and the Importance of Bearing Witness",
  slug: "alexandra-zapruder-on-holocaust-remembrance-antisemitism-and-the-importance-of-bearing-witness",
  showSlug: pilotShow.slug,
  showTitle: pilotShow.title,
  excerpt:
    "Alexandra Zapruder earned her undergraduate degree at Smith College and her Masters at Harvard.",
  publishedAt: "2022-05-09T13:08:55.000Z",
  durationSeconds: 2161,
  season: 3,
  episodeNumber: 46,
  guestNames: ["Alexandra Zapruder"],
  artwork: {
    url: "https://d3t3ozftmdmh3i.cloudfront.net/production/podcast_uploaded_episode/6857581/6857581-1652101720697-0a20d8d22595b.jpg",
    alt: "Episode artwork for Alexandra Zapruder on Holocaust Remembrance.",
  },
  description:
    "Alexandra Zapruder earned her undergraduate degree at Smith College and her Masters at Harvard. As a founding staff member of the United States Holocaust Memorial Museum, she has, for over twenty years, contributed to our knowledge of the Holocaust. In particular, she is the author and editor of Salvaged Pages: Young Writer's Diaries of the Holocaust, published in 2002 and recipient of the National Jewish Book Award in the Holocaust category. She has also penned pieces for Lithub, The Smithsonian Magazine and The New York Times. She also, of course, has one of the most recognizable last names in American history, especially for the generation that grew up in the 1960s and 70s. Her most recent book, Twenty-Six Seconds: A Personal History of the Zapruder Film, is a fascinating account of how her grandfather's famous home movie capturing the assassination of President Kennedy intertwined the life of her family with the life of the nation. In dealing with diaries from children's past or being a descendant of someone that documented this country's most famous political assassinations, one can't help but draw a connection between her two books—a fascination with fragments from the past, her effort to make sense of the objects left behind, and how that shapes our understanding of history. Whether it is pages from children's diaries written during the darkest period in Jewish history or the meaning of an 8 millimeter home movie shot in 1963, Alexandra Zapruder has used her skills to reclaim objects and help us see them in new ways, illuminating the importance of what it means to bear witness, regardless of the medium.",
  audioUrl:
    "https://anchor.fm/s/29786d14/podcast/play/51738265/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2022-4-9%2Fb82696c9-c518-f330-8c5e-b5c7f61a2e0b.mp3",
  chapters: [],
  topics: [],
  people: [],
  places: [],
  hosts,
  relatedHistory: [],
  relatedEpisodes: [],
  source: "local-pilot",
};

const premier: PodcastEpisode = {
  _id: "podcastEpisode.4609de6e-2e4b-40e0-84a6-34688d9265b5",
  title:
    "PREMIER: Mel Brooks, Annexation, Music from the Holocaust, & A Deep Dive into Tikkun Olam",
  slug: "premier-mel-brooks-annexation-music-from-the-holocaust-a-deep-dive-into-tikkun-olam",
  showSlug: pilotShow.slug,
  showTitle: pilotShow.title,
  excerpt: "Pilot episode of The Two Tall Jews Show.",
  publishedAt: "2020-07-01T15:00:00.000Z",
  durationSeconds: 2764,
  season: 1,
  episodeNumber: 1,
  guestNames: [],
  description:
    "Pilot episode of The Two Tall Jews Show. A podcast produced by those that brought you @onthisdayinjewishistory, an up and coming Instagram powerhouse of daily historical content as it relates to Jewish History, the day that it happened. On this show, we dive deeper in a long format discussion with segments and occasional guests to better understand the nuances of the concepts, people and places we merely touch on the Instagram page.\n\nEpisode 001 Contents: Intro- 00:00-02:00 Happy Bday Mel Brooks, Larry David, and Nature of Jewish Humor- 02:00-08:30 Annexation Talk- 08:30-21:00 RIP & Z\"L to Two Greats- 21:10-24:20 Music from the Holocaust, Reborn- 24:25-31:00 Deep Dive: Tikkun Olam (Repair the World) - What it Means in 2020? 31:30-41:15 Bubbe's Delight: Jewish Delicacy of the Day by Bubbe, for Us 41:20-45:00",
  audioUrl:
    "https://anchor.fm/s/29786d14/podcast/play/15960094/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fproduction%2F2020-6-1%2F86729169-48000-2-f731e6c64e584.mp3",
  chapters: [
    { title: "Intro", start: "00:00" },
    {
      title: "Happy Bday Mel Brooks, Larry David, and Nature of Jewish Humor",
      start: "02:00",
    },
    { title: "Annexation Talk", start: "08:30" },
    { title: 'RIP & Z"L to Two Greats', start: "21:10" },
    { title: "Music from the Holocaust, Reborn", start: "24:25" },
    {
      title:
        "Deep Dive: Tikkun Olam (Repair the World) - What it Means in 2020?",
      start: "31:30",
    },
    {
      title: "Bubbe's Delight: Jewish Delicacy of the Day by Bubbe, for Us",
      start: "41:20",
    },
  ],
  topics: [],
  people: [],
  places: [],
  hosts,
  relatedHistory: [],
  relatedEpisodes: [],
  source: "local-pilot",
};

export const pilotEpisodes: PodcastEpisode[] = [
  kalman,
  finale,
  zapruder,
  premier,
].map((episode, _, episodes) => ({
  ...episode,
  relatedEpisodes: episodes
    .filter((other) => other.slug !== episode.slug)
    .map(toSummary),
}));

function toSummary(episode: PodcastEpisode) {
  return {
    _id: episode._id,
    title: episode.title,
    slug: episode.slug,
    showSlug: episode.showSlug,
    showTitle: episode.showTitle,
    excerpt: episode.excerpt,
    publishedAt: episode.publishedAt,
    durationSeconds: episode.durationSeconds,
    season: episode.season,
    episodeNumber: episode.episodeNumber,
    guestNames: episode.guestNames,
    artwork: episode.artwork,
  };
}

export const PILOT_GUIDS = [
  "775bea33-39bf-49b4-bff3-aba9c3ca45a3",
  "89aba54c-5d52-4520-b129-3a7aa4da1c55",
  "0bfea698-4523-4a11-9b1b-b89f24422b88",
  "4609de6e-2e4b-40e0-84a6-34688d9265b5",
] as const;
