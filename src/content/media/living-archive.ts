export type LivingArchiveObject = {
  id: string;
  src: `/media/archive/${string}`;
  width: number;
  height: number;
  alt: string;
  title: string;
  place: string;
  date: string;
  community: string;
  creator?: string;
  repository: string;
  collection: string;
  sourcePageUrl: `https://${string}`;
  downloadUrl: `https://${string}`;
  reproductionNumber: string;
  rightsStatus: "noKnownRestrictions";
  rightsAdvisory: string;
  creditLine: string;
  editorialNote: string;
};

export const LIVING_ARCHIVE_OBJECTS = [
  {
    id: "new-york-rosh-hashanah-1905-1915",
    src: "/media/archive/new-york-rosh-hashanah-1905-1915.jpg",
    width: 1024,
    height: 821,
    alt: "Crowds gather on a Lower East Side street during Rosh Hashanah in early twentieth-century New York",
    title: "Jewish New Year on the East Side",
    place: "New York City",
    date: "c. 1905–1915",
    community: "Jewish New York",
    repository: "Library of Congress Prints and Photographs Division",
    collection: "George Grantham Bain Collection",
    sourcePageUrl: "https://www.loc.gov/pictures/item/91482962/",
    downloadUrl:
      "https://cdn.loc.gov/service/pnp/cph/3c00000/3c04000/3c04900/3c04973v.jpg",
    reproductionNumber: "LC-USZ62-104973",
    rightsStatus: "noKnownRestrictions",
    rightsAdvisory: "No known restrictions on publication.",
    creditLine: "Library of Congress, Bain Collection",
    editorialNote:
      "The Library of Congress catalog title and broad date range are preserved. The creator is not identified in the record.",
  },
  {
    id: "samarkand-jewish-school-1905-1915",
    src: "/media/archive/samarkand-jewish-school-1905-1915.jpg",
    width: 1024,
    height: 923,
    alt: "Jewish schoolchildren and teachers gathered outside a school in Samarkand in the early twentieth century",
    title: "Jewish schoolchildren with a teacher",
    place: "Samarkand, present-day Uzbekistan",
    date: "c. 1905–1915",
    community: "Bukharan Jewish life",
    creator: "Sergei Mikhailovich Prokudin-Gorskii",
    repository: "Library of Congress Prints and Photographs Division",
    collection: "Prokudin-Gorskii Collection",
    sourcePageUrl: "https://www.loc.gov/pictures/item/2018680203/",
    downloadUrl: "https://cdn.loc.gov/service/pnp/prok/02200/02294v.jpg",
    reproductionNumber: "LC-DIG-prok-02294",
    rightsStatus: "noKnownRestrictions",
    rightsAdvisory:
      "No known restrictions on publication; consult the Library of Congress collection guidance for commercial use.",
    creditLine:
      "Prokudin-Gorskii photograph collection, Library of Congress, Prints and Photographs Division",
    editorialNote:
      "Community description follows the catalog context for Jewish education in Samarkand; it is not inferred from appearance.",
  },
  {
    id: "yemenite-passover-family-1939",
    src: "/media/archive/yemenite-passover-family-1939.jpg",
    width: 1024,
    height: 711,
    alt: "A Yemenite Jewish family drinks ceremonial wine around a covered Passover meal in 1939",
    title: "A Yemenite family at Passover",
    place: "Location not stated in the catalog",
    date: "April 3, 1939",
    community: "Yemenite Jewish life",
    repository: "Library of Congress Prints and Photographs Division",
    collection: "G. Eric and Edith Matson Photograph Collection",
    sourcePageUrl: "https://www.loc.gov/pictures/item/2019709133/",
    downloadUrl: "https://cdn.loc.gov/service/pnp/matpc/18300/18363v.jpg",
    reproductionNumber: "LC-DIG-matpc-18363",
    rightsStatus: "noKnownRestrictions",
    rightsAdvisory:
      "No known restrictions on publication under the Matson collection guidance.",
    creditLine:
      "G. Eric and Edith Matson Photograph Collection, Library of Congress",
    editorialNote:
      "The public caption identifies the family as Yemenite. The image is used as a documented ritual-life object, not as a stand-in for all Yemenite Jews.",
  },
] as const satisfies readonly LivingArchiveObject[];
