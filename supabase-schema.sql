-- Execute este script no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.vaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  theme_key text not null default 'neon' check (theme_key in ('neon', 'ocean', 'sunset', 'graphite')),
  accent_color text not null default '#0ce0ff' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  name_font text not null default 'sora' check (name_font in ('sora', 'manrope', 'space', 'poppins')),
  decoration text not null default 'glow' check (decoration in ('glow', 'ring', 'spark')),
  avatar_url text not null default '',
  goals_completed integer not null default 0 check (goals_completed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles add column if not exists avatar_url text not null default '';

alter table public.vaults enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "vaults_select_own" on public.vaults;
drop policy if exists "vaults_insert_own" on public.vaults;
drop policy if exists "vaults_update_own" on public.vaults;
drop policy if exists "vaults_delete_own" on public.vaults;
drop policy if exists "user_profiles_select_public" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
drop policy if exists "user_profiles_delete_own" on public.user_profiles;

create policy "vaults_select_own"
on public.vaults
for select
using (auth.uid() = user_id);

create policy "vaults_insert_own"
on public.vaults
for insert
with check (auth.uid() = user_id);

create policy "vaults_update_own"
on public.vaults
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "vaults_delete_own"
on public.vaults
for delete
using (auth.uid() = user_id);

create policy "user_profiles_select_public"
on public.user_profiles
for select
using (true);

create policy "user_profiles_insert_own"
on public.user_profiles
for insert
with check (auth.uid() = user_id);

create policy "user_profiles_update_own"
on public.user_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_profiles_delete_own"
on public.user_profiles
for delete
using (auth.uid() = user_id);

create index if not exists vaults_user_id_updated_at_idx
on public.vaults (user_id, updated_at desc);

create index if not exists user_profiles_goals_completed_idx
on public.user_profiles (goals_completed desc, updated_at asc);
