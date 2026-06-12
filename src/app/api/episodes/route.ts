import { NextResponse } from "next/server";
import { z } from "zod";

import { getElevenLabsClient } from "@/lib/elevenlabs";
import { hasElevenLabsConfig, hasSupabaseBrowserConfig } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase";

const episodeRequest = z.object({
  brief: z.string().min(12).max(3000),
  hosts: z.array(z.string().min(2)).min(2).max(2),
  source: z.string().min(2).max(60),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = episodeRequest.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid episode brief.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { brief, hosts, source } = parsed.data;
  const slug = `draft-${Date.now()}`;
  const title = `${source} Briefing`;
  const trimmedBrief = brief.replace(/\s+/g, " ").trim();
  const rundown = buildRundown({ brief: trimmedBrief, hosts, source });
  const audioProvider = hasElevenLabsConfig() ? "elevenlabs" : "mock";
  const archiveProvider = hasSupabaseBrowserConfig() ? "supabase" : "local";

  const elevenlabs = getElevenLabsClient();
  const voiceReady = Boolean(elevenlabs);
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.from("episodes").insert({
      audio_provider: audioProvider,
      brief: trimmedBrief,
      host_a: hosts[0],
      host_b: hosts[1],
      rundown,
      slug,
      source,
      status: "draft",
      title,
    });
  }

  return NextResponse.json({
    archiveProvider,
    audioProvider,
    musicReady: hasElevenLabsConfig(),
    rundown,
    slug,
    title,
    voiceReady,
  });
}

function buildRundown({
  brief,
  hosts,
  source,
}: {
  brief: string;
  hosts: string[];
  source: string;
}) {
  const opener = `${hosts[0]} opens with the highest-signal ${source} item: ${brief.slice(
    0,
    132,
  )}${brief.length > 132 ? "..." : ""}`;

  return [
    opener,
    `${hosts[1]} adds context, names the practical consequence, and cuts anything that sounds like filler.`,
    "Both hosts trade one useful disagreement so the listener gets judgment, not a pasteurized summary.",
    "Close with three actions, one follow-up question, and a nine-second instrumental tag from Eleven Music.",
  ];
}
