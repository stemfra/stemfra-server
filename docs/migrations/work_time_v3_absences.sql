-- P29 phase 3 (2026-09-10): permission from a superior.
-- A rep requests hours off a shift day; manager and above approve or reject.
-- Approved minutes become work_days.excused_minutes and count toward the target.
-- Writes go through the server (routes/workTime.js); RLS is read-only defense.
create table if not exists public.staff_absences (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  day          date not null,                    -- the shift day (shift tz)
  minutes      integer not null check (minutes > 0 and minutes <= 24 * 60),
  reason       text,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  decided_by   uuid references auth.users(id) on delete set null,
  decided_at   timestamptz,
  note         text,                             -- the manager's note on the decision
  created_at   timestamptz not null default now()
);
create index if not exists staff_absences_user_day_idx on public.staff_absences (user_id, day desc);
create index if not exists staff_absences_status_idx on public.staff_absences (status, requested_at desc);

alter table public.staff_absences enable row level security;
drop policy if exists staff_absences_own_select on public.staff_absences;
create policy staff_absences_own_select on public.staff_absences for select to authenticated
  using (user_id = auth.uid());
drop policy if exists staff_absences_team_select on public.staff_absences;
create policy staff_absences_team_select on public.staff_absences for select to authenticated
  using (has_crm_role('super_admin','admin','manager','sales_manager'));
