-- Local release prerequisite. No new table or public access; all creation and
-- the purchase checkpoint commit together. Never apply automatically at startup.
create or replace function public.provision_paid_website(
 p_purchase uuid, p_user uuid, p_source uuid, p_rows jsonb, p_lead uuid default null
) returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare
 purchase public.managed_website_purchases%rowtype;
 site_row jsonb; company_row jsonb; site_key uuid; contact_key uuid; company_key uuid;
 existing_contact uuid; entry jsonb; record jsonb; tab text; columns_sql text;
 allowed constant text[] := array['companies','contacts','sites','site_pages','site_sections',
 'site_service_categories','site_services','site_team_members','site_team_service_links',
 'site_availability_rules','site_testimonials','site_theme_settings','legal_acceptances'];
begin
 select * into purchase from public.managed_website_purchases where id=p_purchase for update;
 if not found or purchase.auth_user_id is distinct from p_user then raise exception 'purchase_owner_mismatch'; end if;
 if purchase.site_id is not null then return purchase.site_id; end if;
 -- Older non-atomic provisioning may have orphaned rows. Do not guess which tenant owns them.
 if purchase.state='provisioning' then raise exception 'legacy_provisioning_requires_review'; end if;
 if not (purchase.snapshot ?& array['paid','status','period_end','currency','monthly_cents']) or purchase.state <> 'paid' or not coalesce((purchase.snapshot->>'paid')::boolean,false)
 or purchase.snapshot->>'status' is distinct from 'active' or (purchase.snapshot->>'period_end')::timestamptz <= now()
 or upper(purchase.snapshot->>'currency') is distinct from purchase.currency
 or (purchase.snapshot->>'monthly_cents')::integer is distinct from purchase.monthly_cents then raise exception 'purchase_not_paid'; end if;
 if purchase.selection->>'starterId' is not null and (purchase.selection->>'starterId')::uuid <> p_source then raise exception 'purchase_source_mismatch'; end if;
 if jsonb_typeof(p_rows) <> 'array' then raise exception 'invalid_clone_plan'; end if;
 select e->'records'->0 into site_row from jsonb_array_elements(p_rows) e where e->>'table'='sites';
 select e->'records'->0 into company_row from jsonb_array_elements(p_rows) e where e->>'table'='companies';
 site_key := (site_row->>'id')::uuid; company_key := (company_row->>'id')::uuid; contact_key := (site_row->>'owner_contact_id')::uuid;
 if site_key is null or company_key is null or contact_key is null or (site_row->>'company_id')::uuid <> company_key
 or site_row->>'status' <> 'previewing' or (site_row->'metadata'->>'cloned_from')::uuid is distinct from p_source then raise exception 'invalid_site_binding'; end if;
 if not exists(select 1 from public.sites where id=p_source and template_id=(site_row->>'template_id')::uuid)
 and purchase.selection->>'starterId' is not null then raise exception 'template_mismatch'; end if;
 -- Serialize account/contact creation across two different purchases for the same owner.
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 select id into existing_contact from public.contacts where auth_user_id=p_user;
 if existing_contact is not null and existing_contact <> contact_key then raise exception 'contact_changed_retry' using errcode='40001'; end if;
 for entry in select value from jsonb_array_elements(p_rows) loop
  tab := entry->>'table';
  if tab is null or not tab=any(allowed) then raise exception 'invalid_clone_table'; end if;
  for record in select value from jsonb_array_elements(entry->'records') loop
   if tab not in ('companies','contacts','sites') and (record->>'site_id')::uuid is distinct from site_key then raise exception 'clone_scope_mismatch'; end if;
   if tab='companies' and (record->>'id')::uuid is distinct from company_key then raise exception 'company_mismatch'; end if;
   if tab='contacts' and ((record->>'id')::uuid is distinct from contact_key or (record->>'auth_user_id')::uuid is distinct from p_user) then raise exception 'contact_mismatch'; end if;
   if tab='sites' and (record->>'id')::uuid is distinct from site_key then raise exception 'site_mismatch'; end if;
   select string_agg(format('%I',k),',' order by k) into columns_sql from jsonb_object_keys(record) k;
   if columns_sql is null then raise exception 'empty_clone_record'; end if;
   -- Identifiers are allowlisted/quoted; values are bound parameters. Omitted
   -- fields keep their actual database defaults instead of being forced null.
   execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I,$1)',tab,columns_sql,columns_sql,tab) using record;
  end loop;
 end loop;
 if not exists(select 1 from public.contacts where id=contact_key and auth_user_id=p_user) then raise exception 'contact_owner_mismatch'; end if;
 if p_lead is not null then
  if purchase.selection->>'claimToken' is null then raise exception 'claim_binding_missing'; end if;
  update public.leads set stage='won',won_at=now(),outreach_status='converted',engagement_status='closed',contact_id=contact_key,last_activity_at=now() where id=p_lead;
  insert into public.marketing_events(lead_id,event,ip,user_agent,metadata) values(p_lead,'signup_complete',purchase.selection->>'clientIp',purchase.selection->>'userAgent',jsonb_build_object('site_id',site_key,'subdomain',site_row->>'subdomain'));
 end if;
 update public.managed_website_purchases set site_id=site_key,state='provisioning' where id=p_purchase;
 return site_key;
end $$;
revoke all on function public.provision_paid_website(uuid,uuid,uuid,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.provision_paid_website(uuid,uuid,uuid,jsonb,uuid) to service_role;
create or replace function public.paid_website_provisioning_ready() returns boolean language sql security invoker set search_path=public,pg_temp as $$ select true $$;
revoke all on function public.paid_website_provisioning_ready() from public,anon,authenticated;
grant execute on function public.paid_website_provisioning_ready() to service_role;
