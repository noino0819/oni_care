import ContentDetailClient from "./ContentDetailClient";

interface ContentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContentDetailPage({
  params,
}: ContentDetailPageProps) {
  const { id } = await params;

  return <ContentDetailClient id={id} />;
}
