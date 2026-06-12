export type LocalEpisode = {
  audioUrl?: string | null;
  id: string;
  isPublic: boolean;
  length: string;
  musicPrompt?: string;
  script?: string;
  source: string;
  status?: "failed" | "generating" | "ready" | string;
  title: string;
  url?: string;
  voiceSegments?: Array<{
    text: string;
    voiceId: string;
  }>;
  voiceId?: string;
};

export function readLocalEpisodes(email: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(localEpisodeKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalEpisode[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mergeEpisodes(primary: LocalEpisode[], secondary: LocalEpisode[]) {
  const seen = new Set<string>();
  const merged: LocalEpisode[] = [];

  for (const episode of [...primary, ...secondary]) {
    if (seen.has(episode.id)) continue;
    seen.add(episode.id);
    merged.push(episode);
  }

  return merged;
}

function localEpisodeKey(email: string) {
  return `modulate:episodes:${email.toLowerCase()}`;
}
