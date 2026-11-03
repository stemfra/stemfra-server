-- Applied 2026-11-02 to stemfra-ops (acxepovfklgthxmteqxr) with Peter approval.
-- Whop owns collection; billing_charges mirrors confirmed payments, not a second bill.
-- Preserve all existing providers while permitting reconciled Whop subscriptions.
alter table public.subscriptions drop constraint subscriptions_provider_chk;
alter table public.subscriptions add constraint subscriptions_provider_chk
 check (provider in ('airwallex','payoneer','stripe','lemonsqueezy','paddle','manual','whop'));
create table public.whop_checkout_intents (
 id uuid primary key default gen_random_uuid(), site_id uuid not null references public.sites(id),
 requested_by uuid not null, receipt_email text, product text not null check (product in ('website','ai')),
 plan_key text not null, plan_id text not null, sandbox boolean not null,
 checkout_id text unique, checkout_url text, membership_id text unique,
 state text not null default 'pending' check(state in ('pending','paid')),
 created_at timestamptz not null default now()
);
create unique index whop_one_pending_checkout on public.whop_checkout_intents(site_id) where state='pending';
create table public.whop_events (
 id text primary key, event_type text not null, received_at timestamptz not null default now()
);
create table public.whop_receipt_outbox (
 charge_id uuid primary key references public.billing_charges(id),
 status text not null default 'pending' check(status in ('pending','sending','sent')),
 attempts integer not null default 0, locked_until timestamptz, payload jsonb, first_attempt_at timestamptz,
 created_at timestamptz not null default now(), sent_at timestamptz
);
create unique index whop_payment_once on public.billing_charges ((metadata->>'whop_payment_id')) where metadata->>'whop_payment_id' is not null;
alter table public.whop_checkout_intents enable row level security;
revoke all on public.whop_checkout_intents from public, anon, authenticated;
grant select, insert, update, delete on public.whop_checkout_intents to service_role;
alter table public.whop_events enable row level security;
revoke all on public.whop_events from public, anon, authenticated;
grant select, insert, update, delete on public.whop_events to service_role;
alter table public.whop_receipt_outbox enable row level security;
revoke all on public.whop_receipt_outbox from public, anon, authenticated;
grant select, insert, update, delete on public.whop_receipt_outbox to service_role;

-- All calls are server-only, following application owner authorization.
create function public.whop_prepare_checkout(p_target uuid, p_user uuid, p_key text, p_plan text, p_product text, p_sandbox boolean, p_email text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.whop_checkout_intents%rowtype; sub public.subscriptions%rowtype;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_target::text, 827));
 select * into sub from public.subscriptions where site_id=p_target for update;
 if found and sub.current_period_end > now() and sub.status in ('active','past_due') and not coalesce((sub.metadata->>'awaiting_payment')::boolean,false) then
  raise exception 'subscription_already_exists';
 end if;
 select * into i from public.whop_checkout_intents where site_id=p_target and state='pending' for update;
 if found then
  if i.plan_key<>p_key or i.sandbox<>p_sandbox or i.plan_id<>p_plan then raise exception 'checkout_already_pending'; end if;
 else
  insert into public.whop_checkout_intents(site_id,requested_by,plan_key,plan_id,product,sandbox,receipt_email)
   values(p_target,p_user,p_key,p_plan,p_product,p_sandbox,p_email) returning * into i;
 end if;
 return to_jsonb(i);
end $$;

create function public.whop_reconcile(p_event text, p_type text, p_snapshot jsonb, p_sandbox boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.whop_checkout_intents%rowtype; sub public.subscriptions%rowtype;
 c uuid; inserted_event text; fresh_payment boolean:=false; eligible boolean:=false; snapshot_new boolean:=false;
 m jsonb:=p_snapshot; previous_end timestamptz; start_at timestamptz; end_at timestamptz;
begin
 select * into i from public.whop_checkout_intents
  where membership_id=m->>'membership_id' or id::text=m->>'order_id'
  order by (membership_id=m->>'membership_id') desc nulls last limit 1;
 if not found then raise exception 'unbound_whop_membership'; end if;
 perform pg_advisory_xact_lock(hashtextextended(i.site_id::text,827));
 select * into i from public.whop_checkout_intents where id=i.id for update;
 if i.sandbox is distinct from p_sandbox or i.product is distinct from (m->>'product') or i.plan_id is distinct from (m->>'plan_id') then raise exception 'checkout_binding_mismatch'; end if;
 if i.membership_id is not null and i.membership_id<>m->>'membership_id' then raise exception 'membership_already_bound'; end if;
 if i.checkout_id is null then raise exception 'checkout_not_persisted'; end if;
 if m->>'checkout_id' is not null and m->>'checkout_id'<>i.checkout_id then raise exception 'checkout_id_mismatch'; end if;
 insert into public.whop_events(id,event_type) values(p_event,p_type) on conflict do nothing returning id into inserted_event;
 if inserted_event is null then return jsonb_build_object('duplicate',true); end if;
 select * into sub from public.subscriptions where site_id=i.site_id for update;
 if found and sub.metadata->>'whop_membership_id' is not null and sub.metadata->>'whop_membership_id'<>m->>'membership_id' then
  -- A late webhook for an older membership must never replace a new subscription.
  if i.state='paid' or sub.current_period_end>now() then raise exception 'different_current_membership'; end if;
 end if;
 previous_end:=sub.current_period_end;
 start_at:=(m->>'period_start')::timestamptz; end_at:=(m->>'period_end')::timestamptz;
 eligible:=coalesce((m->>'paid')::boolean,false) and start_at is not null and end_at>now()
   and (m->>'payment_created_at')::timestamptz>=start_at and m->>'status'='active';
 snapshot_new:=coalesce((sub.metadata->>'whop_updated_at')::timestamptz,'epoch'::timestamptz)<=(m->>'updated_at')::timestamptz;
 -- Lifecycle updates cannot activate an unpaid checkout; only a confirmed payment does.
 if snapshot_new and (eligible or i.state='paid') then
 insert into public.subscriptions(site_id,provider,status,currency,build_amount_cents,monthly_amount_cents,started_at,current_period_end,cancel_at_period_end,canceled_at,metadata)
 values(i.site_id,'whop',(case when m->>'status'='cancelled' then 'canceled' else m->>'status' end)::public.subscription_status,'USD',0,29900,coalesce(sub.started_at,(m->>'paid_at')::timestamptz),end_at,(m->>'cancel_at_period_end')::boolean,(m->>'canceled_at')::timestamptz,
 coalesce(sub.metadata,'{}')||jsonb_build_object('awaiting_payment',false,'plan_label','Managed website','whop_membership_id',m->>'membership_id','whop_manage_url',m->>'manage_url','whop_updated_at',m->>'updated_at'))
 on conflict(site_id) do update set provider='whop',status=excluded.status,currency='USD',build_amount_cents=0,monthly_amount_cents=29900,current_period_end=excluded.current_period_end,cancel_at_period_end=excluded.cancel_at_period_end,canceled_at=excluded.canceled_at,metadata=excluded.metadata returning * into sub;
 end if;
 update public.whop_checkout_intents set membership_id=m->>'membership_id',state=case when eligible then 'paid' else state end where id=i.id;
 if coalesce((m->>'paid')::boolean,false) then
  -- Save even a delayed paid payment as history, but do not reset a newer allowance.
  if sub.id is null then raise exception 'payment_period_requires_review'; end if;
  insert into public.billing_charges(site_id,subscription_id,kind,line_items,amount_cents,currency,status,paid_at,period_start,period_end,metadata,provider)
  values(i.site_id,sub.id,'recurring',m->'line_items',(m->>'amount_cents')::integer,'USD','paid',(m->>'paid_at')::timestamptz,
   case when eligible then start_at::date else null end,case when eligible then end_at::date else null end,
   jsonb_build_object('provider','whop','whop_payment_id',m->>'payment_id','whop_membership_id',m->>'membership_id','whop_manage_url',m->>'manage_url','customer_email',m->>'customer_email','receipt_email',i.receipt_email,'sandbox',p_sandbox,'tax_cents',coalesce((select sum((item->>'cents')::integer) from jsonb_array_elements(m->'line_items') item where item->>'label'='Tax collected by Whop'),0)),'whop')
  on conflict ((metadata->>'whop_payment_id')) where metadata->>'whop_payment_id' is not null do nothing returning id into c;
  fresh_payment:=c is not null;
  if fresh_payment then insert into public.whop_receipt_outbox(charge_id) values(c); end if;
 end if;
 return jsonb_build_object('duplicate',false,'charge_id',c,'target_id',i.site_id,'new_payment',fresh_payment);
end $$;
revoke all on function public.whop_prepare_checkout(uuid,uuid,text,text,text,boolean,text) from public,anon,authenticated;
revoke all on function public.whop_reconcile(text,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.whop_prepare_checkout(uuid,uuid,text,text,text,boolean,text) to service_role;
grant execute on function public.whop_reconcile(text,text,jsonb,boolean) to service_role;

-- Lease across workers; provider idempotency key is charge_id. No auth-user grants.
create function public.whop_claim_receipt() returns uuid language sql security invoker set search_path='' as $$
 update public.whop_receipt_outbox set status='sending',attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),locked_until=now()+interval '15 minutes'
 where charge_id=(select charge_id from public.whop_receipt_outbox
 where status<>'sent' and attempts<20 and (first_attempt_at is null or first_attempt_at>now()-interval '23 hours') and (locked_until is null or locked_until<now())
 order by created_at for update skip locked limit 1) returning charge_id
$$;
revoke all on function public.whop_claim_receipt() from public,anon,authenticated;
grant execute on function public.whop_claim_receipt() to service_role;
