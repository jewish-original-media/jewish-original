import { documentTypes } from "./documents";
import { newsEventDocumentTypes } from "./news-events";
import { objectTypes } from "./objects";
import { originalDocumentTypes } from "./originals";
import { podcastDocumentTypes, podcastObjectTypes } from "./podcasts";
import { torahPortionBrief } from "./torah";

export const schemaTypes = [
  ...objectTypes,
  ...podcastObjectTypes,
  ...documentTypes,
  ...podcastDocumentTypes,
  ...newsEventDocumentTypes,
  ...originalDocumentTypes,
  torahPortionBrief,
];
