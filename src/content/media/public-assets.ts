export type PublicRightsClass = "A" | "B";

export type FounderPhotoCrop =
  "archive" | "gathering" | "overlook" | "steps" | "street" | "tefillin";

export type PublicFounderPhoto = {
  id: string;
  src: `/media/founder/${string}`;
  width: number;
  height: number;
  alt: string;
  kind: "Photograph";
  title: string;
  placeDate: string;
  credit: string;
  crop: FounderPhotoCrop;
  rightsClass: PublicRightsClass;
  owner: string;
  notes: string;
};

export const FOUNDER_PHOTOS = {
  archive: {
    id: "archive-photographer",
    src: "/media/founder/archive-photographer.webp",
    width: 768,
    height: 1024,
    alt: "A photographer carrying a camera steps through a weathered stone opening",
    kind: "Photograph",
    title: "Looking through the layers",
    placeDate: "Jewish Original field photography",
    credit: "Jewish Original Media",
    crop: "archive",
    rightsClass: "A",
    owner: "Jewish Original Media",
    notes:
      "Founder-cleared photograph. Used as the editorial image in the Jewish Today room.",
  },
  gathering: {
    id: "community-gathering",
    src: "/media/founder/community-gathering.webp",
    width: 1024,
    height: 605,
    alt: "A large outdoor gathering seated across a grassy rise",
    kind: "Photograph",
    title: "Community, gathered",
    placeDate: "Jewish Original field photography",
    credit: "Jewish Original Media",
    crop: "gathering",
    rightsClass: "A",
    owner: "Jewish Original Media",
    notes:
      "Founder-cleared photograph. Used as a secondary homepage masthead image.",
  },
  overlook: {
    id: "founders-overlook",
    src: "/media/founder/founders-overlook.webp",
    width: 583,
    height: 1024,
    alt: "Two Jewish Original founders standing together at an urban overlook",
    kind: "Photograph",
    title: "Jewish Original, in the world",
    placeDate: "Jewish Original field photography",
    credit: "Jewish Original Media",
    crop: "overlook",
    rightsClass: "A",
    owner: "Jewish Original Media",
    notes:
      "Founder-cleared photograph. Used as a secondary homepage masthead image.",
  },
  street: {
    id: "meyer-isaac-street",
    src: "/media/founder/meyer-isaac-street.webp",
    width: 1024,
    height: 1024,
    alt: "Meyer Grunberg and Isaac Simon standing at a weathered Jerusalem street corner",
    kind: "Photograph",
    title: "Meyer Grunberg and Isaac Simon",
    placeDate: "Jerusalem",
    credit: "Jewish Original Media",
    crop: "street",
    rightsClass: "A",
    owner: "Jewish Original Media",
    notes:
      "Founder-uploaded pair photograph. Used on the homepage Podcast field and the show listening room.",
  },
  steps: {
    id: "meyer-isaac-steps",
    src: "/media/founder/meyer-isaac-steps.webp",
    width: 1024,
    height: 1024,
    alt: "Meyer Grunberg and Isaac Simon on Jerusalem limestone steps",
    kind: "Photograph",
    title: "Meyer Grunberg and Isaac Simon",
    placeDate: "Jerusalem",
    credit: "Jewish Original Media",
    crop: "steps",
    rightsClass: "A",
    owner: "Jewish Original Media",
    notes:
      "Founder-uploaded pair photograph. Used on About. Different crop from the Podcast portrait.",
  },
  tefillin: {
    id: "morning-tefillin",
    src: "/media/founder/morning-tefillin.webp",
    width: 1024,
    height: 1024,
    alt: "A man wearing tefillin reads from a Hebrew book",
    kind: "Photograph",
    title: "Morning prayer",
    placeDate: "Jerusalem",
    credit: "Jewish Original Media",
    crop: "tefillin",
    rightsClass: "A",
    owner: "Jewish Original Media",
    notes:
      "Founder-uploaded photograph of daily Jewish life. Used on the homepage masthead and Support. The subject is not named in public caption.",
  },
} as const satisfies Record<string, PublicFounderPhoto>;
