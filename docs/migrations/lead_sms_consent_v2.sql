-- lead_sms_consent_v2 (2026-09-11, Peter: "if the owner consents on a call, how
-- do we unlock the text field?"). Consent gets a provenance so we can show
-- Twilio / a carrier HOW it was obtained (Messaging Policy: keep proof of every
-- consent). Sources: send_claim (the Send Claim click during a call),
-- verbal_call (rep recorded the owner's yes on a call, recording kept),
-- inbound_text (they texted us first), form (a web form / keyword opt-in).
alter table public.leads add column if not exists sms_consent_source text
  check (sms_consent_source is null or sms_consent_source in ('send_claim','verbal_call','inbound_text','form'));
alter table public.leads add column if not exists sms_consent_by uuid references auth.users(id) on delete set null;
alter table public.leads add column if not exists sms_consent_note text;
-- Backfill: every consent stamped so far came from the Send Claim click.
update public.leads set sms_consent_source = 'send_claim' where sms_consent_at is not null and sms_consent_source is null;
