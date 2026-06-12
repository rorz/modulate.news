import Link from "next/link";

export function PublicEpisodePage({ id, username }: { id: string; username?: string }) {
  const owner = username ?? "public";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6">
      <article className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
        <Link className="text-sm font-semibold text-slate-500 transition hover:text-sky-700" href="/">
          Modulate
        </Link>

        <div className="mt-8 border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase text-sky-700">{owner}.modulate.news/e/{id}</p>
          <h1 className="font-heading mt-3 text-4xl font-black leading-tight">
            Public episode
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            This share page is publicly accessible. Supabase-backed episode data
            will hydrate here once the archive is connected.
          </p>
        </div>

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black">Audio preview</p>
          <div className="mt-4 h-3 overflow-hidden rounded bg-slate-200">
            <div className="h-full w-2/3 bg-sky-700" />
          </div>
        </div>
      </article>
    </main>
  );
}
