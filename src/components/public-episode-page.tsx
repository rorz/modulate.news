import Link from "next/link";
import { notFound } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase";

type PublicEpisode = {
  audio_url: string | null;
  length_cap: string;
  public_id: string;
  source: string;
  title: string;
  username: string | null;
};

export async function PublicEpisodePage({ id, username }: { id: string; username?: string }) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    notFound();
  }

  let query = supabase
    .from("episodes")
    .select("audio_url,length_cap,public_id,source,title,username")
    .eq("public_id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (username) {
    query = query.eq("username", username);
  }

  const { data } = (await query) as { data: PublicEpisode | null };

  if (!data) {
    notFound();
  }

  const owner = data.username ?? username ?? "public";

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-mist-50 to-slate-100 px-4 py-5 text-slate-950 sm:px-6">
      <article className="mx-auto max-w-2xl rounded-xs border border-slate-200/90 bg-gradient-to-br from-white to-mist-50/80 p-5 sm:p-8">
        <Link className="text-sm font-semibold text-slate-500 transition hover:text-mist-700" href="/">
          Modulate
        </Link>

        <div className="mt-8 border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase text-mist-700">
            {owner}.modulate.news/e/{data.public_id}
          </p>
          <h1 className="font-heading mt-3 text-4xl font-black leading-tight">
            {data.title}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            {data.source} · {data.length_cap}
          </p>
        </div>

        <div className="mt-6 rounded-xs border border-slate-200/90 bg-white/72 p-4">
          <p className="text-sm font-black">Audio preview</p>
          {data.audio_url ? (
            <audio className="mt-4 w-full" controls src={`/api/episodes/${data.public_id}/audio`} />
          ) : (
            <div className="mt-4 h-3 overflow-hidden rounded-xs bg-slate-200">
              <div className="h-full w-2/3 bg-gradient-to-r from-mist-800 to-mist-600" />
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
