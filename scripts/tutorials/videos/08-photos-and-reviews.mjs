// Video 8: "How to add photos and reviews" (Website > Media, Website >
// Testimonials). Probed 2026-09-08: /media (All / Images / Videos filters,
// drop zone, grid with Delete), /testimonials (rows with Feature / Hide from
// site, + Add). No writes.
import { side, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '08-photos-and-reviews',
  title: 'How to add photos and reviews',
  description: 'Upload and reuse photos in the Stemfra media library, and add customer reviews to your website.',
  intro: 'In this video we will show you where your photos live, how to reuse them anywhere on the site, and how to add customer reviews.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/media`, { waitUntil: 'load' }); await page.waitForSelector('h1:has-text("Media")', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'media-1', title: 'Media',
      say: 'Under Website, Media is every photo and video you have uploaded, in one place.',
      run: async ({ cursor }) => { await cursor.hover(side('Website'), { at: 'website' }); await cursor.hover('h1:has-text("Media")', { at: 'media', settle: 900 }); } },
    { id: 'media-2',
      say: 'Drop files here, or click to upload. Images are compressed automatically, so a phone photo is fine.',
      run: async ({ cursor }) => { await cursor.hover('text=Drop files here', { at: 'drop files', settle: 1200 }); } },
    { id: 'media-3',
      say: 'Each file shows where it is used. Anything marked unused can be deleted safely. Anything in use stays, because a section on your site needs it.',
      run: async ({ cursor }) => { await cursor.hover('main img', { at: 'each file', settle: 700 }); await cursor.hover('text=/In use|Unused/', { at: 'unused', settle: 1000 }).catch(() => {}); } },
    { id: 'media-4',
      say: 'You never upload the same photo twice: every image field in the CMS has a Library tab that picks from here.',
      run: async ({ cursor }) => { await cursor.sweep([{ target: 'button:has-text("Images")', at: 'never upload' }, { target: 'button:has-text("Videos")', at: 'library tab' }]); } },
    { id: 'reviews-1', title: 'Reviews',
      say: 'Reviews live under Website, then Testimonials. Each row is one review on your site.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/testimonials`, 2000); await cursor.hover('h1:has-text("Testimonials")', { at: 'testimonials', settle: 900 }); } },
    { id: 'reviews-2',
      say: 'Add takes the customer name, the review, the service it was for and an optional photo.',
      run: async ({ cursor }) => { await cursor.hover('main button:has-text("Add")', { at: 'add', settle: 900 }); await cursor.click('main button:has-text("Marco Rossi")', { at: 'customer name', after: 1500 }).catch(() => {}); } },
    { id: 'reviews-3',
      say: 'Feature marks the reviews your theme highlights. Hide from site keeps a review without showing it. Drag the handle to change the order.',
      run: async ({ cursor, page }) => { await cursor.click('main button:has-text("Cancel"), main button:has-text("Close")', { after: 800 }).catch(async () => { await page.keyboard.press('Escape'); }); await cursor.sweep([{ target: 'button[aria-label^="Feature this"], button[aria-label^="Unfeature"]', at: 'feature' }, { target: 'button[aria-label="Hide from site"]', at: 'hide from site' }, { target: 'button[aria-label^="Reorder"]', at: 'handle' }]); }, hold: 0.8 },
  ],
};
