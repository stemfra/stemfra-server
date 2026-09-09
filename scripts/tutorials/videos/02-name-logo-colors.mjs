// Video 2: "How to set your business name, logo and brand colors" (Website > Style).
// Probed 2026-09-08: /settings/style sections #business, #themes, #layout,
// #hero-navbar, #labels, #branding (Logo, Favicon), #brand-display, #palette
// (Theme default + 11 presets), #colors (Primary, Accent, Background, Text).
// Palette clicks write immediately, so the take picks a preset and returns to
// "Theme default" on camera; the logo modal is opened and closed, not saved.
import { side, sec, OUTRO, closeStacy, retype } from '../lib/script.mjs';

export default {
  id: '02-name-logo-colors',
  title: 'How to set your business name, logo and brand colors',
  description: 'Where your business name, logo, favicon and brand colors live in the Stemfra CMS, and how each shows on your website.',
  intro: 'In this video we will show you where your business name, your logo and your brand colors live, and how each one shows on your website.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/settings/style`, { waitUntil: 'load' }); await page.waitForSelector('#business', { timeout: 20000 }); await closeStacy(page); await page.evaluate(() => window.scrollTo(0, 0)); },
  segments: [
    { id: 'open-1', title: 'Open Style',
      say: 'In your CMS, open Website in the sidebar, then Style. Everything about how your site looks is on this one page.',
      run: async ({ cursor }) => { await cursor.hover(side('Website'), { at: 'website' }); await cursor.hover('h1:has-text("Style")', { at: 'style', settle: 900 }); } },
    { id: 'name-1', title: 'Business name',
      say: 'The first card is your business name. Type it exactly as customers know it. It appears in your site header, your footer, and in search results.',
      run: async ({ cursor, page }) => { await retype(cursor, page, '#business input', 'Argyle & Sons', { at: 'business name', delay: 90 }); await cursor.hover('#business button:has-text("Save")', { at: 'search results', settle: 700 }); } },
    { id: 'name-2',
      say: 'Click Save when you change it. Each card on this page saves on its own.',
      run: async ({ cursor }) => { await cursor.click('#business button:has-text("Save")', { at: 'save', after: 1200 }); } },
    { id: 'logo-1', title: 'Logo and favicon',
      say: 'Scroll down to Logo and favicon. The logo is used in your site header. The favicon is the small icon in the browser tab.',
      run: async ({ cursor }) => { await cursor.hover(sec('branding'), { at: 'logo and favicon', scroll: true, settle: 600 }); await cursor.hover('#branding label:has-text("Favicon")', { at: 'favicon', scroll: true, settle: 800 }); } },
    { id: 'logo-2',
      say: 'Click Replace, or Add an image on a new site, to upload your logo, or pick one you already uploaded from the Library. A PNG with a transparent background looks best.',
      run: async ({ cursor, page }) => {
        await cursor.click('#branding button:has-text("Replace"), #branding button:has-text("Add an image")', { at: 'replace', after: 1000, scroll: true });
        await cursor.hover('button:has-text("Library")', { at: 'library', settle: 900 });
        await cursor.hover('button:has-text("Upload")', { at: 'transparent', settle: 700 });
        await cursor.click('[role="dialog"] button[aria-label="Close"], button[aria-label="Close"]', { after: 500 }).catch(async () => { await page.keyboard.press('Escape'); });
        await page.locator('button:has-text("Stock photos")').waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {});
      } },
    { id: 'display-1',
      say: 'Brand display decides what the header shows: your logo and name together, the logo only, or the name only.',
      run: async ({ cursor }) => { await cursor.hover(sec('brand-display'), { at: 'brand display', scroll: true, settle: 500 }); await cursor.sweep([{ target: '#brand-display button:has-text("Logo + name")', at: 'together' }, { target: '#brand-display button:has-text("Logo only")', at: 'logo only' }, { target: '#brand-display button:has-text("Name only")', at: 'name only' }]); } },
    { id: 'colors-1', title: 'Brand colors',
      say: 'Your theme comes with its own colors. Color palette lets you swap the whole set with one click.',
      run: async ({ cursor }) => { await cursor.hover(sec('palette'), { at: 'color palette', scroll: true, settle: 600 }); await cursor.click('#palette button:has-text("Slate & Sand")', { at: 'one click', after: 1500, scroll: true }); } },
    { id: 'colors-2',
      say: 'Every palette was tuned for readability, so any of them is safe. To go back to the theme colors, pick Theme default.',
      run: async ({ cursor }) => { await cursor.hover('#palette button:has-text("Heritage")', { at: 'readability', settle: 700 }); await cursor.click('#palette button:has-text("Theme default")', { at: 'theme default', after: 1200 }); } },
    { id: 'colors-3',
      say: 'If you have exact brand colors, Brand colors takes them: the headline color, the accent for buttons and links, the background and the text.',
      run: async ({ cursor }) => { await cursor.hover(sec('colors'), { at: 'brand colors', scroll: true, settle: 500 }); await cursor.sweep([{ target: '#colors label:has-text("Primary")', at: 'headline color' }, { target: '#colors label:has-text("Accent")', at: 'accent' }, { target: '#colors label:has-text("Background")', at: 'background' }, { target: '#colors label:has-text("Text")', at: 'the text' }]); } },
    { id: 'colors-4',
      say: 'Reset to defaults puts the theme colors back at any time. Click Save to apply your own.',
      run: async ({ cursor }) => { await cursor.hover('#colors button:has-text("Reset to defaults")', { at: 'reset to defaults', settle: 800 }); await cursor.hover('#colors button:has-text("Save")', { at: 'click save', settle: 900 }); }, hold: 0.9 },
  ],
};
