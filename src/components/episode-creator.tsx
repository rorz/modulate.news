"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { FormEvent, useRef, useState } from "react";

import { SpeakerPicker } from "@/components/speaker-picker";
import {
  type HostProfile,
  type LengthCap,
  lengthCaps,
  type MusicVibe,
  musicVibes,
  type Source,
  sources,
} from "@/lib/prototype-data";

type Bite = {
  id: string;
  inputUrl: string;
  lengthCap: LengthCap;
  source: Source;
};

export function EpisodeCreator(props: {
  bites: Bite[];
  createError: string;
  createEpisode: (event: FormEvent<HTMLFormElement>) => void;
  creating: boolean;
  hostA: HostProfile;
  hostB: HostProfile;
  makePublic: boolean;
  musicVibe: MusicVibe;
  onBack: () => void;
  setBites: (bites: Bite[]) => void;
  setHostA: (host: HostProfile) => void;
  setHostB: (host: HostProfile) => void;
  setMakePublic: (value: boolean) => void;
  setMusicVibe: (vibe: MusicVibe) => void;
  voiceOptions: HostProfile[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [musicPreviewId, setMusicPreviewId] = useState("");
  const [previewError, setPreviewError] = useState("");

  function updateBite(id: string, patch: Partial<Bite>) {
    props.setBites(props.bites.map((bite) => (bite.id === id ? { ...bite, ...patch } : bite)));
  }

  function addBite() {
    props.setBites([
      ...props.bites,
      {
        id: crypto.randomUUID(),
        inputUrl: "https://",
        lengthCap: lengthCaps[1],
        source: sources[1],
      },
    ]);
  }

  function removeBite(id: string) {
    props.setBites(props.bites.filter((bite) => bite.id !== id));
  }

  async function previewMusic(vibe: MusicVibe) {
    setPreviewError("");
    setMusicPreviewId(vibe.id);
    audioRef.current?.pause();

    try {
      const response = await fetch("/api/intro", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: vibe.clipPrompts.intro }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to preview music.");
      }

      const url = URL.createObjectURL(await response.blob());
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setMusicPreviewId("");
      };
      await audio.play();
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Unable to preview music.");
      setMusicPreviewId("");
    }
  }

  return (
    <form className="py-8 pb-16" onSubmit={props.createEpisode}>
      <button
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-mist-600 transition hover:text-mist-900"
        onClick={props.onBack}
        type="button"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        My Episodes
      </button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-mist-500">Studio</p>
          <h1 className="font-heading mt-2 bg-gradient-to-tr from-mist-900 to-mist-600 bg-clip-text pb-1 text-4xl font-black text-transparent">
            Create episode
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-mist-600">
          Pick the sound, cast the hosts, then compose the episode from bites.
        </p>
      </div>

      <Section title="Music">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {musicVibes.map((vibe) => {
            const active = vibe.id === props.musicVibe.id;
            return (
              <div className={active ? "choice choice-active" : "choice"} key={vibe.id}>
                <button
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  onClick={() => props.setMusicVibe(vibe)}
                  type="button"
                >
                  <span className="choice-icon">
                    <vibe.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-black">
                      {vibe.label}
                      {active ? <CheckIcon className="size-4 text-mist-700" weight="bold" /> : null}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-mist-600">{vibe.prompt}</span>
                  </span>
                </button>
                <button
                  aria-label={`Preview ${vibe.label}`}
                  className="preview-button"
                  disabled={musicPreviewId === vibe.id}
                  onClick={() => previewMusic(vibe)}
                  type="button"
                >
                  <PlayIcon className="size-4" weight="fill" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
        {previewError ? <p className="mt-3 text-sm text-red-600">{previewError}</p> : null}
      </Section>

      <Section title="Speakers">
        <div className="grid gap-3 sm:grid-cols-2">
          <SpeakerPicker
            host={props.hostA}
            label="Speaker 1"
            onSelect={props.setHostA}
            voices={props.voiceOptions}
          />
          <SpeakerPicker
            host={props.hostB}
            label="Speaker 2"
            onSelect={props.setHostB}
            voices={props.voiceOptions}
          />
        </div>
      </Section>

      <Section title="Bites">
        <div className="grid gap-4">
          {props.bites.map((bite, index) => (
            <BiteEditor
              bite={bite}
              canRemove={props.bites.length > 1}
              index={index}
              key={bite.id}
              onRemove={() => removeBite(bite.id)}
              onUpdate={(patch) => updateBite(bite.id, patch)}
            />
          ))}
        </div>
        <button className="secondary-button mt-4" onClick={addBite} type="button">
          <PlusIcon className="size-4" aria-hidden="true" />
          Add bite
        </button>
      </Section>

      <Section title="Visibility">
        <label className="studio-card flex min-h-16 items-center gap-3 p-4 text-left">
          <input
            checked={props.makePublic}
            className="size-4 accent-mist-700"
            onChange={(event) => props.setMakePublic(event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="block font-black">Make public</span>
            <span className="mt-1 block text-sm text-mist-600">
              Generate a shareable /e link on your Modulate subdomain.
            </span>
          </span>
        </label>
      </Section>

      <button className="primary-button mt-7 h-12 w-full sm:w-auto" disabled={props.creating}>
        <PlusIcon className="size-5" aria-hidden="true" />
        {props.creating ? "Creating..." : "Create episode"}
      </button>
      {props.createError ? <p className="mt-3 text-sm text-red-600">{props.createError}</p> : null}
    </form>
  );
}

function BiteEditor({
  bite,
  canRemove,
  index,
  onRemove,
  onUpdate,
}: {
  bite: Bite;
  canRemove: boolean;
  index: number;
  onRemove: () => void;
  onUpdate: (patch: Partial<Bite>) => void;
}) {
  return (
    <div className="studio-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-black text-slate-950">Bite {index + 1}</h3>
        {canRemove ? (
          <button
            className="grid size-9 place-items-center rounded-xs border border-mist-200/90 bg-white/70 text-mist-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={onRemove}
            type="button"
          >
            <TrashIcon className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {sources.map((item) => {
          const active = item.id === bite.source.id;
          return (
            <button
              className={active ? "choice choice-active" : "choice"}
              disabled={"disabled" in item && item.disabled}
              key={item.id}
              onClick={() => onUpdate({ inputUrl: sourcePlaceholder(item.id), source: item })}
              type="button"
            >
              <span className="choice-icon">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-black">{item.name}</span>
                <span className="mt-1 block text-sm text-mist-600">{item.action}</span>
              </span>
            </button>
          );
        })}
      </div>

      {bite.source.id === "url" || bite.source.id === "luma" ? (
        <input
          className="mt-3 h-12 w-full rounded-xs border border-mist-300/80 bg-white px-3 text-base outline-none transition focus:border-mist-500/80 focus:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10)]"
          onChange={(event) => onUpdate({ inputUrl: event.target.value })}
          placeholder={sourcePlaceholder(bite.source.id)}
          value={bite.inputUrl}
        />
      ) : null}
      <p className="mt-2 text-sm text-mist-600">{bite.source.detail}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {lengthCaps.map((cap) => (
          <button
            className={cap.id === bite.lengthCap.id ? "length-choice choice-active" : "length-choice"}
            key={cap.id}
            onClick={() => onUpdate({ lengthCap: cap })}
            type="button"
          >
            <span className="font-heading text-3xl font-black text-mist-900">{cap.cap}</span>
            <span>
              <span className="block font-black">{cap.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function sourcePlaceholder(sourceId: Source["id"]) {
  if (sourceId === "luma") return "https://lu.ma/modulate-launch";
  if (sourceId === "url") return "https://example.com/article";
  if (sourceId === "hacker-news") return "https://news.ycombinator.com";
  return "";
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-8 border-t border-mist-200/80 pt-6">
      <h2 className="font-heading mb-4 text-xl font-black text-slate-950">{title}</h2>
      {children}
    </section>
  );
}
