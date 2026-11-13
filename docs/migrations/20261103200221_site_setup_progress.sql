-- Private, account/site-scoped drafts. Never exposed through public site/theme data.
create table if not exists public.site_setup_progress (
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  step text not null default '1' check (step in ('intro','1','2','3','4','preview')),
  business_draft jsonb,
  revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (site_id, user_id)
);
alter table public.site_setup_progress enable row level security;
revoke all on public.site_setup_progress from public, anon, authenticated;
grant select, insert, update, delete on public.site_setup_progress to service_role;
