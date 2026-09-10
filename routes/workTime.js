// ─── Work time — reads + settings for the CRM (P29 phase 1) ──────────────────
//
//   GET  /api/work-time/settings          any staff (the CRM idle clock needs the thresholds)
//   POST /api/work-time/settings          super_admin only (Settings → Work time)
//   GET  /api/work-time/me?from&to        own days + a live rollup of the current shift
//   GET  /api/work-time/team?from&to      manager and above: every active staff member
//   PATCH /api/work-time/shift/:userId    manager and above: set a rep's shift
//
// Single-var supabase require per convention.
const express = require('express');
const supabase = require('../config/supabase');
const { requireStaffAuth, requireStaffRole } = require('../middleware/staffAuth');
const wt = require('../lib/workTime');

const router = express.Router();
const TEAM_ROLES = ['super_admin', 'admin', 'manager', 'sales_manager'];

router.get('/settings', requireStaffAuth, async (req, res) => {
  try {
    res.json({ settings: await wt.getSettings(), limits: wt.LIMITS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings', requireStaffRole('super_admin'), async (req, res) => {
  try {
    const settings = await wt.saveSettings(req.body || {}, req.staffUser.id);
    res.json({ settings, limits: wt.LIMITS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireStaffAuth, async (req, res) => {
  try {
    const userId = req.staffUser.id;
    const { from, to } = req.query;
    res.json(await wt.daysFor(userId, { from, to }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/team', requireStaffRole(...TEAM_ROLES), async (req, res) => {
  try {
    const { from, to } = req.query;
    const settings = await wt.getSettings();
    const { data: profiles, error } = await supabase
      .from('profiles').select('id, full_name, email, avatar_url, role, shift').eq('is_active', true).order('full_name');
    if (error) throw error;
    const people = [];
    for (const p of profiles || []) {
      const d = await wt.daysFor(p.id, { from, to, profile: p, settings });
      people.push({ id: p.id, full_name: p.full_name, email: p.email, avatar_url: p.avatar_url, role: p.role, ...d });
    }
    res.json({ settings, people });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/shift/:userId', requireStaffRole(...TEAM_ROLES), async (req, res) => {
  try {
    const settings = await wt.getSettings();
    const shift = req.body?.shift == null ? null : wt.normalizeShift(req.body.shift, settings.default_shift);
    const { error } = await supabase.from('profiles').update({ shift }).eq('id', req.params.userId);
    if (error) throw error;
    res.json({ shift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Lock-screen PIN (phase 2) ───────────────────────────────────────────────
//   GET    /api/work-time/pin          { set, setAt, lockedUntil }
//   POST   /api/work-time/pin          { pin }  4 to 6 digits; sets or replaces
//   DELETE /api/work-time/pin          removes it (Google unlock only)
//   POST   /api/work-time/pin/verify   { pin } → { ok } | 401 { ok:false, attemptsLeft, lockedUntil }
// Hash = scrypt with a per-user salt (node crypto, no new dependency). Five
// wrong tries lock the PIN for 15 minutes; the lock screen then offers Google.
const crypto = require('crypto');
const PIN_RE = /^\d{4,6}$/;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60_000;

function hashPin(pin, salt = crypto.randomBytes(16)) {
  const hash = crypto.scryptSync(pin, salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}
function verifyHash(pin, stored) {
  const [, saltHex, hashHex] = String(stored || '').split('$');
  if (!saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(pin, Buffer.from(saltHex, 'hex'), 32, { N: 16384, r: 8, p: 1 });
  const expected = Buffer.from(hashHex, 'hex');
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}

router.get('/pin', requireStaffAuth, async (req, res) => {
  try {
    const { data } = await supabase.from('staff_lock_pins').select('set_at, locked_until').eq('user_id', req.staffUser.id).maybeSingle();
    res.json({ set: !!data, setAt: data?.set_at || null, lockedUntil: data?.locked_until || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pin', requireStaffAuth, async (req, res) => {
  try {
    const pin = String(req.body?.pin ?? '');
    if (!PIN_RE.test(pin)) return res.status(400).json({ error: 'The PIN must be 4 to 6 digits.' });
    if (/^(\d)\1+$/.test(pin) || '0123456789'.includes(pin) || '9876543210'.includes(pin)) {
      return res.status(400).json({ error: 'Pick a PIN that is not a repeat or a run of digits.' });
    }
    const now = new Date().toISOString();
    const { error } = await supabase.from('staff_lock_pins').upsert({
      user_id: req.staffUser.id, pin_hash: hashPin(pin), set_at: now, failed_attempts: 0, locked_until: null, updated_at: now,
    }, { onConflict: 'user_id' });
    if (error) throw error;
    res.json({ set: true, setAt: now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/pin', requireStaffAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('staff_lock_pins').delete().eq('user_id', req.staffUser.id);
    if (error) throw error;
    res.json({ set: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pin/verify', requireStaffAuth, async (req, res) => {
  try {
    const userId = req.staffUser.id;
    const pin = String(req.body?.pin ?? '');
    const { data: row } = await supabase.from('staff_lock_pins').select('*').eq('user_id', userId).maybeSingle();
    if (!row) return res.status(404).json({ ok: false, error: 'No PIN set.' });
    const now = Date.now();
    if (row.locked_until && new Date(row.locked_until).getTime() > now) {
      return res.status(423).json({ ok: false, attemptsLeft: 0, lockedUntil: row.locked_until });
    }
    if (PIN_RE.test(pin) && verifyHash(pin, row.pin_hash)) {
      await supabase.from('staff_lock_pins').update({ failed_attempts: 0, locked_until: null, updated_at: new Date().toISOString() }).eq('user_id', userId);
      return res.json({ ok: true });
    }
    const failed = (row.locked_until ? 0 : row.failed_attempts) + 1;
    const lockedUntil = failed >= MAX_ATTEMPTS ? new Date(now + LOCKOUT_MS).toISOString() : null;
    await supabase.from('staff_lock_pins').update({ failed_attempts: lockedUntil ? 0 : failed, locked_until: lockedUntil, updated_at: new Date().toISOString() }).eq('user_id', userId);
    res.status(lockedUntil ? 423 : 401).json({ ok: false, attemptsLeft: Math.max(0, MAX_ATTEMPTS - failed), lockedUntil });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
