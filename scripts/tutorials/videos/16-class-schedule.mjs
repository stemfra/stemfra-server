// Video 16: "How to manage your class schedule" (Operations > Schedule).
// Argyle has no classes, so the take runs on the CrossFit demo (Forge & Bell,
// same owner): start() selects that site through the CMS switcher storage key
// and finish() puts Argyle back. Probed 2026-09-08: the Schedule page and the
// service Type switch (Appointment / Class) in the service editor.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

const KEY = 'stemfra-cms-selected-site';
const FORGE = '00000000-0000-4000-c000-000000000003';
const ARGYLE = '00000000-0000-4000-a000-000000000003';
const select = async (page, base, id) => { await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, id]); await page.goto(`${base}/schedule`, { waitUntil: 'load' }); };

export default {
  id: '16-class-schedule',
  title: 'How to manage your class schedule',
  description: 'For studios and gyms: turn a service into a class, schedule its sessions, and let clients book a spot.',
  intro: 'In this video we will show you how classes work: turning a service into a class, scheduling the sessions, and taking bookings for a spot.',
  outro: OUTRO,
  async start({ page, base }) { await select(page, base, FORGE); await page.waitForSelector('h1', { timeout: 20000 }); await closeStacy(page); },
  async finish({ page, base }) { await select(page, base, ARGYLE); },
  segments: [
    { id: 'what-1', title: 'Classes',
      say: 'A class is a service many people book at once: a session with a capacity, on a timetable. Appointments are one-on-one; classes are group.',
      run: async ({ cursor }) => { await cursor.hover(side('Operations'), { at: 'a class is' }); await cursor.hover('h1', { at: 'timetable', settle: 1000 }); } },
    { id: 'type-1', title: 'Make a service a class',
      say: 'In Services, open the service and set its Type to Class. Capacity is how many spots each session has.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/services`, 2200); await cursor.click('[data-tour="services-list"] button', { at: 'open the service', after: 1200 }); await cursor.sweep([{ target: 'main button:has-text("Class")', at: 'class' }, { target: 'label:has-text("Capacity")', at: 'capacity', scroll: true }]); } },
    { id: 'sched-1', title: 'Schedule sessions',
      say: 'Then, under Operations, Schedule, add the sessions: the day, the time, the coach, and whether it repeats every week.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/schedule`, 2200); await cursor.hover('h1', { at: 'schedule', settle: 600 }); await cursor.hover('main button:has-text("Add"), main button:has-text("New")', { at: 'add the sessions', settle: 1000 }).catch(() => {}); } },
    { id: 'sched-2',
      say: 'Each session shows on your website timetable. Clients book a spot, the count goes down, and a full session closes on its own.',
      run: async ({ cursor, page }) => { await cursor.hover('main', { at: 'timetable', settle: 800 }); await page.mouse.wheel(0, 400); await cursor.sleep(1200); } },
    { id: 'tip-1',
      say: 'The chat assistant reads the same timetable, so a visitor asking for tonight’s class gets the real times.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="stacy-launcher"]', { at: 'chat assistant', settle: 1200 }); }, hold: 0.8 },
  ],
};
