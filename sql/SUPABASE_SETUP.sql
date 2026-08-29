-- ============================================================
-- AshZone V6.0 Support System / Supabase setup
-- 請整段貼到 Supabase SQL Editor 執行一次
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Admin users ----------
create table if not exists public.az_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'AZ Admin',
  created_at timestamptz not null default now()
);

-- ---------- Tickets ----------
create table if not exists public.az_support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_no text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  steam_id text,
  category text not null,
  contact_type text,
  contact_value text,
  title text not null,
  message text not null,
  status text not null default '待處理'
    check (status in ('待處理','處理中','等待玩家','已完成','已關閉')),
  priority text not null default '一般'
    check (priority in ('低','一般','高','緊急')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists az_support_tickets_user_id_idx
  on public.az_support_tickets(user_id);

create index if not exists az_support_tickets_status_idx
  on public.az_support_tickets(status);

create index if not exists az_support_tickets_created_at_idx
  on public.az_support_tickets(created_at desc);

-- ---------- Replies ----------
create table if not exists public.az_support_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.az_support_tickets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_role text not null check (author_role in ('player','admin')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists az_support_replies_ticket_id_idx
  on public.az_support_replies(ticket_id, created_at);

-- ---------- Helpers ----------
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
    where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.az_is_admin() from public;
grant execute on function public.az_is_admin() to authenticated;

create or replace function public.az_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists az_support_tickets_touch on public.az_support_tickets;
create trigger az_support_tickets_touch
before update on public.az_support_tickets
for each row execute function public.az_touch_updated_at();

-- ---------- RLS ----------
alter table public.az_admin_users enable row level security;
alter table public.az_support_tickets enable row level security;
alter table public.az_support_replies enable row level security;

drop policy if exists "admin can read own admin row" on public.az_admin_users;
create policy "admin can read own admin row"
on public.az_admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "user can insert own ticket" on public.az_support_tickets;
create policy "user can insert own ticket"
on public.az_support_tickets
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "user or admin can read ticket" on public.az_support_tickets;
create policy "user or admin can read ticket"
on public.az_support_tickets
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.az_is_admin())
);

drop policy if exists "admin can update ticket" on public.az_support_tickets;
create policy "admin can update ticket"
on public.az_support_tickets
for update
to authenticated
using ((select public.az_is_admin()))
with check ((select public.az_is_admin()));

drop policy if exists "admin can delete ticket" on public.az_support_tickets;
create policy "admin can delete ticket"
on public.az_support_tickets
for delete
to authenticated
using ((select public.az_is_admin()));

drop policy if exists "user or admin can read replies" on public.az_support_replies;
create policy "user or admin can read replies"
on public.az_support_replies
for select
to authenticated
using (
  exists (
    select 1
    from public.az_support_tickets t
    where t.id = az_support_replies.ticket_id
      and (
        t.user_id = (select auth.uid())
        or (select public.az_is_admin())
      )
  )
);

drop policy if exists "user can reply own ticket" on public.az_support_replies;
create policy "user can reply own ticket"
on public.az_support_replies
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and author_role = 'player'
  and exists (
    select 1
    from public.az_support_tickets t
    where t.id = az_support_replies.ticket_id
      and t.user_id = (select auth.uid())
  )
);

drop policy if exists "admin can add admin reply" on public.az_support_replies;
create policy "admin can add admin reply"
on public.az_support_replies
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and author_role = 'admin'
  and (select public.az_is_admin())
);

-- Least-privilege API grants
revoke all on public.az_admin_users from anon, authenticated;
revoke all on public.az_support_tickets from anon, authenticated;
revoke all on public.az_support_replies from anon, authenticated;

grant select on public.az_admin_users to authenticated;
grant select, insert on public.az_support_tickets to authenticated;
grant update, delete on public.az_support_tickets to authenticated;
grant select, insert on public.az_support_replies to authenticated;

-- ============================================================
-- 建立第一個管理員：
-- 1. Supabase → Authentication → Users → Add user
-- 2. 建立管理員 Email / Password
-- 3. 把下面信箱換成你的管理員信箱，再單獨執行：
--
-- insert into public.az_admin_users (user_id, display_name)
-- select id, 'AZ 管理員'
-- from auth.users
-- where email = 'YOUR_ADMIN_EMAIL@example.com'
-- on conflict (user_id) do update
-- set display_name = excluded.display_name;
-- ============================================================
