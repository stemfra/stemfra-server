-- leads_reject_old_school_v1 (2026-09-16, Peter after the Neil's Barbershop call +
-- the remote-team decision): a scraped listing the owner never claimed
-- (readiness = 'old_school') is not a match for Stemfra's remote, digital-first
-- offer, so it never enters the CRM. The n8n workflow drops these at its
-- Digital-ready? gate (n8n-workflows/leadgen-readiness-gate-v15.paste.md) and
-- reports the count; this trigger is the backstop for any lead-gen insert that
-- skips the gate. Hand-added leads (source <> 'google_maps') are never touched.
-- Returning NULL from a BEFORE INSERT trigger silently drops the row.
create or replace function public.leads_reject_old_school()
returns trigger
language plpgsql
as $$
begin
  if new.readiness = 'old_school' and coalesce(new.source, '') = 'google_maps' then
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_reject_old_school on public.leads;
create trigger leads_reject_old_school
  before insert on public.leads
  for each row execute function public.leads_reject_old_school();
