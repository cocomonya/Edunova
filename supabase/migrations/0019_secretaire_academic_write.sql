-- Corrige un bug preexistant : la secretaire avait acces (nav, UI) aux ecrans
-- de gestion des matieres, heures/classe et affectation enseignant, mais les
-- policies RLS exigeaient 'settings.manage' (reserve au directeur), rendant
-- ces ecrans inutilisables pour elle malgre les permissions qu'elle possede
-- deja ('students.edit'). On elargit les policies d'ecriture pour accepter
-- aussi 'students.edit', sans rien retirer au directeur.

drop policy if exists "subjects_write" on public.subjects;
create policy "subjects_write" on public.subjects
for all to authenticated
using (
  school_id = public.current_school_id()
  and (public.has_permission('settings.manage') or public.has_permission('students.edit'))
);

drop policy if exists "teacher_assignments_write" on public.teacher_assignments;
create policy "teacher_assignments_write" on public.teacher_assignments
for all to authenticated
using (
  school_id = public.current_school_id()
  and (public.has_permission('settings.manage') or public.has_permission('students.edit'))
);

drop policy if exists "class_subjects_write" on public.class_subjects;
create policy "class_subjects_write" on public.class_subjects
for all to authenticated
using (
  school_id = public.current_school_id()
  and (public.has_permission('settings.manage') or public.has_permission('students.edit'))
);
