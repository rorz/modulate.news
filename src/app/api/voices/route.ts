import { NextResponse } from "next/server";

import { hasElevenLabsConfig } from "@/lib/env";
import { listDefaultVoices } from "@/lib/elevenlabs";

export async function GET() {
  if (!hasElevenLabsConfig()) {
    return NextResponse.json({ voices: [] });
  }

  try {
    const voices = await listDefaultVoices();
    return NextResponse.json({ voices });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load voices.", voices: [] },
      { status: 502 },
    );
  }
}
