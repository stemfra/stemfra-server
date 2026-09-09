// Video 24: "How to see your Stemfra invoices and pay them". Probed
// 2026-09-08: /billing (Subscription hero: Free plan, 5% on sales), /billing/
// invoices (Invoice #, Description, Status, Due date, Amount, Invoice
// actions), an invoice opens with bank-transfer details and "I have paid".
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '24-stemfra-invoices',
  title: 'How to see your Stemfra invoices and pay them',
  description: 'Your Stemfra plan, the monthly commission invoice, how to pay it and how it is marked paid.',
  intro: 'In this video we will show you what you pay Stemfra, where the invoices are, and how to pay one.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/billing`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="billing-plan"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'plan-1', title: 'Your plan',
      say: 'Billing is under your account, top right. The Subscription tab shows your plan: no setup fee, no monthly fee, five percent of the sales your site takes.',
      run: async ({ cursor }) => { await cursor.hover('button[aria-label="Account"]', { at: 'top right', settle: 500 }); await cursor.hover('[data-tour="billing-plan"]', { at: 'five percent', settle: 1200 }); } },
    { id: 'inv-1', title: 'Invoices',
      say: 'Invoices lists every one: the description, the status, the due date and the amount. The commission invoice arrives once a month.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/billing/invoices`, 2200); await cursor.sweep([{ target: 'th:has-text("Description")', at: 'description' }, { target: 'th:has-text("Status")', at: 'status' }, { target: 'th:has-text("Due date")', at: 'due date' }, { target: 'th:has-text("Amount")', at: 'amount' }]); } },
    { id: 'inv-2',
      say: 'Open one to see the bank transfer details and the payment reference. Put the reference on the transfer and the invoice is marked paid on its own when the money arrives.',
      run: async ({ cursor, page }) => { await cursor.click('button[aria-label="Invoice actions"]', { at: 'open one', after: 1200 }); await cursor.hover('text=/View|Open/', { at: 'reference', settle: 900 }).catch(() => {}); await page.keyboard.press('Escape'); } },
    { id: 'inv-3',
      say: 'Paid early by another route? I have paid tells us to check, and the invoice moves to Processing until it clears.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="billing-invoices"]', { at: 'i have paid', settle: 1200 }); } },
    { id: 'details-1', title: 'Billing details',
      say: 'Billing details holds the name and address printed on your invoices. Keep it current, and your accountant will thank you.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/billing/details`, 2200); await cursor.hover('[data-tour="billing-details"]', { at: 'billing details', settle: 1200 }).catch(() => {}); }, hold: 0.8 },
  ],
};
