// Video 12: "How to read and reply to enquiries" (Inbox). Probed 2026-09-08:
// tabs New / All / Archived (data-tour leads-filters), rows in leads-inbox,
// an open row shows Reply, Mark as replied, Archive, Delete permanently.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '12-reply-to-enquiries',
  title: 'How to read and reply to enquiries',
  description: 'Read the messages your website and chat assistant collect, and reply from inside the Stemfra CMS.',
  intro: 'In this video we will show you where the messages from your website land, and how to reply without leaving the CMS.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/leads`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="leads-inbox"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'inbox-1', title: 'The inbox',
      say: 'Click Inbox. Every contact form and every conversation the chat assistant captured is a row here. The badge in the sidebar counts the new ones.',
      run: async ({ cursor }) => { await cursor.hover(side('Inbox'), { at: 'inbox' }); await cursor.hover('[data-tour="leads-inbox"]', { at: 'every contact form', settle: 900 }); } },
    { id: 'inbox-2',
      say: 'New shows what you have not read. All shows everything. Archived keeps the ones you are done with.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("New (")', at: 'new shows' }, { target: 'button:has-text("All (")', at: 'all shows' }, { target: 'button:has-text("Archived")', at: 'archived' }]); } },
    { id: 'open-1', title: 'Open a message',
      say: 'Click a row to read it. It is marked read on its own. Below the message you get the actions: Reply, Mark as replied, Archive.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="leads-inbox"] button', { at: 'click a row', after: 1200 }); await cursor.sweep([{ target: 'button:has-text("Reply")', at: 'reply' }, { target: 'button:has-text("Mark as replied")', at: 'mark as replied' }, { target: 'button:has-text("Archive")', at: 'archive' }]); } },
    { id: 'reply-1', title: 'Reply',
      say: 'Reply opens a composer right here. Your reply is sent from your business name, and the client answers to your own email.',
      run: async ({ cursor }) => { await cursor.click('button:has-text("Reply")', { at: 'reply opens', after: 1500 }); await cursor.hover('main textarea, main [contenteditable="true"]', { at: 'composer', settle: 900 }).catch(() => {}); } },
    { id: 'reply-2',
      say: 'If you replied by phone or in person, use Mark as replied so the row leaves your New list. Archive when the conversation is over.',
      run: async ({ cursor, page }) => { await page.keyboard.press('Escape').catch(() => {}); await cursor.hover('button:has-text("Mark as replied")', { at: 'mark as replied', settle: 800 }).catch(() => {}); await cursor.hover('button:has-text("Archive")', { at: 'archive', settle: 800 }).catch(() => {}); } },
    { id: 'tip-1',
      say: 'Chat enquiries carry the visitor details the assistant collected, so you can answer with a booking link straight away.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="leads-inbox"]', { at: 'chat enquiries', settle: 1200 }); }, hold: 0.8 },
  ],
};
