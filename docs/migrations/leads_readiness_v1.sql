-- leads_readiness_v1 (2026-09-11, Peter + the Neil's Barbershop call): digital
-- readiness of a scraped business, from signals already in the Google Maps
-- record (no extra cost). Set by the n8n Parse step (leadgen-parse-v13):
--   old_school = listing not claimed by the owner
--   middle     = claimed, nothing else on the profile
--   modern     = claimed + one sign of life: owner description or post,
--                20+ photos, a booking link, or a social profile
-- Details (which signals fired) live in qualification.readiness_signals.
alter table public.leads add column if not exists readiness text
  check (readiness is null or readiness in ('modern','middle','old_school'));
create index if not exists leads_readiness_idx on public.leads (readiness);
