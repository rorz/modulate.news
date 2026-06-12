alter table public.episodes
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists is_public boolean not null default false;

drop policy if exists "Episodes are publicly readable" on public.episodes;
drop policy if exists "Authenticated users can create episodes" on public.episodes;

create policy "Public episodes are readable"
  on public.episodes
  for select
  using (is_public = true);

create policy "Users can read their own episodes"
  on public.episodes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own episodes"
  on public.episodes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own episodes"
  on public.episodes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
