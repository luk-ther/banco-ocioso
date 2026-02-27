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

create table if not exists public.social_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users (id) on delete cascade,
  followed_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint social_follows_no_self_follow check (follower_id <> followed_id),
  constraint social_follows_unique unique (follower_id, followed_id)
);

create table if not exists public.social_friend_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'canceled', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint social_friend_requests_no_self check (requester_id <> addressee_id)
);

create table if not exists public.social_friendships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users (id) on delete cascade,
  user_b uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint social_friendships_no_self check (user_a <> user_b),
  constraint social_friendships_canonical_pair check (user_a < user_b),
  constraint social_friendships_unique unique (user_a, user_b)
);

create table if not exists public.social_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1200),
  created_at timestamptz not null default now(),
  constraint social_messages_no_self check (sender_id <> receiver_id)
);

alter table public.user_profiles add column if not exists avatar_url text not null default '';

alter table public.vaults enable row level security;
alter table public.user_profiles enable row level security;
alter table public.social_follows enable row level security;
alter table public.social_friend_requests enable row level security;
alter table public.social_friendships enable row level security;
alter table public.social_messages enable row level security;

drop policy if exists "vaults_select_own" on public.vaults;
drop policy if exists "vaults_insert_own" on public.vaults;
drop policy if exists "vaults_update_own" on public.vaults;
drop policy if exists "vaults_delete_own" on public.vaults;

drop policy if exists "user_profiles_select_public" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
drop policy if exists "user_profiles_delete_own" on public.user_profiles;

drop policy if exists "social_follows_select_public" on public.social_follows;
drop policy if exists "social_follows_insert_own" on public.social_follows;
drop policy if exists "social_follows_delete_own" on public.social_follows;

drop policy if exists "social_friend_requests_select_related" on public.social_friend_requests;
drop policy if exists "social_friend_requests_insert_own" on public.social_friend_requests;
drop policy if exists "social_friend_requests_update_related" on public.social_friend_requests;

drop policy if exists "social_friendships_select_public" on public.social_friendships;
drop policy if exists "social_friendships_insert_related" on public.social_friendships;
drop policy if exists "social_friendships_delete_related" on public.social_friendships;

drop policy if exists "social_messages_select_related" on public.social_messages;
drop policy if exists "social_messages_insert_related" on public.social_messages;

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

create policy "social_follows_select_public"
on public.social_follows
for select
using (true);

create policy "social_follows_insert_own"
on public.social_follows
for insert
with check (
  auth.uid() = follower_id
  and follower_id <> followed_id
);

create policy "social_follows_delete_own"
on public.social_follows
for delete
using (auth.uid() = follower_id);

create policy "social_friend_requests_select_related"
on public.social_friend_requests
for select
using (
  auth.uid() = requester_id
  or auth.uid() = addressee_id
);

create policy "social_friend_requests_insert_own"
on public.social_friend_requests
for insert
with check (
  auth.uid() = requester_id
  and requester_id <> addressee_id
  and status = 'pending'
);

create policy "social_friend_requests_update_related"
on public.social_friend_requests
for update
using (
  status = 'pending'
  and (
    auth.uid() = requester_id
    or auth.uid() = addressee_id
  )
)
with check (
  requester_id <> addressee_id
  and (
    (auth.uid() = requester_id and status in ('pending', 'canceled'))
    or
    (auth.uid() = addressee_id and status in ('pending', 'accepted', 'rejected'))
  )
);

create policy "social_friendships_select_public"
on public.social_friendships
for select
using (true);

create policy "social_friendships_insert_related"
on public.social_friendships
for insert
with check (
  (auth.uid() = user_a or auth.uid() = user_b)
  and user_a < user_b
  and exists (
    select 1
    from public.social_friend_requests fr
    where fr.status = 'accepted'
      and (
        (fr.requester_id = user_a and fr.addressee_id = user_b)
        or
        (fr.requester_id = user_b and fr.addressee_id = user_a)
      )
  )
);

create policy "social_friendships_delete_related"
on public.social_friendships
for delete
using (
  auth.uid() = user_a
  or auth.uid() = user_b
);

create policy "social_messages_select_related"
on public.social_messages
for select
using (
  auth.uid() = sender_id
  or auth.uid() = receiver_id
);

create policy "social_messages_insert_related"
on public.social_messages
for insert
with check (
  auth.uid() = sender_id
  and sender_id <> receiver_id
  and exists (
    select 1
    from public.social_friendships f
    where
      (f.user_a = sender_id and f.user_b = receiver_id)
      or
      (f.user_a = receiver_id and f.user_b = sender_id)
  )
);

create index if not exists vaults_user_id_updated_at_idx
on public.vaults (user_id, updated_at desc);

create index if not exists user_profiles_goals_completed_idx
on public.user_profiles (goals_completed desc, updated_at asc);

create index if not exists social_follows_followed_id_idx
on public.social_follows (followed_id, created_at desc);

create index if not exists social_follows_follower_id_idx
on public.social_follows (follower_id, created_at desc);

create unique index if not exists social_friend_requests_pending_unique
on public.social_friend_requests (requester_id, addressee_id)
where status = 'pending';

create index if not exists social_friend_requests_addressee_status_idx
on public.social_friend_requests (addressee_id, status, updated_at desc);

create index if not exists social_friend_requests_requester_status_idx
on public.social_friend_requests (requester_id, status, updated_at desc);

create index if not exists social_friendships_user_a_idx
on public.social_friendships (user_a, created_at desc);

create index if not exists social_friendships_user_b_idx
on public.social_friendships (user_b, created_at desc);

create index if not exists social_messages_sender_receiver_created_idx
on public.social_messages (sender_id, receiver_id, created_at desc);

create index if not exists social_messages_receiver_sender_created_idx
on public.social_messages (receiver_id, sender_id, created_at desc);
