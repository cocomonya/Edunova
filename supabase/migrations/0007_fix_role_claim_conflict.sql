create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
claims jsonb;
v_role_slug text;
v_school_id uuid;
v_permissions text[];
begin
select r.slug, u.school_id
into v_role_slug, v_school_id
from public.users u
join public.roles r on r.id = u.role_id
where u.id = (event->>'user_id')::uuid
and u.is_active = true;

select coalesce(array_agg(p.slug), array[]::text[])
into v_permissions
from public.role_permissions rp
join public.permissions p on p.id = rp.permission_id
join public.users u on u.role_id = rp.role_id
where u.id = (event->>'user_id')::uuid;

claims := coalesce(event->'claims', '{}'::jsonb);

if v_role_slug is not null and v_school_id is not null then
claims := jsonb_set(claims, '{app_role}', to_jsonb(v_role_slug));
claims := jsonb_set(claims, '{school_id}', to_jsonb(v_school_id::text));
claims := jsonb_set(claims, '{permissions}', to_jsonb(v_permissions));
end if;

event := jsonb_set(event, '{claims}', claims);
return event;
end;
$$;

create or replace function public.current_role_slug()
returns text
language sql
stable
as $$
select auth.jwt() ->> 'app_role';
$$;
