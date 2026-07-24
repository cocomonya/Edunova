alter table public.classes add column if not exists local text;
alter table public.classes add column if not exists titulaire_id uuid references public.users(id);

update public.classes set niveau = '6e primaire', local = 'A', name = '6e primaire - Local A'
where niveau = 'CM2';
