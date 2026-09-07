-- Light mode arc (2026-09-05): per-user theme preference. Dark stays the default for
-- everyone; light / system are opt-ins from Settings → Appearance. Applied live the same day.
alter table public.user_settings
  add column if not exists theme text not null default 'dark';
alter table public.user_settings drop constraint if exists user_settings_theme_check;
alter table public.user_settings
  add constraint user_settings_theme_check check (theme in ('dark','light','system'));
