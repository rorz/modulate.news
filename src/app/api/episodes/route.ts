import { put } from "@vercel/blob";
import { after, NextResponse } from "next/server";
import { z } from "zod";

import { generateMusicBuffer, generateSpeechBuffer, getElevenLabsClient } from "@/lib/elevenlabs";
import { draftEpisodeRundown } from "@/lib/episode-draft";
import { hasBlobConfig, hasElevenLabsConfig, hasSupabaseBrowserConfig } from "@/lib/env";
import { stitchMp3Clips } from "@/lib/mp3-stitcher";
import { createPublicEpisodeId } from "@/lib/public-ids";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabase";

export const maxDuration = 300;
export const runtime = "nodejs";

const episodeRequest = z.object({
  brief: z.string().min(12).max(3000),
  hosts: z.array(z.string().min(2)).min(2).max(2),
  lengthCap: z.enum(["bullet", "brief", "story"]).optional(),
  makePublic: z.boolean().optional().default(false),
  musicPrompt: z.string().min(12).max(1200).optional(),
  musicVibe: z.string().min(2).max(80).optional(),
  publicId: z.string().regex(/^[A-HJKM-NP-Za-km-z2-9]{6,24}$/).optional(),
  script: z.string().min(12).max(3000).optional(),
  source: z.string().min(2).max(60),
  sourceUrl: z.string().url().optional(),
  voiceId: z.string().min(2).max(120).optional(),
  voiceIds: z.array(z.string().min(2).max(120)).min(2).max(2).optional(),
});

type EpisodeRow = {
  audio_url: string | null;
  created_at: string;
  is_public: boolean;
  length_cap: string | null;
  public_id: string;
  script: string | null;
  source: string;
  status: string;
  title: string;
  username: string | null;
  voice_id: string | null;
};

export async function GET() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ episodes: [] });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ episodes: [] }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("episodes")
    .select(
      "public_id,title,source,length_cap,is_public,username,created_at,script,voice_id,audio_url,status",
    )
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json({
        episodes: [],
        persistenceWarning: "Run Supabase migrations to persist episodes.",
      });
    }

    return NextResponse.json({ error: error.message, episodes: [] }, { status: 400 });
  }

  return NextResponse.json({
    episodes: ((data ?? []) as EpisodeRow[]).map((episode) => ({
      id: episode.public_id,
      audioUrl: episode.audio_url ? `/api/episodes/${episode.public_id}/audio` : undefined,
      isPublic: episode.is_public,
      length: lengthLabel(episode.length_cap),
      script: episode.script ?? undefined,
      source: episode.source,
      status: episode.status,
      title: episode.title,
      url:
        episode.is_public && episode.username
          ? `https://${episode.username}.modulate.news/e/${episode.public_id}`
          : undefined,
      voiceId: episode.voice_id ?? undefined,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = episodeRequest.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid episode brief.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const {
    brief,
    hosts,
    lengthCap,
    makePublic,
    musicPrompt,
    musicVibe,
    publicId,
    script,
    source,
    sourceUrl,
    voiceId,
    voiceIds,
  } = parsed.data;
  const id = publicId ?? createPublicEpisodeId();
  const slug = id;
  const title = `${source} Briefing · ${new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  })}`;
  const trimmedBrief = brief.replace(/\s+/g, " ").trim();
  const rundown =
    script?.split(/\n+/).filter(Boolean) ??
    (await draftEpisodeRundown({
      brief: trimmedBrief,
      hosts,
      lengthCap,
      musicVibe,
      source,
      sourceUrl,
    }));
  const playableScript = script ?? [title, ...rundown].join("\n\n");
  const audioProvider = hasElevenLabsConfig() ? "elevenlabs" : "mock";
  const archiveProvider = hasSupabaseBrowserConfig() ? "supabase" : "unconfigured";

  if (!hasElevenLabsConfig() || !hasBlobConfig()) {
    return NextResponse.json(
      { error: "ElevenLabs and Vercel Blob are required to create episodes." },
      { status: 503 },
    );
  }

  const elevenlabs = getElevenLabsClient();
  const voiceReady = Boolean(elevenlabs);
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is required to create episodes." },
      { status: 503 },
    );
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sign in before creating episodes." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  const username =
    typeof profile?.username === "string"
      ? profile.username
      : typeof userData.user.user_metadata.username === "string"
        ? userData.user.user_metadata.username
        : null;

  if (makePublic && !username) {
    return NextResponse.json(
      { error: "Choose a username before making episodes public." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("episodes").insert({
    audio_provider: audioProvider,
    audio_url: null,
    brief: trimmedBrief,
    host_a: hosts[0],
    host_b: hosts[1],
    is_public: makePublic,
    length_cap: lengthCap ?? "brief",
    music_vibe: musicVibe ?? "mist",
    public_id: id,
    rundown,
    script: playableScript,
    slug,
    source,
    source_url: sourceUrl,
    status: "generating",
    title,
    user_id: userData.user.id,
    username,
    voice_id: voiceId,
  });

  if (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "Run Supabase migrations before creating episodes." },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  after(async () => {
    const audioUrl = await composeAndStoreEpisodeAudio({
      episodeId: id,
      musicPrompt,
      rundown,
      title,
      voiceIds: voiceIds ?? (voiceId ? [voiceId, voiceId] : undefined),
    });
    const writeClient = getSupabaseAdminClient() ?? supabase;

    await writeClient
      .from("episodes")
      .update({
        audio_url: audioUrl,
        status: audioUrl ? "ready" : "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("public_id", id);
  });

  return NextResponse.json({
    archiveProvider,
    audioProvider,
    audioUrl: null,
    musicReady: hasElevenLabsConfig(),
    episodeId: id,
    publicId: makePublic ? id : null,
    rundown,
    slug,
    status: "generating",
    title,
    voiceReady,
  });
}

function lengthLabel(lengthCap?: string | null) {
  if (lengthCap === "bullet") return "1 min";
  if (lengthCap === "story") return "5 min";
  return "3 min";
}

async function composeAndStoreEpisodeAudio({
  episodeId,
  musicPrompt,
  rundown,
  title,
  voiceIds,
}: {
  episodeId: string;
  musicPrompt?: string;
  rundown: string[];
  title: string;
  voiceIds?: string[];
}) {
  if (!musicPrompt || !voiceIds?.[0] || !voiceIds[1] || !hasElevenLabsConfig() || !hasBlobConfig()) {
    return null;
  }

  try {
    const clips: Buffer[] = [];
    const music = await generateMusicBuffer(musicPrompt);

    if (music) clips.push(music);

    for (const [index, line] of [title, ...rundown].entries()) {
      const speech = await generateSpeechBuffer({
        text: line,
        voiceId: voiceIds[index % 2] ?? voiceIds[0],
      });

      if (speech) {
        clips.push(speech);
        if (music && index < rundown.length) clips.push(music);
      }
    }

    if (music) clips.push(music);
    if (clips.length === 0) return null;

    const episode = await stitchMp3Clips(clips);

    const blob = await put(
      `episodes/${episodeId}.mp3`,
      new Blob([episode], {
        type: "audio/mpeg",
      }),
      {
        access: "private",
        addRandomSuffix: false,
        contentType: "audio/mpeg",
      },
    );

    return blob.pathname;
  } catch (error) {
    console.error("Episode audio generation failed", error);
    return null;
  }
}

function isMissingTableError(error: { code?: string; message?: string }) {
  const message = error.message?.toLowerCase() ?? "";
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    message.includes("could not find the table") ||
    message.includes("does not exist")
  );
}
