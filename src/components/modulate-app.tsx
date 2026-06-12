"use client";

import {
  Activity,
  ArrowUpRight,
  Check,
  Loader2,
  Mic2,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Settings2,
  Volume2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { AuthPanel } from "@/components/auth-panel";
import { HostSelect } from "@/components/host-select";
import {
  episodes,
  type HostProfile,
  hostProfiles,
  pipeline,
  type Source,
  sources,
} from "@/lib/prototype-data";

type DraftState = "idle" | "loading" | "ready" | "error";

const starterBrief =
  "Turn yesterday's product decisions, release notes, and useful external links into a short bulletin. Keep it useful for a founder who has ten minutes between meetings.";

export function ModulateApp() {
  const [selectedSource, setSelectedSource] = useState<Source>(sources[0]);
  const [hostA, setHostA] = useState<HostProfile>(hostProfiles[0]);
  const [hostB, setHostB] = useState<HostProfile>(hostProfiles[1]);
  const [brief, setBrief] = useState(starterBrief);
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [draft, setDraft] = useState<string[]>([
    "Open with the decision that matters most.",
    "Explain what changed, who needs to care, and what happens next.",
    "Close with a crisp action list and a subtle instrumental tag.",
  ]);
  const [playing, setPlaying] = useState(false);

  const hostLine = useMemo(
    () => `${hostA.label} lead host + ${hostB.label} co-host`,
    [hostA, hostB],
  );

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftState("loading");

    try {
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: selectedSource.name,
          brief,
          hosts: [hostA.label, hostB.label],
        }),
      });

      if (!response.ok) {
        throw new Error("Draft request failed.");
      }

      const result = (await response.json()) as { rundown: string[] };
      setDraft(result.rundown);
      setDraftState("ready");
    } catch {
      setDraftState("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#f5f1e8]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-white/10 py-3">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-[#f5f1e8] text-[#090909]">
              <Radio className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Modulate</p>
              <p className="mt-1 text-xs text-white/48">Private audio briefings</p>
            </div>
          </div>
          <button className="grid size-9 place-items-center rounded-md border border-white/12 text-white/70 transition hover:border-white/24 hover:text-white">
            <Settings2 className="size-4" aria-hidden="true" />
            <span className="sr-only">Settings</span>
          </button>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-w-0 flex-col gap-5">
            <section className="rounded-lg border border-white/10 bg-[#101010] p-4 shadow-2xl shadow-black/30 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b8ff5c]">
                    Composer
                  </p>
                  <h1 className="mt-2 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">
                    Make a podcast out of whatever deserves your attention.
                  </h1>
                </div>
                <div className="grid grid-cols-4 gap-1 rounded-md border border-white/10 p-1">
                  {pipeline.map((item) => (
                    <div
                      className="grid size-11 place-items-center rounded bg-white/[0.03] text-white/55"
                      key={item.label}
                      title={item.label}
                    >
                      <item.icon className="size-4" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-4">
                {sources.map((source) => {
                  const active = source.id === selectedSource.id;

                  return (
                    <button
                      className={`flex min-h-24 flex-col justify-between rounded-md border p-3 text-left transition ${
                        active
                          ? "border-[#b8ff5c] bg-[#b8ff5c] text-[#090909]"
                          : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/25"
                      }`}
                      key={source.id}
                      onClick={() => setSelectedSource(source)}
                      type="button"
                    >
                      <source.icon className="size-5" aria-hidden="true" />
                      <span>
                        <span className="block text-sm font-semibold">{source.name}</span>
                        <span className="mt-1 block text-xs opacity-70">{source.signal}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <form
              className="rounded-lg border border-white/10 bg-[#101010] p-4 sm:p-5"
              onSubmit={createDraft}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Source brief</h2>
                  <p className="mt-1 text-sm text-white/50">{selectedSource.detail}</p>
                </div>
                <button
                  className="grid size-9 place-items-center rounded-md border border-white/12 text-white/70 transition hover:border-white/24 hover:text-white"
                  onClick={() => setBrief(starterBrief)}
                  type="button"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  <span className="sr-only">Reset brief</span>
                </button>
              </div>

              <textarea
                className="mt-4 min-h-36 w-full resize-none rounded-md border border-white/10 bg-black/30 p-4 text-base leading-7 text-white outline-none transition placeholder:text-white/28 focus:border-[#b8ff5c]"
                onChange={(event) => setBrief(event.target.value)}
                value={brief}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex flex-wrap gap-2 text-xs text-white/48">
                  <span className="rounded border border-white/10 px-2 py-1">
                    Supabase archive
                  </span>
                  <span className="rounded border border-white/10 px-2 py-1">
                    Eleven v3 voice
                  </span>
                  <span className="rounded border border-white/10 px-2 py-1">
                    Music API intro
                  </span>
                </div>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#f5f1e8] px-4 text-sm font-semibold text-[#090909] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={draftState === "loading" || brief.trim().length < 12}
                  type="submit"
                >
                  {draftState === "loading" ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Wand2 className="size-4" aria-hidden="true" />
                  )}
                  Draft episode
                </button>
              </div>
            </form>
          </div>

          <aside className="flex min-w-0 flex-col gap-5">
            <AuthPanel />
            <section className="rounded-lg border border-white/10 bg-[#101010] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Voice desk</h2>
                  <p className="mt-1 text-sm text-white/50">{hostLine}</p>
                </div>
                <Mic2 className="size-5 text-[#b8ff5c]" aria-hidden="true" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <HostSelect label="Host A" onSelect={setHostA} selected={hostA.id} />
                <HostSelect label="Host B" onSelect={setHostB} selected={hostB.id} />
              </div>

              <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Intro bed</p>
                    <p className="mt-1 text-xs text-white/45">
                      9s instrumental, no vocals, clean cold open
                    </p>
                  </div>
                  <Volume2 className="size-4 text-white/58" aria-hidden="true" />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded bg-white/10">
                  <div className="h-full w-2/3 bg-[#b8ff5c]" />
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#101010] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Current rundown</h2>
                  <p className="mt-1 text-sm text-white/50">
                    {draftState === "error"
                      ? "Local fallback is still available."
                      : "Ready for voice and music generation."}
                  </p>
                </div>
                <button
                  className="grid size-10 place-items-center rounded-md bg-[#b8ff5c] text-[#090909]"
                  onClick={() => setPlaying((value) => !value)}
                  type="button"
                >
                  {playing ? (
                    <Pause className="size-4" aria-hidden="true" />
                  ) : (
                    <Play className="size-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">{playing ? "Pause" : "Play"}</span>
                </button>
              </div>

              <ol className="mt-4 space-y-2">
                {draft.map((line, index) => (
                  <li
                    className="grid grid-cols-[2rem_1fr] gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3"
                    key={`${line}-${index}`}
                  >
                    <span className="grid size-8 place-items-center rounded bg-white/8 font-mono text-xs text-white/55">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm leading-6 text-white/78">{line}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-lg border border-white/10 bg-[#101010] p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Episode archive</h2>
                  <p className="mt-1 text-sm text-white/50">Stored as public blog posts.</p>
                </div>
                <button className="grid size-9 place-items-center rounded-md border border-white/12 text-white/70 transition hover:border-white/24 hover:text-white">
                  <Plus className="size-4" aria-hidden="true" />
                  <span className="sr-only">New episode</span>
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {episodes.map((episode) => (
                  <article
                    className="rounded-md border border-white/10 bg-white/[0.03] p-3"
                    key={episode.title}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{episode.title}</p>
                        <p className="mt-1 text-xs text-white/48">
                          {episode.source} · {episode.date} · {episode.length}
                        </p>
                      </div>
                      <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded border border-white/10 px-2 text-xs text-white/62">
                        {episode.status === "ready" ? (
                          <Check className="size-3" aria-hidden="true" />
                        ) : (
                          <Activity className="size-3" aria-hidden="true" />
                        )}
                        {episode.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/62">{episode.summary}</p>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 py-4 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <span>Built for public progress. Secrets stay in environment variables.</span>
          <Link className="inline-flex items-center gap-1 text-white/60" href="/episodes/launch-radar">
            Open sample episode
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
