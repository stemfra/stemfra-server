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
  description: 'A tour of the Stemfra CMS: the dashboard, the sidebar, the top bar, the setup badge, Stacy and the quick actions.',
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
      say: 'The green Published pill tells you the site is live. Its menu opens the live site, or takes it back to preview.',
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

    // Stacy's rail and the setup checklist changed on 2026-09-14 (re-cut
    // 2026-09-25): no Chat / History / Setup tabs, a greeting band and a
    // "Chat options" menu instead; the checklist is the top-bar Setup badge.
    { id: 'setup-1', title: 'The setup badge',
      say: 'Next to Publish, the Setup badge counts your setup steps. Open it for the list: what is left to do and what is done, in three stages, each step with a button that takes you to the right page or walks you through it on screen.',
      run: async ({ cursor, page }) => {
        await cursor.click('[data-tour="setup-progress"] button', { at: 'setup badge', after: 1200 });
        await cursor.sweep([
          { target: 'button:has-text("To do")', at: 'left to do' }, { target: 'button:has-text("Done")', at: 'what is done' },
          { target: 'text=Make it yours', at: 'three stages' }, { target: 'button:has-text("Set up")', at: 'right page' },
          { target: 'button:has-text("Show me how")', at: 'walks you through' },
        ]).catch(() => {});
        await page.keyboard.press('Escape').catch(() => {});
        await page.mouse.click(700, 600).catch(() => {}); // click-away closes the dropdown
      } },
    { id: 'stacy-1', title: 'Stacy',
      say: 'This is Stacy, your CMS copilot. Ask her anything about your site, and she answers from your real data. She also drafts your text: focus any field and the draft goes straight in with one click.',
      run: async ({ cursor, page }) => {
        await cursor.click('[data-tour="stacy-launcher"]', { at: 'stacy', after: 1200 });
        await cursor.hover("text=Hi, I'm Stacy", { at: 'ask her', settle: 500 }).catch(() => {});
        await cursor.hover('textarea[placeholder*="Ask Stacy"]', { at: 'drafts your text', settle: 800 });
        await cursor.click('button[aria-label="Close"]', { at: 'one click', after: 600 }).catch(() => {});
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      } },

    { id: 'tour-1', title: 'Quick actions',
      say: 'Quick actions are the shortcuts you use most. Update your website reopens the setup wizard from your first day, whenever your details change, and Finish setup opens the same list as the badge.',
      run: async ({ cursor }) => { await cursor.hover('text=Quick actions', { at: 'quick actions', settle: 400, scroll: true }); await cursor.hover('a:has-text("Update your website")', { at: 'update your website', settle: 900 }).catch(() => {}); await cursor.hover('button:has-text("Finish setup")', { at: 'finish setup', settle: 1200 }).catch(() => {}); }, hold: 1.0 },
  ],
};
