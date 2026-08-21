-- ============================================================
-- AshZone V7.12 - 玩家伺服器規章確認
-- 在 Supabase SQL Editor 執行一次
-- ============================================================

create or replace function public.az_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.az_admin_users a
    where a.user_id = auth.uid()
  );
$$;

create table if not exists public.az_rules_acceptance (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rules_version text not null,
  accepted_at timestamptz not null default now()
);

alter table public.az_rules_acceptance enable row level security;

drop policy if exists "rules_select_own_or_admin" on public.az_rules_acceptance;
create policy "rules_select_own_or_admin"
on public.az_rules_acceptance
for select
to authenticated
using (
  user_id = auth.uid()
  or public.az_is_admin()
);

drop policy if exists "rules_insert_own" on public.az_rules_acceptance;
create policy "rules_insert_own"
on public.az_rules_acceptance
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "rules_update_own" on public.az_rules_acceptance;
create policy "rules_update_own"
on public.az_rules_acceptance
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update on public.az_rules_acceptance to authenticated;

-- 目前規章版本由網站 js/rules-config.js 控制：
-- 2026.08-v1
--
-- 未來更新規章時，例如改成 2026.09-v2，
-- 只要修改 rules-config.js 的 version，
-- 已登入玩家就會重新被要求確認新版規章。
