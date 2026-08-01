-- Table de liaison matiere <-> classe, avec pondination/volume horaire
create table if not exists public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  hours_per_week numeric not null default 0,
  coefficient numeric not null default 1,
  is_optional boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (class_id, subject_id, academic_year_id)
);

-- Colonne d'archivage pour les matieres (coherent avec le reste de l'app : jamais de suppression reelle)
alter table public.subjects add column if not exists is_active boolean not null default true;

-- Backfill : creer une ligne class_subjects pour chaque combinaison deja existante
-- dans teacher_assignments, afin que la nouvelle contrainte ne casse rien
insert into public.class_subjects (school_id, class_id, subject_id, academic_year_id, hours_per_week, coefficient, is_optional)
select distinct school_id, class_id, subject_id, academic_year_id, 0, 1, false
from public.teacher_assignments
on conflict (class_id, subject_id, academic_year_id) do nothing;

-- Un enseignant ne peut etre affecte que si la matiere est deja rattachee a la classe
alter table public.teacher_assignments
  add constraint teacher_assignments_class_subject_fkey
  foreign key (class_id, subject_id, academic_year_id)
  references public.class_subjects (class_id, subject_id, academic_year_id)
  on delete cascade;

alter table public.class_subjects enable row level security;

create policy "class_subjects_select" on public.class_subjects
for select to authenticated
using (school_id = public.current_school_id());

create policy "class_subjects_write" on public.class_subjects
for all to authenticated
using (school_id = public.current_school_id() and public.has_permission('settings.manage'));
