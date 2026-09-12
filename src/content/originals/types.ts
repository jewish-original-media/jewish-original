import type { PortableTextBlock } from "@/lib/history/source-body";
import type { HistoryCitation, HistoryImage } from "@/content/history/types";

export type OriginalReference = {
  name: string;
  slug: string;
};

export type OriginalSummary = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  authors: OriginalReference[];
  topics: OriginalReference[];
  featuredMedia?: HistoryImage;
};

export type OriginalArticle = OriginalSummary & {
  body: PortableTextBlock[];
  citations: HistoryCitation[];
  relatedHistory: {
    relationType?: string;
    note?: string;
    entry?: {
      title: string;
      slug: string;
      excerpt?: string;
    };
  }[];
  relatedPodcastEpisodes: {
    relationType?: string;
    note?: string;
    episode?: {
      title: string;
      slug: string;
      showSlug?: string;
    };
  }[];
  seo?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    openGraphTitle?: string;
    openGraphDescription?: string;
  };
  workflowStatus?: string;
  _createdAt?: string;
  _updatedAt: string;
};
