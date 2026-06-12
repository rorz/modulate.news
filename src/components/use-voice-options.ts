"use client";

import { useEffect, useState } from "react";

import { type HostProfile, hostProfiles } from "@/lib/prototype-data";

export function useVoiceOptions() {
  const [voiceOptions, setVoiceOptions] = useState<HostProfile[]>([...hostProfiles]);
  const [hostA, setHostA] = useState<HostProfile>(hostProfiles[0]);
  const [hostB, setHostB] = useState<HostProfile>(hostProfiles[1]);

  useEffect(() => {
    let cancelled = false;

    async function loadVoices() {
      const response = await fetch("/api/voices");
      const result = (await response.json()) as {
        voices?: Array<{
          accent?: string;
          category?: string;
          description?: string;
          id: string;
          label: string;
          previewUrl?: string;
          role?: string;
        }>;
      };
      const voices =
        result.voices?.map((voice) => ({
          accent: voice.accent ?? "Global",
          category: voice.category,
          id: voice.id,
          label: voice.label,
          previewUrl: voice.previewUrl,
          role: voice.role ?? voice.description ?? "host voice",
          sample: "This is Modulate. Here is the useful bit, without the noise.",
        })) ?? [];

      if (!cancelled && voices.length >= 2) {
        setVoiceOptions(voices);
        setHostA(voices[0]);
        setHostB(voices[1]);
      }
    }

    loadVoices().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return { hostA, hostB, setHostA, setHostB, voiceOptions };
}
