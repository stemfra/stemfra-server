// Video 22: "How to connect your Google Business Profile". Probed 2026-09-08:
// /google-profile ("Do you already have a Google Business Profile?" with
// "Yes, I have one" / "No / I'm not sure"), and the review link under
// Website > Notifications > Automated emails.
import { createRequire } from 'node:module';
import { OUTRO, closeStacy } from '../lib/script.mjs';

// The "Yes, I have one" answer persists in site_theme_settings.metadata.gbp, so
// a second take opens straight on "Connect your existing listing" and the
// question is gone (the 4K cut hit this, 2026-09-09). Clear it before and after.
const ARGYLE = '00000000-0000-4000-a000-000000000003';
async function resetGbpAnswer() {
  const supabase = createRequire(import.meta.url)('../../../config/supabase');
  const { data } = await supabase.from('site_theme_settings').select('metadata').eq('site_id', ARGYLE).maybeSingle();
  if (!data?.metadata?.gbp) return;
  const metadata = { ...data.metadata }; delete metadata.gbp;
  await supabase.from('site_theme_settings').update({ metadata }).eq('site_id', ARGYLE);
}

export default {
  id: '22-google-business-profile',
  title: 'How to connect your Google Business Profile',
  description: 'Point your Google Maps listing at your Stemfra site and add your review link so the automatic review request works.',
  intro: 'In this video we will show you how to connect your Google Business Profile, so customers can find and book you straight from Google.',
  outro: OUTRO,
  async start({ page, base }) { await resetGbpAnswer(); await page.goto(`${base}/google-profile`, { waitUntil: 'load' }); await page.waitForSelector('button:has-text("Yes, I have one")', { timeout: 20000 }); await closeStacy(page); },
  async finish() { await resetGbpAnswer(); },
  segments: [
    { id: 'what-1', title: 'Why it matters',
      say: 'Your Google Business Profile is the listing on Google Maps and Search with your reviews, hours and photos. Most local clients start there.',
      run: async ({ cursor }) => { await cursor.hover('h1:has-text("Google Business Profile")', { at: 'listing', settle: 1200 }); } },
    { id: 'have-1', title: 'Two paths',
      say: 'If your business already shows on Maps with reviews, you have one: choose Yes, I have one. Otherwise choose No, and the page walks you through creating it.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("Yes, I have one")', at: 'yes' }, { target: 'button:has-text("No /")', at: 'no' }]); await cursor.click('button:has-text("Yes, I have one")', { at: 'creating it', after: 1500 }); } },
    { id: 'have-2',
      say: 'The steps put your new website address on the listing, so the Website button on Google opens your site, and Book online goes to your booking page.',
      run: async ({ cursor, page }) => { await cursor.hover('main', { at: 'website address', settle: 600 }); await page.mouse.wheel(0, 500); await cursor.sleep(1500); } },
    { id: 'reviews-1', title: 'Your review link',
      say: 'One more thing: paste your Google review link under Website, Notifications, Automated emails. The review request email your clients get after a visit uses it.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/settings/notifications#lifecycle-emails`, 2500); await cursor.hover('#lifecycle-emails', { at: 'review link', settle: 1200, scroll: true }).catch(() => {}); } },
    { id: 'reviews-2',
      say: 'Reviews are what a new client reads before they book. Asking after every visit is the single best thing you can automate.',
      run: async ({ cursor }) => { await cursor.hover('text=/review/i', { at: 'reviews', settle: 1200, scroll: true }).catch(() => {}); }, hold: 0.8 },
  ],
};
