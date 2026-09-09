// Video 28: "Your first five minutes: the setup wizard" (Playlist 4, recorded
// on a FRESH sign-up). Probed live 2026-09-08 (probe-signup.mjs / probe-wizard.mjs):
//   /signup?vertical=barbers  step 1 "Tell us about your business" = Business
//   name, First name, Last name, "Do you already have a website domain?" (Not
//   yet / Yes, I own one), Continue; step 2 goals tiles (Take bookings online,
//   Get found & win new clients, ...), Continue or Skip for now; step 3 "Create
//   your account" = Continue with Google, Email, Password, terms checkbox,
//   "Create my site" -> the dashboard with the wizard overlay "Let's setup
//   <name>" + Start. Wizard steps (h2): "Tell customers who and where you are"
//   (business name, map-card name, street address, phone, email; "Save &
//   continue", which takes a few seconds). On a starter-based site the other
//   three steps are already ticked, so the wizard CLOSES after that save
//   (it only stays open while a stage is incomplete).
//
// Account: LAUNCH_EMAIL (cleancuts@example.com: a test-domain address, so the
// site is auto-flagged test and no mail is delivered anywhere) + LAUNCH_PASSWORD.
// cleanup-launch.mjs removes exactly this account afterwards.
import { OUTRO } from '../lib/script.mjs';

const BIZ = { name: 'Clean Cuts Barbers', first: 'Daniel', last: 'Smith', mapName: 'Clean Cuts Barbers, Williamsburg', address: '88 Bedford Ave, Brooklyn, NY 11211', phone: '(718) 555 0142', email: 'hello@cleancutsbarbers.com' };
// Exact labels only: a loose /done/ also matched the dashboard's "3 of 12 steps
// done" button behind the overlay and the take clicked thin air (2026-09-08).
const NEXT = (page) => page.getByRole('button', { name: /^(save & continue|save|next|complete|finish|finish setup|done)$/i }).first();
const headingGone = (page, re, timeout = 12000) => page.waitForFunction((src) => !Array.from(document.querySelectorAll('h2')).some((h) => new RegExp(src, 'i').test(h.textContent)), re.source, { timeout }).then(() => true).catch(() => false);
// Save & continue saves first (a PATCH + a refetch, a few seconds); if the step
// has not moved on, click once more, then fall back to the step tab.
const advance = async (cursor, page, re, at, fallbackTab) => {
  await cursor.click(NEXT(page), { at, after: 600 });
  if (await headingGone(page, re)) return;
  await cursor.click(NEXT(page), { after: 600 }).catch(() => {});
  if (await headingGone(page, re, 8000)) return;
  if (fallbackTab) { await cursor.click(`button[aria-label="Go to ${fallbackTab}"]`, { after: 800 }).catch(() => {}); await headingGone(page, re, 5000); }
};
const fillByPlaceholder = async (cursor, page, ph, text, at) => { await cursor.click(`input[placeholder="${ph}"]`, { at, after: 200 }); await page.locator(`input[placeholder="${ph}"]`).fill(''); await cursor.type(text, { delay: 40 }); };

export default {
  id: '28-setup-wizard',
  title: 'Your first five minutes: the setup wizard',
  description: 'From sign-up to a working sample site: the four setup steps that make it yours.',
  intro: 'In this video we will show you your first five minutes with Stemfra: signing up, and the four setup steps that turn the sample site into your own.',
  outro: OUTRO,
  signup: true,
  async start({ page, base }) {
    if (!process.env.LAUNCH_EMAIL || !process.env.LAUNCH_PASSWORD) throw new Error('set LAUNCH_EMAIL + LAUNCH_PASSWORD for the launch set');
    await page.goto(`${base}/signup?vertical=barbers`, { waitUntil: 'load' });
    await page.waitForSelector('h1:has-text("Tell us about your business")', { timeout: 20000 });
  },
  segments: [
    { id: 'signup-1', title: 'Sign up',
      say: 'Start for free on stemfra dot com opens the sign-up. Three short steps: your business, what you want the site to do, and your account.',
      run: async ({ cursor }) => { await cursor.hover('h1:has-text("Tell us about your business")', { at: 'three short steps', settle: 900 }); } },
    { id: 'signup-2',
      say: 'Type your business name and your own name. If you already own a domain, say so here, and we help you connect it after sign-up.',
      run: async ({ cursor, page }) => {
        const inputs = page.locator('input:not([type="checkbox"]):not([type="email"]):not([type="password"])'); // the sign-up inputs carry no type attribute
        await cursor.click(inputs.nth(0), { at: 'business name', after: 200 }); await cursor.type(BIZ.name, { delay: 60 });
        await cursor.click(inputs.nth(1), { at: 'your own name', after: 200 }); await cursor.type(BIZ.first, { delay: 60 });
        await cursor.click(inputs.nth(2), { after: 200 }); await cursor.type(BIZ.last, { delay: 60 });
        await cursor.click('button:has-text("Not yet")', { at: 'own a domain', after: 500 }).catch(() => {});
        await cursor.click('button:has-text("Continue")', { at: 'after sign-up', after: 1200 });
      } },
    { id: 'signup-3',
      say: 'Tell us what you want the site to do for you. Stacy uses this to put the right setup steps first. Pick what fits, or skip.',
      run: async ({ cursor }) => {
        await cursor.click('button:has-text("Take bookings online")', { at: 'what you want', after: 500 });
        await cursor.click('button:has-text("Get found")', { at: 'right setup steps', after: 500 }).catch(() => {});
        await cursor.click('button:has-text("Continue")', { at: 'or skip', after: 1200 });
      } },
    { id: 'signup-4',
      say: 'Your email and a password, or continue with Google. Tick the terms, click Create my site, and your site is built in a few seconds.',
      run: async ({ cursor, page }) => {
        await cursor.click('input[type="email"]', { at: 'your email', after: 200 }); await cursor.type(process.env.LAUNCH_EMAIL, { delay: 45 });
        await cursor.click('input[type="password"]', { at: 'password', after: 200 }); await page.keyboard.type(process.env.LAUNCH_PASSWORD, { delay: 35 });
        await cursor.click('input[type="checkbox"]', { at: 'tick the terms', after: 400 });
        await cursor.click('button:has-text("Create my site")', { at: 'create my site', after: 800 });
      } },
    { id: 'building-1',
      say: 'Stemfra now builds your site from the sample for your kind of business: the pages, the services, a team, the photos, the booking flow. It takes about half a minute, and there is nothing to do but wait.',
      run: async ({ cursor, page }) => {
        await page.waitForURL((u) => !/signup/.test(u.pathname), { timeout: 90000 }).catch(() => {});
        await page.waitForSelector('button:has-text("Start")', { timeout: 60000 }).catch(() => {});
        await cursor.sleep(1200);
      } },
    { id: 'wizard-1', title: 'The setup wizard',
      say: 'You land on your dashboard, and the setup wizard opens over it. Click Start.',
      run: async ({ cursor, page }) => {
        await page.waitForFunction(() => Array.from(document.images).some((i) => /unsplash|cloudinary/.test(i.src) && i.complete && i.naturalWidth > 0), null, { timeout: 15000 }).catch(() => {}); // the slide photo, not a dark frame
        await cursor.hover('h1:has-text("setup")', { at: 'setup wizard', settle: 800 }).catch(() => {});
        await cursor.click('button:has-text("Start")', { at: 'click start', after: 1500 });
        await page.waitForSelector('h2:has-text("Tell customers")', { timeout: 20000 }).catch(() => {});
      } },
    { id: 'wizard-tabs',
      say: 'Four steps: your business, your services, your opening hours and your team. The last three are already ticked, because the sample site for your kind of business filled them in. You can open any of them and change what you like.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button[aria-label="Go to Your business"]', at: 'your business' }, { target: 'button[aria-label="Go to Your services"]', at: 'your services' }, { target: 'button[aria-label="Go to Opening hours"]', at: 'opening hours' }, { target: 'button[aria-label="Go to Your team"]', at: 'your team' }]); await cursor.hover('button[aria-label="Go to Your services"]', { at: 'already ticked', settle: 900 }).catch(() => {}); } },
    { id: 'wizard-2',
      say: 'Your business is the one step only you can do: the name customers see on the map card, your street address, the phone they can call and the email for enquiries. Replace the sample values with yours.',
      run: async ({ cursor, page }) => {
        await fillByPlaceholder(cursor, page, 'e.g. Fresh Fades, Main St', BIZ.mapName, 'map card');
        await fillByPlaceholder(cursor, page, '123 Main St, Austin, TX', BIZ.address, 'street address');
        await fillByPlaceholder(cursor, page, '(512) 555 0100', BIZ.phone, 'phone');
        await fillByPlaceholder(cursor, page, 'you@yourbusiness.com', BIZ.email, 'email');
      } },
    { id: 'wizard-3',
      say: 'Save and continue. With the other three steps already complete, the wizard closes, and your dashboard is ready. Services, Team and Business hours in the sidebar are where you refine them later.',
      run: async ({ cursor, page }) => {
        await cursor.click(NEXT(page), { at: 'save and continue', after: 600 });
        await page.waitForFunction(() => !document.querySelector('button[aria-label="Go to Your business"]'), null, { timeout: 25000 }).catch(() => {});
        await cursor.sleep(600);
        await cursor.sweep([{ target: 'aside a:has-text("Services")', at: 'services' }, { target: 'aside a:has-text("Team")', at: 'team' }]).catch(() => {});
      } },
    { id: 'done-1',
      say: 'From here, Stacy’s checklist takes over. The next videos in this set cover billing details, publishing, and your domain.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="stacy-launcher"]', { at: 'checklist', settle: 1200 }).catch(() => {}); }, hold: 0.8 },
  ],
};
