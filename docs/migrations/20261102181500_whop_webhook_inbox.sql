-- CLI migration creation unavailable locally (telemetry filesystem permission).
create table public.whop_webhook_inbox (
 id uuid primary key default gen_random_uuid(), delivery_id text not null,
 account_id text not null, sandbox boolean not null, event_type text not null, resource_id text not null,
 status text not null default 'pending' check(status in ('pending','processing','done','review')),
 attempts integer not null default 0, next_attempt_at timestamptz not null default now(),
 locked_until timestamptz, claim_token uuid, last_error text,
 created_at timestamptz not null default now(), completed_at timestamptz,
 unique(account_id,sandbox,delivery_id)
);
create index whop_webhook_due on public.whop_webhook_inbox(account_id,sandbox,next_attempt_at) where status in ('pending','processing');
alter table public.whop_webhook_inbox enable row level security;
revoke all on public.whop_webhook_inbox from public,anon,authenticated;
grant select,insert,update,delete on public.whop_webhook_inbox to service_role;
create function public.whop_claim_webhook(p_account text,p_sandbox boolean)
returns setof public.whop_webhook_inbox language sql security invoker set search_path='' as $$
 with exhausted as (
 update public.whop_webhook_inbox set status='review',last_error='worker_lease_exhausted',locked_until=null,claim_token=null
 where account_id=p_account and sandbox=p_sandbox and status='processing' and locked_until<now() and attempts>=8 returning id
 ), candidate as (
 select id from public.whop_webhook_inbox
 where account_id=p_account and sandbox=p_sandbox and attempts<8
 and ((status='pending' and next_attempt_at<=now()) or (status='processing' and locked_until<now()))
 order by next_attempt_at for update skip locked limit 1
 ) update public.whop_webhook_inbox q set status='processing',attempts=q.attempts+1,
 locked_until=now()+interval '2 minutes',claim_token=gen_random_uuid()
 from candidate where q.id=candidate.id returning q.*;
$$;
revoke all on function public.whop_claim_webhook(text,boolean) from public,anon,authenticated;
grant execute on function public.whop_claim_webhook(text,boolean) to service_role;
