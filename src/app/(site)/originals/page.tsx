import type { Metadata } from "next";
import { draftMode } from "next/headers";

import { OriginalsIndex } from "@/components/originals/originals-index";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublishedOriginalsIndex } from "@/content/originals/fetch";
import {
  buildOriginalsBreadcrumbJsonLd,
  buildOriginalsHomeMetadata,
  originalsCollectionJsonLd,
} from "@/lib/seo/originals";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: preview } = await draftMode();
  const metadata = buildOriginalsHomeMetadata();
  return preview
    ? { ...metadata, robots: { index: false, follow: false } }
    : metadata;
}

export default async function OriginalsPage() {
  const { isEnabled: preview } = await draftMode();
  const items = await getPublishedOriginalsIndex(preview).catch(() => []);

  return (
    <>
      {!preview ? (
        <>
          <JsonLd data={originalsCollectionJsonLd()} />
          <JsonLd data={buildOriginalsBreadcrumbJsonLd()} />
        </>
      ) : null}
      <OriginalsIndex items={items} />
    </>
  );
}
