// Video 19: "How to use Stacy, your CMS copilot". Probed 2026-09-07/08: the
// Stacy launcher (data-tour stacy-launcher), rail with Chat / History / Setup,
// four suggested questions, the composer, "Show me how" and "Set up, I can
// draft it" on checklist rows, refine chips when a text field is focused.
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '19-stacy-copilot',
  title: 'How to use Stacy, your CMS copilot',
  description: 'Ask Stacy about your site, let her draft and refine text, and follow her setup checklist inside the Stemfra CMS.',
  intro: 'In this video we will show you Stacy, the copilot inside your CMS: what she knows, what she can write, and how her checklist walks you through setup.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="stacy-launcher"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'open-1', title: 'Meet Stacy',
      say: 'Stacy sits at the bottom right of every page. Click her to open the rail.',
      run: async ({ cursor, page }) => { await cursor.click('[data-tour="stacy-launcher"]', { at: 'click her', after: 1500 }); await page.locator('button:has-text("Chat")').first().click({ timeout: 1500 }).catch(() => {}); } },
    { id: 'ask-1', title: 'Ask',
      say: 'She answers from your real data. The suggestions are good first questions: your opening hours, which service has no photo, which pages are missing a description.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'text=What are my opening hours', at: 'opening hours' }, { target: 'text=Which of my services has no photo', at: 'no photo' }, { target: 'text=Which pages are missing', at: 'missing' }]).catch(() => {}); } },
    { id: 'ask-2',
      say: 'Or type your own. Where do I change my footer text? Which team member has the most bookings this month? She points you to the right page, or answers outright.',
      run: async ({ cursor, page }) => { await cursor.click('textarea[placeholder*="Ask Stacy"]', { at: 'type your own', after: 300 }); await cursor.type('Where do I change my footer text?', { delay: 40 }); await cursor.sleep(1200); await page.locator('textarea[placeholder*="Ask Stacy"]').fill('').catch(() => {}); } },
    { id: 'draft-1', title: 'Draft and refine',
      say: 'On any text field, focus it and Stacy offers to rewrite what is there: simpler, shorter, longer, warmer or more professional. Drafts go into the field with one click, and you still Save.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/content/about?section=rich_text`, 2500); await cursor.click('[data-tour="section-rich_text"] textarea', { at: 'focus it', after: 400, scroll: true }); await cursor.click('[data-tour="stacy-launcher"]', { after: 1400 }).catch(() => {}); await cursor.sweep([{ target: 'button:has-text("Simplify")', at: 'simpler' }, { target: 'button:has-text("Shorten")', at: 'shorter' }, { target: 'button:has-text("Warmer")', at: 'warmer' }]).catch(() => {}); } },
    { id: 'setup-1', title: 'The checklist',
      say: 'Setup is her checklist for a new site, in three stages. Each step opens the right page, Show me how walks you through it on screen, and Set up, I can draft it writes the text for you.',
      run: async ({ cursor, page }) => { await page.locator('button:has-text("Setup")').first().click({ timeout: 1500 }).catch(() => {}); await cursor.sweep([{ target: 'text=Make it yours', at: 'three stages' }, { target: 'text=Show me how', at: 'show me how' }, { target: 'text=Set up, I can draft it', at: 'draft it' }]).catch(() => {}); } },
    { id: 'history-1',
      say: 'History keeps every conversation, so an answer from last week is one click away.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("History")', { at: 'history', settle: 1200 }).catch(() => {}); }, hold: 0.8 },
  ],
};
