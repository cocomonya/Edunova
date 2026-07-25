create policy "users_update_self" on public.users
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());
