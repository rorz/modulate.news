"use client";

import { EnvelopeSimpleIcon, SignInIcon } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

import { isValidUsername, normalizeUsername } from "@/lib/public-ids";

type AuthState = "idle" | "loading" | "sent" | "error";

export function AuthPanel({
  onSuccess,
}: {
  onSuccess: (profile: { email: string; username: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [state, setState] = useState<AuthState>("idle");
  const [message, setMessage] = useState("Pick your public episode subdomain.");

  const normalizedUsername = normalizeUsername(username);
  const usernameReady = isValidUsername(normalizedUsername);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usernameReady) {
      setState("error");
      setMessage("Use 3-30 lowercase letters, numbers, or hyphens.");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, username: normalizedUsername }),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to sign in.");
      }

      setMessage(result.message ?? "Signed in.");
      setState("sent");
      onSuccess({ email, username: normalizedUsername });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
      setState("error");
    }
  }

  return (
    <form className="mt-8 grid gap-3" onSubmit={signIn}>
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Username</span>
        <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-slate-300 bg-white">
          <input
            className="h-12 min-w-0 px-3 text-base text-slate-950 outline-none placeholder:text-slate-400"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="alex"
            value={username}
          />
          <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
            .modulate.news
          </span>
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Email</span>
        <div className="grid grid-cols-[auto_1fr] items-center rounded-md border border-slate-300 bg-white px-3">
          <EnvelopeSimpleIcon className="size-5 text-slate-400" aria-hidden="true" />
          <input
            className="h-12 min-w-0 px-3 text-base text-slate-950 outline-none placeholder:text-slate-400"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </div>
      </label>

      <button
        className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={state === "loading" || !email || !usernameReady}
        type="submit"
      >
        <SignInIcon className="size-5" aria-hidden="true" />
        Log in
      </button>

      <p className={state === "error" ? "text-sm text-red-600" : "text-sm text-slate-500"}>
        {message}
      </p>
    </form>
  );
}
