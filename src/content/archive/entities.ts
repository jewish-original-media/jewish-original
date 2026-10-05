import "server-only";

import { cache } from "react";
import { defineQuery } from "next-sanity";

import { getPublishedSanityClient } from "@/lib/sanity/client";

import type { ArchiveEntity, ArchiveFacetType } from "./types";

const archiveEntitiesQuery = defineQuery(`*[
  !(_id in path("drafts.**")) &&
  _type in ["topic", "person", "place", "geographicRegion", "historicalEra", "organization"] &&
  defined(name) &&
  defined(slug.current) &&
  (!defined(status) || status == "active")
]{
  "documentType": _type,
  "facetType": select(
    _type == "geographicRegion" => "region",
    _type == "historicalEra" => "era",
    _type
  ),
  name,
  "slug": slug.current,
  "description": select(
    _type == "person" => pt::text(biography),
    _type == "place" => historicalContext,
    description
  )
}`);

export const getArchiveEntities = cache(async () => {
  return getPublishedSanityClient().fetch<ArchiveEntity[]>(
    archiveEntitiesQuery,
    {},
    {
      next: {
        revalidate: 3600,
        tags: ["archive-entities"],
      },
    },
  );
});

export const getArchiveEntity = cache(
  async (facetType: ArchiveFacetType, slug: string) => {
    const entities = await getArchiveEntities();
    return (
      entities.find(
        (entity) => entity.facetType === facetType && entity.slug === slug,
      ) ?? null
    );
  },
);
