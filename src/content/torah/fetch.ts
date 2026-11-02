import { getPublishedSanityClient } from "@/lib/sanity/client";

import { torahPortionBriefQuery } from "./queries";
import type { TorahPortionBrief } from "./types";

export type TorahPortionBriefLookup = {
  canonicalTitle: string;
  observedOn: string;
  hebcalSourceHref?: string;
};

export async function getPublishedTorahPortionBrief({
  canonicalTitle,
  observedOn,
  hebcalSourceHref,
}: TorahPortionBriefLookup) {
  return getPublishedSanityClient().fetch<TorahPortionBrief | null>(
    torahPortionBriefQuery,
    {
      canonicalTitle,
      observedOn,
      hebcalSourceHref: hebcalSourceHref || null,
    },
    {
      next: {
        revalidate: 3600,
        tags: ["torah-brief", `torah-brief:${observedOn}`],
      },
    },
  );
}
