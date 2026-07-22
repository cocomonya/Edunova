create or replace function public.current_school_id()
returns uuid
language sql
stable
as $$
select (auth.jwt() ->> 'school_id')::uuid;
$$;

create or replace function public.current_role_slug()
returns text
language sql
stable
as $$
select auth.jwt() ->> 'app_role';
$$;

create or replace function public.has_permission(perm text)
returns boolean
language sql
stable
as $$
select coalesce((auth.jwt() -> 'permissions') ? perm, false);
$$;

alter table public.schools enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.users enable row level security;

create policy "auth_admin_read_users" on public.users for select to supabase_auth_admin using (true);
create policy "auth_admin_read_roles" on public.roles for select to supabase_auth_admin using (true);
create policy "auth_admin_read_permissions" on public.permissions for select to supabase_auth_admin using (true);
create policy "auth_admin_read_role_permissions" on public.role_permissions for select to supabase_auth_admin using (true);

create policy "users_select_own_school" on public.users
for select to authenticated
using (school_id = public.current_school_id());

create policy "users_update_managers" on public.users
for update to authenticated
using (school_id = public.current_school_id() and public.has_permission('users.manage'));

create policy "schools_select_own" on public.schools
for select to authenticated
using (id = public.current_school_id());

create policy "roles_select_all" on public.roles
for select to authenticated
using (true);

create policy "permissions_select_all" on public.permissions
for select to authenticated
using (true);

create policy "role_permissions_select_all" on public.role_permissions
for select to authenticated
using (true);
