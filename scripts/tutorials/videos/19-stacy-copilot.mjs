// Video 19: "How to use Stacy, your CMS copilot". REWRITTEN 2026-09-25: the
// 2026-09-08 take filmed the Chat / History / Setup tabs and Stacy's setup
// checklist, both gone since 2026-09-14. Probed live 2026-09-25 (probe.mjs on
// the demo owner): the rail's header is a chevron (aria-label "Close") left,
// the Stacy mark + title centred, a 3-dot "Chat options" menu right (New chat,
// History; History shows "Back to chat" on the left); an empty chat opens on
// the greeting band ("Hi, I'm Stacy 👋 / Ask me anything about your site.")
// with three starter questions; the composer is "Ask Stacy anything…" with the
// phone button "Prefer to talk? Call us at …" at its left and Send at its
// right; the phone button opens the centred call view. The setup checklist
// now lives in the TOP BAR: the "7/13 Setup" badge (data-tour setup-progress)
// opens "Finish your website" with To do / Done tabs, the three stages, and
// per row "Set up" (or "Set up, Stacy drafts it"), "Show me how", "Mark done",
// plus "Run the setup wizard" and "Ask Stacy" in the footer. The refine chips
// still appear in the rail when a text field is focused.
import { OUTRO, closeStacy, closePreview } from '../lib/script.mjs';

const LAUNCHER = '[data-tour="stacy-launcher"]';
const COMPOSER = 'textarea[placeholder*="Ask Stacy"]';
const BADGE = '[data-tour="setup-progress"] button';

export default {
  id: '19-stacy-copilot',
  title: 'How to use Stacy, your CMS copilot',
  description: 'Ask Stacy about your site, let her draft and refine your text, and see where the setup checklist lives now.',
  intro: 'In this video we will show you Stacy, the copilot inside your CMS: what she knows, what she can write, and how the setup checklist works alongside her.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/`, { waitUntil: 'load' }); await page.waitForSelector(LAUNCHER, { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'open-1', title: 'Meet Stacy',
      say: 'Stacy sits at the bottom right of every page. Click her to open the rail. She greets you, and the box at the bottom is where you ask.',
      run: async ({ cursor, page }) => {
        await cursor.click(LAUNCHER, { at: 'click her', after: 1500 });
        await page.waitForSelector(COMPOSER, { timeout: 8000 }).catch(() => {});
        await cursor.hover("text=Hi, I'm Stacy", { at: 'greets you', settle: 600 }).catch(() => {});
        await cursor.hover(COMPOSER, { at: 'box at the bottom', settle: 600 }).catch(() => {});
      } },
    { id: 'ask-1', title: 'Ask',
      say: 'She answers from your real data. The three starters are good first questions: your opening hours, which service has no photo, which pages are missing a description.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'text=What are my opening hours', at: 'opening hours' }, { target: 'text=Which of my services has no photo', at: 'no photo' }, { target: 'text=Which pages are missing', at: 'missing' }]).catch(() => {}); } },
    { id: 'ask-2',
      say: 'Or type your own. Where do I change my footer text? Which team member has the most bookings this month? She points you to the right page, or answers outright.',
      run: async ({ cursor, page }) => { await cursor.click(COMPOSER, { at: 'type your own', after: 300 }); await cursor.type('Where do I change my footer text?', { delay: 40 }); await cursor.sleep(1200); await page.locator(COMPOSER).fill('').catch(() => {}); } },
    { id: 'options-1', title: 'Chat options',
      say: 'The three dots hold your chat options: a new chat, and History, which keeps every conversation, so an answer from last week is one click away. The arrow brings you back.',
      run: async ({ cursor, page }) => {
        await cursor.click('button[aria-label="Chat options"]', { at: 'three dots', after: 900 });
        await cursor.hover('button:has-text("New chat")', { at: 'new chat', settle: 500 }).catch(() => {});
        await cursor.click('button:has-text("History")', { at: 'history', after: 1200 }).catch(() => {});
        await cursor.click('button[aria-label="Back to chat"]', { at: 'arrow brings', after: 800 }).catch(() => {});
        await page.waitForSelector(COMPOSER, { timeout: 5000 }).catch(() => {});
      } },
    { id: 'talk-1',
      say: 'Prefer to talk? The phone button next to the box shows the Stemfra number: a real person picks up during business hours.',
      run: async ({ cursor }) => {
        await cursor.click('button[aria-label^="Prefer to talk"]', { at: 'phone button', after: 1200 });
        await cursor.hover('text=Call us at', { at: 'stemfra number', settle: 800 }).catch(() => {});
        await cursor.click('button[aria-label="Back to chat"]', { at: 'business hours', after: 800 }).catch(() => {});
      } },
    { id: 'draft-1', title: 'Draft and refine',
      say: 'On any text field, focus it and Stacy offers to rewrite what is there: simpler, shorter, longer, warmer or more professional. Drafts go into the field with one click, and you still Save.',
      // Editor fields live in the page body, not inside the row's data-tour element (video 4 lesson); the content page auto-opens the live preview drawer, close it first.
      run: async ({ cursor, goto, base, page }) => {
        await goto(`${base}/content/about?section=rich_text`, 2500); await closePreview(page);
        await page.waitForSelector('main textarea', { timeout: 15000 }).catch(() => {});
        await cursor.click('main textarea', { at: 'focus it', after: 400, scroll: true });
        await cursor.click(LAUNCHER, { after: 1400 }).catch(() => {});
        await page.waitForSelector(COMPOSER, { timeout: 8000 }).catch(() => {});
        await cursor.sweep([{ target: 'button:has-text("Simplify")', at: 'simpler' }, { target: 'button:has-text("Shorten")', at: 'shorter' }, { target: 'button:has-text("Warmer")', at: 'warmer' }]).catch(() => {});
      } },
    { id: 'setup-1', title: 'The setup checklist',
      say: 'The setup checklist is not inside Stacy any more. It is the Setup badge at the top of every page: what is left to do and what is done, in three stages, each step with Set up, Show me how, or Mark done.',
      run: async ({ cursor, goto, base, page }) => {
        await closeStacy(page);
        await goto(`${base}/`, 2000);
        await page.waitForSelector(BADGE, { timeout: 15000 }).catch(() => {});
        await cursor.click(BADGE, { at: 'setup badge', after: 1200 });
        await cursor.sweep([{ target: 'button:has-text("To do")', at: 'left to do' }, { target: 'button:has-text("Done")', at: 'what is done' }, { target: 'text=Make it yours', at: 'three stages' }]).catch(() => {});
        await cursor.hover('button:has-text("Set up")', { at: 'set up', settle: 500, scroll: true }).catch(() => {});
        await cursor.hover('button:has-text("Show me how")', { at: 'show me how', settle: 500, scroll: true }).catch(() => {});
        await cursor.hover('button:has-text("Mark done")', { at: 'mark done', settle: 500, scroll: true }).catch(() => {});
      } },
    { id: 'setup-2',
      say: 'The steps that need words say Set up, Stacy drafts it: she opens beside the editor with the text ready to use. And Run the setup wizard reopens the wizard from your first day, whenever your details change.',
      run: async ({ cursor, page }) => {
        await cursor.hover('button:has-text("Stacy drafts it")', { at: 'stacy drafts it', settle: 900, scroll: true }).catch(() => {});
        await cursor.hover('a:has-text("Run the setup wizard")', { at: 'run the setup wizard', settle: 1000, scroll: true }).catch(() => {});
        await page.keyboard.press('Escape').catch(() => {});
      }, hold: 0.8 },
  ],
};
