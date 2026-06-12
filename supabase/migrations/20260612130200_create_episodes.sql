create extension if not exists pgcrypto;

create table if not exists public.episodes (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  username text,
  slug text not null unique,
  title text not null,
  source text not null,
  source_url text,
  brief text not null,
  rundown jsonb not null default '[]'::jsonb,
  host_a text not null,
  host_b text not null,
  music_vibe text not null default 'mist',
  length_cap text not null default 'brief',
  status text not null default 'draft',
  audio_provider text not null default 'mock',
  audio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.episodes enable row level security;

create policy "Episodes are publicly readable"
  on public.episodes
  for select
  using (true);

create policy "Authenticated users can create episodes"
  on public.episodes
  for insert
  to authenticated
  with check (true);
