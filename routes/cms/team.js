// /api/cms/team — the setup wizard's team step (P39 onboarding v2, slice b, 2026-09-13).
//   POST /solo { siteId }  → { member } makes the site a one-person shop
//
// "Just me": the sample people are removed and ONE bookable record is created for
// the owner (name from the owner's contact, else the business name), flagged
// `metadata.solo = true` + `is_owner`. It is linked to every active service and
// gets weekly availability copied from the site's business hours, so booking
// works exactly as it does for a team. The templates hide the Team section, the
// Team nav item and the "choose your barber" step while the solo record is the
// only active member (packages/site-data `visibleTeam`); the moment the owner
// adds a colleague in the CMS, everyone (owner included) shows as a normal team.
// `siteCompleteness` needs no change: "at least one team member" stays true.
const express = require('express');
const { randomUUID } = require('crypto');
const supabase = require('../../config/supabase');
const { requireCmsAuth, verifySiteOwnership } = require('../../middleware/cmsAuth');

const router = express.Router();
router.use(express.json({ limit: '10kb' }));
router.use(requireCmsAuth);

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

router.post('/solo', async (req, res) => {
  const siteId = String(req.body?.siteId || '');
  if (!siteId) return res.status(400).json({ error: 'siteId is required' });
  const site = await verifySiteOwnership(req.cmsUser.id, siteId);
  if (!site) return res.status(403).json({ error: 'Not your site' });

  try {
    const { data: full } = await supabase.from('sites').select('id, owner_contact_id, business_hours').eq('id', siteId).single();
    const name = await ownerName({ id: siteId, owner_contact_id: full.owner_contact_id });

    // Sample people (and anything hanging off them) go; bookings on a fresh site do
    // not exist yet, and a site with real bookings is not one the wizard runs on.
    for (const table of ['site_team_service_links', 'site_availability_rules', 'site_team_members']) {
      const { error } = await supabase.from(table).delete().eq('site_id', siteId);
      if (error) throw new Error(`${table}: ${error.message}`);
    }

    const memberId = randomUUID();
    const member = {
      id: memberId, site_id: siteId, name, slug: slugify(name),
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

    return res.json({ member, linkedServices: services?.length || 0, availabilityDays: rules.length });
  } catch (e) {
    console.error('[cms/team/solo]', e.message);
    return res.status(500).json({ error: e.message || 'Could not set up the solo profile' });
  }
});


// POST /defaults { siteId } → { linked, scheduled }
// The wizard's team step is a plain list of names (Peter, 2026-09-14). A person
// added there must be bookable at once, so this gives every ACTIVE member who has
// none yet: links to all active services, and weekly availability from the
// business hours. Idempotent: members who already have links or rules are left
// alone. (The /solo endpoint above stays for the older "Just me" path.)
router.post('/defaults', async (req, res) => {
  const siteId = String(req.body?.siteId || '');
  if (!siteId) return res.status(400).json({ error: 'siteId is required' });
  const site = await verifySiteOwnership(req.cmsUser.id, siteId);
  if (!site) return res.status(403).json({ error: 'Not your site' });
  try {
    const [{ data: full }, { data: members }, { data: services }, { data: links }, { data: rules }] = await Promise.all([
      supabase.from('sites').select('business_hours').eq('id', siteId).single(),
      supabase.from('site_team_members').select('id').eq('site_id', siteId).eq('is_active', true),
      supabase.from('site_services').select('id').eq('site_id', siteId).eq('is_active', true),
      supabase.from('site_team_service_links').select('team_member_id').eq('site_id', siteId),
      supabase.from('site_availability_rules').select('team_member_id').eq('site_id', siteId).eq('is_active', true),
    ]);
    const hasLinks = new Set((links || []).map((l) => l.team_member_id));
    const hasRules = new Set((rules || []).map((r) => r.team_member_id));
    let linked = 0, scheduled = 0;
    for (const m of members || []) {
      if (!hasLinks.has(m.id) && services?.length) {
        const { error } = await supabase.from('site_team_service_links')
          .insert(services.map((s) => ({ id: randomUUID(), site_id: siteId, team_member_id: m.id, service_id: s.id })));
        if (error) throw new Error(`site_team_service_links: ${error.message}`);
        linked++;
      }
      if (!hasRules.has(m.id)) {
        const rows = rulesFromHours(siteId, m.id, full?.business_hours);
        if (rows.length) {
          const { error } = await supabase.from('site_availability_rules').insert(rows);
          if (error) throw new Error(`site_availability_rules: ${error.message}`);
          scheduled++;
        }
      }
    }
    return res.json({ linked, scheduled, members: (members || []).length });
  } catch (e) {
    console.error('[cms/team/defaults]', e.message);
    return res.status(500).json({ error: e.message || 'Could not set up the team' });
  }
});

module.exports = router;
