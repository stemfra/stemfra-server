// serviceCatalog — the curated "most common services" per vertical that the
// setup wizard offers as tick boxes (P39 onboarding v2, slice a, 2026-09-13).
//
// Peter's rule: an owner should tick what they offer and type a price, not
// rename demo services. Names stay plain and vertical-neutral in tone; the
// durations are typical starting points the owner can change. Prices are never
// pre-filled (they differ by market and shop). Fitness entries carry
// `kind: 'class'` so the CMS creates them as classes, not appointments.
//
// Custom names owners add land in `service_suggestions` (routes/cms/serviceCatalog);
// promote the frequent ones into this file. Keep every entry short and in the
// order a shop would list it.
const CATALOG = {
  barbershops: [
    { name: "Men's haircut", duration: 30 },
    { name: 'Skin fade', duration: 45 },
    { name: 'Scissor cut', duration: 45 },
    { name: 'Buzz cut', duration: 20 },
    { name: 'Beard trim', duration: 20 },
    { name: 'Beard sculpt', duration: 30 },
    { name: 'Hot towel shave', duration: 30 },
    { name: 'Haircut & beard', duration: 60 },
    { name: 'Line-up / edge-up', duration: 15 },
    { name: "Kids' haircut", duration: 30 },
    { name: 'Seniors haircut', duration: 30 },
    { name: 'Wash & style', duration: 30 },
    { name: 'Hair colour', duration: 60 },
    { name: 'Grey blending', duration: 45 },
    { name: 'Head shave', duration: 30 },
    { name: 'Eyebrow trim', duration: 10 },
    { name: 'Facial', duration: 30 },
    { name: 'Scalp treatment', duration: 30 },
  ],
  salons: [
    { name: "Women's cut & style", duration: 60 },
    { name: "Men's cut", duration: 30 },
    { name: "Kids' cut", duration: 30 },
    { name: 'Blow-dry', duration: 45 },
    { name: 'Root touch-up', duration: 90 },
    { name: 'Full colour', duration: 120 },
    { name: 'Highlights, partial', duration: 120 },
    { name: 'Highlights, full', duration: 180 },
    { name: 'Balayage', duration: 180 },
    { name: 'Toner / gloss', duration: 45 },
    { name: 'Keratin treatment', duration: 150 },
    { name: 'Deep conditioning', duration: 30 },
    { name: 'Updo / event styling', duration: 60 },
    { name: 'Manicure', duration: 45 },
    { name: 'Gel manicure', duration: 60 },
    { name: 'Pedicure', duration: 60 },
    { name: 'Brow shape & tint', duration: 30 },
    { name: 'Lash extensions', duration: 120 },
    { name: 'Waxing', duration: 30 },
    { name: 'Facial', duration: 60 },
    { name: 'Makeup', duration: 60 },
  ],
  crossfit: [
    { name: 'Free intro session', duration: 45, kind: 'class' },
    { name: 'CrossFit class', duration: 60, kind: 'class' },
    { name: 'Strength & power', duration: 60, kind: 'class' },
    { name: 'Conditioning / MetCon', duration: 45, kind: 'class' },
    { name: 'Olympic lifting', duration: 75, kind: 'class' },
    { name: 'Gymnastics skills', duration: 60, kind: 'class' },
    { name: 'Mobility & recovery', duration: 45, kind: 'class' },
    { name: 'Open gym', duration: 60, kind: 'class' },
    { name: 'Kids class', duration: 45, kind: 'class' },
    { name: 'Teens class', duration: 60, kind: 'class' },
    { name: 'Masters (40+)', duration: 60, kind: 'class' },
    { name: 'Foundations / on-ramp', duration: 60, kind: 'class' },
    { name: 'Personal training', duration: 60 },
    { name: 'Nutrition coaching', duration: 45 },
    { name: 'Movement assessment', duration: 45 },
  ],
  yoga_pilates: [
    { name: 'First-timer intro', duration: 60, kind: 'class' },
    { name: 'Vinyasa flow', duration: 60, kind: 'class' },
    { name: 'Slow flow', duration: 60, kind: 'class' },
    { name: 'Power yoga', duration: 60, kind: 'class' },
    { name: 'Hatha', duration: 60, kind: 'class' },
    { name: 'Yin', duration: 75, kind: 'class' },
    { name: 'Restorative', duration: 75, kind: 'class' },
    { name: 'Hot yoga', duration: 60, kind: 'class' },
    { name: 'Prenatal yoga', duration: 60, kind: 'class' },
    { name: 'Pilates mat', duration: 50, kind: 'class' },
    { name: 'Pilates reformer', duration: 50, kind: 'class' },
    { name: 'Meditation', duration: 30, kind: 'class' },
    { name: 'Breathwork', duration: 45, kind: 'class' },
    { name: 'Private session', duration: 60 },
    { name: 'Workshop', duration: 120, kind: 'class' },
  ],
  massage: [
    { name: 'Swedish massage', duration: 60 },
    { name: 'Deep tissue massage', duration: 60 },
    { name: 'Sports massage', duration: 60 },
    { name: 'Hot stone massage', duration: 75 },
    { name: 'Aromatherapy massage', duration: 60 },
    { name: 'Prenatal massage', duration: 60 },
    { name: 'Thai massage', duration: 90 },
    { name: 'Reflexology', duration: 45 },
    { name: 'Lymphatic drainage', duration: 60 },
    { name: 'Cupping', duration: 45 },
    { name: 'Couples massage', duration: 60 },
    { name: 'Chair massage', duration: 20 },
    { name: 'Head, neck & shoulders', duration: 30 },
    { name: 'Foot massage', duration: 30 },
    { name: 'Stretch therapy', duration: 45 },
    { name: 'Body scrub', duration: 45 },
  ],
  spa: [
    { name: 'Signature facial', duration: 60 },
    { name: 'Deep cleanse facial', duration: 45 },
    { name: 'Anti-ageing facial', duration: 75 },
    { name: 'Swedish massage', duration: 60 },
    { name: 'Deep tissue massage', duration: 60 },
    { name: 'Hot stone massage', duration: 75 },
    { name: 'Aromatherapy massage', duration: 60 },
    { name: 'Body scrub', duration: 45 },
    { name: 'Body wrap', duration: 60 },
    { name: 'Spa manicure', duration: 45 },
    { name: 'Spa pedicure', duration: 60 },
    { name: 'Gel manicure', duration: 60 },
    { name: 'Waxing', duration: 30 },
    { name: 'Brow & lash tint', duration: 30 },
    { name: 'Couples package', duration: 90 },
    { name: 'Sauna / steam session', duration: 45 },
    { name: 'Spa day package', duration: 180 },
  ],
};

// Vertical slug aliases the rest of the platform uses (lib/verticalConfig).
const ALIAS = { barbers: 'barbershops', barbershop: 'barbershops', salon: 'salons', beauty_salon: 'salons', yoga: 'yoga_pilates', pilates: 'yoga_pilates', spas: 'spa', massage_studio: 'massage', gym: 'crossfit', fitness: 'crossfit' };

function catalogFor(verticalSlug) {
  const slug = String(verticalSlug || '').toLowerCase();
  const key = CATALOG[slug] ? slug : ALIAS[slug] || null;
  return key ? { vertical: key, items: CATALOG[key] } : { vertical: null, items: [] };
}

module.exports = { CATALOG, catalogFor };
