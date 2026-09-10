-- P29 phase 1 (2026-09-10): staff working-time monitor.
-- Presence heartbeats already say who is online; they now also carry whether the
-- person is idle (no input for N minutes, N = crm_settings.work_time.idle_stop_minutes)
-- and whether a call is live. The server sweeper turns that into work_sessions
-- (open/close) and rolls them into one work_days row per person per shift.
-- Writes: service role only (the sweeper). Reads: own rows, or the team for
-- manager-and-above via has_crm_role(). No screenshots, no keystrokes.

alter table public.user_presence
  add column if not exists last_active_at timestamptz,
  add column if not exists idle boolean not null default false,
  add column if not exists in_call boolean not null default false;

-- Per-rep shift, e.g. {"start":"16:00","end":"24:00","tz":"Africa/Lagos"}.
-- NULL = crm_settings.work_time.default_shift.
alter table public.profiles add column if not exists shift jsonb;

create table if not exists public.work_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at   timestamptz,
  source     text not null default 'presence',
  created_at timestamptz not null default now()
);
create index if not exists work_sessions_user_started_idx on public.work_sessions (user_id, started_at desc);
-- one open session per person
create unique index if not exists work_sessions_open_idx on public.work_sessions (user_id) where ended_at is null;

create table if not exists public.work_days (
  user_id         uuid not null references auth.users(id) on delete cascade,
  day             date not null,                 -- the shift's calendar day in the rep's shift tz
  shift_start     timestamptz,
  shift_end       timestamptz,
  active_minutes  integer not null default 0,
  idle_minutes    integer not null default 0,
  calls           integer not null default 0,
  emails          integer not null default 0,
  first_seen      timestamptz,
  last_seen       timestamptz,
  excused_minutes integer not null default 0,    -- phase 3: approved absences
  target_minutes  integer,
  status          text,                          -- phase 4: 'ok' | 'short' | 'excused', set at shift end
  updated_at      timestamptz not null default now(),
  primary key (user_id, day)
);
create index if not exists work_days_day_idx on public.work_days (day desc);

alter table public.work_sessions enable row level security;
alter table public.work_days enable row level security;

drop policy if exists work_sessions_own_select on public.work_sessions;
create policy work_sessions_own_select on public.work_sessions for select to authenticated
  using (user_id = auth.uid());
drop policy if exists work_sessions_team_select on public.work_sessions;
create policy work_sessions_team_select on public.work_sessions for select to authenticated
  using (has_crm_role('super_admin','admin','manager','sales_manager'));

drop policy if exists work_days_own_select on public.work_days;
create policy work_days_own_select on public.work_days for select to authenticated
  using (user_id = auth.uid());
drop policy if exists work_days_team_select on public.work_days;
create policy work_days_team_select on public.work_days for select to authenticated
  using (has_crm_role('super_admin','admin','manager','sales_manager'));

-- Team-wide settings (super_admin edits them from Settings → Work time via the server).
insert into public.crm_settings (key, value)
values ('work_time', '{"idle_stop_minutes":5,"lock_minutes":45,"lock_mode":"pin","target_hours":7,"shift_hours":8,"default_shift":{"start":"16:00","end":"24:00","tz":"Africa/Lagos"}}'::jsonb)
on conflict (key) do nothing;
