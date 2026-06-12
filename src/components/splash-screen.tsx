"use client";

import { Brand, Shell } from "@/components/app-shell";
import { AuthPanel } from "@/components/auth-panel";
import { PrismaticBurstBackground } from "@/components/backgrounds/prismatic-burst";

export function SplashScreen({
  onAuthenticated,
}: {
  onAuthenticated: (profile: { email: string; username: string }) => void;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      <PrismaticBurstBackground />
      <div className="absolute inset-0 bg-white/62" aria-hidden="true" />
      <Shell>
        <div className="relative grid min-h-[calc(100vh-2rem)] place-items-center py-10">
          <section className="w-full max-w-md">
            <Brand />
            <h1 className="font-heading mt-10 bg-gradient-to-tr from-mist-800 to-mist-600 bg-clip-text pb-1 text-5xl font-black leading-[1.04] text-transparent sm:text-6xl">
              Podcasts from anything.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Generate bulletins for the daily information you care about, at work or for fun.
            </p>
            <AuthPanel onAuthenticated={onAuthenticated} />
          </section>
        </div>
      </Shell>
    </main>
  );
}
