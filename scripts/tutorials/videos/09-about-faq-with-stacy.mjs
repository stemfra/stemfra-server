// Video 9: "How to write your About page and FAQ with Stacy". Probed
// 2026-09-08: /content/about?section=rich_text (Headline, Body, Story image,
// alt, Image side); Stacy's refine chips appear when a text field is focused
// (Simplify, Shorten, Lengthen, Warmer, Professional) and every draft carries
// "Use in <field>". Nothing is applied on camera, so the demo copy stays.
// Stacy opens on her Setup checklist while steps are pending; the "Setup (n)"
// control in her header toggles Setup <-> Chat, and the rewrite chips only
// render in the Chat view, so the script clicks that toggle after opening her.
import { side, OUTRO, closeStacy, closePreview } from '../lib/script.mjs';

export default {
  id: '09-about-faq-with-stacy',
  title: 'How to write your About page and FAQ with Stacy',
  description: 'Let Stacy draft and refine the text of your About page and FAQ inside the Stemfra CMS.',
  intro: 'In this video we will show you how to write your About page and your FAQ with Stacy, so you never start from a blank field.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/content/about?section=rich_text`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="section-rich_text"]', { timeout: 20000 }); await closeStacy(page); await closePreview(page); },
  segments: [
    { id: 'about-1', title: 'The About page',
      say: 'Open Website, Pages, then About. Your story is one section: a headline, a paragraph, and a photo beside it.',
      run: async ({ cursor }) => { await cursor.hover(side('Website'), { at: 'website' }); await cursor.hover('button:has-text("Your story")', { at: 'your story', settle: 500 }); await cursor.sweep([{ target: 'label:has-text("Headline")', at: 'headline', scroll: true }, { target: 'label:has-text("Body")', at: 'paragraph' }, { target: 'label:has-text("Story image")', at: 'photo', scroll: true }]); } },
    { id: 'stacy-1', title: 'Draft with Stacy',
      say: 'Click into the paragraph, then open Stacy. Because a text field is focused, she offers to rewrite it: Simplify, Shorten, Lengthen, Warmer or Professional.',
      run: async ({ cursor }) => { await cursor.click('main textarea', { at: 'click into', after: 500, scroll: true }); await cursor.click('[data-tour="stacy-launcher"]', { at: 'open stacy', after: 1200 }); await cursor.click('button:has-text("Setup (")', { after: 900 }).catch(() => {}); await cursor.sweep([{ target: 'button:has-text("Simplify")', at: 'simplify' }, { target: 'button:has-text("Shorten")', at: 'shorten' }, { target: 'button:has-text("Warmer")', at: 'warmer' }, { target: 'button:has-text("Professional")', at: 'professional' }]).catch(() => {}); } },
    { id: 'stacy-2',
      say: 'Pick one. Stacy rewrites your own text, grounded in your business details, and hands it back as a draft.',
      run: async ({ cursor, page }) => { await cursor.click('button:has-text("Warmer")', { at: 'pick one', after: 800 }).catch(() => {}); await page.waitForSelector('button:has-text("Use in")', { timeout: 25000 }).catch(() => {}); await cursor.hover('button:has-text("Use in")', { at: 'draft', settle: 1000 }).catch(() => {}); } },
    { id: 'stacy-3',
      say: 'Use in Body puts the draft into the field. You still review it and click Save. Nothing changes on your site until you do.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("Use in")', { at: 'use in body', settle: 900 }).catch(() => {}); await cursor.hover('main button:has-text("Save")', { at: 'click save', settle: 800, scroll: true }).catch(() => {}); } },
    { id: 'stacy-4',
      say: 'You can also just ask. Tell Stacy what your shop is about and she drafts the whole paragraph from scratch.',
      run: async ({ cursor, page }) => { await cursor.click('textarea[placeholder*="Ask Stacy"]', { at: 'just ask', after: 300 }); await cursor.type('Write a warm About paragraph for a family barbershop open since 1998.', { delay: 28 }); await cursor.sleep(900); await page.locator('textarea[placeholder*="Ask Stacy"]').fill('').catch(() => {}); } },
    { id: 'faq-1', title: 'The FAQ',
      say: 'The FAQ page works the same way. Each question and answer is one item, and Stacy can answer the questions customers actually ask you.',
      run: async ({ cursor, goto, base, page }) => { await closeStacy(page); await goto(`${base}/content/faq?section=faq`, 1500); await closePreview(page); await cursor.hover('h1:has-text("FAQ")', { at: 'faq page', settle: 400 }).catch(() => {}); await cursor.click('button:has-text("Frequently asked questions")', { at: 'each question', after: 700 }).catch(() => {}); await cursor.hover('main textarea', { at: 'stacy can answer', settle: 900, scroll: true }).catch(() => {}); } },
    { id: 'faq-2',
      say: 'Drag an item to reorder, add one for every question you hear at the front desk, and Save.',
      run: async ({ cursor }) => { await cursor.hover('main button:has-text("Add FAQ item")', { at: 'add one', settle: 900, scroll: true }).catch(() => {}); await cursor.hover('main button:has-text("Save")', { at: 'save', settle: 800, scroll: true }).catch(() => {}); }, hold: 0.8 },
  ],
};
