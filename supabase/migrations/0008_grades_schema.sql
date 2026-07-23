create table if not exists public.subjects (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
name text not null,
code text,
created_at timestamptz not null default now(),
unique (school_id, name)
);

create table if not exists public.teacher_assignments (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
teacher_id uuid not null references public.users(id) on delete cascade,
class_id uuid not null references public.classes(id) on delete cascade,
subject_id uuid not null references public.subjects(id) on delete cascade,
academic_year_id uuid not null references public.academic_years(id) on delete cascade,
created_at timestamptz not null default now(),
unique (teacher_id, class_id, subject_id, academic_year_id)
);

create table if not exists public.evaluations (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
class_id uuid not null references public.classes(id) on delete cascade,
subject_id uuid not null references public.subjects(id) on delete cascade,
academic_year_id uuid not null references public.academic_years(id) on delete cascade,
title text not null,
type text not null default 'devoir' check (type in ('interrogation','devoir','examen')),
date_evaluation date not null default current_date,
max_score numeric not null default 20,
coefficient numeric not null default 1,
created_by uuid references public.users(id),
created_at timestamptz not null default now()
);

create table if not exists public.grades (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
student_id uuid not null references public.students(id) on delete cascade,
evaluation_id uuid not null references public.evaluations(id) on delete cascade,
score numeric not null,
comment text,
created_by uuid references public.users(id),
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
unique (student_id, evaluation_id)
);

create table if not exists public.parent_students (
id uuid primary key default gen_random_uuid(),
school_id uuid not null references public.schools(id) on delete cascade,
parent_id uuid not null references public.users(id) on delete cascade,
student_id uuid not null references public.students(id) on delete cascade,
relation text not null default 'parent',
created_at timestamptz not null default now(),
unique (parent_id, student_id)
);

create or replace function public.is_teacher_of(p_class_id uuid, p_subject_id uuid)
returns boolean
language sql
stable
as $$
select exists (
select 1 from public.teacher_assignments ta
where ta.teacher_id = auth.uid()
and ta.class_id = p_class_id
and ta.subject_id = p_subject_id
);
$$;

create or replace function public.is_parent_of_student(p_student_id uuid)
returns boolean
language sql
stable
as $$
select exists (
select 1 from public.parent_students ps
where ps.parent_id = auth.uid()
and ps.student_id = p_student_id
);
$$;

alter table public.subjects enable row level security;
alter table public.teacher_assignments enable row level security;
alter table public.evaluations enable row level security;
alter table public.grades enable row level security;
alter table public.parent_students enable row level security;

create policy "subjects_select" on public.subjects
for select to authenticated
using (school_id = public.current_school_id());

create policy "subjects_write" on public.subjects
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('settings.manage'));

create policy "teacher_assignments_select" on public.teacher_assignments
for select to authenticated
using (
school_id = public.current_school_id()
and (teacher_id = auth.uid() or public.has_permission('reports.view'))
);

create policy "teacher_assignments_write" on public.teacher_assignments
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('settings.manage'));

create policy "evaluations_select" on public.evaluations
for select to authenticated
using (
school_id = public.current_school_id()
and (
public.is_teacher_of(class_id, subject_id)
or public.has_permission('reports.view')
or exists (
select 1 from public.enrollments e
where e.class_id = evaluations.class_id
and e.academic_year_id = evaluations.academic_year_id
and public.is_parent_of_student(e.student_id)
)
)
);

create policy "evaluations_write" on public.evaluations
for all to authenticated
using (
school_id = public.current_school_id()
and public.has_permission('grades.edit')
and public.is_teacher_of(class_id, subject_id)
);

create policy "grades_select" on public.grades
for select to authenticated
using (
school_id = public.current_school_id()
and (
public.has_permission('reports.view')
or public.is_parent_of_student(student_id)
or exists (
select 1 from public.evaluations ev
where ev.id = grades.evaluation_id
and public.is_teacher_of(ev.class_id, ev.subject_id)
)
)
);

create policy "grades_write" on public.grades
for all to authenticated
using (
school_id = public.current_school_id()
and public.has_permission('grades.edit')
and exists (
select 1 from public.evaluations ev
where ev.id = grades.evaluation_id
and public.is_teacher_of(ev.class_id, ev.subject_id)
)
);

create policy "parent_students_select" on public.parent_students
for select to authenticated
using (
school_id = public.current_school_id()
and (parent_id = auth.uid() or public.has_permission('reports.view'))
);

create policy "parent_students_write" on public.parent_students
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('users.manage'));
