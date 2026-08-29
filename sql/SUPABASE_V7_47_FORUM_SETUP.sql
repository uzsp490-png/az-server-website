-- ============================================================
-- AshZone V7.47 玩家討論區
-- 在 Supabase SQL Editor 執行一次
-- 需要既有 az_admin_users / az_is_admin() / Auth 玩家帳號系統
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.az_forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  category text not null check (category in ('綜合討論','遊戲攻略','交易交流','問題求助','意見建議','隊伍招募')),
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 5000),
  reply_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.az_forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.az_forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists az_forum_posts_created_idx on public.az_forum_posts(created_at desc);
create index if not exists az_forum_posts_category_idx on public.az_forum_posts(category, created_at desc);
create index if not exists az_forum_replies_post_idx on public.az_forum_replies(post_id, created_at);

create or replace function public.az_forum_touch_updated_at()
returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end; $$;

drop trigger if exists az_forum_posts_touch on public.az_forum_posts;
create trigger az_forum_posts_touch before update on public.az_forum_posts for each row execute function public.az_forum_touch_updated_at();
drop trigger if exists az_forum_replies_touch on public.az_forum_replies;
create trigger az_forum_replies_touch before update on public.az_forum_replies for each row execute function public.az_forum_touch_updated_at();

create or replace function public.az_forum_refresh_reply_count(p_post_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'login required'; end if;
  update public.az_forum_posts p set reply_count=(select count(*) from public.az_forum_replies r where r.post_id=p_post_id) where p.id=p_post_id;
end; $$;
revoke all on function public.az_forum_refresh_reply_count(uuid) from public;
grant execute on function public.az_forum_refresh_reply_count(uuid) to authenticated;

-- 保證只有本人可以改文章內容；管理員可以刪除違規文章
alter table public.az_forum_posts enable row level security;
alter table public.az_forum_replies enable row level security;

-- 未登入完全不可讀
revoke all on public.az_forum_posts from anon;
revoke all on public.az_forum_replies from anon;
grant select,insert,update,delete on public.az_forum_posts to authenticated;
grant select,insert,update,delete on public.az_forum_replies to authenticated;

-- Posts
 drop policy if exists "forum posts authenticated read" on public.az_forum_posts;
create policy "forum posts authenticated read" on public.az_forum_posts for select to authenticated using (true);
 drop policy if exists "forum posts insert own" on public.az_forum_posts;
create policy "forum posts insert own" on public.az_forum_posts for insert to authenticated with check (user_id=(select auth.uid()));
 drop policy if exists "forum posts update own" on public.az_forum_posts;
create policy "forum posts update own" on public.az_forum_posts for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
 drop policy if exists "forum posts delete own or admin" on public.az_forum_posts;
create policy "forum posts delete own or admin" on public.az_forum_posts for delete to authenticated using (user_id=(select auth.uid()) or (select public.az_is_admin()));

-- Replies
 drop policy if exists "forum replies authenticated read" on public.az_forum_replies;
create policy "forum replies authenticated read" on public.az_forum_replies for select to authenticated using (true);
 drop policy if exists "forum replies insert own" on public.az_forum_replies;
create policy "forum replies insert own" on public.az_forum_replies for insert to authenticated with check (user_id=(select auth.uid()));
 drop policy if exists "forum replies update own" on public.az_forum_replies;
create policy "forum replies update own" on public.az_forum_replies for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
 drop policy if exists "forum replies delete own or admin" on public.az_forum_replies;
create policy "forum replies delete own or admin" on public.az_forum_replies for delete to authenticated using (user_id=(select auth.uid()) or (select public.az_is_admin()));

-- 完成後：未登入使用者無法讀取討論資料；登入玩家可發文/回覆/管理自己的內容；管理員可刪除違規內容。
