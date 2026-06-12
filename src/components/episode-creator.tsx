"use client";

import {
  ArrowLeftIcon,
  MicrophoneStageIcon,
  PlayIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { FormEvent } from "react";

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

export function EpisodeCreator(props: {
  createEpisode: (event: FormEvent<HTMLFormElement>) => void;
  creating: boolean;
  hostA: HostProfile;
  hostB: HostProfile;
  inputUrl: string;
  lengthCap: LengthCap;
  musicVibe: MusicVibe;
  onBack: () => void;
  setHostA: (host: HostProfile) => void;
  setHostB: (host: HostProfile) => void;
  setInputUrl: (value: string) => void;
  setLengthCap: (cap: LengthCap) => void;
  setMusicVibe: (vibe: MusicVibe) => void;
  setSource: (source: Source) => void;
  source: Source;
}) {
  return (
    <form className="py-8" onSubmit={props.createEpisode}>
      <button
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
        onClick={props.onBack}
        type="button"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        My Episodes
      </button>

      <h1 className="font-heading text-4xl font-black">Create Episode</h1>

      <Section title="Source">
        <div className="grid gap-3 sm:grid-cols-2">
          {sources.map((item) => {
            const active = item.id === props.source.id;
            return (
              <button
                className={active ? "choice choice-active" : "choice"}
                key={item.id}
                onClick={() => props.setSource(item)}
                type="button"
              >
                <item.icon className="size-6" aria-hidden="true" />
                <span>
                  <span className="block font-black">{item.name}</span>
                  <span className="mt-1 block text-sm text-slate-500">{item.action}</span>
                </span>
              </button>
            );
          })}
        </div>
        <input
          className="mt-3 h-12 w-full rounded-xs border border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 px-3 text-base outline-none transition focus:border-mist-500/80 focus:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10)]"
          disabled={props.source.id !== "url"}
          onChange={(event) => props.setInputUrl(event.target.value)}
          placeholder="https://..."
          value={props.inputUrl}
        />
        <p className="mt-2 text-sm text-slate-500">{props.source.detail}</p>
      </Section>

      <Section title="Music vibe">
        <div className="grid gap-3 sm:grid-cols-3">
          {musicVibes.map((vibe) => (
            <button
              className={vibe.id === props.musicVibe.id ? "choice choice-active" : "choice"}
              key={vibe.id}
              onClick={() => props.setMusicVibe(vibe)}
              type="button"
            >
              <vibe.icon className="size-6" aria-hidden="true" />
              <span>
                <span className="block font-black">{vibe.label}</span>
                <span className="mt-1 block text-sm text-slate-500">{vibe.prompt}</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Speakers">
        <div className="grid gap-3 sm:grid-cols-2">
          <SpeakerPicker host={props.hostA} label="Speaker 1" onSelect={props.setHostA} />
          <SpeakerPicker host={props.hostB} label="Speaker 2" onSelect={props.setHostB} />
        </div>
      </Section>

      <Section title="Length cap">
        <div className="grid gap-3 sm:grid-cols-3">
          {lengthCaps.map((cap) => (
            <button
              className={cap.id === props.lengthCap.id ? "choice choice-active" : "choice"}
              key={cap.id}
              onClick={() => props.setLengthCap(cap)}
              type="button"
            >
              <span className="text-2xl font-black">{cap.cap}</span>
              <span>
                <span className="block font-black">{cap.label}</span>
                <span className="mt-1 block text-sm text-slate-500">Hard cap only</span>
              </span>
            </button>
          ))}
        </div>
      </Section>

      <button className="primary-button mt-7 h-12 w-full sm:w-auto" disabled={props.creating}>
        <PlusIcon className="size-5" aria-hidden="true" />
        {props.creating ? "Creating..." : "Create public episode"}
      </button>
    </form>
  );
}

function SpeakerPicker({
  host,
  label,
  onSelect,
}: {
  host: HostProfile;
  label: string;
  onSelect: (host: HostProfile) => void;
}) {
  return (
    <div className="rounded-xs border border-slate-200/90 bg-gradient-to-br from-white to-mist-50/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase text-slate-500">{label}</p>
        <MicrophoneStageIcon className="size-5 text-mist-700" aria-hidden="true" />
      </div>
      <select
        className="mt-3 h-12 w-full rounded-xs border border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 px-3 outline-none transition focus:border-mist-500/80 focus:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10)]"
        onChange={(event) => {
          const next = hostProfiles.find((profile) => profile.id === event.target.value);
          if (next) onSelect(next);
        }}
        value={host.id}
      >
        {hostProfiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.label} · {profile.accent}
          </option>
        ))}
      </select>
      <button className="secondary-button mt-3" onClick={() => speak(host)} type="button">
        <PlayIcon className="size-4" weight="fill" aria-hidden="true" />
        Live sample
      </button>
    </div>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-7 border-t border-slate-200 pt-6">
      <h2 className="font-heading mb-4 text-lg font-black">{title}</h2>
      {children}
    </section>
  );
}

function speak(host: HostProfile) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(host.sample);
  utterance.rate = host.rate;
  utterance.pitch = host.pitch;
  window.speechSynthesis.speak(utterance);
}
