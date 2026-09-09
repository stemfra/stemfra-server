// Video 10: "How to set your search titles and descriptions (SEO)". Probed
// 2026-09-08: the per-page "SEO" entry at the top of the "On this page" list
// (data-tour seo-panel) opens the panel with the Google preview, the SEO
// title (first input) and the description (first textarea); site defaults live
// at /settings/seo (Default site title + Default description + Save).
// Peter 2026-09-08: fields must actually be filled and SAVED on camera, and
// Stacy must be ASKED for a description, not just mentioned. The values typed
// here are good SEO for the demo site and are left in place.
import { side, OUTRO, closeStacy, closePreview, retype } from '../lib/script.mjs';

const TITLE = 'Argyle & Sons | Barbershop in New York City';
const ASK = 'Write a search description for my home page, under 150 characters.';

export default {
  id: '10-seo-titles-descriptions',
  title: 'How to set your search titles and descriptions',
  description: 'Write the title and description Google shows for each page of your Stemfra website, with a live preview and Stacy to draft it.',
  intro: 'In this video we will show you where to write the title and description that Google shows for each page of your site, and how to let Stacy draft it.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/content/home`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="seo-panel"]', { timeout: 20000 }); await closeStacy(page); await closePreview(page); },
  segments: [
    { id: 'seo-1', title: 'The SEO panel',
      say: 'Every page has an SEO entry at the top of its section list. Open Website, Pages, Home, and click SEO.',
      run: async ({ cursor }) => { await cursor.hover(side('Website'), { at: 'website' }); await cursor.click('[data-tour="seo-panel"]', { at: 'click seo', after: 1400 }); } },
    { id: 'seo-2', title: 'Title',
      say: 'The preview at the top is what your page looks like in a Google result. The title is the blue line. Keep it under sixty characters, and lead with what you do and where. Let us type one, and Save.',
      run: async ({ cursor, page }) => { await cursor.hover('main input', { at: 'the title', settle: 500, scroll: true }); await retype(cursor, page, 'main input', TITLE, { at: 'let us type', delay: 45, scroll: true }); await cursor.click('main button:has-text("Save")', { at: 'and save', after: 1300, scroll: true }).catch(() => {}); } },
    { id: 'seo-3', title: 'Description',
      say: 'The description is the grey text under it. About one hundred and fifty characters, written for a person, not for a robot. The counters keep you inside the limits.',
      run: async ({ cursor }) => { await cursor.hover('main textarea', { at: 'the description', settle: 900, scroll: true }); await cursor.hover('text=/\\d+ ?\\/ ?\\d+|characters/', { at: 'counters', settle: 800 }).catch(() => {}); } },
    { id: 'stacy-1', title: 'Ask Stacy',
      say: 'If writing it is a chore, click into the description, open Stacy, and ask her for one. She drafts from your real services and location.',
      run: async ({ cursor, page }) => {
        await cursor.click('main textarea', { at: 'click into', after: 400, scroll: true });
        await cursor.click('[data-tour="stacy-launcher"]', { at: 'open stacy', after: 1200 });
        await cursor.click('button:has-text("Setup (")', { after: 800 }).catch(() => {});
        await cursor.click('textarea[placeholder*="Ask Stacy"]', { at: 'ask her', after: 300 });
        await cursor.type(ASK, { delay: 26 });
        await page.keyboard.press('Enter');
      } },
    { id: 'stacy-2',
      say: 'Use in Description puts her draft into the field. Read it, change a word if you like, then click Save.',
      run: async ({ cursor, page }) => {
        await page.waitForSelector('button:has-text("Use in")', { timeout: 30000 }).catch(() => {});
        await cursor.click('button:has-text("Use in")', { at: 'use in description', after: 900 }).catch(() => {});
        await cursor.click('main button:has-text("Save")', { at: 'click save', after: 1500, scroll: true }).catch(() => {});
        await closeStacy(page);
      } },
    { id: 'seo-4',
      say: 'The social image is the picture shown when someone shares your link on Facebook, Instagram or WhatsApp.',
      run: async ({ cursor }) => { await cursor.hover('text=/Social|OG|share/i', { at: 'social image', settle: 1000, scroll: true }).catch(() => {}); } },
    { id: 'defaults-1', title: 'Site defaults',
      say: 'Pages without their own text fall back to the site defaults, under Website, SEO. Give the site a default title once, click Save, then refine the pages that matter most: home and services.',
      run: async ({ cursor, goto, base, page }) => {
        await goto(`${base}/settings/seo`, 1800);
        await retype(cursor, page, 'main input', TITLE, { at: 'default title', delay: 45, scroll: true });
        await cursor.click('main button:has-text("Save")', { at: 'click save', after: 1400, scroll: true }).catch(() => {});
      }, hold: 0.9 },
  ],
};
