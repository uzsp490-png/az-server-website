-- ============================================================
-- AshZone V7.4 玩家頭像 + 文字可讀性版
-- 請整段貼到 Supabase SQL Editor 執行一次
-- 不會刪除既有玩家、工單、通知或管理員資料
-- ============================================================

-- 玩家資料新增頭像欄位
alter table public.az_player_profiles
  add column if not exists avatar_url text,
  add column if not exists avatar_path text;

-- 建立公開頭像 bucket（2MB；JPG/PNG/WEBP）
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'az-avatars',
  'az-avatars',
  true,
  2097152,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 玩家可讀公開頭像
drop policy if exists "az avatar public read" on storage.objects;
create policy "az avatar public read"
on storage.objects
for select
to public
using (bucket_id = 'az-avatars');

-- 玩家只能上傳到自己的資料夾：<uid>/...
drop policy if exists "az avatar upload own" on storage.objects;
create policy "az avatar upload own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'az-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- 玩家只能更新自己的頭像檔
drop policy if exists "az avatar update own" on storage.objects;
create policy "az avatar update own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'az-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'az-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- 玩家只能刪除自己的頭像檔
drop policy if exists "az avatar delete own" on storage.objects;
create policy "az avatar delete own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'az-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- profile 既有 RLS 已允許玩家 update 自己資料
grant select, update on public.az_player_profiles to authenticated;

-- ============================================================
-- 完成後：
-- 玩家中心可自行上傳 / 更換 / 移除頭像
-- ============================================================
