-- ============================================================
-- AshZone V7.0 玩家帳號中心
-- 請整段貼到 Supabase SQL Editor 執行一次
-- 不會刪除既有客服工單 / 管理員 / 回覆資料
-- ============================================================

create table if not exists public.az_player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  steam_id text,
  account_status text not null default '正常',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists az_player_profiles_steam_id_idx
  on public.az_player_profiles(steam_id);

create or replace function public.az_profile_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists az_player_profiles_touch on public.az_player_profiles;
create trigger az_player_profiles_touch
before update on public.az_player_profiles
for each row execute function public.az_profile_touch_updated_at();

-- 新 Auth 使用者自動建立玩家資料
create or replace function public.az_create_player_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.az_player_profiles (user_id, display_name)
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data->>'display_name',''), '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists az_on_auth_user_created on auth.users;
create trigger az_on_auth_user_created
after insert on auth.users
for each row execute function public.az_create_player_profile();

-- 幫已存在的 Auth 帳號補 profile（包含你目前管理員與舊匿名 session）
insert into public.az_player_profiles (user_id, display_name)
select
  u.id,
  nullif(coalesce(u.raw_user_meta_data->>'display_name',''), '')
from auth.users u
on conflict (user_id) do nothing;

alter table public.az_player_profiles enable row level security;

drop policy if exists "player can read own profile" on public.az_player_profiles;
create policy "player can read own profile"
on public.az_player_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "player can update own profile" on public.az_player_profiles;
create policy "player can update own profile"
on public.az_player_profiles
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "admin can read player profiles" on public.az_player_profiles;
create policy "admin can read player profiles"
on public.az_player_profiles
for select
to authenticated
using ((select public.az_is_admin()));

revoke all on public.az_player_profiles from anon, authenticated;
grant select, update on public.az_player_profiles to authenticated;

-- ============================================================
-- 完成後即可使用：
-- register.html       玩家註冊
-- login.html          玩家登入
-- account.html        玩家中心
-- forgot-password.html 忘記密碼
-- reset-password.html  重設密碼
-- ============================================================
