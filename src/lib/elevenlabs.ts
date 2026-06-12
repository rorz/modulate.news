import { ElevenLabsClient } from "elevenlabs";

import { env, hasElevenLabsConfig } from "@/lib/env";

export type ElevenLabsVoice = {
  accent: string;
  category: string;
  description: string;
  id: string;
  label: string;
  previewUrl: string;
  role: string;
};

let client: ElevenLabsClient | null = null;

export function getElevenLabsClient() {
  if (!hasElevenLabsConfig()) {
    return null;
  }

  client ??= new ElevenLabsClient({
    apiKey: env.ELEVENLABS_API_KEY,
  });

  return client;
}

export async function listDefaultVoices() {
  if (!hasElevenLabsConfig()) {
    return [];
  }

  const params = new URLSearchParams({
    include_total_count: "false",
    page_size: "36",
    voice_type: "default",
  });
  const response = await fetch(`https://api.elevenlabs.io/v2/voices?${params}`, {
    headers: {
      "xi-api-key": env.ELEVENLABS_API_KEY!,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(await elevenLabsErrorMessage(response, "Unable to load ElevenLabs voices."));
  }

  const payload = (await response.json()) as {
    voices?: Array<{
      category?: string;
      description?: string | null;
      labels?: Record<string, string>;
      name?: string;
      preview_url?: string | null;
      sharing?: {
        labels?: Record<string, string>;
      } | null;
      verified_languages?: Array<{
        accent?: string;
        preview_url?: string;
      }>;
      voice_id?: string;
    }>;
  };

  return (payload.voices ?? [])
    .map((voice): ElevenLabsVoice | null => {
      const labels = { ...voice.sharing?.labels, ...voice.labels };
      const previewUrl = voice.preview_url ?? voice.verified_languages?.[0]?.preview_url ?? "";
      const name = voice.name?.trim();
      const voiceId = voice.voice_id?.trim();

      if (!name || !voiceId || !previewUrl) {
        return null;
      }

      return {
        accent: labels.accent ?? voice.verified_languages?.[0]?.accent ?? "Global",
        category: voice.category ?? "default",
        description: voice.description ?? labels.description ?? "ElevenLabs default voice",
        id: voiceId,
        label: name,
        previewUrl,
        role: labels.use_case ?? labels.description ?? "host voice",
      };
    })
    .filter((voice): voice is ElevenLabsVoice => Boolean(voice))
    .slice(0, 12);
}

export async function streamMusicIntro(prompt: string) {
  if (!hasElevenLabsConfig()) {
    return null;
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/music/stream?output_format=mp3_44100_128",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "xi-api-key": env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        force_instrumental: true,
        model_id: "music_v1",
        music_length_ms: 5000,
        prompt,
      }),
    },
  );

  if (!response.ok || !response.body) {
    throw new Error(await elevenLabsErrorMessage(response, "ElevenLabs music generation failed."));
  }

  return response.body;
}

export async function streamSpeech({ text, voiceId }: { text: string; voiceId: string }) {
  if (!hasElevenLabsConfig()) {
    return null;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "xi-api-key": env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        model_id: "eleven_multilingual_v2",
        text,
        voice_settings: {
          similarity_boost: 0.78,
          stability: 0.56,
          style: 0.14,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok || !response.body) {
    throw new Error(await elevenLabsErrorMessage(response, "ElevenLabs speech generation failed."));
  }

  return response.body;
}

export async function generateSpeechBuffer({ text, voiceId }: { text: string; voiceId: string }) {
  const stream = await streamSpeech({ text, voiceId });

  if (!stream) {
    return null;
  }

  return Buffer.from(await new Response(stream).arrayBuffer());
}

export async function generateMusicBuffer(prompt: string) {
  const stream = await streamMusicIntro(prompt);

  if (!stream) {
    return null;
  }

  return Buffer.from(await new Response(stream).arrayBuffer());
}

async function elevenLabsErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { detail?: unknown; message?: unknown };
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : typeof body.message === "string"
          ? body.message
          : null;

    return detail ?? fallback;
  } catch {
    return fallback;
  }
}
