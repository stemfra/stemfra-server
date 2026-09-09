// Video 6: "How to add a service" (Services). CMS only, in the rhythm of video
// 7 (Peter 2026-09-08: the first cut visited the live site twice and sat in
// silence; barbershops are one vertical of several, so the CMS is the story).
// Probed 2026-09-08: the new-service form has Name, Category, Description,
// Service photo, Price (Fixed/From), Duration (fixed/variable); team assignment
// lives in the edit view after "Add service" and saves on its own; the list
// rows carry the reorder handle and the "Hide from site" toggle. The demo
// service is deleted in finish() so the demo site stays as it was.
import { createRequire } from 'node:module';
import { side, OUTRO, closeStacy } from '../lib/script.mjs';
const require = createRequire(import.meta.url);
const SERVICE = 'Hot towel shave';

export default {
  id: '06-add-a-service',
  title: 'How to add a service',
  description: 'Add a service to your Stemfra website with its price, duration, photo and team, so clients can book it.',
  intro: 'In this video we will show you how to add a service to your website, with its price, duration and photo, so clients can book it.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/services`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="services-add"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'list-1', title: 'Your services',
      say: 'Click Services in the sidebar. Every row here is one service on your menu, and one option in your booking flow.',
      run: async ({ cursor }) => { await cursor.hover(side('Services'), { at: 'services' }); await cursor.hover('[data-tour="services-list"]', { at: 'every row', settle: 900 }); } },
    { id: 'list-2',
      say: 'Drag the handle on the left to change the order visitors see. Hide from site takes a service off the website without deleting it, so it keeps its bookings and its photo.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button[aria-label^="Reorder service"]', at: 'handle' }, { target: 'button[aria-label="Hide from site"]', at: 'hide from site' }]); } },
    { id: 'add-1', title: 'Add the service',
      say: 'Click Add.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="services-add"]', { at: 'add', after: 1200 }); } },
    { id: 'add-2',
      say: 'Give it a name. Let us add Hot towel shave.',
      run: async ({ cursor }) => { await cursor.click('main input[type="text"]', { at: 'name', after: 300 }); await cursor.type(SERVICE, { delay: 70 }); } },
    { id: 'add-3',
      say: 'Pick a category. Categories group your menu. With one kind of service, one category is enough.',
      run: async ({ cursor }) => { await cursor.click('main button:has-text("None")', { at: 'category', after: 700 }); await cursor.click(':text-is("Cuts")', { at: 'group', after: 600 }); } },
    { id: 'add-4',
      say: 'Write a sentence or two that visitors will read on the card. If you are stuck, Stacy can draft it.',
      run: async ({ cursor }) => { await cursor.click('main textarea', { at: 'write', after: 300 }); await cursor.type('A classic straight razor shave with hot towels and a cooling balm.', { delay: 32 }); } },
    { id: 'add-5',
      say: 'Add a photo. Add an image opens your library: upload a new photo, or reuse one you already have.',
      run: async ({ cursor, page }) => {
        await cursor.click('button:has-text("Add an image")', { at: 'add an image', after: 1000 });
        await cursor.click('button:has-text("Library")', { at: 'library', after: 1000 });
        await cursor.click('[role="dialog"] img, [class*="modal"] img', { at: 'reuse', after: 900 }).catch(async () => { await page.keyboard.press('Escape'); });
      } },
    { id: 'add-6',
      say: 'Set the price. Fixed shows the exact price. From shows the word from before it, for services that vary.',
      run: async ({ cursor }) => { await cursor.click('input[placeholder="0.00"]', { at: 'price', after: 300, scroll: true }); await cursor.type('35'); await cursor.hover('main button:has-text("Fixed")', { at: 'fixed shows', settle: 600 }); } },
    { id: 'add-7',
      say: 'Set the duration. This is what the booking calendar blocks, so keep it honest. Variable lets you give a range, and the calendar blocks the longer one.',
      run: async ({ cursor }) => { await cursor.click('main input[type="number"]', { at: 'duration', after: 300, scroll: true }); await cursor.type('30'); await cursor.hover('main button:has-text("variable")', { at: 'variable', settle: 700 }); } },
    { id: 'add-8',
      say: 'Click Add service.',
      run: async ({ cursor, page }) => { await cursor.click('button:has-text("Add service")', { at: 'add service', after: 1200, scroll: true }); await page.waitForSelector(`button:has-text("${SERVICE}")`, { timeout: 10000 }).catch(() => {}); } },
    { id: 'team-1', title: 'Assign your team',
      say: 'Open the service you just added, and tick the team members who do it. Only they are offered when a client books it. These toggles save on their own.',
      run: async ({ cursor }) => {
        await cursor.click(`button:has-text("${SERVICE}")`, { at: 'open the service', after: 1200 });
        await cursor.click('label:has-text("Theo Bianchi") input, label:has-text("Theo Bianchi")', { at: 'tick', after: 500, scroll: true });
        await cursor.click('label:has-text("Rafael Ortiz") input, label:has-text("Rafael Ortiz")', { at: 'team members', after: 900, scroll: true });
      } },
    { id: 'done-1',
      say: 'That is it. The service is on your services page as soon as your site is published, and in the booking flow with the duration you set.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/services`, 1500); await cursor.hover(`main button:has-text("${SERVICE}")`, { at: 'on your services page', settle: 1200, scroll: true }).catch(() => {}); }, hold: 0.9 },
  ],
  // Delete the demo service (and its team links) so the demo site stays as it was.
  async finish() {
    const supabase = require('../../../config/supabase');
    const { data: site } = await supabase.from('sites').select('id').eq('subdomain', 'argyle-and-sons').single();
    const { data: rows } = await supabase.from('site_services').select('id').eq('site_id', site.id).eq('name->>en', SERVICE);
    for (const r of rows || []) {
      await supabase.from('site_team_service_links').delete().eq('service_id', r.id);
      await supabase.from('site_services').delete().eq('id', r.id);
    }
  },
};
