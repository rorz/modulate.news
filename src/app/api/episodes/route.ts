import { NextResponse } from "next/server";
import { z } from "zod";

import { getElevenLabsClient } from "@/lib/elevenlabs";
import { hasElevenLabsConfig, hasSupabaseBrowserConfig } from "@/lib/env";
import { createPublicEpisodeId } from "@/lib/public-ids";
import { getSupabaseServerClient } from "@/lib/supabase";

const episodeRequest = z.object({
  brief: z.string().min(12).max(3000),
  hosts: z.array(z.string().min(2)).min(2).max(2),
  lengthCap: z.enum(["bullet", "brief", "story"]).optional(),
  musicVibe: z.string().min(2).max(80).optional(),
  publicId: z.string().regex(/^[A-HJKM-NP-Za-km-z2-9]{6,24}$/).optional(),
  source: z.string().min(2).max(60),
  sourceUrl: z.string().url().optional(),
  username: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/).optional(),
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

  const { brief, hosts, lengthCap, musicVibe, publicId, source, sourceUrl, username } =
    parsed.data;
  const id = publicId ?? createPublicEpisodeId();
  const slug = id;
  const title = `${source} Briefing`;
  const trimmedBrief = brief.replace(/\s+/g, " ").trim();
  const rundown = buildRundown({ brief: trimmedBrief, hosts, lengthCap, musicVibe, source });
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
      length_cap: lengthCap ?? "brief",
      music_vibe: musicVibe ?? "mist",
      public_id: id,
      rundown,
      slug,
      source,
      source_url: sourceUrl,
      status: "draft",
      title,
      username,
    });
  }

  return NextResponse.json({
    archiveProvider,
    audioProvider,
    musicReady: hasElevenLabsConfig(),
    publicId: id,
    rundown,
    slug,
    title,
    voiceReady,
  });
}

function buildRundown({
  brief,
  hosts,
  lengthCap,
  musicVibe,
  source,
}: {
  brief: string;
  hosts: string[];
  lengthCap?: string;
  musicVibe?: string;
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
    `Close under the ${lengthCap ?? "brief"} cap with ${musicVibe ?? "mist"} intro music.`,
  ];
}
