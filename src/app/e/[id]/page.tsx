import { PublicEpisodePage } from "@/components/public-episode-page";

type EpisodePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { id } = await params;
  return <PublicEpisodePage id={id} />;
}
