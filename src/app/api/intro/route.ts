import { NextResponse } from "next/server";
import { z } from "zod";

import { hasElevenLabsConfig } from "@/lib/env";
import { streamMusicIntro } from "@/lib/elevenlabs";

const introRequest = z.object({
  prompt: z.string().min(12).max(1200),
});

export async function POST(request: Request) {
  const parsed = introRequest.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid music prompt." }, { status: 400 });
  }

  if (!hasElevenLabsConfig()) {
    return NextResponse.json(
      { error: "ElevenLabs is not configured yet. Add ELEVENLABS_API_KEY." },
      { status: 503 },
    );
  }

  const stream = await streamMusicIntro(parsed.data.prompt);

  if (!stream) {
    return NextResponse.json({ error: "Music stream unavailable." }, { status: 503 });
  }

  return new Response(stream, {
    headers: {
      "content-type": "audio/mpeg",
    },
  });
}
