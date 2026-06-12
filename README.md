<p align="center">
  <img src="./public/modulate-wordmark.svg" alt="Modulate" width="260" />
</p>

# Modulate

Turn anything worth reading into a short, hosted audio briefing.

Modulate is a mobile-first podcast studio for daily information: Hacker News,
URLs, Luma events, and soon Slack. Pick a music identity, choose two
ElevenLabs voices, add one or more bites, and Modulate renders a private MP3 to
Vercel Blob. Episodes stay private until the user explicitly makes them public.

Built in public with Next.js, Vercel, Supabase, ElevenLabs, Bun, Knip, and
pokayoke.

## What Works

- Email/password auth with Supabase
- Account usernames for `username.modulate.news`
- Private episodes by default
- Public share paths at `/e/<id>` and `/u/<username>/e/<id>`
- Hacker News, URL, and Luma-style bites
- ElevenLabs default voice discovery and preview clips
- ElevenLabs Music API intro generation
- Full MP3 render uploaded to private Vercel Blob storage
- Auth-aware audio proxy for private playback
- Loading, ready, and failed render states in the episode library
- Public-repo checks for secret safety

## Stack

- **Vercel**: Next.js 16, App Router, Proxy/Middleware, Blob
- **Codex**: rapid product build loop, pokayoke guardrails, repo checks
- **Supabase**: Auth, Postgres, RLS-backed private/public episode data
- **ElevenLabs**: default voices, speech synthesis, Music API jingles
- **Bun**: package manager and local scripts

## Local Setup

```sh
bun install
cp .env.example .env.local
```

Fill `.env.local`:

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
ELEVENLABS_API_KEY=
BLOB_READ_WRITE_TOKEN=
```

`SUPABASE_DB_URL` is only needed for applying migrations from your machine. If
your password contains reserved URL characters such as `@`, percent-encode them.

Run migrations:

```sh
supabase db push --db-url "$SUPABASE_DB_URL"
```

Start the app:

```sh
bun run dev
```

Open `http://localhost:3000`.

## Verification

```sh
bun run check
```

This runs TypeScript, ESLint, Knip, Bun tests, pokayoke, and a production Next
build.

## Notes

The Blob store can stay private. Modulate stores the private Blob pathname in
Supabase and streams audio through `/api/episodes/:id/audio` after checking the
episode row and current user.

The Zalando font fallback warning during build is harmless for the prototype:
Next cannot infer fallback override metrics for those local font names, but the
build still completes.
