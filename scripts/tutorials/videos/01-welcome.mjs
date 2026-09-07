// Video 1: "Welcome to your Stemfra CMS". Script = CMS_TUTORIAL_VIDEOS.md §4.
// Each segment: one narration line (`say`) + one on-screen action (`run`).
// `title` marks a YouTube chapter. Labels quoted as the CMS shows them (walk of
// 2026-09-07). Recording tenant: the demo owner on argyle-and-sons.
//
// Take 2 lessons: never leave the Dashboard in this video (clicking a Manage
// group opens the Pages editor + the two-panel sidebar and the rest of the take
// is filmed on the wrong page); hover the groups instead. Stacy's rail closes
// with its own "Close" button; the Published pill's chevron is "Publish menu".
const side = (label) => `aside a:has-text("${label}")`;

export default {
  id: '01-welcome',
  title: 'Welcome to your Stemfra CMS',
  description: 'A tour of the Stemfra CMS: the dashboard, the sidebar, the top bar, Stacy and the guided tour.',
  intro: 'In this video we will show you around your Stemfra CMS, the place where you edit your website and run your bookings.',
  outro: 'Next, set your business name, logo and colors. That is the next video in this playlist. Thanks for watching. Questions go under the video, or ask Stacy inside your CMS.',
  async start({ page, base }) {
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Quick actions', { timeout: 20000 });
    // Make sure Stacy's rail is closed before the first frame.
    await page.locator('button[aria-label="Close"]').first().click({ timeout: 1500 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0));
  },
  segments: [
    { id: 'dash-1', title: 'The dashboard',
      say: 'This is your dashboard. Every time you sign in, you land here.',
      run: async ({ cursor }) => { await cursor.moveTo(760, 300, 900); } },
    { id: 'dash-2',
      say: 'The cards show your business at a glance: bookings today, new messages, revenue this month, and how far along your setup is.',
      run: async ({ cursor }) => { await cursor.sweep(['text=Bookings today', 'text=New messages', 'text=Revenue this month', 'text=Setup'], { each: 850 }); } },
    { id: 'dash-3',
      say: 'The chart shows your bookings over the last thirty days, and the panels below list your upcoming bookings and your latest messages.',
      run: async ({ cursor }) => { await cursor.hover('text=Last 30 days', { settle: 1000 }); await cursor.sweep(['text=Upcoming bookings', 'text=Recent messages'], { each: 900 }); } },

    { id: 'side-1', title: 'The sidebar',
      say: 'Everything you can do lives in the sidebar on the left.',
      run: async ({ cursor }) => { await cursor.hover(side('Dashboard')); } },
    { id: 'side-2',
      say: 'Sites lists every website in your account. Dashboard brings you back here.',
      run: async ({ cursor }) => { await cursor.sweep([side('Sites'), side('Dashboard')], { each: 900 }); } },
    { id: 'side-3',
      say: 'Then your day to day: Services, Team, Bookings, Inbox and Clients. The badge on Inbox is how many enquiries are waiting.',
      run: async ({ cursor }) => { await cursor.sweep([side('Services'), side('Team'), side('Bookings'), side('Inbox'), side('Clients')], { each: 750 }); } },
    { id: 'side-4',
      say: 'The three groups under Manage each open a second panel with their own items. Website holds your pages, photos, reviews and style. Marketing holds promotions, your blog and subscribers. Operations holds your schedule, memberships and reports.',
      run: async ({ cursor }) => { await cursor.sweep([side('Website'), side('Marketing'), side('Operations')], { each: 2600 }); } },

    { id: 'top-1', title: 'The top bar',
      say: 'The business you are editing sits at the top of the sidebar. Click it to switch sites or add a new one.',
      run: async ({ cursor }) => { await cursor.hover('aside button:has-text("Argyle")', { settle: 1000 }); } },
    { id: 'top-2',
      say: 'Across the top, the search box finds any page, setting, service or team member. Press Command K or Control K to open it from anywhere.',
      run: async ({ cursor, page }) => {
        await cursor.click('input[placeholder*="Search"]', { after: 400 });
        await cursor.type('hours'); await cursor.sleep(1600);
        await page.keyboard.press('Escape'); await cursor.sleep(200);
        // Leave the box empty for the rest of the take.
        await page.locator('input[placeholder*="Search"]').first().fill('').catch(() => {});
        await page.keyboard.press('Escape'); await cursor.sleep(300);
      } },
    { id: 'top-3',
      say: 'Docs opens the help guides, and New site adds another business to your account.',
      run: async ({ cursor }) => { await cursor.sweep(['text=Docs', 'text=New site'], { each: 900 }); } },
    { id: 'top-4',
      say: 'The green Published pill tells you the site is live. Its menu is where you open the site and the publish checklist.',
      run: async ({ cursor, page }) => {
        await cursor.hover('text=Published', { settle: 700 });
        await cursor.click('button[aria-label="Publish menu"]', { after: 1600 });
        await page.keyboard.press('Escape'); await cursor.sleep(300);
      } },
    { id: 'top-5',
      say: 'View site shows your website in a new tab, exactly as visitors see it, and Analytics opens your traffic.',
      run: async ({ cursor }) => { await cursor.sweep(['a:has-text("View site")', 'a:has-text("Analytics")'], { each: 1000 }); } },
    { id: 'top-6',
      say: 'The bell shows new enquiries, bookings and invoices.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="notif-bell"]', { settle: 1000 }); } },

    { id: 'stacy-1', title: 'Stacy',
      say: 'This is Stacy, your CMS copilot. Ask her anything about your site, and she answers from your real data.',
      run: async ({ cursor, page }) => {
        await cursor.click('[data-tour="stacy-launcher"]', { after: 1500 });
        await page.locator('button:has-text("Setup")').first().click({ timeout: 1500 }).catch(() => {});
        await cursor.sleep(600);
      } },
    { id: 'stacy-2',
      say: 'Stacy also keeps your setup checklist in three stages: Make it yours, Get found on Google, and Before you publish. Each step opens the right page, and Show me how walks you through it on screen.',
      run: async ({ cursor }) => { await cursor.sweep(['text=Make it yours', 'text=Get found on Google', 'text=Before you publish', 'text=Show me how'], { each: 1100 }); } },
    { id: 'stacy-3',
      say: 'She can also draft your text. Focus any field and the draft goes straight in with one click.',
      run: async ({ cursor }) => {
        await cursor.hover('text=Set up, I can draft it', { settle: 1200 }).catch(() => {});
        await cursor.click('button[aria-label="Close"]', { after: 700 }).catch(() => {});
      } },

    { id: 'tour-1', title: 'Take the tour',
      say: 'If you prefer to be shown around inside the CMS, open Quick actions and choose Take a quick tour. The tour runs on your own site, with the same voice you are hearing now.',
      run: async ({ cursor }) => { await cursor.hover('text=Quick actions', { settle: 500 }); await cursor.hover('button:has-text("Take a quick tour")', { settle: 1200 }); }, hold: 1.2 },
  ],
};
