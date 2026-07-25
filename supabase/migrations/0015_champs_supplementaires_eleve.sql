alter table public.students add column if not exists post_nom text;
alter table public.students add column if not exists sexe text check (sexe in ('M', 'F'));
alter table public.students add column if not exists guardian_address text;
alter table public.students add column if not exists emergency_contact_name text;
alter table public.students add column if not exists emergency_contact_relation text;
alter table public.students add column if not exists emergency_contact_phone text;

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
p_academic_year_id uuid,
p_post_nom text default null,
p_sexe text default null,
p_guardian_address text default null,
p_emergency_contact_name text default null,
p_emergency_contact_relation text default null,
p_emergency_contact_phone text default null
)
returns uuid
language plpgsql
as $$
declare
v_student_id uuid;
begin
insert into public.students (
school_id, first_name, last_name, date_naissance, lieu_naissance,
adresse, acte_naissance_numero, guardian_name, guardian_phone,
post_nom, sexe, guardian_address,
emergency_contact_name, emergency_contact_relation, emergency_contact_phone
) values (
p_school_id, p_first_name, p_last_name, p_date_naissance, p_lieu_naissance,
p_adresse, p_acte_naissance_numero, p_guardian_name, p_guardian_phone,
p_post_nom, p_sexe, p_guardian_address,
p_emergency_contact_name, p_emergency_contact_relation, p_emergency_contact_phone
)
returning id into v_student_id;

insert into public.enrollments (
school_id, student_id, class_id, academic_year_id
) values (
p_school_id, v_student_id, p_class_id, p_academic_year_id
);

return v_student_id;
end;
$$;
