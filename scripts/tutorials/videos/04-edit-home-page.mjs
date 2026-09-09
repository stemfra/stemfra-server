// Video 4: "How to edit your home page" (Website > Pages > Home). Probed
// 2026-09-08: "On this page" list (SEO, Welcome banner, Short introduction,
// ...), section rows data-tour="section-<type>", the eye "Hide section"
// buttons on optional sections, the "Preview" drawer (data-tour
// preview-button). The headline edit is made and reverted on camera.
// The editor pane sits to the RIGHT of the list: its fields are NOT inside
// the row's data-tour element, so target them as `main input` / `main textarea`
// (Headline is the first input of the hero editor).
import { side, OUTRO, closeStacy, retype, closePreview } from '../lib/script.mjs';

const HEADLINE = 'Best Haircut & Hot Shave in New York City';
const save = async (cursor) => { await cursor.click('main button:has-text("Save")', { at: 'save', after: 1600, scroll: true }).catch(() => {}); };

export default {
  id: '04-edit-home-page',
  title: 'How to edit your home page',
  description: 'Edit any section of your Stemfra home page, hide sections you do not need yet, and preview changes live.',
  intro: 'In this video we will show you how to edit your home page: every section, the sections you can hide, and the live preview.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/content/home`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="section-list"]', { timeout: 20000 }); await closeStacy(page); await closePreview(page); },
  segments: [
    { id: 'open-1', title: 'Pages',
      say: 'Open Website, then Pages, and choose Home. Every page of your site is built from sections, listed on the left in the order they appear.',
      run: async ({ cursor }) => { await cursor.hover(side('Website'), { at: 'website' }); await cursor.hover('h1:has-text("Home")', { at: 'home', settle: 500 }); await cursor.hover('[data-tour="section-list"]', { at: 'listed on the left', settle: 900 }); } },
    { id: 'edit-1', title: 'Edit a section',
      say: 'Click a section to open it. The Welcome banner is your hero: the headline, the line under it, the button and the photo.',
      run: async ({ cursor }) => { await cursor.click('button:has-text("Welcome banner")', { at: 'welcome banner', after: 900 }); await cursor.sweep([{ target: 'label:has-text("Headline")', at: 'headline' }, { target: 'label:has-text("Subheadline")', at: 'line under it' }, { target: 'label:has-text("Button text")', at: 'button' }, { target: 'label:has-text("Hero image")', at: 'photo', scroll: true }]); } },
    { id: 'edit-2',
      say: 'Let us change the headline. Type the new one, then click Save.',
      run: async ({ cursor, page }) => { await retype(cursor, page, 'main input', 'Sharp Cuts and Hot Shaves in New York City', { at: 'type', delay: 40, scroll: true }); await save(cursor); } },
    { id: 'preview-1', title: 'Preview',
      say: 'Preview opens your live site beside the editor, so you can check every change without leaving the page.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="preview-button"]', { at: 'preview', after: 2800 }); await cursor.hover('iframe', { at: 'check every change', settle: 1200 }).catch(() => {}); } },
    { id: 'preview-2',
      say: 'The icons at the top switch between desktop and mobile. Most of your visitors are on a phone, so check both.',
      run: async ({ cursor }) => { await cursor.hover('button[aria-label*="obile"], button[title*="obile"]', { at: 'mobile', settle: 900 }).catch(() => {}); await cursor.click('button[aria-label*="obile"], button[title*="obile"]', { at: 'phone', after: 1500 }).catch(() => {}); } },
    { id: 'edit-3',
      say: 'Putting the original headline back is the same edit. Type it, Save, and the preview follows.',
      run: async ({ cursor, page }) => { await retype(cursor, page, 'main input', HEADLINE, { at: 'type it', delay: 40, scroll: true }); await save(cursor); await cursor.click('button[aria-label="Close preview"]', { at: 'follows', after: 600 }).catch(() => {}); } },
    { id: 'hide-1', title: 'Hide a section',
      say: 'Optional sections carry an eye icon. Hiding one takes it off the site but keeps its content, so you can bring it back when you are ready.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="section-eye"]', { at: 'eye icon', after: 1400, scroll: true }); await cursor.click('[data-tour="section-eye"]', { at: 'bring it back', after: 1000 }); } },
    { id: 'more-1',
      say: 'The other sections work the same way: your story, services, team, gallery, reviews, awards, and your location and contact details.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("Your story")', at: 'your story' }, { target: 'button:has-text("Services")', at: 'services' }, { target: 'button:has-text("Team")', at: 'team' }, { target: 'button:has-text("Gallery")', at: 'gallery' }, { target: 'button:has-text("Reviews")', at: 'reviews' }, { target: 'button:has-text("Awards")', at: 'awards' }, { target: 'button:has-text("Location")', at: 'location' }]); }, hold: 0.8 },
  ],
};
