// Video 17: "How to read your reports" (Operations > Reports). Probed
// 2026-09-08: PDF, Export, This month / This quarter / This year / Custom range.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '17-reports',
  title: 'How to read your reports',
  description: 'Revenue, bookings, top services and staff in the Stemfra reports, with PDF and spreadsheet export.',
  intro: 'In this video we will show you your reports: what you earned, what was booked, and how to export them for your accountant.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/reports`, { waitUntil: 'load' }); await page.waitForSelector('h1:has-text("Reports")', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'open-1', title: 'Reports',
      say: 'Reports lives under Operations. Pick the period at the top: this month, this quarter, this year, or a custom range.',
      run: async ({ cursor }) => { await cursor.hover(side('Operations'), { at: 'operations' }); await cursor.sweep([{ target: 'button:has-text("This month")', at: 'this month' }, { target: 'button:has-text("This quarter")', at: 'quarter' }, { target: 'button:has-text("This year")', at: 'this year' }, { target: 'button:has-text("Custom range")', at: 'custom' }]); await cursor.click('button:has-text("This quarter")', { after: 1500 }); } },
    { id: 'read-1',
      say: 'Revenue is what you collected, with what is still due shown separately. Bookings count every appointment, with no-shows and cancellations broken out.',
      run: async ({ cursor, page }) => { await cursor.hover('main', { at: 'revenue', settle: 800 }); await page.mouse.wheel(0, 400); await cursor.sleep(1200); } },
    { id: 'read-2',
      say: 'Further down, your top services and your team by bookings and revenue, and recurring memberships as their own line.',
      run: async ({ cursor, page }) => { await page.mouse.wheel(0, 600); await cursor.sleep(1400); await page.mouse.wheel(0, 500); await cursor.sleep(1000); } },
    { id: 'export-1', title: 'Export',
      say: 'PDF prints the page as a report. Export downloads the numbers as a spreadsheet for your accountant.',
      run: async ({ cursor, page }) => { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await cursor.sleep(600); await cursor.sweep([{ target: 'button:has-text("PDF")', at: 'pdf' }, { target: 'button:has-text("Export")', at: 'export' }]); }, hold: 0.8 },
  ],
};
