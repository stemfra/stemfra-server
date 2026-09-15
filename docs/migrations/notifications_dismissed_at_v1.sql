-- Notification clearing (Peter, 2026-09-15). Applied 2026-09-15 via the Supabase MCP.
-- A cleared notification is HIDDEN (dismissed_at set), never deleted, so the row
-- stays for audit (a lead-gen bell may be the only record a rep saw). Both apps
-- filter `dismissed_at is null`; the CRM tray and the CMS bell also drop READ
-- rows older than 30 days, the CMS history page keeps them.
alter table public.crm_notifications add column if not exists dismissed_at timestamptz;
alter table public.cms_notifications add column if not exists dismissed_at timestamptz;
create index if not exists crm_notifications_user_live_idx on public.crm_notifications (user_id, created_at desc) where dismissed_at is null;
create index if not exists cms_notifications_site_live_idx on public.cms_notifications (site_id, created_at desc) where dismissed_at is null;
