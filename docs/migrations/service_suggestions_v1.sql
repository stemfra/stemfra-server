-- service_suggestions_v1 (P39 onboarding v2 slice a, 2026-09-13, Peter: "curate
-- the service list from what barbers actually add"). Every custom service an
-- owner types into the setup wizard's catalogue step lands here with its
-- vertical; staff promote the frequent ones into lib/serviceCatalog.js.
create table if not exists public.service_suggestions (
  id               uuid primary key default gen_random_uuid(),
  vertical_slug    text not null,
  name             text not null,
  duration_minutes integer,
  price_cents      integer,
  currency         text,
  site_id          uuid references public.sites(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists service_suggestions_vertical_idx on public.service_suggestions (vertical_slug, lower(name));
alter table public.service_suggestions enable row level security;
-- Written by the server (service role) on behalf of the owner; staff read in the CRM.
drop policy if exists service_suggestions_staff_read on public.service_suggestions;
create policy service_suggestions_staff_read on public.service_suggestions
  for select using (is_stemfra_staff());
