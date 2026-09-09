// Video 15: "How to set up memberships" (Operations > Memberships). Probed
// 2026-09-08: Plans (+ Add plan, Edit, Remove), Renewals (Confirm all
// collected), Members (Pause, Suspend, Cancel per row), Recent activity.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '15-memberships',
  title: 'How to set up memberships',
  description: 'Create membership plans on your Stemfra site, and manage members, renewals, pauses and cancellations.',
  intro: 'In this video we will show you how to offer memberships: the plans, how a client signs up, and how you manage renewals.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/memberships`, { waitUntil: 'load' }); await page.waitForSelector('h1:has-text("Memberships")', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'plans-1', title: 'Plans',
      say: 'Memberships lives under Operations. Plans are what you sell: a name, a price, and how often it renews.',
      run: async ({ cursor }) => { await cursor.hover(side('Operations'), { at: 'operations' }); await cursor.hover('h3:has-text("Plans"), h2:has-text("Plans")', { at: 'plans are', settle: 900 }); } },
    { id: 'plans-2',
      say: 'Add plan creates one. Edit changes the price for new members only; current members keep what they signed up for.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("Add plan")', { at: 'add plan', settle: 800 }); await cursor.hover('button:has-text("Edit")', { at: 'edit', settle: 900 }); } },
    { id: 'signup-1', title: 'How a client joins',
      say: 'Clients pick a plan on your website. The membership starts once you confirm it, so nobody is charged by surprise.',
      run: async ({ cursor }) => { await cursor.hover('h3:has-text("Members"), h2:has-text("Members")', { at: 'clients pick', settle: 1000, scroll: true }); } },
    { id: 'renew-1', title: 'Renewals',
      say: 'Renewals lists what is due this period. Confirm all collected marks them paid in one click when the money is in.',
      run: async ({ cursor }) => { await cursor.hover('h3:has-text("Renewals"), h2:has-text("Renewals")', { at: 'renewals', settle: 700, scroll: true }); await cursor.hover('button:has-text("Confirm all collected")', { at: 'confirm all collected', settle: 1000 }); } },
    { id: 'members-1', title: 'Members',
      say: 'Each member row has Pause for a holiday, Suspend when a payment is missing, and Cancel at the end of the period.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("Pause")', at: 'pause', scroll: true }, { target: 'button:has-text("Suspend")', at: 'suspend' }, { target: 'button:has-text("Cancel")', at: 'cancel' }]); } },
    { id: 'activity-1',
      say: 'Recent activity is the audit trail: every pause, refund and cancellation, with who did it and when.',
      run: async ({ cursor }) => { await cursor.hover('h3:has-text("Recent activity"), h2:has-text("Recent activity")', { at: 'recent activity', settle: 1200, scroll: true }); }, hold: 0.8 },
  ],
};
