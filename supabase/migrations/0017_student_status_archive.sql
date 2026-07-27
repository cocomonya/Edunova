-- Migration les anciennes valeurs de statut vers le nouveau schema
update public.students set status = 'archive' where status = 'inactif';

-- Supprimer dynamiquement toute contrainte CHECK existante sur students.status
do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = rel.oid and att.attnum = any(con.conkey)
  where rel.relname = 'students'
    and con.contype = 'c'
    and att.attname = 'status';

  if constraint_name is not null then
    execute format('alter table public.students drop constraint %I', constraint_name);
  end if;
end $$;

-- Nouvelle contrainte avec les 4 statuts
alter table public.students
  add constraint students_status_check
  check (status in ('actif', 'archive', 'transfere', 'diplome'));

alter table public.students alter column status set default 'actif';
