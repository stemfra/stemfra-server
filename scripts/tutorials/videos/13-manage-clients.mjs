// Video 13: "How to manage your clients". Probed 2026-09-08: /customers table
// (Name, Email, Phone, Tags, Bookings, Revenue, Last booked), Filters, Export,
// Import (data-tour customers-import), Customise columns, per-row Copy email /
// Copy phone / Actions.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '13-manage-clients',
  title: 'How to manage your clients',
  description: 'Your client list in the Stemfra CMS: visit history, revenue per client, tags, import and export.',
  intro: 'In this video we will show you your client list: who booked what, how much they spent, and how to bring in the clients you already have.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/customers`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="customers-table"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'list-1', title: 'The client list',
      say: 'Click Clients. Every person who booked with you is a row, created on their first booking.',
      run: async ({ cursor }) => { await cursor.hover(side('Clients'), { at: 'clients' }); await cursor.hover('[data-tour="customers-table"]', { at: 'every person', settle: 900 }); } },
    { id: 'list-2',
      say: 'The columns tell you how many times they booked, what they spent, and when they last came in. Sort by any of them.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'th:has-text("Bookings")', at: 'booked' }, { target: 'th:has-text("Revenue")', at: 'spent' }, { target: 'th:has-text("Last booked")', at: 'last came' }]); } },
    { id: 'row-1',
      say: 'Each row has one-click copy for email and phone, and an actions menu for notes and tags.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button[aria-label="Copy email"]', at: 'copy' }, { target: 'button[aria-label^="Actions for"]', at: 'actions menu' }]); await cursor.click('button[aria-label^="Actions for"]', { after: 1200 }); await cursor.sleep(300); } },
    { id: 'import-1', title: 'Import',
      say: 'Switching from another system? Import takes a spreadsheet of your existing clients so they are here from day one.',
      run: async ({ cursor, page }) => { await page.keyboard.press('Escape'); await cursor.hover('[data-tour="customers-import"]', { at: 'import', settle: 1200 }); } },
    { id: 'export-1',
      say: 'Export downloads the list the same way, and Customise columns shows only what you use.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("Export")', at: 'export' }, { target: 'button:has-text("Customise columns")', at: 'customise' }]); } },
    { id: 'tip-1',
      say: 'Filters narrow the list, for example to clients who have not been back in three months, the ones worth a message.',
      run: async ({ cursor }) => { await cursor.click('button:has-text("Filters")', { at: 'filters', after: 1400 }).catch(() => {}); }, hold: 0.8 },
  ],
};
