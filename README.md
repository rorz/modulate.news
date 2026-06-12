# Modulate

Mobile-first podcast briefings from anything: Slack, Hacker News, Luma, pasted
notes, URLs, transcripts, and research.

The prototype uses Next.js 16, Bun, Supabase SSR/Auth plumbing, ElevenLabs voice
and music hooks, Knip, pokayoke, and Vercel-ready defaults.

## Setup

```sh
bun install
cp .env.example .env.local
```

Fill the Supabase and ElevenLabs values in `.env.local`. Keep `.env.local`
private.

## Scripts

```sh
bun run dev
bun run check
```

`bun run check` runs TypeScript, ESLint, Knip, Bun tests, pokayoke, and a
production Next build.

## Supabase

The initial schema lives in `supabase/migrations`. Episodes are public-readable
and authenticated users can create drafts.

## ElevenLabs

Server-side hooks are in `src/lib/elevenlabs.ts`. The prototype returns mock
audio state without credentials and switches to ElevenLabs once
`ELEVENLABS_API_KEY` is present.

## Deploy

Import the public repo into Vercel, set the environment variables, and deploy.
No secrets should be committed.
