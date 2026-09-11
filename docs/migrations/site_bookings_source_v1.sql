-- site_bookings_source_v1 (P36, 2026-09-11, Peter's rule): who created the booking.
-- Set ONCE at creation by the creating code path, never edited:
--   web            the public booking flow on the site
--   chat           the Front Desk agent (site chat)
--   voice          the voice agent
--   owner_walk_in  typed in by the owner in the CMS calendar for a walk-in
--   owner_phone    typed in by the owner after a phone call a human answered
--   import         CSV / provider import
-- Commission applies to web / chat / voice only. owner_* bookings still block
-- the calendar and show in Reports as "walk-in, no commission". NULL (rows
-- from before this column) is treated as web, which matches how they were made.
alter table public.site_bookings add column if not exists source text
  check (source is null or source in ('web','chat','voice','owner_walk_in','owner_phone','import'));
create index if not exists site_bookings_source_idx on public.site_bookings (site_id, source);
