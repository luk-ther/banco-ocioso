-- Execute este script no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.vaults (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'basic_monthly', 'annual', 'fixed')),
  extra_vaults integer not null default 0 check (extra_vaults >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_plans
drop constraint if exists user_plans_plan_tier_check;

alter table public.user_plans
add constraint user_plans_plan_tier_check
check (plan_tier in ('free', 'basic_monthly', 'annual', 'fixed'));

alter table public.vaults enable row level security;
alter table public.user_plans enable row level security;

drop policy if exists "vaults_select_own" on public.vaults;
drop policy if exists "vaults_insert_own" on public.vaults;
drop policy if exists "vaults_update_own" on public.vaults;
drop policy if exists "vaults_delete_own" on public.vaults;

drop policy if exists "user_plans_select_own" on public.user_plans;
drop policy if exists "user_plans_insert_own" on public.user_plans;
drop policy if exists "user_plans_update_own" on public.user_plans;

create policy "vaults_select_own"
on public.vaults
for select
using (auth.uid() = user_id);

create policy "vaults_insert_own"
on public.vaults
for insert
with check (
  auth.uid() = user_id
  and (
    coalesce(
      (
        select up.plan_tier
        from public.user_plans up
        where up.user_id = auth.uid()
      ),
      'free'
    ) in ('basic_monthly', 'annual', 'fixed')
    or
    (
      select count(*)
      from public.vaults v
      where v.user_id = auth.uid()
    ) < (
      3 + coalesce(
        (
          select up.extra_vaults
          from public.user_plans up
          where up.user_id = auth.uid()
        ),
        0
      )
    )
  )
);

create policy "vaults_update_own"
on public.vaults
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "vaults_delete_own"
on public.vaults
for delete
using (auth.uid() = user_id);

create policy "user_plans_select_own"
on public.user_plans
for select
using (auth.uid() = user_id);

create policy "user_plans_insert_own"
on public.user_plans
for insert
with check (auth.uid() = user_id);

create policy "user_plans_update_own"
on public.user_plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists vaults_user_id_updated_at_idx
on public.vaults (user_id, updated_at desc);

create index if not exists user_plans_updated_at_idx
on public.user_plans (updated_at desc);
