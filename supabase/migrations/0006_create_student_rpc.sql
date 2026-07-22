create or replace function public.create_student_with_enrollment(
p_school_id uuid,
p_first_name text,
p_last_name text,
p_date_naissance date,
p_lieu_naissance text,
p_adresse text,
p_acte_naissance_numero text,
p_guardian_name text,
p_guardian_phone text,
p_class_id uuid,
p_academic_year_id uuid
)
returns uuid
language plpgsql
as $$
declare
v_student_id uuid;
begin
insert into public.students (school_id, first_name, last_name, date_naissance, lieu_naissance, adresse, acte_naissance_numero, guardian_name, guardian_phone)
values (p_school_id, p_first_name, p_last_name, p_date_naissance, p_lieu_naissance, p_adresse, p_acte_naissance_numero, p_guardian_name, p_guardian_phone)
returning id into v_student_id;

insert into public.enrollments (school_id, student_id, class_id, academic_year_id)
values (p_school_id, v_student_id, p_class_id, p_academic_year_id);

return v_student_id;
end;
$$;

revoke execute on function public.create_student_with_enrollment from public, anon;
grant execute on function public.create_student_with_enrollment to authenticated;
