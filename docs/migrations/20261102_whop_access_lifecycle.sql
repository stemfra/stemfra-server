-- Paid-through access is extended only by verified paid reconciliation.
create or replace function public.whop_reconcile(p_event text, p_type text, p_snapshot jsonb, p_sandbox boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.whop_checkout_intents%rowtype; sub public.subscriptions%rowtype;
 c uuid; inserted_event text; fresh_payment boolean:=false; eligible boolean:=false; snapshot_new boolean:=false;
 invoice_identity jsonb;
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
 if i.acquisition_mode='saved_card' then
  if i.member_id is null or i.payment_method_id is null or i.member_id is distinct from (m->>'member_id') then raise exception 'saved_card_member_mismatch'; end if;
  if i.membership_id is null and m->>'payment_id' is not null and i.payment_method_id is distinct from (m->>'payment_method_id') then raise exception 'saved_card_method_mismatch'; end if;
 else
  if i.checkout_id is null then raise exception 'checkout_not_persisted'; end if;
  if m->>'checkout_id' is not null and m->>'checkout_id'<>i.checkout_id then raise exception 'checkout_id_mismatch'; end if;
 end if;
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
 values(i.site_id,'whop',(case when m->>'status'='cancelled' then 'canceled' else m->>'status' end)::public.subscription_status,'USD',0,29900,coalesce(sub.started_at,(m->>'paid_at')::timestamptz),case when eligible then greatest(end_at,previous_end) else previous_end end,(m->>'cancel_at_period_end')::boolean,(m->>'canceled_at')::timestamptz,
 coalesce(sub.metadata,'{}')||case when eligible then jsonb_build_object('whop_paid_through',greatest(end_at, (sub.metadata->>'whop_paid_through')::timestamptz)) else '{}'::jsonb end||jsonb_build_object('awaiting_payment',false,'plan_label','Managed website','whop_membership_id',m->>'membership_id','whop_manage_url',m->>'manage_url','whop_updated_at',m->>'updated_at'))
 on conflict(site_id) do update set provider='whop',status=excluded.status,currency='USD',build_amount_cents=0,monthly_amount_cents=29900,current_period_end=excluded.current_period_end,cancel_at_period_end=excluded.cancel_at_period_end,canceled_at=excluded.canceled_at,metadata=excluded.metadata returning * into sub;
 end if;
 update public.whop_checkout_intents set membership_id=m->>'membership_id',state=case when eligible then 'paid' else state end where id=i.id;
 if coalesce((m->>'paid')::boolean,false) then
  -- Save even a delayed paid payment as history, but do not reset a newer allowance.
  if sub.id is null then raise exception 'payment_period_requires_review'; end if;
  -- Resolve the saved Stemfra billing identity inside the payment transaction.
  select jsonb_build_object('profile',
   jsonb_build_object('first_name',ct.first_name,'last_name',ct.last_name,'country',ct.country,'state',ct.state)
    || coalesce(ct.billing_profile,'{}'::jsonb) || coalesce(co.billing_profile,'{}'::jsonb),
   'email',ct.email)
  into invoice_identity from public.sites st
   left join public.contacts ct on ct.id=st.owner_contact_id
   left join public.companies co on co.id=st.company_id where st.id=i.site_id;
  insert into public.billing_charges(site_id,subscription_id,kind,line_items,amount_cents,currency,status,paid_at,period_start,period_end,metadata,provider,due_date)
  values(i.site_id,sub.id,'recurring',m->'line_items',(m->>'amount_cents')::integer,'USD','paid',(m->>'paid_at')::timestamptz,
   case when eligible then start_at::date else null end,case when eligible then end_at::date else null end,
   jsonb_build_object('billing_snapshot',invoice_identity,'invoice_issued_at',m->>'paid_at','provider','whop','whop_payment_id',m->>'payment_id','whop_membership_id',m->>'membership_id','whop_manage_url',m->>'manage_url','customer_email',m->>'customer_email','receipt_email',i.receipt_email,'sandbox',p_sandbox,'tax_cents',coalesce((select sum((item->>'cents')::integer) from jsonb_array_elements(m->'line_items') item where item->>'label'='Tax collected by Whop'),0)),'whop',((m->>'paid_at')::timestamptz at time zone 'UTC')::date)
  on conflict ((metadata->>'whop_payment_id')) where metadata->>'whop_payment_id' is not null do nothing returning id into c;
  fresh_payment:=c is not null;
  if fresh_payment then insert into public.whop_receipt_outbox(charge_id) values(c); end if;
 end if;
 return jsonb_build_object('duplicate',false,'charge_id',c,'target_id',i.site_id,'new_payment',fresh_payment);
end $$;

create or replace function public.whop_apply_site_access(p_site uuid, p_membership text, p_updated timestamptz, p_sandbox boolean)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare sub public.subscriptions%rowtype; st public.sites%rowtype; paid_until timestamptz; cutoff timestamptz; reason text; action text:='unchanged';
begin
 select * into sub from public.subscriptions where site_id=p_site for update;
 if sub.id is null or sub.provider<>'whop' or sub.metadata->>'whop_membership_id' is distinct from p_membership
 or (sub.metadata->>'whop_updated_at')::timestamptz is distinct from p_updated then return jsonb_build_object('action','stale_or_unbound'); end if;
 if not exists(select 1 from public.whop_checkout_intents where site_id=p_site and membership_id=p_membership and sandbox=p_sandbox and state='paid') then return jsonb_build_object('action','unbound'); end if;
 select * into st from public.sites where id=p_site for update;
 if st.id is null or st.deleted_at is not null then return jsonb_build_object('action','excluded'); end if;
 if p_sandbox then
  if st.metadata->'is_test' is distinct from 'true'::jsonb then return jsonb_build_object('action','excluded'); end if;
 elsif coalesce(st.metadata->'is_test'='true'::jsonb,false) or coalesce(st.metadata->'is_starter'='true'::jsonb,false) or coalesce(st.metadata->'internal'='true'::jsonb,false) then return jsonb_build_object('action','excluded'); end if;
 paid_until:=(sub.metadata->>'whop_paid_through')::timestamptz;
 if paid_until is null then return jsonb_build_object('action','review_missing_paid_boundary'); end if;
 if sub.cancel_at_period_end or sub.status::text in ('canceled','cancelled','expired') then cutoff:=paid_until; reason:='cancellation';
 elsif sub.status::text='past_due' then cutoff:=paid_until+interval '7 days'; reason:='failed_renewal';
 elsif sub.status::text='active' and paid_until>now() then cutoff:=paid_until;
 else return jsonb_build_object('action','review_provider_state'); end if;
 if now()>=cutoff and st.status::text='live' then
  update public.sites set status='suspended',metadata=coalesce(metadata,'{}')||jsonb_build_object('whop_access',jsonb_build_object('membership',p_membership,'reason',reason,'suspended_at',now(),'paid_through',paid_until,'access_end',cutoff)) where id=p_site;
  action:='suspended';
 elsif paid_until>now() and sub.status::text='active' and st.status::text='suspended' and st.metadata->'whop_access'->>'membership'=p_membership then
  update public.sites set status='live',metadata=(coalesce(metadata,'{}')-'whop_access')||jsonb_build_object('whop_restored_at',now()) where id=p_site;
  action:='restored';
 end if;
 return jsonb_build_object('action',action,'access_end',cutoff,'reason',reason);
end $$;
revoke all on function public.whop_apply_site_access(uuid,text,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.whop_apply_site_access(uuid,text,timestamptz,boolean) to service_role;
