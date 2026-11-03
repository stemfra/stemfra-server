-- Restrictive policies supplement existing ownership RLS; they do not grant access.
create or replace function public.cms_site_operable(p_site uuid) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
 select public.is_stemfra_staff() or exists(select 1 from public.sites where id=p_site and status::text<>'suspended' and deleted_at is null)
$$;
revoke all on function public.cms_site_operable(uuid) from public;
grant execute on function public.cms_site_operable(uuid) to authenticated;
do $$ declare t record; begin
 for t in select c.table_name from information_schema.columns c join pg_class p on p.relname=c.table_name and p.relnamespace='public'::regnamespace
 where c.table_schema='public' and c.column_name='site_id' and p.relkind='r' and p.relrowsecurity
 and (c.table_name like 'site\_%' escape '\' or c.table_name in ('agent_conversations','service_suggestions')) loop
 execute format('create policy cms_suspension_restriction on public.%I as restrictive for all to authenticated using (public.cms_site_operable(site_id)) with check (public.cms_site_operable(site_id))',t.table_name);
 end loop;
end $$;
create policy cms_suspended_site_update on public.sites as restrictive for update to authenticated
 using (public.is_stemfra_staff() or status::text<>'suspended')
 with check (public.is_stemfra_staff() or status::text<>'suspended');
create policy cms_suspended_site_delete on public.sites as restrictive for delete to authenticated
 using (public.is_stemfra_staff() or status::text<>'suspended');

create table public.whop_access_notices (
 id uuid primary key default gen_random_uuid(), site_id uuid not null references public.sites(id), kind text not null check(kind in ('suspended','restored')),
 transition_key text unique not null, status text not null default 'pending' check(status in ('pending','sent','skipped','review')), created_at timestamptz not null default now(), sent_at timestamptz, first_attempt_at timestamptz, locked_until timestamptz, attempts integer not null default 0
);
alter table public.whop_access_notices enable row level security;
revoke all on public.whop_access_notices from public,anon,authenticated;
grant all on public.whop_access_notices to service_role;
create or replace function public.queue_whop_access_notice() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.status::text='suspended' and old.status::text='live' and new.metadata->'whop_access'->>'suspended_at' is not null then
 insert into public.whop_access_notices(site_id,kind,transition_key) values(new.id,'suspended',new.id||':suspended:'||(new.metadata->'whop_access'->>'suspended_at')) on conflict do nothing;
 elsif new.status::text='live' and old.status::text='suspended' and old.metadata->'whop_access' is not null and new.metadata->>'whop_restored_at' is not null then
 insert into public.whop_access_notices(site_id,kind,transition_key) values(new.id,'restored',new.id||':restored:'||(new.metadata->>'whop_restored_at')) on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function public.queue_whop_access_notice() from public,anon,authenticated;
create trigger whop_access_notice after update of status on public.sites for each row execute function public.queue_whop_access_notice();
