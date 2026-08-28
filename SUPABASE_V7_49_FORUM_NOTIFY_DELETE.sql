-- ============================================================
-- AshZone V7.49 討論區回覆通知 + 刪除權限
-- 在 Supabase SQL Editor 執行一次
-- 需要 V7.47 + V7.48 已建立
-- ============================================================

-- 讓通知中心支援 forum 類型
alter table public.az_player_notifications
  drop constraint if exists az_player_notifications_type_check;

alter table public.az_player_notifications
  add constraint az_player_notifications_type_check
  check (type in ('system','support','forum','event','account'));

-- 發文者本人 / 管理員刪除權限已由既有 RLS 支援。
-- 重新建立，確保目前資料庫一定正確。
drop policy if exists "forum posts delete own or admin" on public.az_forum_posts;
create policy "forum posts delete own or admin"
on public.az_forum_posts
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (select public.az_is_admin())
);

drop policy if exists "forum replies delete own or admin" on public.az_forum_replies;
create policy "forum replies delete own or admin"
on public.az_forum_replies
for delete to authenticated
using (
  user_id = (select auth.uid())
  or (select public.az_is_admin())
);

-- 有其他玩家回覆主題時，自動通知原發文者。
create or replace function public.az_notify_forum_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
  post_title text;
begin
  select p.user_id, p.title
    into target_user, post_title
  from public.az_forum_posts p
  where p.id = new.post_id;

  -- 自己回自己不通知
  if target_user is null or target_user = new.user_id then
    return new;
  end if;

  insert into public.az_player_notifications(
    user_id, type, title, message, link
  ) values (
    target_user,
    'forum',
    '你的討論主題有新回覆',
    coalesce(new.author_name,'玩家') || ' 回覆了「' || left(coalesce(post_title,'討論主題'),60) || '」。',
    'forum.html?post=' || new.post_id::text
  );

  return new;
end;
$$;

drop trigger if exists az_forum_reply_notification on public.az_forum_replies;
create trigger az_forum_reply_notification
after insert on public.az_forum_replies
for each row execute function public.az_notify_forum_reply();

-- 完成：
-- 1. 別人回覆你的主題 -> 玩家中心 / 導覽列出現未讀通知
-- 2. 點通知 -> 直接打開該討論主題
-- 3. 發文者可刪自己的文章
-- 4. 回覆者可刪自己的回覆
-- 5. 管理員可刪任何文章 / 回覆
