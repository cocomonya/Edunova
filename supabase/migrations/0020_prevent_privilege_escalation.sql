-- Corrige une faille de conception : la policy "users_update_self" (migration 0014)
-- autorise un utilisateur a modifier n'importe quelle colonne de sa propre ligne,
-- car RLS ne filtre que les lignes, pas les colonnes. Aucune exploitation active
-- n'a ete identifiee (seul le changement de mot de passe l'utilise aujourd'hui,
-- et ne touche que must_change_password), mais c'est une faille dormante :
-- un futur bug pourrait permettre a un utilisateur de changer son propre role_id,
-- school_id ou de se reactiver apres desactivation.
--
-- Ce trigger bloque ces 3 colonnes sur toute auto-modification, sauf si
-- l'acteur possede deja la permission 'users.manage' (le directeur), ou si
-- la requete provient du service_role (client admin, utilise pour les actions
-- legitimes comme la creation de compte).

create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if (new.role_id is distinct from old.role_id
      or new.school_id is distinct from old.school_id
      or new.is_active is distinct from old.is_active)
     and not public.has_permission('users.manage') then
    raise exception 'Modification du role, de l ecole ou du statut actif non autorisee.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_self_privilege_escalation on public.users;
create trigger trg_prevent_self_privilege_escalation
before update on public.users
for each row
execute function public.prevent_self_privilege_escalation();
