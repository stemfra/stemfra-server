-- Local implementation only. No rows seeded and no public grants.
begin;
create table if not exists public.marketplace_listings (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check(slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
 site_id uuid unique references public.sites(id) on delete cascade,
 name text not null check(length(name) between 1 and 200),
 category text not null check(category in ('Barbershops','Beauty salons','Hair salons','Nails','Brows & lashes','Massage','Spa')),
 city text not null default '', country text not null default '', address text not null default '',
 phone text not null default '', website text not null default '', image_url text not null default '',
 source_label text not null, source_url text not null default '', source_license text not null,
 source_approved boolean not null default false, reviewed_by uuid,
 checked_at timestamptz not null, claimed boolean not null default false,
 booking_enabled boolean not null default false, owner_visible boolean not null default true,
 status text not null default 'draft' check(status in ('draft','published','suppressed')),
 profile jsonb not null default '{}'::jsonb check(jsonb_typeof(profile)='object'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(not booking_enabled or (claimed and site_id is not null)),
 check(status <> 'published' or (source_approved and reviewed_by is not null))
);
create index if not exists marketplace_directory_search on public.marketplace_listings(category,city) where status='published' and owner_visible and source_approved;
create table if not exists public.marketplace_requests (
 id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
 kind text not null check(kind in ('claim','correction','removal')),
 name text not null check(length(name) between 1 and 120),
 email text not null check(length(email) between 3 and 254),
 message text not null check(length(message) between 10 and 2000),
 status text not null default 'pending' check(status in ('pending','reviewing','resolved','rejected')),
 reviewed_by uuid, resolution text, created_at timestamptz not null default now()
);
create index if not exists marketplace_pending_requests on public.marketplace_requests(status,created_at);
-- Durable, race-safe intake cooldown. Local rate limiting also protects the HTTP endpoint.
create or replace function public.marketplace_request_cooldown() returns trigger language plpgsql set search_path=public as $$
begin
 perform pg_advisory_xact_lock(hashtext(new.listing_id::text || lower(new.email)));
 if exists(select 1 from public.marketplace_requests where listing_id=new.listing_id and lower(email)=lower(new.email) and created_at > now()-interval '5 minutes') then
  raise exception 'Request cooldown' using errcode='P0001';
 end if;
 return new;
end $$;
drop trigger if exists marketplace_request_cooldown on public.marketplace_requests;
create trigger marketplace_request_cooldown before insert on public.marketplace_requests for each row execute function public.marketplace_request_cooldown();
alter table public.marketplace_listings enable row level security;
alter table public.marketplace_requests enable row level security;
revoke all on public.marketplace_listings,public.marketplace_requests from public,anon,authenticated;
grant select,insert,update,delete on public.marketplace_listings,public.marketplace_requests to service_role;
revoke all on function public.marketplace_request_cooldown() from public,anon,authenticated;
commit;
