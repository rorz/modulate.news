"use client";

import { PlayIcon } from "@phosphor-icons/react";

import { type HostProfile } from "@/lib/prototype-data";

export function SpeakerPicker({
  host,
  label,
  onSelect,
  voices,
}: {
  host: HostProfile;
  label: string;
  onSelect: (host: HostProfile) => void;
  voices: HostProfile[];
}) {
  return (
    <div className="studio-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-mist-500">{label}</p>
      <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3">
        <select
          className="h-12 min-w-0 rounded-xs border border-slate-300/90 bg-white px-3 text-base font-black outline-none transition focus:border-mist-500/80 focus:shadow-[0_0_0_3px_rgb(92_122_145_/_0.12)]"
          onChange={(event) => {
            const next = voices.find((profile) => profile.id === event.target.value);
            if (next) onSelect(next);
          }}
          value={host.id}
        >
          {voices.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.label}
            </option>
          ))}
        </select>
        <button
          aria-label={`Preview ${host.label}`}
          className="preview-button"
          onClick={() => speak(host)}
          type="button"
        >
          <PlayIcon className="size-4" weight="fill" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function speak(host: HostProfile) {
  if (host.previewUrl) {
    const audio = new Audio(host.previewUrl);
    audio.play();
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(host.sample));
}
