// Video 3: "How to choose a theme" (Website > Style > Themes). Argyle has two
// barbershop themes (Classic NYC active, Manhattan). The take switches to
// Manhattan and back on camera, so the demo site ends where it started.
import { side, sec, OUTRO, closeStacy } from '../lib/script.mjs';

const confirmSwitch = async (cursor, page, at1 = 'switch to this theme', at2 = 'confirm') => {
  await cursor.click('button:has-text("Switch to this theme")', { at: at1, after: 900, scroll: true });
  await cursor.click('[role="dialog"] button:has-text("Switch"), button:has-text("Switch"):not(:has-text("theme"))', { at: at2, after: 2500 }).catch(() => {});
  await page.waitForTimeout(1500);
};

export default {
  id: '03-choose-a-theme',
  title: 'How to choose a theme',
  description: 'Switch your Stemfra website between themes without losing any of your content.',
  intro: 'In this video we will show you how to choose a theme for your website, and why switching never loses your content.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/settings/style`, { waitUntil: 'load' }); await page.waitForSelector('#themes', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'what-1', title: 'What a theme is',
      say: 'A theme is the look of your site: the layout, the fonts and the colors. Your content stays the same underneath: services, team, photos, reviews and pages.',
      run: async ({ cursor }) => { await cursor.hover(sec('themes'), { at: 'theme is', scroll: true, settle: 600 }); await cursor.hover('#themes', { at: 'content stays', settle: 900 }); } },
    { id: 'pick-1', title: 'Pick a theme',
      say: 'Open Website, then Style, and scroll to Themes. Each card shows the fonts and colors of one theme. The active one is marked.',
      run: async ({ cursor }) => { await cursor.hover(side('Website'), { at: 'website' }); await cursor.hover('#themes', { at: 'scroll to themes', scroll: true, settle: 400 }); await cursor.hover('#themes :text-is("Active")', { at: 'active one', settle: 900 }).catch(() => {}); } },
    { id: 'pick-2',
      say: 'To try another one, click Switch to this theme, then confirm. The change is live in a few seconds.',
      run: async ({ cursor, page }) => { await confirmSwitch(cursor, page); } },
    { id: 'pick-3',
      say: 'Open your site to see it. Same business, same services, same photos, in a different register.',
      run: async ({ cursor, goto, page }) => { await goto('https://argyleandsons.click/', 3000); await cursor.hover('body', { at: 'different register', settle: 1500 }).catch(() => {}); await page.mouse.wheel(0, 700); await cursor.sleep(1200); } },
    { id: 'back-1', title: 'Switch back',
      say: 'Changing your mind is the same two clicks. Nothing you wrote or uploaded is touched by a theme switch.',
      run: async ({ cursor, goto, base, page }) => { await goto(`${base}/settings/style`, 2500); await page.locator('#themes').scrollIntoViewIfNeeded(); await confirmSwitch(cursor, page, 'same two clicks', 'nothing you wrote'); } },
    { id: 'options-1', title: 'Theme options',
      say: 'Some themes offer options of their own, like a one-page or multi-page layout, or a video hero. They sit right under the theme cards when the theme supports them.',
      run: async ({ cursor }) => { await cursor.hover(sec('layout'), { at: 'options of their own', scroll: true, settle: 700 }); await cursor.hover(sec('hero-navbar'), { at: 'video hero', scroll: true, settle: 900 }); }, hold: 0.8 },
  ],
};
