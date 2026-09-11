-- leads.vertical (2026-09-11): the six verticals we sell, as a first-class column.
-- Backfilled from qualification.vertical (lead-gen) else the legacy design-gallery
-- template_slug ('barber' → barbershop, 'beauty' → beauty_salon). Read via
-- lib/leadVertical.js verticalOfLead(); the CRM filters on this column.
alter table public.leads add column if not exists vertical text;
alter table public.leads drop constraint if exists leads_vertical_check;
alter table public.leads add constraint leads_vertical_check
  check (vertical is null or vertical in ('barbershop','beauty_salon','crossfit','yoga_pilates','massage','spa'));
update public.leads set vertical = case lower(coalesce(qualification->>'vertical',''))
    when 'barbershop' then 'barbershop' when 'barbershops' then 'barbershop' when 'barber' then 'barbershop'
    when 'beauty_salon' then 'beauty_salon' when 'salon' then 'beauty_salon' when 'salons' then 'beauty_salon' when 'beauty' then 'beauty_salon'
    when 'crossfit' then 'crossfit' when 'gym' then 'crossfit' when 'fitness' then 'crossfit'
    when 'yoga_pilates' then 'yoga_pilates' when 'yoga' then 'yoga_pilates' when 'pilates' then 'yoga_pilates'
    when 'massage' then 'massage' when 'spa' then 'spa' else null end
  where vertical is null;
update public.leads set vertical = case template_slug
    when 'barber' then 'barbershop' when 'beauty' then 'beauty_salon' when 'fitness' then 'crossfit' when 'studio' then 'yoga_pilates' else null end
  where vertical is null and template_slug is not null;
create index if not exists leads_vertical_idx on public.leads (vertical);

-- Keep the column filled for every writer that only knows the legacy fields
-- (the n8n lead-gen insert writes qualification.vertical; older code writes
-- template_slug): derive on insert/update when vertical is null.
create or replace function public.leads_derive_vertical() returns trigger language plpgsql as $$
begin
  if new.vertical is null then
    new.vertical := case lower(coalesce(new.qualification->>'vertical', new.template_slug, ''))
      when 'barbershop' then 'barbershop' when 'barbershops' then 'barbershop' when 'barber' then 'barbershop'
      when 'beauty_salon' then 'beauty_salon' when 'salon' then 'beauty_salon' when 'salons' then 'beauty_salon' when 'beauty' then 'beauty_salon'
      when 'crossfit' then 'crossfit' when 'gym' then 'crossfit' when 'fitness' then 'crossfit'
      when 'yoga_pilates' then 'yoga_pilates' when 'yoga' then 'yoga_pilates' when 'pilates' then 'yoga_pilates' when 'studio' then 'yoga_pilates'
      when 'massage' then 'massage' when 'spa' then 'spa' else null end;
  end if;
  return new;
end $$;
drop trigger if exists leads_derive_vertical on public.leads;
create trigger leads_derive_vertical before insert or update of qualification, template_slug on public.leads
  for each row execute function public.leads_derive_vertical();
