"use client";

import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CopyIcon,
  PlusIcon,
  RadioIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { AuthPanel } from "@/components/auth-panel";
import { PrismaticBurstBackground } from "@/components/backgrounds/prismatic-burst";
import { EpisodeCreator } from "@/components/episode-creator";
import {
  type HostProfile,
  hostProfiles,
  type LengthCap,
  lengthCaps,
  type MusicVibe,
  musicVibes,
  type Source,
  sources,
} from "@/lib/prototype-data";
import { createPublicEpisodeId } from "@/lib/public-ids";

type Screen = "splash" | "episodes" | "creator";
type Episode = {
  id: string;
  title: string;
  source: string;
  length: string;
  url: string;
};

const defaultUrl = "https://news.ycombinator.com";

export function ModulateApp() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [profile, setProfile] = useState({ email: "", username: "" });
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [source, setSource] = useState<Source>(sources[1]);
  const [inputUrl, setInputUrl] = useState(defaultUrl);
  const [musicVibe, setMusicVibe] = useState<MusicVibe>(musicVibes[0]);
  const [hostA, setHostA] = useState<HostProfile>(hostProfiles[0]);
  const [hostB, setHostB] = useState<HostProfile>(hostProfiles[1]);
  const [lengthCap, setLengthCap] = useState<LengthCap>(lengthCaps[1]);
  const [creating, setCreating] = useState(false);

  const publicBase = useMemo(
    () => (profile.username ? `https://${profile.username}.modulate.news` : ""),
    [profile.username],
  );

  async function createEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);

    const id = createPublicEpisodeId();
    const sourceLabel = source.id === "url" ? inputUrl : source.name;

    try {
      await fetch("/api/episodes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brief: `Create a ${lengthCap.label.toLowerCase()} episode from ${sourceLabel}. Music vibe: ${
            musicVibe.label
          }. Hard cap: ${lengthCap.cap}.`,
          hosts: [`${hostA.label} (${hostA.accent})`, `${hostB.label} (${hostB.accent})`],
          lengthCap: lengthCap.id,
          musicVibe: musicVibe.id,
          publicId: id,
          source: source.name,
          sourceUrl: source.id === "url" ? inputUrl : undefined,
          username: profile.username,
        }),
      });
    } finally {
      setEpisodes((items) => [
        {
          id,
          title: `${source.name} ${lengthCap.label}`,
          source: source.name,
          length: lengthCap.cap,
          url: `${publicBase}/e/${id}`,
        },
        ...items,
      ]);
      setCreating(false);
      setScreen("episodes");
    }
  }

  if (screen === "splash") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-white text-slate-950">
        <PrismaticBurstBackground />
        <div className="absolute inset-0 bg-white/42" aria-hidden="true" />
        <Shell>
          <div className="relative grid min-h-[calc(100vh-2rem)] place-items-center py-10">
            <section className="w-full max-w-md">
              <Brand />
              <h1 className="font-heading mt-10 text-5xl font-black leading-none text-slate-950 sm:text-6xl">
                Podcasts from whatever you read.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Connect a source, choose the sound, pick two hosts, and publish a
                public share link on your own Modulate subdomain.
              </p>
              <AuthPanel
                onSuccess={(nextProfile) => {
                  setProfile(nextProfile);
                  setScreen("episodes");
                }}
              />
            </section>
          </div>
        </Shell>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Shell>
        <header className="flex items-center justify-between border-b border-slate-200 py-4">
          <Brand />
          <div className="text-right">
            <p className="text-sm font-semibold">{profile.username}.modulate.news</p>
            <p className="text-xs text-slate-500">{profile.email}</p>
          </div>
        </header>

        {screen === "episodes" ? (
          <section className="py-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-sky-700">Library</p>
                <h1 className="font-heading mt-2 text-4xl font-black">My Episodes</h1>
              </div>
              {episodes.length > 0 ? (
                <button className="primary-button" onClick={() => setScreen("creator")}>
                  <PlusIcon className="size-5" aria-hidden="true" />
                  Create
                </button>
              ) : null}
            </div>

            {episodes.length === 0 ? (
              <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-white p-6">
                <div className="grid size-12 place-items-center rounded-md bg-sky-100 text-sky-700">
                  <RadioIcon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="font-heading mt-6 text-2xl font-black">No episodes yet</h2>
                <p className="mt-2 max-w-lg text-slate-600">
                  Create your first public episode. You can start from an integration
                  or paste a URL.
                </p>
                <button className="primary-button mt-6" onClick={() => setScreen("creator")}>
                  <PlusIcon className="size-5" aria-hidden="true" />
                  Create episode
                </button>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {episodes.map((episode) => (
                  <article
                    className="rounded-lg border border-slate-200 bg-white p-4"
                    key={episode.id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-heading text-lg font-black">{episode.title}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {episode.source} · {episode.length} · /e/{episode.id}
                        </p>
                      </div>
                      <CheckCircleIcon className="size-6 text-sky-700" weight="fill" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link className="secondary-button" href={`/e/${episode.id}`}>
                        <ArrowSquareOutIcon className="size-4" aria-hidden="true" />
                        Open
                      </Link>
                      <button
                        className="secondary-button"
                        onClick={() => navigator.clipboard?.writeText(episode.url)}
                      >
                        <CopyIcon className="size-4" aria-hidden="true" />
                        Copy share link
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <EpisodeCreator
            createEpisode={createEpisode}
            creating={creating}
            hostA={hostA}
            hostB={hostB}
            inputUrl={inputUrl}
            lengthCap={lengthCap}
            musicVibe={musicVibe}
            setHostA={setHostA}
            setHostB={setHostB}
            setInputUrl={setInputUrl}
            setLengthCap={setLengthCap}
            setMusicVibe={setMusicVibe}
            onBack={() => setScreen("episodes")}
            setSource={setSource}
            source={source}
          />
        )}
      </Shell>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Image
        alt="Modulate"
        className="h-7 w-auto"
        height={88}
        priority
        src="/modulate-wordmark.svg"
        width={475}
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen w-full max-w-5xl px-4 sm:px-6">{children}</div>;
}
