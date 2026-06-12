import Link from "next/link";
import { notFound } from "next/navigation";

import { episodes } from "@/lib/prototype-data";

type EpisodePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug } = await params;
  const episode = episodes.find((item) => slug === slugify(item.title));

  if (!episode) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-5 text-[#f5f1e8] sm:px-6">
      <article className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-[#101010] p-5 sm:p-8">
        <Link className="text-sm text-white/50 transition hover:text-white" href="/">
          Back to composer
        </Link>

        <div className="mt-8 border-b border-white/10 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b8ff5c]">
            {episode.source} · {episode.status}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">{episode.title}</h1>
          <p className="mt-3 text-sm text-white/50">
            {episode.date} · {episode.length}
          </p>
        </div>

        <div className="mt-6 rounded-md border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Audio preview</p>
              <p className="mt-1 text-sm text-white/50">
                ElevenLabs output appears here once credentials are configured.
              </p>
            </div>
            <div className="h-10 w-24 rounded bg-[#b8ff5c]" />
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="mt-3 text-base leading-8 text-white/70">{episode.summary}</p>
        </section>
      </article>
    </main>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
