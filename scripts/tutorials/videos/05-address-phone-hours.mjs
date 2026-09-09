// Video 5: "How to set your address, phone and opening hours". Probed
// 2026-09-08: the Location section of the home page (Location name, Use my
// billing address, Street address, Country, Use my account phone, Phone, Use
// my account email, Email, Photo, Show a map beside the details) and
// /settings/hours (seven rows with Closed toggles, Reset to defaults, Save).
import { side, OUTRO, closeStacy, closePreview } from '../lib/script.mjs';

export default {
  id: '05-address-phone-hours',
  title: 'How to set your address, phone and opening hours',
  description: 'Set the address, phone and email your website shows, and the opening hours that drive your booking calendar.',
  intro: 'In this video we will show you where to set your address, phone and email, and the opening hours that drive your booking calendar.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/content/home?section=location_map`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="section-location_map"]', { timeout: 20000 }); await closeStacy(page); await closePreview(page); },
  segments: [
    { id: 'where-1', title: 'Location and contact',
      say: 'Your address, phone and email live in one place: the Location and contact details section of your home page. From there they feed your footer, your contact page and your booking confirmations.',
      run: async ({ cursor }) => { await cursor.hover('button:has-text("Location")', { at: 'location and contact', settle: 500 }); await cursor.hover('[data-tour="section-location_map"]', { at: 'feed your footer', settle: 900, scroll: true }); } },
    { id: 'fields-1',
      say: 'Location name is how the venue is called on the site. Street address is what visitors see and what the map uses.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'label:has-text("Location name")', at: 'location name', scroll: true }, { target: 'label:has-text("Street address")', at: 'street address', scroll: true }]); } },
    { id: 'fields-2',
      say: 'Use my billing address copies the address from your account, so you type it once. The same shortcut exists for your phone and your email.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'text=Use my billing address', at: 'billing address', scroll: true }, { target: 'text=Use my account phone', at: 'phone', scroll: true }, { target: 'text=Use my account email', at: 'email', scroll: true }]); } },
    { id: 'fields-3',
      say: 'Show a map beside the details puts a Google map next to your address. Turn it off if you work from home.',
      run: async ({ cursor }) => { await cursor.hover('label:has-text("Show a map")', { at: 'show a map', settle: 1000, scroll: true }); } },
    { id: 'hours-1', title: 'Opening hours',
      say: 'Opening hours are under Website, then Business hours. This is one grid for the whole business.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/settings/hours`, 2000); await cursor.hover('h1:has-text("Business hours")', { at: 'business hours', settle: 800 }); } },
    { id: 'hours-2',
      say: 'Each day has an opening and a closing time, or a Closed switch. The booking calendar only offers slots inside these hours, so keep them true.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'main input[type="time"]', at: 'opening', scroll: true }, { target: 'main label:has-text("Closed")', at: 'closed switch' }]); await cursor.hover('#hours', { at: 'keep them true', settle: 900 }); } },
    { id: 'hours-3',
      say: 'Team members can have their own working hours inside the business hours. You set those on each person in Team. Click Save when you are done.',
      run: async ({ cursor }) => { await cursor.hover(side('Team'), { at: 'team', settle: 700 }).catch(() => {}); await cursor.hover('main button:has-text("Save")', { at: 'save', settle: 900, scroll: true }); }, hold: 0.8 },
  ],
};
