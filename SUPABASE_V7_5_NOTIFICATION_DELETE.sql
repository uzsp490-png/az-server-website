-- ============================================================
-- AshZone V7.5 玩家通知刪除權限
-- 請整段貼到 Supabase SQL Editor 執行一次
-- 不會刪除任何既有通知，只新增玩家刪除自己通知的權限
-- ============================================================

drop policy if exists "player can delete own notifications"
on public.az_player_notifications;

create policy "player can delete own notifications"
on public.az_player_notifications
for delete
to authenticated
using (user_id = (select auth.uid()));

grant delete on public.az_player_notifications to authenticated;

-- 完成後玩家可以：
-- 1. 刪除單則通知
-- 2. 清除所有已讀通知
