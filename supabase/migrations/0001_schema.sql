create extension if not exists "pgcrypto";

create table if not exists public.schools (
id uuid primary key default gen_random_uuid(),
name text not null,
slug text not null unique,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

comment on table public.schools is 'Racine du multi-tenant. Chaque ecole isole strictement ses donnees.';

create table if not exists public.roles (
id uuid primary key default gen_random_uuid(),
slug text not null unique,
name text not null,
created_at timestamptz not null default now()
);

comment on table public.roles is 'Catalogue des roles EduNova. Fixe pour le MVP (5 roles).';

create table if not exists public.permissions (
id uuid primary key default gen_random_uuid(),
slug text not null unique,
name text not null,
description text,
created_at timestamptz not null default now()
);

comment on table public.permissions is 'Permissions granulaires. Modifiable sans redeploiement via role_permissions.';

create table if not exists public.role_permissions (
role_id uuid not null references public.roles(id) on delete cascade,
permission_id uuid not null references public.permissions(id) on delete cascade,
primary key (role_id, permission_id)
);

comment on table public.role_permissions is 'Table de jonction : permissions actives par role.';

create table if not exists public.users (
id uuid primary key references auth.users(id) on delete cascade,
school_id uuid not null references public.schools(id) on delete restrict,
role_id uuid not null references public.roles(id) on delete restrict,
full_name text not null,
email text not null,
is_active boolean not null default true,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

comment on table public.users is 'Profil applicatif. school_id et role_id obligatoires (fail-closed).';

create index if not exists idx_users_school_id on public.users(school_id);
create index if not exists idx_users_role_id on public.users(role_id);
