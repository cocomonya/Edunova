do $$
declare
v_constraint_name text;
begin
select conname into v_constraint_name
from pg_constraint
where conrelid = 'public.teacher_assignments'::regclass
and contype = 'u';

if v_constraint_name is not null then
execute format('alter table public.teacher_assignments drop constraint %I', v_constraint_name);
end if;
end $$;

alter table public.teacher_assignments
add constraint teacher_assignments_class_subject_year_key
unique (class_id, subject_id, academic_year_id);
