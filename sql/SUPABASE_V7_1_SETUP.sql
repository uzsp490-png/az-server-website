-- ============================================================
-- AshZone V7.1 玩家中心強化 / 通知 / 帳號安全 / 玩家管理
-- 直接整段貼到 Supabase SQL Editor 執行一次
-- 不會刪除既有玩家、客服工單、管理員或回覆資料
-- ============================================================

-- 1) 玩家 Profile 增加最近活動欄位
alter table public.az_player_profiles
  add column if not exists last_seen_at timestamptz;

-- 2) 玩家通知
create table if not exists public.az_player_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system'
    check (type in ('system','support','event','account')),
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists az_player_notifications_user_idx
  on public.az_player_notifications(user_id, created_at desc);

create index if not exists az_player_notifications_unread_idx
  on public.az_player_notifications(user_id, is_read);

alter table public.az_player_notifications enable row level security;

drop policy if exists "player can read own notifications" on public.az_player_notifications;
create policy "player can read own notifications"
on public.az_player_notifications
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "player can update own notifications" on public.az_player_notifications;
create policy "player can update own notifications"
on public.az_player_notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "admin can read notifications" on public.az_player_notifications;
create policy "admin can read notifications"
on public.az_player_notifications
for select
to authenticated
using ((select public.az_is_admin()));

drop policy if exists "admin can insert notifications" on public.az_player_notifications;
create policy "admin can insert notifications"
on public.az_player_notifications
for insert
to authenticated
with check ((select public.az_is_admin()));

drop policy if exists "admin can delete notifications" on public.az_player_notifications;
create policy "admin can delete notifications"
on public.az_player_notifications
for delete
to authenticated
using ((select public.az_is_admin()));

revoke all on public.az_player_notifications from anon, authenticated;
grant select, update, insert, delete on public.az_player_notifications to authenticated;

-- 3) 管理員可以更新玩家 Profile 狀態
drop policy if exists "admin can update player profiles" on public.az_player_profiles;
create policy "admin can update player profiles"
on public.az_player_profiles
for update
to authenticated
using ((select public.az_is_admin()))
with check ((select public.az_is_admin()));

-- 4) 允許 authenticated 使用既有 profile 權限
grant select, update on public.az_player_profiles to authenticated;

-- 5) 建立客服回覆通知 trigger：
--    AZ 客服回覆玩家工單時，自動建立一則未讀通知
create or replace function public.az_notify_support_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
  ticket_number text;
begin
  if new.author_role <> 'admin' then
    return new;
  end if;

  select t.user_id, t.ticket_no
    into target_user, ticket_number
  from public.az_support_tickets t
  where t.id = new.ticket_id;

  if target_user is not null then
    insert into public.az_player_notifications (
      user_id, type, title, message, link
    ) values (
      target_user,
      'support',
      '客服工單有新回覆',
      '工單 ' || coalesce(ticket_number,'') || ' 收到 AshZone 客服新回覆。',
      'account.html?tab=tickets'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists az_support_reply_notification on public.az_support_replies;
create trigger az_support_reply_notification
after insert on public.az_support_replies
for each row execute function public.az_notify_support_reply();

-- ============================================================
-- V7.1 完成後功能：
-- 玩家中心：
--  - 通知中心 / 未讀數
--  - 修改密碼
--  - 登出所有裝置
--  - 最近活動時間
--
-- 管理員後台：
--  - 玩家管理
--  - 搜尋 Email / 顯示名稱 / Steam ID
--  - 帳號狀態：正常 / 限制 / 停權
--  - 對指定玩家發網站通知
-- ============================================================
