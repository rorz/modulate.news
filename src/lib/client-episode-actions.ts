import type { LocalEpisode } from "@/lib/local-episodes";

type SetEpisodes = (updater: (items: LocalEpisode[]) => LocalEpisode[]) => void;

export async function retryFailedEpisode(episode: LocalEpisode, setEpisodes: SetEpisodes) {
  const response = await fetch(`/api/episodes/${episode.id}/retry`, {
    method: "POST",
  });

  if (!response.ok) {
    const result = (await response.json()) as { error?: string };
    throw new Error(result.error ?? "Unable to retry episode.");
  }

  setEpisodes((items) =>
    items.map((item) =>
      item.id === episode.id ? { ...item, audioUrl: null, status: "generating" } : item,
    ),
  );
}
