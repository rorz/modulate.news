"use client";

import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CopyIcon,
  LockKeyIcon,
  PlayIcon,
  PlusIcon,
  RadioIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRef, useState } from "react";

type Episode = {
  audioUrl?: string | null;
  id: string;
  isPublic: boolean;
  length: string;
  script?: string;
  source: string;
  status?: string;
  title: string;
  url?: string;
  voiceId?: string;
};

export function EpisodesScreen({
  episodes,
  loading,
  onCreate,
}: {
  episodes: Episode[];
  loading: boolean;
  onCreate: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState("");
  const [playError, setPlayError] = useState("");

  async function playEpisode(episode: Episode) {
    setPlayError("");
    setPlayingId(episode.id);
    audioRef.current?.pause();

    try {
      if (!episode.audioUrl) {
        throw new Error("Audio is still rendering.");
      }

      const audio = new Audio(episode.audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setPlayingId("");
      };
      await audio.play();
    } catch (error) {
      setPlayError(error instanceof Error ? error.message : "Unable to play episode.");
      setPlayingId("");
    }
  }

  return (
    <section className="py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-mist-700">Library</p>
          <h1 className="font-heading mt-2 text-4xl font-black">My Episodes</h1>
        </div>
        {episodes.length > 0 ? (
          <button className="primary-button" onClick={onCreate}>
            <PlusIcon className="size-5" aria-hidden="true" />
            Create
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-3">
          {[0, 1, 2].map((item) => (
            <div className="studio-card h-24 animate-pulse p-4" key={item}>
              <div className="h-4 w-1/3 rounded-xs bg-mist-200/90" />
              <div className="mt-4 h-3 w-2/3 rounded-xs bg-mist-100" />
            </div>
          ))}
        </div>
      ) : episodes.length === 0 ? (
        <div className="mt-10 rounded-xs border border-dashed border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 p-6">
          <div className="grid size-12 place-items-center rounded-xs bg-gradient-to-br from-mist-100 to-mist-200 text-mist-700">
            <RadioIcon className="size-6" aria-hidden="true" />
          </div>
          <h2 className="font-heading mt-6 text-2xl font-black">No episodes yet</h2>
          <p className="mt-2 max-w-lg text-slate-600">
            Create your first private episode. You can make it public when it is ready to share.
          </p>
          <button className="primary-button mt-6" onClick={onCreate}>
            <PlusIcon className="size-5" aria-hidden="true" />
            Create episode
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {episodes.map((episode) => (
            <article
              className="studio-card p-4"
              key={episode.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-lg font-black">{episode.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {episode.source} · {episode.length} ·{" "}
                    {episode.status === "generating"
                      ? "Generating audio"
                      : episode.status === "failed"
                        ? "Render failed"
                      : episode.isPublic
                        ? `/e/${episode.id}`
                        : "Private"}
                  </p>
                </div>
                {episode.status === "generating" ? (
                  <SpinnerGapIcon className="size-6 animate-spin text-mist-500" />
                ) : episode.isPublic ? (
                  <CheckCircleIcon className="size-6 text-mist-700" weight="fill" />
                ) : (
                  <LockKeyIcon className="size-6 text-mist-500" weight="fill" />
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="secondary-button"
                  disabled={
                    playingId === episode.id ||
                    episode.status === "generating" ||
                    episode.status === "failed"
                  }
                  onClick={() => playEpisode(episode)}
                >
                  <PlayIcon className="size-4" weight="fill" aria-hidden="true" />
                  {episode.status === "failed"
                    ? "Failed"
                    : episode.status === "generating"
                    ? "Rendering"
                    : playingId === episode.id
                      ? "Playing"
                      : "Play"}
                </button>
                {episode.isPublic && episode.url ? (
                  <>
                    <Link className="secondary-button" href={`/e/${episode.id}`}>
                      <ArrowSquareOutIcon className="size-4" aria-hidden="true" />
                      Open
                    </Link>
                    <button
                      className="secondary-button"
                      onClick={() => navigator.clipboard?.writeText(episode.url ?? "")}
                    >
                      <CopyIcon className="size-4" aria-hidden="true" />
                      Copy share link
                    </button>
                  </>
                ) : null}
              </div>
              {playError ? <p className="mt-3 text-sm text-red-600">{playError}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
