insert into public.roles (slug, name) values
('directeur', 'Directeur'),
('secretaire', 'Secretaire'),
('comptable', 'Comptable'),
('enseignant', 'Enseignant'),
('parent', 'Parent')
on conflict (slug) do nothing;

insert into public.permissions (slug, name, description) values
('students.view', 'Voir les eleves', 'Consulter les fiches eleves'),
('students.edit', 'Modifier les eleves', 'Creer/modifier les fiches eleves'),
('students.delete', 'Supprimer les eleves', 'Supprimer une fiche eleve'),
('grades.view', 'Voir les notes', 'Consulter les notes et bulletins'),
('grades.edit', 'Modifier les notes', 'Saisir/modifier les notes'),
('finance.view', 'Voir les finances', 'Consulter les paiements et factures'),
('finance.edit', 'Modifier les finances', 'Enregistrer paiements, editer factures'),
('users.manage', 'Gerer les utilisateurs', 'Creer/modifier/desactiver des comptes'),
('reports.view', 'Voir les rapports', 'Consulter les rapports et statistiques'),
('settings.manage', 'Gerer les parametres ecole', 'Modifier la configuration de l ecole')
on conflict (slug) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'directeur'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'secretaire' and p.slug in ('students.view','students.edit','users.manage','reports.view')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'comptable' and p.slug in ('finance.view','finance.edit','reports.view')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'enseignant' and p.slug in ('students.view','grades.view','grades.edit')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'parent' and p.slug in ('grades.view')
on conflict do nothing;
