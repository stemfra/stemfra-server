-- leads_entity_type_v1 — applied live 2026-09-10 (P31 section 3).
-- UK PECR: only a corporate subscriber (limited company / LLP / plc) may receive
-- cold B2B email without consent; a sole trader or partnership counts as an
-- individual. Reps record what Companies House shows; lib/outreachCompliance
-- emailAllowed() refuses email to a GB lead that is not a company. Null = unchecked.
alter table leads add column if not exists entity_type text
  check (entity_type in ('company', 'sole_trader', 'partnership', 'unknown'));
comment on column leads.entity_type is 'company | sole_trader | partnership | unknown. UK PECR gate: cold email only to company (Companies House). Null = unchecked.';
