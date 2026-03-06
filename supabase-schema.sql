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
  theme_key text not null default 'neon' check (theme_key in ('neon', 'ocean', 'sunset', 'graphite', 'aurora', 'midnight', 'ember', 'forest', 'royal', 'ruby', 'ice', 'sand', 'violet', 'carbon', 'linithy')),
  accent_color text not null default '#0ce0ff' check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  name_font text not null default 'sora' check (name_font in ('sora', 'manrope', 'space', 'poppins', 'montserrat', 'nunito', 'raleway', 'oswald', 'lora', 'merriweather', 'playfair', 'fira', 'dmsans', 'bebas')),
  decoration text not null default 'glow' check (decoration in ('glow', 'ring', 'spark', 'pulse', 'grid', 'stars', 'stripes', 'dots')),
  presence_status text not null default 'online' check (presence_status in ('online', 'dnd', 'away', 'offline')),
  last_seen_at timestamptz not null default now(),
  is_verified boolean not null default false,
  owned_badges text[] not null default array['first_users'],
  equipped_badges text[] not null default array['first_users'],
  allow_friend_requests boolean not null default true,
  allow_followers boolean not null default true,
  show_in_ranking boolean not null default true,
  bio text not null default '' check (char_length(bio) <= 180),
  avatar_url text not null default '',
  banner_url text not null default '' check (char_length(banner_url) <= 560000),
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
alter table public.user_profiles add column if not exists bio text not null default '';
alter table public.user_profiles add column if not exists banner_url text not null default '';
alter table public.user_profiles add column if not exists presence_status text not null default 'online';
alter table public.user_profiles add column if not exists last_seen_at timestamptz not null default now();
alter table public.user_profiles add column if not exists is_verified boolean not null default false;
alter table public.user_profiles add column if not exists owned_badges text[] not null default array['first_users'];
alter table public.user_profiles add column if not exists equipped_badges text[] not null default array['first_users'];
alter table public.user_profiles add column if not exists allow_friend_requests boolean not null default true;
alter table public.user_profiles add column if not exists allow_followers boolean not null default true;
alter table public.user_profiles add column if not exists show_in_ranking boolean not null default true;

alter table public.user_profiles drop constraint if exists user_profiles_theme_key_check;
alter table public.user_profiles add constraint user_profiles_theme_key_check
check (theme_key in ('neon', 'ocean', 'sunset', 'graphite', 'aurora', 'midnight', 'ember', 'forest', 'royal', 'ruby', 'ice', 'sand', 'violet', 'carbon', 'linithy'));

alter table public.user_profiles drop constraint if exists user_profiles_name_font_check;
alter table public.user_profiles add constraint user_profiles_name_font_check
check (name_font in ('sora', 'manrope', 'space', 'poppins', 'montserrat', 'nunito', 'raleway', 'oswald', 'lora', 'merriweather', 'playfair', 'fira', 'dmsans', 'bebas'));

alter table public.user_profiles drop constraint if exists user_profiles_decoration_check;
alter table public.user_profiles add constraint user_profiles_decoration_check
check (decoration in ('glow', 'ring', 'spark', 'pulse', 'grid', 'stars', 'stripes', 'dots'));

alter table public.user_profiles drop constraint if exists user_profiles_presence_status_check;
update public.user_profiles
set presence_status = 'offline'
where coalesce(presence_status, '') not in ('online', 'dnd', 'away', 'offline');
alter table public.user_profiles add constraint user_profiles_presence_status_check
check (presence_status in ('online', 'dnd', 'away', 'offline'));

alter table public.user_profiles drop constraint if exists user_profiles_bio_check;
alter table public.user_profiles add constraint user_profiles_bio_check
check (char_length(bio) <= 180);

alter table public.user_profiles drop constraint if exists user_profiles_banner_url_check;
alter table public.user_profiles add constraint user_profiles_banner_url_check
check (char_length(banner_url) <= 560000);

create or replace function public.unique_text_array(items text[])
returns text[]
language sql
immutable
as $$
  select coalesce(array_agg(distinct item order by item), array[]::text[])
  from unnest(coalesce(items, array[]::text[])) as item
  where nullif(trim(item), '') is not null
$$;

create or replace function public.sync_user_profile_verified_badge()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  has_verified_email boolean;
  was_verified boolean;
begin
  select exists (
    select 1
    from auth.users au
    where au.id = new.user_id
      and lower(coalesce(au.email, '')) = 'luktheer@gmail.com'
  )
  into has_verified_email;

  was_verified := case
    when tg_op = 'UPDATE' then coalesce(old.is_verified, false)
    else false
  end;

  new.owned_badges := public.unique_text_array(array_append(coalesce(new.owned_badges, array[]::text[]), 'first_users'));
  new.is_verified := was_verified or has_verified_email;

  if new.is_verified then
    new.owned_badges := public.unique_text_array(array_append(new.owned_badges, 'verified'));
  end if;

  new.equipped_badges := public.unique_text_array(
    array(
      select badge
      from unnest(coalesce(new.equipped_badges, array[]::text[])) as badge
      where badge = any(new.owned_badges)
    )
  );

  if coalesce(array_length(new.equipped_badges, 1), 0) = 0 then
    new.equipped_badges := array['first_users'];
  end if;

  return new;
end;
$$;

drop trigger if exists user_profiles_sync_verified_badge on public.user_profiles;
create trigger user_profiles_sync_verified_badge
before insert or update on public.user_profiles
for each row execute function public.sync_user_profile_verified_badge();

update public.user_profiles up
set is_verified = true
where exists (
  select 1
  from auth.users au
  where au.id = up.user_id
    and lower(coalesce(au.email, '')) = 'luktheer@gmail.com'
);

update public.user_profiles
set owned_badges = public.unique_text_array(array_append(coalesce(owned_badges, array[]::text[]), 'first_users'));

update public.user_profiles up
set owned_badges = public.unique_text_array(array_append(coalesce(up.owned_badges, array[]::text[]), 'verified')),
    is_verified = true
where exists (
  select 1
  from auth.users au
  where au.id = up.user_id
    and lower(coalesce(au.email, '')) = 'luktheer@gmail.com'
);

update public.user_profiles
set equipped_badges = case
  when coalesce(array_length(filtered.badges, 1), 0) = 0 then array['first_users']
  else filtered.badges
end
from (
  select
    up.user_id,
    public.unique_text_array(
      array(
        select badge
        from unnest(coalesce(up.equipped_badges, array[]::text[])) as badge
        where badge = any(coalesce(up.owned_badges, array[]::text[]))
      )
    ) as badges
  from public.user_profiles up
) as filtered
where filtered.user_id = public.user_profiles.user_id;

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
  and coalesce(
    (
      select up.allow_followers
      from public.user_profiles up
      where up.user_id = followed_id
    ),
    true
  )
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
  and coalesce(
    (
      select up.allow_friend_requests
      from public.user_profiles up
      where up.user_id = addressee_id
    ),
    true
  )
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

create index if not exists user_profiles_ranking_visibility_idx
on public.user_profiles (show_in_ranking, goals_completed desc, updated_at asc);

create index if not exists user_profiles_presence_last_seen_idx
on public.user_profiles (presence_status, last_seen_at desc);

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
