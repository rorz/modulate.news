"use client";

import { ArrowRightIcon, EnvelopeSimpleIcon, LockKeyIcon } from "@phosphor-icons/react";
import { FormEvent, MouseEvent, useState } from "react";

type AuthState = "idle" | "loading" | "error";

export function AuthPanel({
  onAuthenticated,
}: {
  onAuthenticated: (profile: { email: string; username: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<AuthState>("idle");
  const [message, setMessage] = useState("");

  const emailReady = /^\S+@\S+\.\S+$/.test(email);
  const passwordReady = password.length >= 6;

  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailReady || !passwordReady) {
      setState("error");
      setMessage("Enter an email and a password with at least 6 characters.");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as {
        email?: string;
        error?: string;
        username?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to sign in.");
      }

      onAuthenticated({ email: result.email ?? email, username: result.username ?? "" });
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
    <form className="mt-8 grid gap-3" onSubmit={start}>
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Email</span>
        <div className="grid grid-cols-[auto_1fr] items-center overflow-hidden rounded-xs border border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 px-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.88)] transition focus-within:border-mist-500/70 focus-within:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10),inset_0_1px_0_rgb(255_255_255_/_0.88)]">
          <EnvelopeSimpleIcon className="size-5 text-mist-500" aria-hidden="true" />
          <input
            className="h-12 min-w-0 bg-transparent px-3 text-base text-slate-950 outline-none placeholder:text-slate-400"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            type="email"
            value={email}
          />
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase text-slate-500">Password</span>
        <div className="grid grid-cols-[auto_1fr] items-center overflow-hidden rounded-xs border border-slate-300/80 bg-gradient-to-br from-white to-mist-50/80 px-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.88)] transition focus-within:border-mist-500/70 focus-within:shadow-[0_0_0_3px_rgb(92_122_145_/_0.10),inset_0_1px_0_rgb(255_255_255_/_0.88)]">
          <LockKeyIcon className="size-5 text-mist-500" aria-hidden="true" />
          <input
            className="h-12 min-w-0 bg-transparent px-3 text-base text-slate-950 outline-none placeholder:text-slate-400"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="6+ characters"
            type="password"
            value={password}
          />
        </div>
      </label>

      <button
        className="primary-button mt-2 h-12 w-full"
        disabled={state === "loading" || !emailReady || !passwordReady}
        onMouseMove={moveButtonGlow}
        type="submit"
      >
        {state === "loading" ? "Starting..." : "Start"}
        <ArrowRightIcon className="size-5" aria-hidden="true" />
      </button>

      {state === "error" ? <p className="text-sm text-red-600">{message}</p> : null}
    </form>
  );
}
