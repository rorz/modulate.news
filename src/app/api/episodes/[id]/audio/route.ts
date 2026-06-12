import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase";

type EpisodeAudioRow = {
  audio_url: string | null;
  is_public: boolean;
  user_id: string;
};

type AudioRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: AudioRouteContext) {
  const { id } = await context.params;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("episodes")
    .select("audio_url,is_public,user_id")
    .eq("public_id", id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Episode not found." }, { status: 404 });
  }

  const episode = data as EpisodeAudioRow;
  const canRead = episode.is_public || userData.user?.id === episode.user_id;

  if (!canRead) {
    return NextResponse.json({ error: "Episode is private." }, { status: 404 });
  }

  if (!episode.audio_url) {
    return NextResponse.json({ error: "Audio is not ready." }, { status: 409 });
  }

  const blob = await get(episode.audio_url, { access: "private" });

  if (!blob || blob.statusCode !== 200 || !blob.stream) {
    return NextResponse.json({ error: "Audio blob not found." }, { status: 404 });
  }

  return new Response(blob.stream, {
    headers: {
      "cache-control": episode.is_public ? "public, max-age=300" : "private, max-age=60",
      "content-type": blob.blob.contentType,
    },
  });
}
