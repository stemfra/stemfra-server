// Video 14: "How to get paid: pay at venue and card payments". Probed
// 2026-09-08: /billing/payments (Billing tabs Subscription / Invoices /
// Payments / Billing details; "Your site collects payment in person for now";
// Currency select; "How pay-at-venue works" explainer) and the booking
// modal's Collected switch. The price toggle lives in Style for wellness
// verticals only, so it is not shown here.
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '14-get-paid',
  title: 'How to get paid',
  description: 'How bookings are paid on a Stemfra site today: in person at the visit, recorded as due until you mark them collected.',
  intro: 'In this video we will show you how you get paid for bookings, and how the CMS keeps track of what is still due.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/billing/payments`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="billing-payments"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'where-1', title: 'Payments',
      say: 'Payments lives under Billing, in the Payments tab. This page is about money you receive from your clients, separate from what you pay Stemfra.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("Payments"), a:has-text("Payments")', { at: 'payments tab', settle: 700 }); await cursor.hover('[data-tour="billing-payments"]', { at: 'separate', settle: 900 }); } },
    { id: 'venue-1', title: 'Pay at venue',
      say: 'Clients book online and pay at their visit. Every booking is recorded with the amount owed, and shows in your reports as due.',
      run: async ({ cursor }) => { await cursor.hover('text=Your site collects payment in person', { at: 'pay at their visit', settle: 1000 }); await cursor.hover('text=How pay-at-venue works', { at: 'due', settle: 900, scroll: true }); } },
    { id: 'venue-2',
      say: 'When they pay, open the booking and click Collected. If you forget, it is marked collected automatically twenty four hours after the slot.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/bookings`, 2200); await cursor.click('[data-tour="bookings-grid"] button', { at: 'open the booking', after: 1200 }); await cursor.hover('[role="dialog"] :text-is("Collected"), [role="dialog"] button:has-text("Collected")', { at: 'collected', settle: 1000 }).catch(() => {}); } },
    { id: 'venue-3',
      say: 'Collected and due are what your Reports add up, so the numbers there are cash you actually took.',
      run: async ({ cursor, page }) => { await page.keyboard.press('Escape'); await cursor.hover('aside a:has-text("Operations")', { at: 'reports', settle: 1000 }); } },
    { id: 'currency-1',
      say: 'Currency sets the symbol shown on your site and in your reports.',
      run: async ({ cursor, goto, base, page }) => { await goto(`${base}/billing/payments`, 2000); await page.waitForSelector('label:has-text("Currency")', { timeout: 15000 }).catch(() => {}); await cursor.hover('label:has-text("Currency")', { at: 'currency', settle: 1000 }); } },
    { id: 'online-1',
      say: 'Online card payments at booking are coming. When they open for your account, you will connect them on this same page.',
      run: async ({ cursor }) => { await cursor.hover('text=Online payments', { at: 'online card payments', settle: 1200 }); }, hold: 0.8 },
  ],
};
