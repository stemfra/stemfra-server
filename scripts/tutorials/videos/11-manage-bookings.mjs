// Video 11: "How to manage bookings". Probed 2026-09-08: toolbar (Previous day,
// Today, Next day, day / week), + Add (data-tour bookings-add) opens the
// appointment form (Service, Team member, Date, Time, Duration, Price,
// Customer, Payment collected at visit; Add appointment), the grid
// (bookings-grid) with one button per appointment, and the booking modal
// (Adjust service or price, Collected / Undo, Copy email, Copy phone, Save
// notes, Resend confirmation). No writes: the form is opened and cancelled.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '11-manage-bookings',
  title: 'How to manage bookings',
  description: 'Read your booking calendar, open an appointment, add one by hand, and mark it collected.',
  intro: 'In this video we will show you how to read your booking calendar, open an appointment, add one by hand, and mark it collected.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/bookings`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="bookings-grid"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'cal-1', title: 'The calendar',
      say: 'Click Bookings. Every appointment your website takes lands here, one column per team member.',
      run: async ({ cursor }) => { await cursor.hover(side('Bookings'), { at: 'bookings' }); await cursor.hover('[data-tour="bookings-grid"]', { at: 'one column', settle: 900 }); } },
    { id: 'cal-2',
      say: 'The toolbar moves between days, jumps back to today, and switches between the day and the week view.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button[aria-label="Next day"]', at: 'between days' }, { target: 'button:has-text("Today")', at: 'today' }, { target: 'button:text-is("Week")', at: 'week view' }]); await cursor.click('button:text-is("Week")', { after: 1500 }); await cursor.click('button:text-is("Day")', { at: 'view', after: 900 }); } },
    { id: 'open-1', title: 'Open an appointment',
      say: 'Click any appointment to open it. You see the service, the time, the team member, the customer with one-click copy for email and phone, and any notes.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="bookings-grid"] button', { at: 'click any', after: 1200 }); await cursor.sweep([{ target: '[role="dialog"] button[aria-label="Copy email"], [role="dialog"] button:has-text("Copy email")', at: 'copy' }, { target: '[role="dialog"] button:has-text("Save notes")', at: 'notes' }]); } },
    { id: 'open-2',
      say: 'Payment at visit shows what is due in person. When the client pays, click Collected. That is what feeds your revenue reports.',
      run: async ({ cursor }) => { await cursor.hover('[role="dialog"] :text-is("Collected"), [role="dialog"] button:has-text("Collected")', { at: 'collected', settle: 1000 }).catch(() => {}); } },
    { id: 'open-3',
      say: 'Resend confirmation sends the client their confirmation email again. Adjust service or price changes what was booked without cancelling it.',
      run: async ({ cursor, page }) => { await cursor.sweep([{ target: '[role="dialog"] button:has-text("Resend confirmation")', at: 'resend' }, { target: '[role="dialog"] button:has-text("Adjust service or price")', at: 'adjust' }]); await page.keyboard.press('Escape'); await cursor.sleep(500); } },
    { id: 'add-1', title: 'Add by hand',
      say: 'A phone booking goes in with Add. Pick the service, the team member, the date and time, and the customer. Price and duration follow the service.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="bookings-add"]', { at: 'add', after: 1200 }); await cursor.sweep([{ target: 'label:has-text("Service")', at: 'service' }, { target: 'label:has-text("Team member")', at: 'team member' }, { target: 'label:has-text("Date")', at: 'date' }, { target: 'label:has-text("Customer")', at: 'customer' }, { target: 'label:has-text("Price")', at: 'price' }]); } },
    { id: 'add-2',
      say: 'Add appointment saves it and emails the client the same confirmation a website booking gets. We will cancel this one.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("Add appointment")', { at: 'add appointment', settle: 900 }); await cursor.click('button:has-text("Cancel")', { at: 'cancel', after: 800 }); } },
    { id: 'tip-1',
      say: 'Reminders go out on their own, twenty four hours and two hours before each appointment. You never send those by hand.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="bookings-grid"]', { at: 'reminders', settle: 1200 }); }, hold: 0.8 },
  ],
};
