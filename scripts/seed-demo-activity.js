#!/usr/bin/env node
// Rolling demo ACTIVITY seed for a demo/Starter site (Peter, 2026-09-08: richer
// data for the tutorial videos, kept apart from what a clone inherits).
//
//   node -r dotenv/config scripts/seed-demo-activity.js [--site argyle-and-sons] [--apply] [--with-posts]
//
// What it writes (all OPERATIONAL rows, which cloneSite/provisionSite never
// copy, so a new owner starting from this Starter gets none of it):
//   - bookings: the last 30 days + the next 14 (Mon to Sat, 10:00 to 18:30, no
//     overlaps per barber; past = completed / a few no-shows and cancellations,
//     most marked collected at venue; future = confirmed)
//   - leads: a handful over the last two weeks (new / read / replied)
//   - newsletter subscribers over the last 60 days
//   - existing active memberships get a current renewal date
//   - (--with-posts) two blog posts; PUBLIC on the live site, so opt-in only
// Every row carries metadata.demo_seed = true (the sweepers, compliance books
// and clone strip already honour it) + metadata.demo_seed_batch = <label>, so
// re-running replaces its own previous batch instead of piling up. Dry-run by
// default: prints the plan; --apply writes.
const supabase = require('../config/supabase');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const SUBDOMAIN = opt('--site', 'argyle-and-sons');
const APPLY = args.includes('--apply');
const WITH_POSTS = args.includes('--with-posts');
const BATCH = opt('--batch', 'rolling-activity');
const TAG = { demo_seed: true, demo_seed_batch: BATCH };

// Deterministic pseudo-random so two runs on the same day agree.
let seed = 20260908;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const day = (n) => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + n); return d; };
const at = (d, h, m) => { const x = new Date(d); x.setUTCHours(h, m, 0, 0); return x; };
const NY_OFFSET_H = 4; // America/New_York in September = UTC-4; slots below are local hours

const NEW_CUSTOMERS = [
  ['Ethan', 'Cole'], ['Noah', 'Reyes'], ['Mason', 'Kim'], ['Julian', 'Price'], ['Owen', 'Bassett'], ['Andre', 'Whitfield'],
  ['Caleb', 'Nguyen'], ['Miles', 'Carter'], ['Isaac', 'Romano'], ['Elijah', 'Sato'],
];
const LEADS = [
  { name: 'Daniel Ferreira', email: 'daniel.ferreira.demo@example.com', message: 'Do you take walk-ins on Saturdays or is it booking only?', source_page: 'Contact form', daysAgo: 0.3, status: 'new' },
  { name: 'Chris Okafor', email: 'chris.okafor.demo@example.com', message: 'Looking for a skin fade before a wedding on the 20th. Any slot after 5pm?', source_page: 'Chat assistant', daysAgo: 1.2, status: 'new' },
  { name: 'Tom Brennan', email: 'tom.brennan.demo@example.com', phone: '(212) 555-0161', message: 'Price for a father and son visit, haircut plus a kids cut?', source_page: 'Contact form', daysAgo: 3, status: 'read' },
  { name: 'Sam Whitaker', email: 'sam.whitaker.demo@example.com', message: 'Can I book the same barber every time? Theo did my last fade.', source_page: 'Chat assistant', daysAgo: 5, status: 'replied' },
  { name: 'Victor Alvarez', email: 'victor.alvarez.demo@example.com', message: 'Do you do beard trims only, no haircut?', source_page: 'Contact form', daysAgo: 8, status: 'replied' },
  { name: 'Ray Donovan', email: 'ray.donovan.demo@example.com', phone: '(917) 555-0144', message: 'Group booking for 4 groomsmen on a Friday morning, is that possible?', source_page: 'Contact form', daysAgo: 12, status: 'replied' },
];
const SUBSCRIBERS = ['ava.morgan', 'ben.hughes', 'carla.diaz', 'dev.patel', 'ella.brooks', 'finn.walsh', 'grace.lee', 'hugo.martin', 'ivy.chen', 'jack.turner', 'kai.nakamura', 'lena.fischer', 'max.rivera', 'nina.kowalski'];
const POSTS = [
  { title: 'How often should you get a haircut?', excerpt: 'Every cut has a shelf life. Here is how to time yours by style.', body: 'Short back and sides hold their shape for about three weeks. A longer scissor cut can go five or six. Beards want a tidy-up every two weeks if you like the line sharp.\n\nThe easiest habit is to book your next visit before you leave the chair. Your barber knows your grow-out and will suggest the right gap.', tags: ['grooming', 'tips'], daysAgo: 6 },
  { title: 'Hot towel shave: what actually happens', excerpt: 'Twenty minutes, four steps, one very close shave.', body: 'A hot towel opens the skin and softens the beard. Pre-shave oil, then a warm lather, then the straight razor with the grain and, where your skin allows it, against. A cold towel closes everything up and a balm settles the skin.\n\nIf you have never had one, book it before an event. You will look sharper for a good three days.', tags: ['services'], daysAgo: 16 },
];

async function main() {
  const { data: site, error } = await supabase.from('sites').select('id, subdomain, metadata, company:companies(name)').eq('subdomain', SUBDOMAIN).single();
  if (error || !site) throw new Error(`site ${SUBDOMAIN} not found`);
  if (!site.metadata?.is_starter && !site.metadata?.is_test) throw new Error(`${SUBDOMAIN} is not a Starter/test site; refusing to seed activity on a real tenant`);
  const sid = site.id;
  const [{ data: services }, { data: team }, { data: customers }, { data: subs }] = await Promise.all([
    supabase.from('site_services').select('id, name, price_cents, duration_minutes').eq('site_id', sid).eq('is_active', true).order('display_order'),
    supabase.from('site_team_members').select('id, name').eq('site_id', sid).eq('is_active', true).order('display_order'),
    supabase.from('site_customers').select('id, first_name, last_name, email').eq('site_id', sid),
    supabase.from('site_subscriptions').select('id, status').eq('site_id', sid).in('status', ['active', 'trialing']),
  ]);
  console.log(`[seed] ${site.company?.name} (${SUBDOMAIN}): ${services.length} services, ${team.length} barbers, ${customers.length} customers, ${subs.length} active members`);

  // ── Replace the previous batch ───────────────────────────────────────────
  if (APPLY) {
    const gone = {};
    for (const t of ['site_bookings', 'site_leads', 'site_posts']) {
      const { data } = await supabase.from(t).delete().eq('site_id', sid).eq('metadata->>demo_seed_batch', BATCH).select('id');
      gone[t] = data?.length || 0;
    }
    const { data: subsGone } = await supabase.from('site_newsletter_subscribers').delete().eq('site_id', sid).like('email', '%.demo.news@example.com').select('id');
    gone.newsletter = subsGone?.length || 0;
    console.log('[seed] removed previous batch:', gone);
  }

  // ── Customers: top up to ~30 named demo clients ──────────────────────────
  let pool = customers.slice();
  const missing = NEW_CUSTOMERS.filter(([f, l]) => !pool.some((c) => c.first_name === f && c.last_name === l));
  if (missing.length) {
    const rows = missing.map(([first_name, last_name], i) => ({ site_id: sid, first_name, last_name, email: `${first_name}.${last_name}.demo@example.com`.toLowerCase(), phone: `(212) 555-01${String(70 + i).padStart(2, '0')}`, metadata: TAG, created_at: day(-Math.floor(rnd() * 60)).toISOString() }));
    if (APPLY) { const { data, error: e } = await supabase.from('site_customers').insert(rows).select('id, first_name, last_name, email'); if (e) throw e; pool = pool.concat(data); }
    console.log(`[seed] customers to add: ${rows.length}`);
  }

  // ── Bookings: last 30 days + next 14, Mon to Sat, per-barber slot cursor ──
  const bookings = [];
  for (let d = -30; d <= 14; d++) {
    const date = day(d);
    const dow = date.getUTCDay(); // 0 Sun
    if (dow === 0) continue;
    const isSat = dow === 6;
    const perDay = isSat ? 8 : 5 + Math.floor(rnd() * 3); // Saturdays are busy
    const cursor = new Map(team.map((t) => [t.id, 10 * 60 + Math.floor(rnd() * 3) * 15])); // minutes since local midnight
    for (let i = 0; i < perDay; i++) {
      const barber = pick(team), svc = pick(services), cust = pick(pool);
      let start = cursor.get(barber.id);
      start += (Math.floor(rnd() * 3)) * 15; // a gap between clients
      if (start + svc.duration_minutes > 18 * 60 + 30) continue;
      const startsAt = at(date, Math.floor(start / 60) + NY_OFFSET_H, start % 60);
      const endsAt = new Date(startsAt.getTime() + svc.duration_minutes * 60000);
      cursor.set(barber.id, start + svc.duration_minutes);
      const past = startsAt < new Date();
      const r = rnd();
      const status = !past ? 'confirmed' : r < 0.05 ? 'no_show' : r < 0.09 ? 'cancelled' : 'completed';
      const collected = past && status === 'completed' && rnd() < 0.85;
      bookings.push({
        site_id: sid, customer_id: cust.id, team_member_id: barber.id, service_id: svc.id,
        service_name_snapshot: svc.name, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), duration_minutes: svc.duration_minutes,
        status, payment_status: 'none', amount_cents: svc.price_cents,
        confirmation_sent_at: new Date(startsAt.getTime() - 3 * 86400000).toISOString(),
        reminder_24h_sent_at: past ? new Date(startsAt.getTime() - 86400000).toISOString() : null,
        customer_notes: rnd() < 0.15 ? pick(['Running 5 min late', 'Same as last time please', 'First visit, recommended by a friend', 'Keep the beard length']) : null,
        metadata: collected ? { ...TAG, collected: true, collected_at: endsAt.toISOString() } : TAG,
        created_at: new Date(startsAt.getTime() - (2 + Math.floor(rnd() * 8)) * 86400000).toISOString(),
      });
    }
  }
  console.log(`[seed] bookings to write: ${bookings.length} (future ${bookings.filter((b) => b.status === 'confirmed').length})`);
  if (APPLY) { for (let i = 0; i < bookings.length; i += 100) { const { error: e } = await supabase.from('site_bookings').insert(bookings.slice(i, i + 100)); if (e) throw e; } }

  // ── Leads ────────────────────────────────────────────────────────────────
  const leads = LEADS.map((l) => {
    const created = new Date(Date.now() - l.daysAgo * 86400000);
    return { site_id: sid, name: l.name, email: l.email, phone: l.phone || null, message: l.message, source_page: l.source_page, status: l.status,
      read_at: l.status === 'new' ? null : new Date(created.getTime() + 3600000 * 5).toISOString(),
      replied_at: l.status === 'replied' ? new Date(created.getTime() + 3600000 * 9).toISOString() : null,
      metadata: l.source_page === 'Chat assistant' ? { ...TAG, source: 'website_chat', captured_by: 'frontdesk' } : TAG, created_at: created.toISOString() };
  });
  console.log(`[seed] leads to write: ${leads.length}`);
  if (APPLY) { const { error: e } = await supabase.from('site_leads').insert(leads); if (e) throw e; }

  // ── Newsletter subscribers ───────────────────────────────────────────────
  const newsRows = SUBSCRIBERS.map((n, i) => ({ site_id: sid, email: `${n}.demo.news@example.com`, source: 'footer', created_at: day(-Math.floor(rnd() * 60)).toISOString() }));
  console.log(`[seed] subscribers to write: ${newsRows.length}`);
  if (APPLY) { const { error: e } = await supabase.from('site_newsletter_subscribers').insert(newsRows); if (e) throw e; }

  // ── Memberships: current renewal dates on the existing active members ────
  if (APPLY && subs.length) {
    for (const s of subs) {
      const end = day(7 + Math.floor(rnd() * 21));
      const { error: e } = await supabase.from('site_subscriptions').update({ current_period_end: end.toISOString() }).eq('id', s.id); if (e) throw e;
    }
  }
  console.log(`[seed] memberships to re-date: ${subs.length}`);

  // ── Blog posts (public on the live site; opt-in) ─────────────────────────
  if (WITH_POSTS) {
    const rows = POSTS.map((p, i) => ({ site_id: sid, slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), title: { en: p.title }, excerpt: { en: p.excerpt }, body: { en: p.body }, author_name: 'Marcus Argyle', tags: p.tags, status: 'published', published_at: day(-p.daysAgo).toISOString(), reading_minutes: 2, display_order: i, metadata: TAG }));
    console.log(`[seed] posts to write: ${rows.length}`);
    if (APPLY) { const { error: e } = await supabase.from('site_posts').insert(rows); if (e) throw e; }
  }

  // ── Trim the notification storm the booking/lead triggers just created ──
  if (APPLY) {
    const cutoff = day(-3).toISOString();
    const { data: trimmed } = await supabase.from('cms_notifications').delete().eq('site_id', sid).in('type', ['booking_created', 'lead_created']).gte('created_at', new Date(Date.now() - 600000).toISOString()).select('id, metadata');
    console.log(`[seed] trigger notifications trimmed: ${trimmed?.length || 0} (bell keeps the organic ones; cutoff kept for reference ${cutoff})`);
  }
  console.log(APPLY ? '[seed] applied.' : '[seed] dry run only; add --apply to write.');
}

main().catch((e) => { console.error('[seed] failed:', e.message || e); process.exit(1); });
