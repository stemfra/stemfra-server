-- Immutable managed-website prices. Browser roles have no direct access.
create table public.managed_website_prices (
 id uuid primary key default gen_random_uuid(),
 sandbox boolean not null, currency text not null check(currency in ('USD','CAD','GBP','KES')),
 monthly_cents integer not null check(monthly_cents>0 and monthly_cents<=100000000),
 plan_key text not null, plan_id text,
 active boolean not null default true,
 created_at timestamptz not null default now(), created_by uuid references auth.users(id),
 unique(sandbox,plan_key), unique(sandbox,plan_id)
);
create unique index managed_website_price_active on public.managed_website_prices(sandbox,currency) where active;
alter table public.managed_website_prices enable row level security;
revoke all on public.managed_website_prices from anon, authenticated;
grant all on public.managed_website_prices to service_role;
insert into public.managed_website_prices(sandbox,currency,monthly_cents,plan_key)
 select s,c,n,k from (values(true),(false)) e(s)
 cross join (values('USD',29900,'managed_website'),('CAD',40000,'managed_website_cad'),('GBP',22500,'managed_website_gbp'),('KES',3000000,'managed_website_kes')) p(c,n,k);
create table public.managed_website_availability (
 id boolean primary key default true check(id), enabled boolean not null default false,
 policy jsonb not null default '{"countries":[],"regions":[]}'::jsonb,
 source_url text, reviewed_at timestamptz, updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
alter table public.managed_website_availability enable row level security;
revoke all on public.managed_website_availability from anon, authenticated;
grant all on public.managed_website_availability to service_role;
insert into public.managed_website_availability(id) values(true);
create function public.publish_managed_website_price(p_id uuid,p_cents integer,p_plan text,p_user uuid)
returns uuid language plpgsql security invoker set search_path='' as $$
declare old public.managed_website_prices%rowtype; new_id uuid:=gen_random_uuid();
begin
 select * into old from public.managed_website_prices where id=p_id for update;
 if not found or not old.active then raise exception 'price_changed_reload'; end if;
 update public.managed_website_prices set active=false where id=p_id;
 insert into public.managed_website_prices(id,sandbox,currency,monthly_cents,plan_key,plan_id,created_by)
 values(new_id,old.sandbox,old.currency,p_cents,'managed_website_'||lower(old.currency)||'_'||replace(new_id::text,'-',''),p_plan,p_user);
 return new_id;
end $$;
revoke all on function public.publish_managed_website_price(uuid,integer,text,uuid) from public,anon,authenticated;
grant execute on function public.publish_managed_website_price(uuid,integer,text,uuid) to service_role;
-- Preserve every existing reconciliation protection, replace only static price validation.
do $migration$
declare definition text; old_check text := $old$not coalesce((m->>'plan_key',m->>'currency', (m->>'monthly_cents')::integer) in (('managed_website','USD',29900),('managed_website_cad','CAD',40000),('managed_website_gbp','GBP',22500),('managed_website_kes','KES',3000000)),false)$old$;
begin
 select pg_get_functiondef('public.whop_reconcile(text,text,jsonb,boolean)'::regprocedure) into definition;
 if position(old_check in definition)=0 then raise exception 'reconciliation_definition_changed'; end if;
 execute replace(definition,old_check,$new$not exists(select 1 from public.managed_website_prices p where p.sandbox=p_sandbox and p.plan_key=m->>'plan_key' and p.currency=m->>'currency' and p.monthly_cents=(m->>'monthly_cents')::integer and (p.plan_id is null or p.plan_id=i.plan_id))$new$);
end $migration$;
