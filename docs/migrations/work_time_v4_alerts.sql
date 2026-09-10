-- P29 phase 4 (2026-09-10): shift-end close + alerts.
-- The sweeper freezes each shift day once its window has ended (closed_at) and,
-- for tracked roles on a work day, bells the team roles when the day came up
-- short without an approved absence (alerted_at prevents a second bell).
-- Weekly summary state lives in crm_settings key 'work_time_state'.
alter table public.work_days
  add column if not exists closed_at  timestamptz,
  add column if not exists alerted_at timestamptz;
create index if not exists work_days_open_idx on public.work_days (day) where closed_at is null;
