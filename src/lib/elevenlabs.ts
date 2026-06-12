import { ElevenLabsClient } from "elevenlabs";

import { env, hasElevenLabsConfig } from "@/lib/env";

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

export async function streamMusicIntro(prompt: string) {
  if (!hasElevenLabsConfig()) {
    return null;
  }

  const response = await fetch("https://api.elevenlabs.io/v1/music/stream", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "xi-api-key": env.ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      force_instrumental: true,
      model_id: "music_v1",
      music_length_ms: 9000,
      prompt,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("ElevenLabs music generation failed.");
  }

  return response.body;
}
