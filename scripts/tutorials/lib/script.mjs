// Shared bits for the video scripts (videos/*.mjs).
export const side = (label) => `aside a:has-text("${label}")`;
export const LIVE = 'https://argyleandsons.click';
export const OUTRO = 'Thanks for watching. Questions go under the video, or ask Stacy inside your CMS.';
/** A settings section on a /settings/<group> page: its header band carries data-tour="<id>-header". */
export const sec = (id) => `[data-tour="${id}-header"]`;
/** Close Stacy's rail if it is open (it steals width from the page). */
export async function closeStacy(page) { await page.locator('button[aria-label="Close"]').first().click({ timeout: 1200 }).catch(() => {}); }
/** Replace an input's value by selecting everything and typing, so the viewer sees the keystrokes. */
export async function retype(cursor, page, selector, text, opts = {}) {
  await cursor.click(selector, { after: 250, ...opts });
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.press('Backspace');
  await cursor.type(text, { delay: opts.delay ?? 55 });
}

/**
 * Content pages (/content/<slug>) open the live-preview drawer on arrival, and
 * the sidebar tucks itself away to a 22px strip while it is open, so a script
 * that points at the navigation must close the drawer first (the Preview
 * button reopens it on cue). Waits for the auto-open, closes, waits for the nav.
 */
export async function closePreview(page) {
  const close = page.locator('button[aria-label="Close preview"]');
  await close.waitFor({ state: 'visible', timeout: 9000 }).catch(() => {});
  await close.click({ timeout: 1500 }).catch(() => {});
  await page.locator('aside a:has-text("Website")').filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
}
