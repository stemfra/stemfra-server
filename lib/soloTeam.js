// soloTeam — a fresh site's team is the OWNER alone (Peter, 2026-09-15: a first-time
// owner must not meet six strangers with photos on the team step; the sample
// services are a catalogue to tick, sample people are not). Lifted from
// routes/cms/team.js /solo so public signup (lib/onboardSite.js) can run it at
// provisioning: the seed's sample people go, one bookable record is created for
// the owner (name from the owner contact, else the business name), flagged
// `metadata.solo = true` + `is_owner`, role "Owner", linked to every active service,
// with weekly availability from the site's business hours. With one member the
// templates hide the team section and the booking flow skips the person step
// (packages/site-data `visibleTeam`); the moment a colleague is added everyone
// shows as a normal team. Demo and Starter sites are never touched (they are
// provisioned by staff scripts, not this path).
const { randomUUID } = require('crypto');
const supabase = require('../config/supabase');

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; // index = day_of_week (0 = Sun)

function slugify(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'owner';
}

async function ownerName(site) {
  const { data: c } = await supabase.from('contacts')
    .select('full_name, first_name, last_name')
    .eq('id', site.owner_contact_id).maybeSingle();
  const first = (c?.first_name || '').trim();
  const last = (c?.last_name || '').trim();
  const full = (c?.full_name || '').trim();
  const name = [first, last].filter(Boolean).join(' ') || full;
  if (name) return name;
  const { data: s } = await supabase.from('sites').select('company:companies(name)').eq('id', site.id).maybeSingle();
  return s?.company?.name || 'Owner';
}

/** Weekly availability rows from the site's business_hours JSON (mon..sun → {open, close, closed}). */
function rulesFromHours(siteId, memberId, hours) {
  const rows = [];
  DAYS.forEach((key, dow) => {
    const d = hours?.[key];
    if (!d || d.closed || !d.open || !d.close) return;
    rows.push({
      id: randomUUID(), site_id: siteId, team_member_id: memberId,
      rule_type: 'weekly_recurring', day_of_week: dow,
      start_time: d.open.length === 5 ? `${d.open}:00` : d.open,
      end_time: d.close.length === 5 ? `${d.close}:00` : d.close,
      is_active: true, metadata: {},
    });
  });
  return rows;
}

/**
 * Replace the site's team with the owner alone. Returns { member, linkedServices, availabilityDays }.
 * Never call it on a site with real bookings (it deletes members).
 */
async function makeSoloTeam(siteId) {
  const { data: full, error: sErr } = await supabase.from('sites').select('id, owner_contact_id, business_hours').eq('id', siteId).single();
  if (sErr) throw new Error(`site: ${sErr.message}`);
  const name = await ownerName({ id: siteId, owner_contact_id: full.owner_contact_id });

  for (const table of ['site_team_service_links', 'site_availability_rules', 'site_team_members']) {
    const { error } = await supabase.from(table).delete().eq('site_id', siteId);
    if (error) throw new Error(`${table}: ${error.message}`);
  }

  const memberId = randomUUID();
  const member = {
    id: memberId, site_id: siteId, name, slug: slugify(name), role: { en: 'Owner' },
    is_active: true, is_owner: true, is_featured: false, accepts_new_clients: true,
    display_order: 0, metadata: { solo: true },
  };
  const { error: mErr } = await supabase.from('site_team_members').insert(member);
  if (mErr) throw new Error(`site_team_members: ${mErr.message}`);

  const { data: services } = await supabase.from('site_services').select('id').eq('site_id', siteId).eq('is_active', true);
  if (services?.length) {
    const { error } = await supabase.from('site_team_service_links')
      .insert(services.map((s) => ({ id: randomUUID(), site_id: siteId, team_member_id: memberId, service_id: s.id })));
    if (error) throw new Error(`site_team_service_links: ${error.message}`);
  }

  const rules = rulesFromHours(siteId, memberId, full.business_hours);
  if (rules.length) {
    const { error } = await supabase.from('site_availability_rules').insert(rules);
    if (error) throw new Error(`site_availability_rules: ${error.message}`);
  }

  return { member, linkedServices: services?.length || 0, availabilityDays: rules.length };
}

module.exports = { makeSoloTeam, rulesFromHours };
