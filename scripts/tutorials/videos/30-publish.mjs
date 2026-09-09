// Video 30: "How to publish your website" (Playlist 4, the fresh Clean Cuts
// site, LAUNCH account). Probed live 2026-09-08: /settings/publish = #publish
// with PREVIEW <subdomain>.stemfra.com, BEFORE YOU PUBLISH (Business name, Your
// location name, Your business address, Your phone number, Your contact email,
// Billing details, Business hours, At least one service, At least one team
// member, Homepage headline), RECOMMENDED (Logo, A customer review, Social
// links, Google Business Profile, Personalize the homepage headline) and the
// "Publish — Go live" button. Peter 2026-09-08: click Publish for real on the
// fresh test site (it goes live on its stemfra.com address; cleanup removes it).
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '30-publish',
  title: 'How to publish your website',
  description: 'The publish checklist, the recommended items, and what happens when you click Publish.',
  intro: 'In this video we will show you how to publish your website, and what the checklist makes sure of first.',
  outro: OUTRO,
  account: 'launch',
  async start({ page, base }) { await page.goto(`${base}/settings/publish`, { waitUntil: 'load' }); await page.waitForSelector('#publish', { timeout: 20000 }); await page.waitForSelector('text=Before you publish', { timeout: 30000 }).catch(() => {}); await closeStacy(page); },
  segments: [
    { id: 'where-1', title: 'The checklist',
      say: 'Publish is the button at the top of every page, and this is the page it opens. Until you publish, your site is a private preview at your Stemfra address that only you can see.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="topbar-publish"]', { at: 'the button', settle: 600 }); await cursor.hover('text=/stemfra\\.com/', { at: 'stemfra address', settle: 900 }).catch(() => {}); } },
    { id: 'list-1',
      say: 'Before you publish lists what a site needs to work: your name, your address, phone and email, billing details, business hours, at least one service and one team member, and a headline.',
      run: async ({ cursor }) => { await cursor.hover('text=Before you publish', { at: 'before you publish', settle: 500, scroll: true }); await cursor.sweep([{ target: 'text=Business name', at: 'your name' }, { target: 'text=Your business address', at: 'your address' }, { target: 'text=Billing details', at: 'billing details' }, { target: 'text=Business hours', at: 'business hours' }, { target: 'text=At least one service', at: 'one service' }, { target: 'text=Homepage headline', at: 'headline' }]); } },
    { id: 'list-2',
      say: 'Anything still missing shows a cross and a link straight to the page that fixes it. Green ticks mean you are done.',
      run: async ({ cursor }) => { await cursor.hover('#publish a', { at: 'a link', settle: 900 }).catch(() => {}); await cursor.hover('text=At least one team member', { at: 'green ticks', settle: 800 }).catch(() => {}); } },
    { id: 'rec-1',
      say: 'Recommended is what makes the site convincing rather than just complete: a logo, a review, your social links, your Google Business Profile. You can publish without them and add them later.',
      run: async ({ cursor }) => { await cursor.hover('text=Recommended', { at: 'recommended', settle: 500, scroll: true }); await cursor.sweep([{ target: 'text=Logo', at: 'a logo' }, { target: 'text=A customer review', at: 'a review' }, { target: 'text=Social links', at: 'social links' }, { target: 'text=Google Business Profile', at: 'google business profile' }]); } },
    { id: 'publish-1', title: 'Publish',
      say: 'When the list is green, click Publish, Go live. Your site is live at your Stemfra address within a minute, and the pill at the top turns green.',
      run: async ({ cursor, page }) => {
        await cursor.click('button:has-text("Go live")', { at: 'click publish', after: 1500, scroll: true });
        await cursor.click('[role="dialog"] button:has-text("Publish"), [role="dialog"] button:has-text("Go live")', { after: 2000 }).catch(() => {});
        await page.waitForSelector('text=Published', { timeout: 60000 }).catch(() => {});
        await cursor.hover('text=Published', { at: 'turns green', settle: 1200 }).catch(() => {});
      } },
    { id: 'after-1',
      say: 'Open it, share it, and from now on every edit you save is live the moment you save it.',
      run: async ({ cursor }) => { await cursor.hover('button[aria-label="Publish menu"]', { at: 'open it', settle: 1200 }).catch(() => {}); }, hold: 0.8 },
  ],
};
