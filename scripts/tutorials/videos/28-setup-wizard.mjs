// Video 28: "Your first five minutes: the setup wizard" (Playlist 4, recorded
// on a FRESH sign-up). REWRITTEN 2026-09-25 for onboarding v2 (P39, shipped
// 2026-09-13 to 2026-09-16): the first take (2026-09-08) filmed the old
// overlay wizard, which no longer exists.
//
// What the screens are now (read from SignupPage.tsx, SetupWizard.tsx and
// LaunchScreen.tsx, then confirmed with a --dry run):
//   /signup?vertical=barbershops, three steps with a progress bar:
//     1 "Tell us about your business": Business name, What kind of business
//       (Select), First / Last name, Country + State (Selects), "Do you already
//       have a website domain?" No / Yes radios, Continue.
//     2 "What do you want to do with your website?": goal tiles, Continue or
//       Skip for now.
//     3 "Create your account": Continue with Google, or Email + Password, the
//       "Free website + 5% commission" note, the terms tick, "Create" -> a
//       provisioning overlay (Creating your account / Building your website /
//       Preparing your setup) -> /setup.
//   /setup is its own route (not an overlay): the intro hero "Let's set up
//   <name>" with one slide per stage + Start, then FOUR stages in a fixed
//   panel (Your business, Your services, Your team, Your look):
//     1 "Finish setting up your website": Contact (Phone, Email address),
//       Location (Address with the Google business finder, Town/City,
//       Postcode), Hours (Always open / Open at selected hours -> popup),
//       "Save & continue" (a few seconds).
//     2 "Tick what you offer and add your prices": the vertical's catalogue as
//       tick rows with minutes + price, "Add your own", Next.
//     3 "Who will customers book with?": the team table (sample people came
//       with the template: "Remove all sample people"), Add a person,
//       "Save & continue" (links every person to the services + hours).
//     4 "Branding": Logo (upload tile + "See recommendations": three composed
//       marks), Cover photo, AI Front desk Yes / No, "Finish".
//   Finish opens the launch screen: "Finishing <name>" (the server writes the
//   headline, service descriptions, FAQ and page titles, 30 to 60 s), then the
//   site in a browser frame with Dashboard left and Publish right. Video 30
//   covers Publish, so this take ends on the frame.
//
// Account: LAUNCH_EMAIL (cleancuts@example.com: a test-domain address, so the
// site is auto-flagged test and no mail is delivered anywhere) + LAUNCH_PASSWORD.
// cleanup-launch.mjs removes exactly this account afterwards. Never sign up
// with a real address here.
import { OUTRO } from '../lib/script.mjs';

const BIZ = { name: 'Clean Cuts Barbers', first: 'Daniel', last: 'Smith', state: 'New York', address: '88 Bedford Ave', city: 'Brooklyn, New York', postal: '11211', phone: '7185550142', email: 'hello@cleancutsbarbers.com', ownService: 'Hot towel shave', ownPrice: '40', person: 'Daniel Smith', colleague: 'Maria Lopez' };
const NEXT = (page, re) => page.getByRole('button', { name: re }).first();
const headingGone = (page, re, timeout = 15000) => page.waitForFunction((src) => !Array.from(document.querySelectorAll('h2')).some((h) => new RegExp(src, 'i').test(h.textContent)), re.source, { timeout }).then(() => true).catch(() => false);
const fillByPlaceholder = async (cursor, page, ph, text, at) => { await cursor.click(`input[placeholder="${ph}"]`, { at, after: 200 }); await page.locator(`input[placeholder="${ph}"]`).fill(''); await cursor.type(text, { delay: 40 }); };
// The CMS Select: a button showing the value (or its placeholder), then a list
// of li > button options behind a "Search…" box when the list is long. Type the
// label first: a long list (the US states) clips its lower rows, and a click
// on a clipped row lands outside the list (dry run, 2026-09-25).
const pick = async (cursor, page, trigger, label, at) => {
  await cursor.click(trigger, { at, after: 500 });
  const search = page.locator('input[placeholder="Search…"]');
  if (await search.count()) { await cursor.click(search, { after: 150 }); await cursor.type(label, { delay: 60 }); await page.waitForTimeout(300); }
  await cursor.click(page.locator('li button').filter({ hasText: new RegExp(`^${label}$`, 'i') }).first(), { after: 700 });
};

export default {
  id: '28-setup-wizard',
  title: 'Your first five minutes: the setup wizard',
  description: 'From sign-up to a finished sample site: the four setup steps that make it yours.',
  intro: 'In this video we will show you your first five minutes with Stemfra: signing up, and the four setup steps that turn the sample site into your own.',
  outro: OUTRO,
  signup: true,
  async start({ page, base }) {
    if (!process.env.LAUNCH_EMAIL || !process.env.LAUNCH_PASSWORD) throw new Error('set LAUNCH_EMAIL + LAUNCH_PASSWORD for the launch set');
    await page.goto(`${base}/signup?vertical=barbershops`, { waitUntil: 'load' });
    await page.waitForSelector('h1:has-text("Tell us about your business")', { timeout: 20000 });
  },
  segments: [
    { id: 'signup-1', title: 'Sign up',
      say: 'Start for free on stemfra dot com opens the sign-up. Three short steps: your business, what you want the site to do, and your account.',
      run: async ({ cursor }) => { await cursor.hover('h1:has-text("Tell us about your business")', { at: 'three short steps', settle: 900 }); } },
    { id: 'signup-2',
      say: 'Type your business name, pick your kind of business, and add your own name and where you are. If you already own a domain, say so here, and we help you connect it after sign-up.',
      run: async ({ cursor, page }) => {
        await cursor.click('input[placeholder="e.g. Argyle & Sons"]', { at: 'business name', after: 200 }); await cursor.type(BIZ.name, { delay: 60 });
        // The business type is preselected from ?vertical=; open the picker only if it is still on its placeholder.
        const typeBtn = page.locator('button:has-text("Choose your business type")');
        if (await typeBtn.count()) await pick(cursor, page, typeBtn, 'Barbershop', 'kind of business');
        else await cursor.hover('button:has-text("Barber")', { at: 'kind of business', settle: 400 }).catch(() => {});
        const names = page.locator('input:not([type="checkbox"]):not([type="email"]):not([type="password"]):not([placeholder])');
        await cursor.click(names.nth(0), { at: 'your own name', after: 200 }); await cursor.type(BIZ.first, { delay: 60 });
        await cursor.click(names.nth(1), { after: 200 }); await cursor.type(BIZ.last, { delay: 60 });
        await pick(cursor, page, page.locator('button:has-text("Choose…")').first(), BIZ.state, 'where you are');
        await cursor.click('button[role="radio"]:has-text("No")', { at: 'own a domain', after: 500 }).catch(() => {});
        await cursor.click('button:has-text("Continue")', { at: 'after sign-up', after: 1200 });
      } },
    { id: 'signup-3',
      say: 'Tell us what you want the site to do for you. Pick what fits, or skip for now.',
      run: async ({ cursor }) => {
        await cursor.click('button:has-text("Take bookings online")', { at: 'what you want', after: 500 });
        await cursor.click('button:has-text("Get found")', { at: 'pick what fits', after: 500 }).catch(() => {});
        await cursor.click('button:has-text("Continue")', { at: 'skip for now', after: 1200 });
      } },
    { id: 'signup-4',
      say: 'Your email and a password, or continue with Google. There is no setup fee and no monthly fee: Stemfra earns five percent on the bookings the site brings you, never more than four hundred dollars a month. Tick the terms and click Create.',
      run: async ({ cursor, page }) => {
        await cursor.click('input[type="email"]', { at: 'your email', after: 200 }); await cursor.type(process.env.LAUNCH_EMAIL, { delay: 45 });
        await cursor.click('input[type="password"]', { at: 'a password', after: 200 }); await page.keyboard.type(process.env.LAUNCH_PASSWORD, { delay: 35 });
        await cursor.hover('p:has-text("commission")', { at: 'no setup fee', settle: 600 }).catch(() => {});
        await cursor.click('input[type="checkbox"]', { at: 'tick the terms', after: 400 });
        await cursor.click(NEXT(page, /^Create$/), { at: 'click create', after: 800 });
      } },
    { id: 'building-1',
      say: 'Stemfra now builds your site from the sample for your kind of business: the pages, the services, a team, the photos, the booking flow. It takes about half a minute.',
      run: async ({ cursor, page }) => {
        await page.waitForURL((u) => /\/setup/.test(u.pathname), { timeout: 120000 }).catch(() => {});
        await page.waitForSelector('button:has-text("Start")', { timeout: 60000 }).catch(() => {});
        await cursor.sleep(1200);
      } },
    { id: 'wizard-1', title: 'The setup wizard',
      say: 'You land in the setup wizard. Four steps: your business, your services, your team and your look. Click Start.',
      run: async ({ cursor, page }) => {
        await page.waitForFunction(() => Array.from(document.images).some((i) => /unsplash|cloudinary/.test(i.src) && i.complete && i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {});
        await cursor.hover('h1:has-text("set up")', { at: 'setup wizard', settle: 600 }).catch(() => {});
        await cursor.sweep([{ target: 'button[aria-label="Show Your business"]', at: 'your business' }, { target: 'button[aria-label="Show Your services"]', at: 'your services' }, { target: 'button[aria-label="Show Your team"]', at: 'your team' }, { target: 'button[aria-label="Show Your look"]', at: 'your look' }], { each: 500 }).catch(() => {});
        await cursor.click('button:has-text("Start")', { at: 'click start', after: 1500 });
        await page.waitForSelector('h2:has-text("Finish setting up")', { timeout: 20000 }).catch(() => {});
      } },
    { id: 'wizard-2',
      say: 'Step one is your business: the phone customers can call, the email for enquiries, and your address. As you type the address, Stemfra also lists the businesses Google knows under your name, so one click can fill it all in.',
      run: async ({ cursor, page }) => {
        await fillByPlaceholder(cursor, page, 'Phone number', BIZ.phone, 'phone customers');
        await fillByPlaceholder(cursor, page, 'you@yourbusiness.com', BIZ.email, 'email for enquiries');
        await fillByPlaceholder(cursor, page, 'Street address', BIZ.address, 'your address');
        await cursor.sleep(1400); // the suggestions list shows under the field
        await page.keyboard.press('Escape').catch(() => {});
        await fillByPlaceholder(cursor, page, 'Brooklyn, New York', BIZ.city, 'fill it all in');
        await fillByPlaceholder(cursor, page, '11201', BIZ.postal);
      } },
    { id: 'wizard-3',
      say: 'Then your opening hours: always open, or the hours you choose, day by day, with your time zone. Save and continue.',
      run: async ({ cursor, page }) => {
        await cursor.click('button:has-text("Open at selected hours")', { at: 'the hours you choose', after: 900 });
        await cursor.hover('[role="dialog"][aria-label="Selected hours"] select', { at: 'time zone', settle: 700 }).catch(() => {});
        await cursor.click('[role="dialog"][aria-label="Selected hours"] button:has-text("Save")', { after: 700 });
        await cursor.click(NEXT(page, /^Save & continue$/), { at: 'save and continue', after: 600 });
        await headingGone(page, /Finish setting up/, 25000);
      } },
    { id: 'wizard-4',
      say: 'Step two is your services. The common services for your kind of business are already ticked. Untick what you do not offer, type your prices and times, and add anything that is missing.',
      run: async ({ cursor, page }) => {
        await page.waitForSelector('h2:has-text("Tick what you offer")', { timeout: 15000 }).catch(() => {});
        const rows = page.locator('input[type="checkbox"][aria-label]');
        const n = await rows.count();
        if (n > 3) await cursor.click(rows.nth(n - 1), { at: 'untick', after: 700 });
        const price = page.locator('input[aria-label$=" price"]:not([disabled])').first();
        await cursor.click(price, { at: 'your prices', after: 200 }); await page.keyboard.press('Meta+A').catch(() => {}); await cursor.type('35', { delay: 70 }); await page.keyboard.press('Tab');
        await fillByPlaceholder(cursor, page, 'A service not in the list', BIZ.ownService, 'anything that is missing');
        await cursor.click('input[placeholder="$ Price"]', { after: 150 }); await cursor.type(BIZ.ownPrice, { delay: 70 });
        await cursor.click('button:has-text("Add")', { after: 900 });
      } },
    { id: 'wizard-5',
      // The sign-up already made the owner the first team member (Daniel
      // Smith, is_owner), so the take adds a colleague, not the owner again
      // (the dry run of 2026-09-25 produced "Daniel Smith, Daniel Smith").
      say: 'Step three is your team: the people customers book with. Your own name is already here. Remove the sample names, add the people who work with you, and every person gets your services and hours. One name is fine too: the site then shows no team section.',
      run: async ({ cursor, page }) => {
        await cursor.click(NEXT(page, /^Next$/), { after: 800 });
        await page.waitForSelector('h2:has-text("Who will customers book with")', { timeout: 15000 }).catch(() => {});
        await cursor.hover(`text=${BIZ.person}`, { at: 'already here', settle: 500 }).catch(() => {});
        await cursor.click('button:has-text("Remove all sample people")', { at: 'remove the sample', after: 700 }).catch(() => {});
        await cursor.click(NEXT(page, /^Remove all$/), { after: 1500 }).catch(() => {});
        await fillByPlaceholder(cursor, page, 'Add a person, e.g. Maria Lopez', BIZ.colleague, 'the people who work');
        await cursor.click('button:has-text("Add")', { after: 1200 });
        await cursor.click(NEXT(page, /^Save & continue$/), { at: 'one name is fine', after: 600 });
        await headingGone(page, /Who will customers/, 25000);
      } },
    { id: 'wizard-6',
      say: 'Step four is your look. Upload your logo, or open the recommendations: three marks composed in your theme colours, ready to use. Add a cover photo for the top of your home page, and decide whether the AI front desk answers visitors in chat.',
      run: async ({ cursor, page }) => {
        await page.waitForSelector('h2:has-text("Branding")', { timeout: 15000 }).catch(() => {});
        await cursor.hover('text=Add a logo', { at: 'upload your logo', settle: 600 }).catch(() => {});
        await cursor.click('button:has-text("See recommendations")', { at: 'the recommendations', after: 900 });
        await page.waitForSelector('[aria-label="Logo recommendations"] button[role="radio"]', { timeout: 20000 }).catch(() => {});
        await cursor.click(page.locator('[aria-label="Logo recommendations"] button[role="radio"]').first(), { at: 'ready to use', after: 1500 });
        await cursor.hover('text=Cover photo', { at: 'cover photo', settle: 700, scroll: true }).catch(() => {});
        await cursor.hover('button:has-text("Yes")', { at: 'front desk', settle: 700, scroll: true }).catch(() => {});
      } },
    { id: 'finish-1', title: 'Your site',
      say: 'Click Finish. Stemfra writes your headline, your service descriptions, a FAQ and your page titles from the details you gave. About a minute.',
      run: async ({ cursor, page }) => {
        await cursor.click(NEXT(page, /^Finish$/), { at: 'click finish', after: 800, scroll: true });
        await page.waitForSelector('iframe[title="Your website"]', { timeout: 120000 }).catch(() => {});
        await page.waitForFunction(() => { const f = document.querySelector('iframe[title="Your website"]'); return !!f && !document.body.textContent.includes('Loading your website'); }, null, { timeout: 60000 }).catch(() => {});
        await cursor.sleep(1200);
      } },
    { id: 'finish-2',
      say: 'And here is your site, with your name, your services, your team and your hours. Dashboard takes you to your CMS. Publish puts it live, and that is the next video.',
      run: async ({ cursor }) => {
        await cursor.hover('iframe[title="Your website"]', { at: 'here is your site', settle: 1200 }).catch(() => {});
        await cursor.hover('button:has-text("Dashboard")', { at: 'dashboard takes', settle: 700 }).catch(() => {});
        await cursor.hover('button:has-text("Publish")', { at: 'publish puts', settle: 1200 }).catch(() => {});
      }, hold: 0.8 },
  ],
};
