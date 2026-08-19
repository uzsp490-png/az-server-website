drop policy if exists "admin can delete ticket" on public.az_support_tickets;

create policy "admin can delete ticket"
on public.az_support_tickets
for delete
to authenticated
using ((select public.az_is_admin()));

grant delete on public.az_support_tickets to authenticated;
