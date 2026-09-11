-- sms_ignored_numbers_v1 (2026-09-11, Peter): tag a text thread as "not relevant".
-- Recycled Twilio numbers receive texts meant for their previous holder (a UK
-- debt collector texting "saeid" on our UK line). Staff mark the number as not
-- relevant from Inbox → Texts; existing inbound rows are dismissed and the
-- webhook files future texts from that number as dismissed + read (no bell, no
-- activity). Restore = delete the row.
create table if not exists public.sms_ignored_numbers (
  phone       text primary key,           -- E.164 as Twilio sends it
  reason      text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.sms_ignored_numbers enable row level security;
drop policy if exists sms_ignored_numbers_staff_all on public.sms_ignored_numbers;
create policy sms_ignored_numbers_staff_all on public.sms_ignored_numbers
  for all using (is_stemfra_staff()) with check (is_stemfra_staff());

alter table public.sms_messages add column if not exists dismissed_at timestamptz;
create index if not exists sms_messages_dismissed_idx on public.sms_messages (from_number) where dismissed_at is not null;
