create or replace function public.generate_matricule()
returns trigger
language plpgsql
as $$
declare
v_prefix text;
v_year text;
v_seq int;
v_start_year int;
v_end_year int;
begin
select upper(left(slug, 3)) into v_prefix from public.schools where id = new.school_id;

select extract(year from ay.start_date)::int, extract(year from ay.end_date)::int
into v_start_year, v_end_year
from public.academic_years ay
where ay.school_id = new.school_id and ay.is_current = true;

if v_start_year is null then
v_year := to_char(now(), 'YY') || '-' || to_char(now() + interval '1 year', 'YY');
else
v_year := right(v_start_year::text, 2) || '-' || right(v_end_year::text, 2);
end if;

select coalesce(max(cast(split_part(matricule, '-', 4) as int)), 0) + 1
into v_seq
from public.students
where school_id = new.school_id and matricule like v_prefix || '-' || v_year || '-%';

new.matricule := v_prefix || '-' || v_year || '-' || lpad(v_seq::text, 4, '0');
return new;
end;
$$;
