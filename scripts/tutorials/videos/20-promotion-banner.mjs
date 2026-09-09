// Video 20: "How to create a promotion banner" (Marketing > Promotions).
// Probed 2026-09-08: + New promotion; cards with Turn this promotion on/off,
// View on site, Edit, Delete. Argyle carries "FIRST CUT $10 OFF" (popup).
import { side, LIVE, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '20-promotion-banner',
  title: 'How to create a promotion',
  description: 'Popups, announcement bars and promo bands on your Stemfra site: create one, turn it on, see it live.',
  intro: 'In this video we will show you promotions: the popups and bars that sit over your site for an offer, a holiday or a notice.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/promotions`, { waitUntil: 'load' }); await page.waitForSelector('h1:has-text("Promotions")', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'what-1', title: 'Promotions',
      say: 'Promotions lives under Marketing. A promotion shows over every page of your site, on top of your theme: a popup, an announcement bar, or a promo band.',
      run: async ({ cursor }) => { await cursor.hover(side('Marketing'), { at: 'marketing' }); await cursor.hover('h1:has-text("Promotions")', { at: 'popup', settle: 1000 }); } },
    { id: 'live-1',
      say: 'This is the one Argyle runs: a first-visit offer with a signup form. It captures the email into your Inbox and your subscribers.',
      run: async ({ cursor, goto }) => { await goto(`${LIVE}/`, 3500); await cursor.hover('text=/FIRST CUT|\\$10 OFF/i', { at: 'first-visit offer', settle: 1500 }).catch(() => {}); } },
    { id: 'new-1', title: 'Create one',
      say: 'New promotion asks for the kind, the headline, the text, a button, an optional photo, and when it runs.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/promotions`, 2000); await cursor.click('button:has-text("New promotion")', { at: 'new promotion', after: 1500 }); await cursor.hover('main label, [role="dialog"] label', { at: 'headline', settle: 900 }).catch(() => {}); } },
    { id: 'new-2',
      say: 'Only one of each kind shows at a time, and the first active one wins. So a holiday notice can wait, switched off, until the day.',
      run: async ({ cursor, goto, base, page }) => { await page.keyboard.press('Escape'); await goto(`${base}/promotions`, 1800); await cursor.sweep([{ target: 'button[aria-label^="Turn this promotion"]', at: 'switched off' }, { target: 'button:has-text("View on site")', at: 'the day' }]); } },
    { id: 'tip-1',
      say: 'Edit changes a live promotion in place. Delete removes it. Either way your theme underneath is untouched.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("Edit")', at: 'edit' }, { target: 'button:has-text("Delete")', at: 'delete' }]); }, hold: 0.8 },
  ],
};
