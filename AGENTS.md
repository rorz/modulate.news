# Modulate Agent Notes

This is a public-repo-compatible prototype. Do not commit secrets, private URLs,
customer data, personal tokens, or local `.env*` files. Commit `.env.example`
only.

Use Bun for package and script work:

```sh
bun install
bun run check
```

Development service rule: do not start a new app server on another port if a
service is already running. If the app is not running, tell the user and let
them start it.

The verification gate is:

```sh
bun run check
```

That runs TypeScript, ESLint, Knip, Bun tests, pokayoke, and `next build`.

Provider integration notes:

- Supabase uses `@supabase/ssr`.
- ElevenLabs server access must stay behind env vars.
- Public browser env vars must be prefixed with `NEXT_PUBLIC_`.
- Service role keys stay server-only and must not be imported into client code.

Next.js note: this project uses Next 16 App Router conventions. `params`,
`searchParams`, `cookies()`, and `headers()` are async.
