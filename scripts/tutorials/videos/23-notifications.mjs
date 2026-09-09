// Video 23: "How notifications work". Probed 2026-09-08: the bell (data-tour
// notif-bell), /notifications with filters (All, Bookings & leads, Billing,
// Website, Stemfra news, Security) and Mark all read; the preferences matrix
// at /profile/notifications.
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '23-notifications',
  title: 'How notifications work',
  description: 'What rings the bell in the Stemfra CMS, the notifications page, and which events reach you by email.',
  intro: 'In this video we will show you what rings the bell in your CMS, and how to choose what reaches you.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="notif-bell"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'bell-1', title: 'The bell',
      say: 'The bell counts what is new: bookings, enquiries, invoices, and announcements from Stemfra. Click it for the latest.',
      run: async ({ cursor, page }) => { await cursor.click('[data-tour="notif-bell"]', { at: 'click it', after: 1800 }); await page.keyboard.press('Escape'); } },
    { id: 'page-1', title: 'The notifications page',
      say: 'View all opens the full page. The filters split it by kind: bookings and leads, billing, website, Stemfra news and security.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/notifications`, 2200); await cursor.sweep([{ target: 'button:has-text("Bookings & leads")', at: 'bookings and leads' }, { target: 'button:has-text("Billing")', at: 'billing' }, { target: 'button:has-text("Website")', at: 'website' }, { target: 'button:has-text("Security")', at: 'security' }]); } },
    { id: 'page-2',
      say: 'Each row opens the thing it is about: the booking, the message, the invoice. Mark all read clears the count.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="notif-feed"]', { at: 'each row', settle: 800 }); await cursor.hover('button:has-text("Mark all read")', { at: 'mark all read', settle: 1000 }); } },
    { id: 'prefs-1', title: 'What reaches you',
      say: 'Under your profile, Notification settings is a grid: each kind of event against each channel. Billing and security always stay on.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/profile/notifications`, 2200); await cursor.hover('[data-tour="notif-prefs-matrix"]', { at: 'grid', settle: 1500 }).catch(() => {}); } },
    { id: 'tip-1',
      say: 'New bookings and messages also arrive as a toast while you are in the CMS, so you never miss one mid-edit.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="notif-bell"]', { at: 'toast', settle: 1200 }); }, hold: 0.8 },
  ],
};
