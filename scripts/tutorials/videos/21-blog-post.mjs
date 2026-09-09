// Video 21: "How to write a blog post" (Marketing > Blog). Probed 2026-09-08:
// + New post (data-tour blog-add), empty state on Argyle. The post editor is
// opened, typed into, and cancelled (no publish), so the live site stays.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '21-blog-post',
  title: 'How to write a blog post',
  description: 'Write and publish a post on your Stemfra site, with a cover photo, and where it appears.',
  intro: 'In this video we will show you how to write a blog post, and where it shows on your website.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/blog`, { waitUntil: 'load' }); await page.waitForSelector('[data-tour="blog-add"]', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'where-1', title: 'Blog',
      say: 'Blog lives under Marketing. Published posts appear on your site at slash blog, newest first, and the Blog link shows in your menu once you have one.',
      run: async ({ cursor }) => { await cursor.hover(side('Marketing'), { at: 'marketing' }); await cursor.hover('[data-tour="blog-list"]', { at: 'published posts', settle: 1000 }); } },
    { id: 'new-1', title: 'Write a post',
      say: 'Click New post. A title, the text, a cover photo, and tags. The address is made from the title on its own.',
      run: async ({ cursor }) => { await cursor.click('[data-tour="blog-add"]', { at: 'new post', after: 1400 }); await cursor.sweep([{ target: 'main label:has-text("Title"), main input[type="text"]', at: 'title' }, { target: 'main textarea', at: 'the text' }, { target: 'text=/Cover|cover photo/i', at: 'cover photo', scroll: true }]).catch(() => {}); } },
    { id: 'new-2',
      say: 'Type the title and the post. Press Enter twice for a new paragraph. Reading time is worked out for you.',
      run: async ({ cursor }) => { await cursor.click('main input[type="text"]', { at: 'type the title', after: 300 }); await cursor.type('How often should you get a haircut?', { delay: 45 }); await cursor.click('main textarea', { at: 'the post', after: 300 }); await cursor.type('Short back and sides hold their shape for about three weeks. A longer cut can go five or six.', { delay: 22 }); } },
    { id: 'publish-1',
      say: 'Save keeps it as a draft. Publish puts it on the site. We will cancel this one.',
      run: async ({ cursor, page }) => { await cursor.hover('main button:has-text("Publish"), main button:has-text("Save")', { at: 'publish', settle: 1000 }).catch(() => {}); await cursor.click('main button:has-text("Cancel"), main button:has-text("Discard")', { at: 'cancel', after: 800 }).catch(async () => { await page.goto(page.url()); }); } },
    { id: 'tip-1',
      say: 'Stuck for words? Focus the text and ask Stacy for a draft on any topic your clients ask about.',
      run: async ({ cursor }) => { await cursor.hover('[data-tour="stacy-launcher"]', { at: 'ask stacy', settle: 1200 }); }, hold: 0.8 },
  ],
};
