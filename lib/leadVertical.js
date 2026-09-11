// leadVertical — the ONE way to read a lead's vertical (2026-09-11).
//
// History: leads carried a legacy `template_slug` from the 16-box design
// gallery ('barber', 'beauty', …), and the lead-gen agent later wrote the real
// vertical into `qualification.vertical`. The CRM's Vertical filter still read
// the box slug and showed "The Barber Box" (Peter, 2026-09-11). `leads.vertical`
// (migration leads_vertical_v1, backfilled) is now the source of truth; the two
// legacy fields only feed the fallback here. Values = the six verticals we sell:
// barbershop, beauty_salon, crossfit, yoga_pilates, massage, spa.
const { resolveVerticalSlug } = require('./verticalConfig');

const VERTICALS = ['barbershop', 'beauty_salon', 'crossfit', 'yoga_pilates', 'massage', 'spa'];
const LABEL = { barbershop: 'Barbershop', beauty_salon: 'Beauty salon', crossfit: 'CrossFit', yoga_pilates: 'Yoga & Pilates', massage: 'Massage', spa: 'Spa' };

// resolveVerticalSlug returns the templates' vertical slugs (barbershops, salons,
// yoga_pilates, …); map them onto the lead vocabulary.
const FROM_TEMPLATE = { barbershops: 'barbershop', salons: 'beauty_salon', crossfit: 'crossfit', yoga_pilates: 'yoga_pilates', massage: 'massage', spa: 'spa', boutique_gyms: 'crossfit' };

function normalise(v) {
  if (!v) return null;
  const s = String(v).trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (VERTICALS.includes(s)) return s;
  const alias = { barber: 'barbershop', barbershops: 'barbershop', salon: 'beauty_salon', salons: 'beauty_salon', beauty: 'beauty_salon', yoga: 'yoga_pilates', pilates: 'yoga_pilates', gym: 'crossfit', fitness: 'crossfit' }[s];
  if (alias) return alias;
  try { return FROM_TEMPLATE[resolveVerticalSlug(s)] || null; } catch { return null; }
}

/** The lead's vertical slug (one of VERTICALS) or null. */
function verticalOfLead(lead) {
  if (!lead) return null;
  if (lead.vertical) return normalise(lead.vertical);
  let q = lead.qualification;
  if (typeof q === 'string') { try { q = JSON.parse(q); } catch { q = null; } }
  return normalise(q && q.vertical) || normalise(lead.template_slug) || normalise(lead.service_type);
}

module.exports = { VERTICALS, LABEL, normalise, verticalOfLead };
