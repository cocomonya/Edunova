create table if not exists public.academic_years (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
label text not null,
start_date date not null,
end_date date not null,
is_current boolean not null default false,
created_at timestamptz not null default now()
);

create unique index if not exists one_current_academic_year_per_school
on public.academic_years(school_id) where (is_current = true);

create table if not exists public.classes (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
academic_year_id uuid not null references public.academic_years(id) on delete cascade,
name text not null,
niveau text not null,
created_at timestamptz not null default now()
);

create table if not exists public.students (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
matricule text not null,
first_name text not null,
last_name text not null,
date_naissance date,
lieu_naissance text,
adresse text,
acte_naissance_numero text,
guardian_name text,
guardian_phone text,
photo_url text,
status text not null default 'actif' check (status in ('actif','inactif','transfere')),
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create unique index if not exists unique_matricule_per_school on public.students(school_id, matricule);

create table if not exists public.enrollments (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
student_id uuid not null references public.students(id) on delete cascade,
class_id uuid not null references public.classes(id) on delete cascade,
academic_year_id uuid not null references public.academic_years(id) on delete cascade,
date_inscription date not null default current_date,
status text not null default 'active',
created_at timestamptz not null default now(),
unique (student_id, academic_year_id)
);

create or replace function public.generate_matricule()
returns trigger
language plpgsql
as $$
declare
v_prefix text;
v_year text;
v_seq int;
begin
select upper(left(slug, 3)) into v_prefix from public.schools where id = new.school_id;
v_year := extract(year from now())::text;

select coalesce(max(cast(split_part(matricule, '-', 3) as int)), 0) + 1
into v_seq
from public.students
where school_id = new.school_id and matricule like v_prefix || '-' || v_year || '-%';

new.matricule := v_prefix || '-' || v_year || '-' || lpad(v_seq::text, 4, '0');
return new;
end;
$$;

drop trigger if exists trg_generate_matricule on public.students;
create trigger trg_generate_matricule
before insert on public.students
for each row
when (new.matricule is null or new.matricule = '')
execute function public.generate_matricule();

alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.enrollments enable row level security;

create policy "academic_years_select" on public.academic_years
for select to authenticated
using (school_id = public.current_school_id());

create policy "academic_years_write" on public.academic_years
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('settings.manage'));

create policy "classes_select" on public.classes
for select to authenticated
using (school_id = public.current_school_id() and (public.has_permission('students.view') or public.has_permission('grades.view')));

create policy "classes_write" on public.classes
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('students.edit'));

create policy "students_select" on public.students
for select to authenticated
using (school_id = public.current_school_id() and public.has_permission('students.view'));

create policy "students_insert" on public.students
for insert to authenticated
with check (school_id = public.current_school_id() and public.has_permission('students.edit'));

create policy "students_update" on public.students
for update to authenticated
using (school_id = public.current_school_id() and public.has_permission('students.edit'));

create policy "students_delete" on public.students
for delete to authenticated
using (school_id = public.current_school_id() and public.has_permission('students.delete'));

create policy "enrollments_select" on public.enrollments
for select to authenticated
using (school_id = public.current_school_id() and public.has_permission('students.view'));

create policy "enrollments_write" on public.enrollments
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('students.edit'));
