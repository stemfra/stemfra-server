-- Prepared locally. Apply before enabling MANAGED_WEBSITE_PURCHASE_ENABLED.
-- A payment can exist before an account or a website. Never expose these rows
-- through the public database API: the purchase secret is checked by the API.
create table public.managed_website_purchases (
 id uuid primary key,
 secret_hash text not null,
 sandbox boolean not null,
 plan_key text not null,
 plan_id text not null,
 currency text not null check(currency in ('USD','CAD','GBP','KES')),
 monthly_cents integer not null check(monthly_cents > 0),
 selection jsonb not null,
 checkout_id text unique,
 checkout_url text,
 snapshot jsonb,
 state text not null default 'pending' check(state in ('pending','paid','provisioning','complete')),
 auth_user_id uuid,
 new_account boolean not null default false,
 site_id uuid references public.sites(id),
 otp_sent_at timestamptz,
 created_at timestamptz not null default now(),
 completed_at timestamptz
);
alter table public.managed_website_purchases enable row level security;
revoke all on public.managed_website_purchases from public, anon, authenticated;
grant select,insert,update,delete on public.managed_website_purchases to service_role;
