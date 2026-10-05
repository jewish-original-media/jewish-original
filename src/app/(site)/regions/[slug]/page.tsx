import {
  EntityArchivePage,
  generateArchiveEntityMetadata,
} from "@/components/explore/entity-archive-page";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generateArchiveEntityMetadata("region", slug);
}

export default async function RegionPage({ params }: PageProps) {
  const { slug } = await params;
  return <EntityArchivePage slug={slug} type="region" />;
}
