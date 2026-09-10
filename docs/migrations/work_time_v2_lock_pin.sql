-- P29 phase 2 (2026-09-10): CRM lock-screen PIN.
-- Kept OUT of user_settings on purpose: that table is returned whole to the
-- client by /api/user-settings and read directly by the CRM, so a hash column
-- there would leak. This table has RLS on and NO policies: service role only
-- (routes/workTime.js set / verify / remove). scrypt hash, salted per user.
create table if not exists public.staff_lock_pins (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  pin_hash        text not null,          -- "scrypt$<salt hex>$<hash hex>"
  set_at          timestamptz not null default now(),
  failed_attempts integer not null default 0,
  locked_until    timestamptz,            -- after 5 wrong tries: 15 minutes, Google only
  updated_at      timestamptz not null default now()
);
alter table public.staff_lock_pins enable row level security;
