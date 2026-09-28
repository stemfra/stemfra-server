-- P45 (2026-09-28): agent abuse and spend protection.
-- Daily message counters for the AI agents, per scope: the whole agent
-- ('global'), one tenant site ('site'), one visitor address ('ip', stored as a
-- salted hash, never the address) and one CMS owner ('owner'). The server
-- bumps the counters on every agent message (lib/agentBudget.js) and stops
-- calling the model once a cap from crm_settings.agent_budget is passed.
-- Additive. RLS on: staff may read, only the service role writes.

create table if not exists public.agent_usage (
  day         date        not null,
  agent       text        not null,
  scope       text        not null check (scope in ('global', 'site', 'ip', 'owner')),
  scope_key   text        not null,
  messages    integer     not null default 0,
  blocked     integer     not null default 0,
  alerted_at  timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (day, agent, scope, scope_key)
);

create index if not exists agent_usage_day_idx on public.agent_usage (day desc, agent);

alter table public.agent_usage enable row level security;

drop policy if exists agent_usage_staff_read on public.agent_usage;
create policy agent_usage_staff_read on public.agent_usage
  for select to authenticated using (public.is_stemfra_staff());

-- One round trip per message: bump every scope and hand back the new counts.
-- p_scopes = [{"scope":"site","key":"<uuid>"}, {"scope":"ip","key":"<hash>"}, ...]
-- Returns {"site": 12, "ip": 3, "global": 140}.
create or replace function public.agent_usage_bump(p_agent text, p_scopes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s jsonb;
  n integer;
  out jsonb := '{}'::jsonb;
  d date := (now() at time zone 'utc')::date;
begin
  for s in select * from jsonb_array_elements(coalesce(p_scopes, '[]'::jsonb)) loop
    insert into public.agent_usage (day, agent, scope, scope_key, messages)
    values (d, p_agent, s->>'scope', s->>'key', 1)
    on conflict (day, agent, scope, scope_key)
    do update set messages = public.agent_usage.messages + 1, updated_at = now()
    returning messages into n;
    out := out || jsonb_build_object(s->>'scope', n);
  end loop;
  return out;
end;
$$;

revoke all on function public.agent_usage_bump(text, jsonb) from public, anon, authenticated;
grant execute on function public.agent_usage_bump(text, jsonb) to service_role;
