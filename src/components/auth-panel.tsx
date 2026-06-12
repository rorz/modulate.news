"use client";

import { Loader2, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

type AuthState = "idle" | "loading" | "sent" | "error";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<AuthState>("idle");
  const [message, setMessage] = useState("Magic-link auth through Supabase.");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to send magic link.");
      }

      setMessage(result.message ?? "Check your inbox.");
      setState("sent");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
      setState("error");
    }
  }

  return (
    <form
      className="rounded-lg border border-white/10 bg-[#101010] p-4 sm:p-5"
      onSubmit={signIn}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-1 text-sm text-white/50">{message}</p>
        </div>
        <Mail className="size-5 text-[#b8ff5c]" aria-hidden="true" />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          className="h-11 min-w-0 rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#b8ff5c]"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#f5f1e8] px-4 text-sm font-semibold text-[#090909] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={state === "loading" || !email}
          type="submit"
        >
          {state === "loading" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="size-4" aria-hidden="true" />
          )}
          Sign in
        </button>
      </div>
    </form>
  );
}
