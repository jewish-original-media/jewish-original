import { documentTypes } from "./documents";
import { objectTypes } from "./objects";
import { podcastDocumentTypes, podcastObjectTypes } from "./podcasts";

export const schemaTypes = [
  ...objectTypes,
  ...podcastObjectTypes,
  ...documentTypes,
  ...podcastDocumentTypes,
];
