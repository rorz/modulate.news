"use client";

import { SignInIcon } from "@phosphor-icons/react";
import { FormEvent, MouseEvent, useState } from "react";

import { isValidUsername, normalizeUsername } from "@/lib/public-ids";

type AuthState = "idle" | "loading" | "sent" | "error";

export function AuthPanel({
  onSuccess,
}: {
  onSuccess: (profile: { email: string; username: string }) => void;
}) {
  const [username, setUsername] = useState("");
  const [state, setState] = useState<AuthState>("idle");
  const [message, setMessage] = useState("");

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
        body: JSON.stringify({ username: normalizedUsername }),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to sign in.");
      }

      setMessage(result.message ?? "Signed in.");
      setState("sent");
      onSuccess({ email: "", username: normalizedUsername });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
      setState("error");
    }
  }

  function moveButtonGlow(event: MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
  }

  return (
    <form className="mt-8 grid gap-3" onSubmit={signIn}>
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Get started</span>
        <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-xs border border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.88)] transition focus-within:border-mist-500/70 focus-within:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10),inset_0_1px_0_rgb(255_255_255_/_0.88)]">
          <input
            className="h-12 min-w-0 bg-transparent px-3 text-base text-slate-950 outline-none placeholder:text-slate-400"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="alex"
            value={username}
          />
          <span className="flex items-center border-l border-slate-200/90 bg-white/52 px-3 text-sm text-mist-600">
            .modulate.news
          </span>
        </div>
      </label>

      <button
        className="primary-button mt-2 h-12 w-full"
        disabled={state === "loading" || !usernameReady}
        onMouseMove={moveButtonGlow}
        type="submit"
      >
        <SignInIcon className="size-5" aria-hidden="true" />
        Sign up or Log in
      </button>

      {state === "error" ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  );
}
