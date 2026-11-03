-- Keep the original paid transaction and provider document. Mirror financial state separately.
create function public.whop_record_financial_state(p_charge uuid,p_event text,p_state jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.billing_charges%rowtype; stamp timestamptz;
begin
 select * into c from public.billing_charges where id=p_charge and provider='whop' for update;
 if not found then raise exception 'unbound_whop_payment';end if;
 stamp:=(p_state->>'updated_at')::timestamptz;
 if stamp is null then raise exception 'missing_provider_timestamp';end if;
 insert into public.whop_events(id,event_type) values(p_event,'payment.financial_state') on conflict do nothing;
 if coalesce((c.metadata->'whop_financial'->>'updated_at')::timestamptz,'epoch')<=stamp then
 update public.billing_charges set metadata=coalesce(metadata,'{}')||jsonb_build_object('whop_financial',p_state) where id=c.id;
 end if;
 return jsonb_build_object('recorded',true);
end $$;
revoke all on function public.whop_record_financial_state(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.whop_record_financial_state(uuid,text,jsonb) to service_role;

-- Retain the most recent explicit staff retry without exposing it to owners.
alter table public.whop_webhook_inbox add column last_retry_by uuid, add column last_retry_at timestamptz;
