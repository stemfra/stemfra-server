// Video 29: "How to add your billing details" (Playlist 4, the fresh Clean Cuts
// site, LAUNCH account). Probed live 2026-09-08: /billing/details = data-tour
// billing-details with First name / Last name (pre-filled from sign-up),
// Address line 1 (placeholder "Street address"), Address line 2, City, Postal /
// ZIP code, Country ("Select country" button), State / region, Tax ID number
// ("No tax ID" toggle + "VAT / EIN / GST…"), "Save details". Required before
// publishing (the checklist's "Billing details" item).
import { OUTRO, closeStacy } from '../lib/script.mjs';


export default {
  id: '29-billing-details',
  title: 'How to add your billing details',
  description: 'The billing name and address printed on your Stemfra invoices, required before you publish.',
  intro: 'In this video we will show you where to add your billing details, the one thing Stemfra needs before your site can go live.',
  outro: OUTRO,
  account: 'launch',
  async start({ page, base }) { await page.goto(`${base}/billing/details`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="billing-details"]', { timeout: 60000 }); await closeStacy(page); },
  segments: [
    { id: 'why-1', title: 'Why',
      say: 'Stemfra charges nothing up front. Once a month you get an invoice for five percent of the sales your site took. The billing details are what goes on that invoice, so the publish checklist asks for them.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="billing-details"]', { at: 'billing details', settle: 1200 }); } },
    { id: 'form-1', title: 'The form',
      say: 'Billing is under your account at the top right, then Billing details. Your name is already here from sign-up.',
      run: async ({ cursor }) => { await cursor.hover('button[aria-label="Account"]', { at: 'top right', settle: 600 }); await cursor.hover('[data-tour="billing-details"] input', { at: 'already here', settle: 800 }); } },
    { id: 'form-2',
      say: 'Start typing the street address and pick it from the suggestions: city, postal code, country and state fill themselves, so the invoice carries the address exactly. Add a tax id if you have one, or leave it off.',
      run: async ({ cursor, page }) => {
        await cursor.click('input[placeholder="Street address"]', { at: 'start typing', after: 200 }); await cursor.type('88 Bedford Ave, Brooklyn', { delay: 55 });
        await page.waitForSelector('li button:has-text("Brooklyn")', { timeout: 10000 }).catch(() => {});
        await cursor.click('li button:has-text("Brooklyn")', { at: 'pick it', after: 1200 }).catch(async () => { await page.keyboard.press('Escape'); });
        await cursor.sweep([{ target: 'div:has(> label:has-text("City")) input', at: 'city' }, { target: 'div:has(> label:has-text("Postal")) input', at: 'postal code' }, { target: 'div:has(> label:has-text("State")) input, div:has(> label:has-text("State")) button', at: 'state' }]).catch(() => {});
        await cursor.hover('button:has-text("No tax ID"), input[placeholder*="VAT"]', { at: 'tax id', settle: 800, scroll: true }).catch(() => {});
      } },
    { id: 'form-3',
      say: 'Save details. The publish checklist ticks Billing details off, and every invoice from now on carries this address.',
      run: async ({ cursor, page }) => { await cursor.click('button:has-text("Save details")', { at: 'save details', after: 1500, scroll: true }); await page.waitForSelector('text=/saved/i', { timeout: 8000 }).catch(() => {}); }, hold: 0.9 },
  ],
};
