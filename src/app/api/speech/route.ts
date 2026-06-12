import { NextResponse } from "next/server";
import { z } from "zod";

import { hasElevenLabsConfig } from "@/lib/env";
import { streamSpeech } from "@/lib/elevenlabs";

const speechRequest = z.object({
  text: z.string().min(12).max(2500),
  voiceId: z.string().min(8).max(80),
});

export async function POST(request: Request) {
  const parsed = speechRequest.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid speech request." }, { status: 400 });
  }

  if (!hasElevenLabsConfig()) {
    return NextResponse.json({ error: "ElevenLabs is not configured." }, { status: 503 });
  }

  const stream = await streamSpeech(parsed.data);

  if (!stream) {
    return NextResponse.json({ error: "Speech stream unavailable." }, { status: 503 });
  }

  return new Response(stream, {
    headers: {
      "content-type": "audio/mpeg",
    },
  });
}
