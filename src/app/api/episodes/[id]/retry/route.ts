import { after, NextResponse } from "next/server";

import { composeAndStoreEpisodeAudio } from "@/lib/episode-audio";
import { hasBlobConfig, hasElevenLabsConfig } from "@/lib/env";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase";

export const maxDuration = 300;
export const runtime = "nodejs";

type RetryRouteProps = {
  params: Promise<{ id: string }>;
};

type RetryEpisodeRow = {
  brief: string;
  music_vibe: string | null;
  public_id: string;
  rundown: unknown;
  script: string | null;
  status: string;
  title: string;
  voice_id: string | null;
};

const musicPrompts: Record<string, string> = {
  chrome:
    "5 second instrumental podcast intro, glossy chrome synth pluck, playful premium UI sound, tiny bass bounce, no vocals",
  mist:
    "5 second instrumental podcast intro, bright white studio feel, glassy mallets, soft sub pulse, optimistic but restrained, no vocals, clean ending",
  paper:
    "5 second instrumental podcast intro, tactile paper clicks, warm muted marimba, smart newsroom rhythm, no vocals",
  steel:
    "5 second instrumental podcast intro, precise steel-blue synth pulse, editorial news texture, clean transient rhythm, no vocals",
};

export async function POST(_request: Request, { params }: RetryRouteProps) {
  if (!hasElevenLabsConfig() || !hasBlobConfig()) {
    return NextResponse.json(
      { error: "ElevenLabs and Vercel Blob are required to retry episodes." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is required to retry episodes." }, { status: 503 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before retrying episodes." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("episodes")
    .select("public_id,title,brief,rundown,script,music_vibe,status,voice_id")
    .eq("public_id", id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Episode not found." }, { status: 404 });
  }

  const episode = data as RetryEpisodeRow;

  if (episode.status !== "failed") {
    return NextResponse.json({ error: "Only failed episodes can be retried." }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("episodes")
    .update({ audio_url: null, status: "generating", updated_at: new Date().toISOString() })
    .eq("public_id", id)
    .eq("user_id", userData.user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  after(async () => {
    const writeClient = getSupabaseAdminClient() ?? supabase;
    const rundown = rundownFromValue(episode.rundown, episode.script, episode.title);

    try {
      const audioUrl = await composeAndStoreEpisodeAudio({
        biteCount: biteCountFromBrief(episode.brief),
        episodeId: episode.public_id,
        musicPrompt: musicPrompts[episode.music_vibe ?? "mist"] ?? musicPrompts.mist,
        rundown,
        title: episode.title,
        voiceIds: episode.voice_id ? [episode.voice_id, episode.voice_id] : undefined,
      });

      await writeClient
        .from("episodes")
        .update({
          audio_url: audioUrl,
          status: audioUrl ? "ready" : "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("public_id", id);
    } catch (error) {
      console.error("Episode retry pipeline failed", error);
      await writeClient
        .from("episodes")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("public_id", id);
    }
  });

  return NextResponse.json({ status: "generating" });
}

function rundownFromValue(rundown: unknown, script: string | null, title: string) {
  if (Array.isArray(rundown) && rundown.every((line) => typeof line === "string")) {
    return rundown;
  }

  return (
    script
      ?.split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line && line !== title) ?? ["Retrying the original episode audio."]
  );
}

function biteCountFromBrief(brief: string) {
  return Math.max(1, brief.match(/\bBite\s+\d+:/gi)?.length ?? 1);
}
