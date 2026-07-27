drop table if exists public.deletion_requests;

create table if not exists public.change_requests (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
target_type text not null check (target_type in ('student', 'user')),
target_id uuid not null,
target_label text not null,
action_type text not null check (action_type in ('update', 'delete')),
payload jsonb,
reason text,
status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
requested_by uuid not null references public.users(id),
resolved_by uuid references public.users(id),
resolved_at timestamptz,
created_at timestamptz not null default now()
);

alter table public.change_requests enable row level security;

create policy "change_requests_select" on public.change_requests
for select to authenticated
using (
school_id = public.current_school_id()
and (requested_by = auth.uid() or public.current_role_slug() = 'directeur')
);

create policy "change_requests_insert" on public.change_requests
for insert to authenticated
with check (
school_id = public.current_school_id()
and (public.has_permission('students.edit') or public.has_permission('users.manage'))
);

create policy "change_requests_update" on public.change_requests
for update to authenticated
using (school_id = public.current_school_id() and public.current_role_slug() = 'directeur');

create policy "users_delete" on public.users
for delete to authenticated
using (
school_id = public.current_school_id()
and public.has_permission('users.manage')
and id != auth.uid()
);
