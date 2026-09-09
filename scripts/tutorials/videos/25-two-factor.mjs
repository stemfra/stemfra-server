// Video 25: "How to secure your account with two-factor authentication".
// Probed 2026-09-08: /profile/security (Two-factor authentication OFF, Turn
// on -> QR + 6-digit code; Change password; This session). The take starts
// the enrolment to show the QR, then cancels, so nothing changes.
import { OUTRO, closeStacy } from '../lib/script.mjs';

export default {
  id: '25-two-factor',
  title: 'How to secure your account with two-factor authentication',
  description: 'Turn on two-factor authentication for your Stemfra account with an authenticator app.',
  intro: 'In this video we will show you how to add two-factor authentication to your account, so a password alone is never enough to get in.',
  outro: OUTRO,
  async start({ page, base }) { await page.goto(`${base}/profile/security`, { waitUntil: 'load' }); await page.waitForSelector('h1:has-text("Security")', { timeout: 20000 }); await closeStacy(page); },
  segments: [
    { id: 'where-1', title: 'Security',
      say: 'Open your profile from the avatar at the top right, then Security. Two-factor authentication is the first card.',
      run: async ({ cursor }) => { await cursor.hover('button[aria-label="Account"]', { at: 'avatar', settle: 600 }); await cursor.hover('h3:has-text("Two-factor"), h2:has-text("Two-factor"), text=Two-factor authentication', { at: 'first card', settle: 1000 }); } },
    { id: 'on-1', title: 'Turn it on',
      say: 'Click Turn on. A QR code appears. Scan it with an authenticator app, like Google Authenticator or 1Password, and type the six digit code it shows.',
      run: async ({ cursor, page }) => { await cursor.click('button:has-text("Turn on")', { at: 'turn on', after: 2500 }); await cursor.hover('main img, main svg', { at: 'qr code', settle: 1200 }).catch(() => {}); await cursor.hover('main input', { at: 'six digit', settle: 900 }).catch(() => {}); } },
    { id: 'on-2',
      say: 'From then on, signing in asks for a fresh code from the app. We will cancel here so this demo account stays as it is.',
      run: async ({ cursor }) => { await cursor.click('button:has-text("Cancel")', { at: 'cancel', after: 1000 }).catch(() => {}); } },
    { id: 'password-1', title: 'Password and session',
      say: 'Change password is below. If you sign in with Google, you may not have a password at all, and that is fine.',
      run: async ({ cursor }) => { await cursor.hover('text=Change password', { at: 'change password', settle: 1000, scroll: true }); } },
    { id: 'session-1',
      say: 'This session shows the account you are signed in as and your last sign-in, so you can spot anything you do not recognise.',
      run: async ({ cursor }) => { await cursor.hover('text=This session', { at: 'this session', settle: 1200, scroll: true }); }, hold: 0.8 },
  ],
};
