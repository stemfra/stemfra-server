// Video 18: "How to turn on the website chat assistant (Front desk)". Probed
// 2026-09-08: /settings/frontdesk (#frontdesk: Enabled / Disabled cards +
// Save). The live demo site shows the chat launcher bottom-right.
import { side, LIVE, OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '18-front-desk-chat',
  title: 'How to turn on the website chat assistant',
  description: 'Switch on the Front desk chat assistant on your Stemfra website: it answers from your real hours, services and pages, captures enquiries, and books.',
  intro: 'In this video we will show you the chat assistant your website can run for you, and how to turn it on.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/settings/frontdesk`, { waitUntil: 'load' }); await page.waitForSelector('#frontdesk', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'what-1', title: 'What it does',
      say: 'On your published site, visitors see a chat button. The assistant answers from your live information: opening hours, services, prices, team and pages. It never invents a price or a free slot.',
      // Argyle's "FIRST CUT $10 OFF" popup (video 20's subject) opens on the live home and covers the site: dismiss it first.
      run: async ({ cursor, goto, page }) => { await goto(`${LIVE}/`, 3000); await page.locator('[role="dialog"] button[aria-label="Close"], button:has-text("No, Thanks")').first().click({ timeout: 4000 }).catch(() => {}); await cursor.sleep(500); await cursor.hover('button[aria-label*="chat" i], button:has-text("Chat"), [class*="launcher"]', { at: 'chat button', settle: 1500 }).catch(() => {}); } },
    { id: 'what-2',
      say: 'When a visitor leaves a name and email, it lands in your Inbox. When they want a time, it offers real slots and can book a free service on the spot.',
      run: async ({ cursor }) => { await cursor.hover('body', { at: 'inbox', settle: 1500 }); } },
    { id: 'on-1', title: 'Turn it on',
      say: 'Back in the CMS, open Website, then Front desk. Enabled shows the assistant on your site. Disabled hides it.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/settings/frontdesk`, 2000); await cursor.hover(side('Website'), { at: 'website' }); await cursor.sweep([{ target: '#frontdesk button:has-text("Enabled")', at: 'enabled shows' }, { target: '#frontdesk button:has-text("Disabled")', at: 'disabled' }]); } },
    { id: 'on-2',
      say: 'Pick Enabled and click Save. The button appears on your site within a minute.',
      run: async ({ cursor }) => { await cursor.hover('#frontdesk button:has-text("Enabled")', { at: 'enabled', settle: 600 }); await cursor.hover('#frontdesk button:has-text("Save")', { at: 'save', settle: 900 }); } },
    { id: 'tip-1',
      say: 'The quick replies the assistant offers, like Book now or Opening hours, are yours to edit under Style, in Buttons and labels.',
      run: async ({ cursor, goto, base }) => { await goto(`${base}/settings/style#labels`, 2200); await cursor.hover('#labels label:has-text("Chat quick replies")', { at: 'quick replies', settle: 1200, scroll: true }).catch(() => {}); }, hold: 0.8 },
  ],
};
