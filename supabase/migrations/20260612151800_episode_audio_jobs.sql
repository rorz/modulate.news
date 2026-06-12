alter table public.episodes
  add column if not exists audio_url text,
  add column if not exists script text,
  add column if not exists voice_id text,
  alter column status set default 'generating';

create index if not exists episodes_user_created_at_idx
  on public.episodes (user_id, created_at desc);

create index if not exists episodes_status_idx
  on public.episodes (status);
