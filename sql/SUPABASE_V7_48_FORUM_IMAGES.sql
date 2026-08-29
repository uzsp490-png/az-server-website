-- ============================================================
-- AshZone V7.48 玩家討論區圖片上傳
-- 在 Supabase SQL Editor 執行一次
-- 可直接接在 V7.47 討論區之後執行
-- ============================================================

-- 文章 / 回覆增加圖片路徑
alter table public.az_forum_posts
  add column if not exists image_paths text[] not null default '{}'::text[];

alter table public.az_forum_replies
  add column if not exists image_paths text[] not null default '{}'::text[];

-- 私人 Storage bucket：圖片不公開列出，網站登入後才取得臨時 signed URL
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'az-forum-images',
  'az-forum-images',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies
drop policy if exists "forum images authenticated read" on storage.objects;
create policy "forum images authenticated read"
on storage.objects for select
to authenticated
using (bucket_id = 'az-forum-images');

drop policy if exists "forum images upload own folder" on storage.objects;
create policy "forum images upload own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'az-forum-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "forum images update own folder" on storage.objects;
create policy "forum images update own folder"
on storage.objects for update
to authenticated
using (
  bucket_id = 'az-forum-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'az-forum-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "forum images delete own or admin" on storage.objects;
create policy "forum images delete own or admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'az-forum-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select public.az_is_admin())
  )
);

-- 完成：
-- 文章最多 5 張、回覆最多 3 張由前端限制
-- Supabase Storage 單張硬上限 5MB
-- 格式限制 JPG / PNG / WebP
-- bucket 為 private，未登入玩家不能直接列出圖片
