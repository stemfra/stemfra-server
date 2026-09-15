-- Account security emails (ROADMAP P39k item 3). Applied 2026-09-15 via the Supabase MCP.
-- The devices an owner has signed in from (device id = a random id the CMS keeps in
-- localStorage). A sign-in from an unknown device id sends the "new sign-in" notice;
-- the FIRST device an owner ever registers is recorded silently, so nobody gets a
-- notice for the browser they were already using when this shipped.
-- Server-only: RLS on, no policies (service role reads and writes).
create table if not exists public.cms_known_devices (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  device_id text not null,
  user_agent text,
  ip text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (auth_user_id, device_id)
);
alter table public.cms_known_devices enable row level security;
create index if not exists cms_known_devices_user_idx on public.cms_known_devices (auth_user_id, last_seen_at desc);
