-- Execute este script no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.vaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vaults enable row level security;

drop policy if exists "vaults_select_own" on public.vaults;
drop policy if exists "vaults_insert_own" on public.vaults;
drop policy if exists "vaults_update_own" on public.vaults;
drop policy if exists "vaults_delete_own" on public.vaults;

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

create index if not exists vaults_user_id_updated_at_idx
on public.vaults (user_id, updated_at desc);
