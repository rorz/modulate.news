"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AccountScreen } from "@/components/account-controls";
import { EpisodeCreator } from "@/components/episode-creator";
import { EpisodesScreen } from "@/components/episodes-screen";
import { SignedInShell } from "@/components/signed-in-shell";
import { SplashScreen } from "@/components/splash-screen";
import { useVoiceOptions } from "@/components/use-voice-options";
import { retryFailedEpisode } from "@/lib/client-episode-actions";
import {
  type LocalEpisode as Episode,
  mergeEpisodes,
  readLocalEpisodes,
} from "@/lib/local-episodes";
import {
  type LengthCap,
  lengthCaps,
  type MusicVibe,
  musicVibes,
  type Source,
  sources,
} from "@/lib/prototype-data";
import { createPublicEpisodeId } from "@/lib/public-ids";

type Screen = "splash" | "episodes" | "creator" | "account";
type Bite = {
  id: string;
  inputUrl: string;
  lengthCap: LengthCap;
  source: Source;
};

const defaultUrl = "https://news.ycombinator.com";

export function ModulateApp() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [profile, setProfile] = useState({ email: "", username: "" });
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountUsername, setAccountUsername] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [bites, setBites] = useState<Bite[]>([
    {
      id: crypto.randomUUID(),
      inputUrl: defaultUrl,
      lengthCap: lengthCaps[1],
      source: sources[0],
    },
  ]);
  const [musicVibe, setMusicVibe] = useState<MusicVibe>(musicVibes[0]);
  const { hostA, hostB, setHostA, setHostB, voiceOptions } = useVoiceOptions();
  const [makePublic, setMakePublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [createError, setCreateError] = useState("");
  const [episodesLoading, setEpisodesLoading] = useState(false);

  const publicBase = useMemo(
    () => (profile.username ? `https://${profile.username}.modulate.news` : ""),
    [profile.username],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        const session = (await response.json()) as {
          authenticated?: boolean;
          email?: string;
          username?: string;
        };

        if (!cancelled && session.authenticated) {
          const username = session.username ?? "";
          setProfile({ email: session.email ?? "", username });
          setAccountUsername(username);
          setScreen(username ? "episodes" : "account");
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (screen !== "episodes" || !profile.email) {
      return;
    }

    let cancelled = false;

    async function loadEpisodes() {
      setEpisodesLoading(true);
      try {
        const [serverEpisodes, localEpisodes] = await Promise.all([
          fetch("/api/episodes").then(async (response) => {
            if (!response.ok) return [];
            const result = (await response.json()) as { episodes?: Episode[] };
            return result.episodes ?? [];
          }),
          Promise.resolve(readLocalEpisodes(profile.email)),
        ]);

        if (!cancelled) {
          setEpisodes(mergeEpisodes(serverEpisodes, localEpisodes));
        }
      } finally {
        if (!cancelled) {
          setEpisodesLoading(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      cancelled = true;
    };
  }, [profile.email, screen]);

  useEffect(() => {
    if (!profile.email || !episodes.some((episode) => episode.status === "generating")) {
      return;
    }

    const interval = window.setInterval(async () => {
      const response = await fetch("/api/episodes");

      if (!response.ok) return;

      const result = (await response.json()) as { episodes?: Episode[] };
      setEpisodes((items) => mergeEpisodes(result.episodes ?? [], items));
    }, 3000);

    return () => window.clearInterval(interval);
  }, [episodes, profile.email]);

  function enterSignedInApp(nextProfile: { email: string; username: string }) {
    setProfile(nextProfile);
    setAccountUsername(nextProfile.username);
    setScreen(nextProfile.username ? "episodes" : "account");
  }

  async function createEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setCreateError("");

    const id = makePublic ? createPublicEpisodeId() : crypto.randomUUID();
    const biteBrief = bites
      .map((bite, index) => {
        const sourceLabel = ["luma", "url"].includes(bite.source.id)
          ? bite.inputUrl
          : bite.source.name;
        return `Bite ${index + 1}: ${sourceLabel}, ${bite.lengthCap.label} (${bite.lengthCap.cap}).`;
      })
      .join(" ");

    try {
      const response = await fetch("/api/episodes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brief: `Create an episode with these bites. ${biteBrief} Music vibe: ${musicVibe.label}.`,
          hosts: [`${hostA.label} (${hostA.accent})`, `${hostB.label} (${hostB.accent})`],
          lengthCap: bites[0]?.lengthCap.id ?? "brief",
          musicPrompt: musicVibe.clipPrompts.intro,
          musicVibe: musicVibe.id,
          makePublic,
          publicId: makePublic ? id : undefined,
          source: bites.length === 1 ? bites[0].source.name : `${bites.length} bites`,
          sourceUrl:
            bites.length === 1 && ["luma", "url"].includes(bites[0].source.id)
              ? bites[0].inputUrl
              : undefined,
          voiceId: hostA.id,
          voiceIds: [hostA.id, hostB.id],
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Unable to create episode.");
      }

      const result = (await response.json()) as {
        episodeId?: string;
        audioUrl?: string | null;
        publicId?: string | null;
        rundown?: string[];
        status?: string;
        title?: string;
      };
      const script = [
        result.title ?? "Modulate briefing",
        ...(result.rundown ?? [
          `${hostA.label} opens with ${bites[0]?.source.name ?? "the first bite"}.`,
          `${hostB.label} adds context and closes the episode.`,
        ]),
      ].join("\n\n");
      const nextEpisode = {
        id: result.episodeId ?? id,
        audioUrl: result.audioUrl,
        isPublic: makePublic,
        title:
          result.title ??
          `${bites.length} ${bites.length === 1 ? "Bite" : "Bites"} · ${new Date().toLocaleString(
            "en-GB",
            {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/London",
            },
          )}`,
        source: bites.length === 1 ? bites[0].source.name : "Mixed sources",
        length: bites.map((bite) => bite.lengthCap.cap).join(" + "),
        script,
        status: result.status ?? (result.audioUrl ? "ready" : "generating"),
        url: makePublic ? `${publicBase}/e/${result.publicId ?? id}` : undefined,
        voiceId: hostA.id,
      };

      setEpisodes((items) => mergeEpisodes([nextEpisode], items));
      setMakePublic(false);
      setScreen("episodes");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Unable to create episode.");
    } finally {
      setCreating(false);
    }
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingAccount(true);
    setAccountMessage("");

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: accountUsername }),
      });
      const result = (await response.json()) as {
        email?: string;
        error?: string;
        username?: string;
      };

      if (!response.ok || !result.username) {
        throw new Error(result.error ?? "Unable to save username.");
      }

      setProfile({ email: result.email ?? profile.email, username: result.username });
      setAccountUsername(result.username);
      setAccountMessage("Saved.");
      setScreen("episodes");
    } catch (error) {
      setAccountMessage(error instanceof Error ? error.message : "Unable to save username.");
    } finally {
      setSavingAccount(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setAccountOpen(false);
    setProfile({ email: "", username: "" });
    setEpisodes([]);
    setScreen("splash");
  }

  if (checkingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-white text-sm font-semibold text-mist-700">
        Modulate
      </main>
    );
  }

  if (screen === "splash") {
    return <SplashScreen onAuthenticated={enterSignedInApp} />;
  }

  return (
    <SignedInShell
      accountOpen={accountOpen}
      profile={profile}
      setAccountOpen={setAccountOpen}
      onAccount={() => {
        setAccountOpen(false);
        setScreen("account");
      }}
      onHome={() => setScreen(profile.email ? "episodes" : "splash")}
      onSignOut={signOut}
    >
        {screen === "account" ? (
          <AccountScreen
            accountMessage={accountMessage}
            savingAccount={savingAccount}
            username={accountUsername}
            setUsername={setAccountUsername}
            onBack={() => setScreen("episodes")}
            onSave={saveAccount}
          />
        ) : screen === "episodes" ? (
          <EpisodesScreen
            episodes={episodes}
            loading={episodesLoading}
            onCreate={() => setScreen("creator")}
            onRetry={(episode) => retryFailedEpisode(episode, setEpisodes)}
          />
        ) : (
          <EpisodeCreator
            createEpisode={createEpisode}
            createError={createError}
            creating={creating}
            hostA={hostA}
            hostB={hostB}
            bites={bites}
            makePublic={makePublic}
            musicVibe={musicVibe}
            voiceOptions={voiceOptions}
            setBites={setBites}
            setHostA={setHostA}
            setHostB={setHostB}
            setMakePublic={setMakePublic}
            setMusicVibe={setMusicVibe}
            onBack={() => setScreen("episodes")}
          />
        )}
    </SignedInShell>
  );
}
