// Video 31: "How to connect or buy a domain" (Playlist 4, the fresh Clean Cuts
// site, LAUNCH account). Probed live 2026-09-08: /settings/domain = #domain
// (Your Stemfra address; "Find a new domain" = data-tour domain-search, input
// placeholder "myspa.com, or just: myspa" + Search; "Use a domain you own
// (optional)" input "yourshop.com" + Connect), #domains-overview, #email (Email
// forwarding). Nothing is bought on camera (Peter): the search runs for real,
// Register is pointed at and left.
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '31-domain',
  title: 'How to connect or buy a domain',
  description: 'Buy a domain inside the Stemfra CMS or connect one you already own, and set up email forwarding on it.',
  intro: 'In this video we will show you how to give your site its own domain: buy one right here, or connect one you already own.',
  outro: OUTRO,
  account: 'launch',
  async start({ page, base }) { await page.goto(`${base}/settings/domain`, { waitUntil: 'load' }); await page.waitForSelector('#domain', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'address-1', title: 'Your address',
      say: 'Every site comes with a free Stemfra address, and it stays yours. A domain of your own sits on top of it.',
      run: async ({ cursor }) => { await cursor.hover('text=Your Stemfra address', { at: 'free stemfra address', settle: 600 }); await cursor.hover('text=/\\.stemfra\\.com/', { at: 'stays yours', settle: 900 }).catch(() => {}); } },
    { id: 'buy-1', title: 'Buy a domain',
      say: 'Under Website, Settings, Domain, type the name you want and click Search. The first result is the exact match, with the price for the first year.',
      run: async ({ cursor, page }) => {
        await cursor.click('[data-tour="domain-search"] input', { at: 'type the name', after: 300 });
        await cursor.type('cleancutsbrooklyn', { delay: 60 });
        await cursor.click('[data-tour="domain-search"] button:has-text("Search")', { at: 'click search', after: 800 });
        await page.waitForSelector('text=/Available|Taken|Premium/i', { timeout: 40000 }).catch(() => {});
        await cursor.hover('text=/Available|Taken/i', { at: 'exact match', settle: 1000 }).catch(() => {});
      } },
    { id: 'buy-2',
      say: 'More options lists the same name with other endings. Check shows whether one is free.',
      run: async ({ cursor }) => { await cursor.hover('text=More options', { at: 'more options', settle: 700, scroll: true }).catch(() => {}); await cursor.click('button:has-text("Check")', { at: 'check', after: 2500 }).catch(() => {}); } },
    { id: 'buy-3',
      say: 'Register buys it instantly and adds it to your Stemfra invoice, privacy protection included. It is connected to your site on its own, no settings to copy.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("Register")', { at: 'register', settle: 1400 }).catch(() => {}); } },
    { id: 'own-1', title: 'Connect one you own',
      say: 'Already own a domain? Type it under Use a domain you own and click Connect. You get one record to add at your registrar, and Stemfra finishes the connection with a certificate.',
      run: async ({ cursor }) => { await cursor.hover('text=Use a domain you own', { at: 'already own', settle: 500, scroll: true }); await cursor.hover('input[placeholder="yourshop.com"]', { at: 'type it', settle: 700 }); await cursor.hover('button:has-text("Connect")', { at: 'click connect', settle: 1200 }).catch(() => {}); } },
    { id: 'email-1', title: 'Email on your domain',
      say: 'On a domain bought here, Email forwarding gives you addresses like hello at your domain that forward to any inbox, for free.',
      run: async ({ cursor }) => { await cursor.hover('#email', { at: 'email forwarding', settle: 1400, scroll: true }).catch(() => {}); }, hold: 0.8 },
  ],
};
