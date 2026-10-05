import {
  EntityArchivePage,
  generateArchiveEntityMetadata,
} from "@/components/explore/entity-archive-page";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generateArchiveEntityMetadata("topic", slug);
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  return <EntityArchivePage slug={slug} type="topic" />;
}
