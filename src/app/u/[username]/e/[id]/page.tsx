import { PublicEpisodePage } from "@/components/public-episode-page";

type UserEpisodePageProps = {
  params: Promise<{ id: string; username: string }>;
};

export default async function UserEpisodePage({ params }: UserEpisodePageProps) {
  const { id, username } = await params;
  return <PublicEpisodePage id={id} username={username} />;
}
