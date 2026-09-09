// Video 26: "How to manage more than one business". Probed 2026-09-08:
// /sites ("Your sites" grid, Open per card, New site), the site switcher at
// the top of the sidebar. The demo owner has 16 sites, which makes the point.
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '26-more-than-one-business',
  title: 'How to manage more than one business',
  description: 'Run several websites from one Stemfra account: the Sites page, the switcher, and adding a new site.',
  intro: 'In this video we will show you how one account runs more than one business, each with its own website, bookings and billing.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/sites`, { waitUntil: 'load' }); await page.waitForSelector('h1:has-text("Your sites")', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'sites-1', title: 'Your sites',
      say: 'Sites lists every website in your account. Each card is a separate business with its own pages, team, bookings and invoices.',
      run: async ({ cursor }) => { await cursor.hover('aside a:has-text("Sites")', { at: 'sites lists' }); await cursor.hover('main', { at: 'each card', settle: 1200 }); } },
    { id: 'sites-2',
      say: 'Open switches the whole CMS to that site. The name at the top of the sidebar always tells you which one you are editing.',
      run: async ({ cursor }) => { await cursor.hover('main button:has-text("Open"), main a:has-text("Open")', { at: 'open switches', settle: 900 }); await cursor.hover('aside button:has-text("Argyle")', { at: 'top of the sidebar', settle: 1000 }); } },
    { id: 'switch-1',
      say: 'That name is also a switcher: click it to jump between sites without going back here.',
      run: async ({ cursor, page }) => { await cursor.click('aside button:has-text("Argyle")', { at: 'click it', after: 1500 }); await page.keyboard.press('Escape'); } },
    { id: 'new-1', title: 'Add a site',
      say: 'New site creates another one: the business name, the kind of business and the city. It starts as a full sample site you then make your own.',
      run: async ({ cursor, page }) => { await cursor.click('button:has-text("New site")', { at: 'new site', after: 1500 }); await cursor.hover('[role="dialog"] label, [role="dialog"] input', { at: 'business name', settle: 1000 }).catch(() => {}); await page.keyboard.press('Escape'); } },
    { id: 'tip-1',
      say: 'Photos can be reused across your sites from the media library, so a second location does not start from zero.',
      run: async ({ cursor }) => { await cursor.hover('main', { at: 'photos', settle: 1200 }); }, hold: 0.8 },
  ],
};
