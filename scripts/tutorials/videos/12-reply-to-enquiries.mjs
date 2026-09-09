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
    // The reading pane (Helen-parity inbox, 2026-09-03): icon toolbar with
    // aria-labels Back to leads / Archive / Delete permanently, and on the right
    // Reply / Mark as replied; a "Suggested reply" card under the message opens
    // the composer prefilled (button title "Use this reply ..."); the composer
    // has "Send reply" + Discard. Nothing is sent in the take.
    { id: 'open-1', title: 'Open a message',
      say: 'Click a row to read it. It is marked read on its own. The icons across the top are your actions: back to the list, archive, delete, and on the right, reply and mark as replied.',
      run: async ({ cursor, page }) => {
        await cursor.click('[data-tour="leads-inbox"] button', { at: 'click a row', after: 1200 });
        await page.waitForSelector('button[aria-label="Back to leads"]', { timeout: 10000 }).catch(() => {});
        await cursor.sweep([{ target: 'button[aria-label="Back to leads"]', at: 'back to the list' }, { target: 'button[aria-label="Archive"]', at: 'archive' }, { target: 'button[aria-label="Delete permanently"]', at: 'delete' }, { target: 'button[aria-label="Reply"]', at: 'reply and' }, { target: 'button[aria-label="Mark as replied"]', at: 'mark as replied' }]);
      } },
    { id: 'suggest-1', title: 'The suggested reply',
      say: 'Under the message, Stemfra drafts a suggested reply from what the visitor wrote, in your business voice. Click it to use it, or the cross to dismiss it.',
      run: async ({ cursor, page }) => {
        await page.waitForSelector('button[title^="Use this reply"]', { timeout: 15000 }).catch(() => {});
        await cursor.hover('button[title^="Use this reply"]', { at: 'suggested reply', settle: 1200 }).catch(() => {});
        await cursor.hover('button[aria-label="Dismiss suggestion"]', { at: 'the cross', settle: 700 }).catch(() => {});
      } },
    { id: 'reply-1', title: 'Reply',
      say: 'Clicking the suggestion opens the composer with the draft in it, fully editable. Your reply goes out from your business name, and the client answers to your own email. Send reply sends it. We will discard this one.',
      run: async ({ cursor, page }) => {
        const used = await cursor.click('button[title^="Use this reply"]', { at: 'clicking the suggestion', after: 1500 }).then(() => true).catch(() => false);
        if (!used) await cursor.click('button[aria-label="Reply"]', { at: 'opens the composer', after: 1500 }).catch(() => {});
        await cursor.hover('main [contenteditable="true"], main textarea', { at: 'fully editable', settle: 900 }).catch(() => {});
        await cursor.hover('button:has-text("Send reply")', { at: 'send reply sends', settle: 900 }).catch(() => {});
        await cursor.click('button:has-text("Discard")', { at: 'discard', after: 800 }).catch(() => page.keyboard.press('Escape'));
      } },
    { id: 'reply-2',
      say: 'If you replied by phone or in person, use Mark as replied so the row leaves your New list. Archive when the conversation is over.',
      run: async ({ cursor }) => { await cursor.hover('button[aria-label="Mark as replied"]', { at: 'mark as replied', settle: 900 }).catch(() => {}); await cursor.hover('button[aria-label="Archive"]', { at: 'archive when', settle: 900 }).catch(() => {}); } },
    { id: 'tip-1',
      say: 'Back returns you to the list. Chat enquiries carry the visitor details the assistant collected, so you can answer with a booking link straight away.',
      run: async ({ cursor, page }) => {
        await cursor.click('button[aria-label="Back to leads"]', { at: 'back returns', after: 1000 }).catch(() => {});
        await page.waitForSelector('[data-tour="leads-inbox"]', { timeout: 10000 }).catch(() => {});
        await cursor.hover('[data-tour="leads-inbox"]', { at: 'chat enquiries', settle: 1200 }).catch(() => {});
      }, hold: 0.8 },
  ],
};
