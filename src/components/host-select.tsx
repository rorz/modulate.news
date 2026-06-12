"use client";

import { type HostProfile, hostProfiles } from "@/lib/prototype-data";

export function HostSelect({
  label,
  onSelect,
  selected,
}: {
  label: string;
  onSelect: (profile: HostProfile) => void;
  selected: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-white/45">{label}</span>
      <select
        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-[#b8ff5c]"
        onChange={(event) => {
          const next = hostProfiles.find((profile) => profile.id === event.target.value);
          if (next) onSelect(next);
        }}
        value={selected}
      >
        {hostProfiles.map((profile) => (
          <option className="bg-[#101010]" key={profile.id} value={profile.id}>
            {profile.label} · {profile.tone}
          </option>
        ))}
      </select>
    </label>
  );
}
