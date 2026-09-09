// Video 1: "Welcome to your Stemfra CMS". Script = CMS_TUTORIAL_VIDEOS.md §4.
// Each segment: one narration line (`say`) + one on-screen action (`run`).
// `title` marks a YouTube chapter. Every cursor move carries `at: '<phrase>'`,
// a phrase from the line, so the pointer lands on the item as it is named.
// Labels quoted as the CMS shows them (walk of 2026-09-07). Recording tenant:
// the demo owner on argyle-and-sons. Never leave the dashboard in this video.
const side = (label) => `aside a:has-text("${label}")`;

export default {
  id: '01-welcome',
  title: 'Welcome to your Dashboard',
  description: 'A tour of the Stemfra CMS: the dashboard, the sidebar, the top bar, Stacy and the guided tour.',
  intro: 'In this video we will show you around your dashboard, the place where you edit your website and run your bookings.',
  outro: 'Thanks for watching. Questions go under the video, or ask Stacy inside your CMS.',
  async start({ page, base }) {
    await page.goto(`${base}/`, { waitUntil: 'load' });
    await page.waitForSelector('text=Quick actions', { timeout: 20000 });
    await page.locator('button[aria-label="Close"]').first().click({ timeout: 1500 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0));
  },
  segments: [
    { id: 'dash-1', title: 'The dashboard',
      say: 'This is your dashboard. Every time you sign in, this is where you land.',
      run: async ({ cursor }) => { await cursor.hover('h1:has-text("Dashboard")', { at: 'dashboard', settle: 400 }); } },
    { id: 'dash-2',
      say: 'The cards show your business at a glance: bookings today, new messages, revenue this month, and how far along your setup is.',
      run: async ({ cursor }) => {
        await cursor.sweep([
          { target: ':text-is("Bookings today")', at: 'bookings today', scroll: true },
          { target: ':text-is("New messages")', at: 'new messages' },
          { target: ':text-is("Revenue this month")', at: 'revenue this month' },
          { target: ':text-is("Setup")', at: 'setup' },
        ]);
      } },
    { id: 'dash-3',
      say: 'The chart shows your bookings over the last thirty days, and the panels below list your upcoming bookings and your latest messages.',
      run: async ({ cursor }) => {
        await cursor.sweep([
          { target: 'text=Last 30 days', at: 'chart', scroll: true },
          { target: 'text=Upcoming bookings', at: 'upcoming bookings', scroll: true },
          { target: 'text=Recent messages', at: 'latest messages' },
        ]);
      } },

    { id: 'side-1', title: 'The sidebar',
      say: 'Everything you can do lives in the sidebar on the left.',
      run: async ({ cursor, page }) => { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await cursor.hover(side('Dashboard'), { at: 'sidebar' }); } },
    { id: 'side-2',
      say: 'Sites lists every website in your account. Dashboard brings you back here.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: side('Sites'), at: 'sites' }, { target: side('Dashboard'), at: 'dashboard' }]); } },
    { id: 'side-3',
      say: 'Then your day to day: Services, Team, Bookings, Inbox and Clients. The badge on Inbox is how many enquiries are waiting.',
      run: async ({ cursor }) => {
        await cursor.sweep([
          { target: side('Services'), at: 'services' }, { target: side('Team'), at: 'team' }, { target: side('Bookings'), at: 'bookings' },
          { target: side('Inbox'), at: 'inbox and' }, { target: side('Clients'), at: 'clients' }, { target: side('Inbox'), at: 'badge' },
        ]);
      } },
    { id: 'side-4',
      say: 'The three groups under Manage each open a second panel with their own items. Website holds your pages, photos, reviews and style. Marketing holds promotions, your blog and subscribers. Operations holds your schedule, memberships and reports.',
      run: async ({ cursor }) => {
        await cursor.sweep([
          { target: 'text=MANAGE', at: 'three groups' }, { target: side('Website'), at: 'website holds' },
          { target: side('Marketing'), at: 'marketing holds' }, { target: side('Operations'), at: 'operations holds' },
        ]);
      } },

    { id: 'top-1', title: 'The top bar',
      say: 'The business you are editing sits at the top of the sidebar. Click it to switch sites or add a new one.',
      run: async ({ cursor }) => { await cursor.hover('aside button:has-text("Argyle")', { at: 'top of the sidebar', settle: 1000 }); } },
    { id: 'top-2',
      say: 'Across the top, the search box finds any page, setting, service or team member. Press Command K or Control K to open it from anywhere.',
      run: async ({ cursor, page }) => {
        await cursor.click('input[placeholder*="Search"]', { at: 'search box', after: 300 });
        await cursor.type('hours'); await cursor.sleep(1400);
        await page.keyboard.press('Escape'); await cursor.sleep(200);
        await page.locator('input[placeholder*="Search"]').first().fill('').catch(() => {});
        await page.keyboard.press('Escape');
      } },
    { id: 'top-3',
      say: 'Docs opens the help guides, and New site adds another business to your account.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'text=Docs', at: 'docs' }, { target: 'text=New site', at: 'new site' }]); } },
    { id: 'top-4',
      say: 'The green Published pill tells you the site is live. Its menu is where you open the site and the publish checklist.',
      run: async ({ cursor, page }) => {
        await cursor.hover('text=Published', { at: 'published pill', settle: 500 });
        await cursor.click('button[aria-label="Publish menu"]', { at: 'its menu', after: 1500 });
        await page.keyboard.press('Escape'); await cursor.sleep(200);
      } },
    { id: 'top-5',
      say: 'View site shows your website in a new tab, exactly as visitors see it, and Analytics opens your traffic.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'a:has-text("View site")', at: 'view site' }, { target: 'a:has-text("Analytics")', at: 'analytics' }]); } },
    { id: 'top-6',
      say: 'The bell shows new enquiries, bookings and invoices.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="notif-bell"]', { at: 'bell', settle: 1000 }); } },

    { id: 'stacy-1', title: 'Stacy',
      say: 'This is Stacy, your CMS copilot. Ask her anything about your site, and she answers from your real data.',
      run: async ({ cursor, page }) => {
        await cursor.click('[data-tour="stacy-launcher"]', { at: 'stacy', after: 1200 });
        await page.locator('button:has-text("Setup")').first().click({ timeout: 1500 }).catch(() => {});
        await cursor.hover('textarea[placeholder*="Ask Stacy"]', { at: 'ask her', settle: 600 });
      } },
    { id: 'stacy-2',
      say: 'Stacy also keeps your setup checklist in three stages: Make it yours, Get found on Google, and Before you publish. Each step opens the right page, and Show me how walks you through it on screen.',
      run: async ({ cursor }) => {
        await cursor.sweep([
          { target: 'text=Make it yours', at: 'make it yours' }, { target: 'text=Get found on Google', at: 'get found' },
          { target: 'text=Before you publish', at: 'before you publish' }, { target: 'text=Open', at: 'opens the right page' },
          { target: 'text=Show me how', at: 'show me how' },
        ]);
      } },
    { id: 'stacy-3',
      say: 'She can also draft your text. Focus any field and the draft goes straight in with one click.',
      run: async ({ cursor }) => {
        await cursor.hover('text=Set up, I can draft it', { at: 'draft your text', settle: 1000 }).catch(() => {});
        await cursor.click('button[aria-label="Close"]', { at: 'one click', after: 600 }).catch(() => {});
      } },

    { id: 'tour-1', title: 'Take the tour',
      say: 'If you prefer to be shown around inside the CMS, open Quick actions and choose Take a quick tour. The tour runs on your own site.',
      run: async ({ cursor }) => { await cursor.hover('text=Quick actions', { at: 'quick actions', settle: 400 }); await cursor.hover('button:has-text("Take a quick tour")', { at: 'take a quick tour', settle: 1200 }); }, hold: 1.0 },
  ],
};
