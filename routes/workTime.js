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
      // Staff only: legacy client profiles (davis@forge-and-bell.com…) are still
      // active rows; the Team page filters them the same way.
      .from('profiles').select('id, full_name, email, avatar_url, role, shift').eq('is_active', true).like('email', '%@stemfra.com').order('full_name');
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

// ─── Absences (phase 3): permission from a superior ──────────────────────────
//   GET    /api/work-time/absences?from&to[&userId|&all=1]   own; team roles may read anyone / everyone
//   POST   /api/work-time/absences  { day, minutes, reason[, userId] }
//          own request → pending (managers are notified); a team role creating
//          it for someone else → approved on the spot.
//   PATCH  /api/work-time/absences/:id  { status: approved|rejected, note }   team roles, not on their own request
//   DELETE /api/work-time/absences/:id  own pending request, or a team role
// Approved minutes flow into work_days.excused_minutes through rollupUser.
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const isTeamRole = (role) => TEAM_ROLES.includes(role);

async function notify(userIds, kind, title, body, route) {
  for (const id of userIds) {
    try {
      await supabase.rpc('crm_notify', { p_user: id, p_kind: kind, p_title: title, p_body: body || '', p_route: route || '/activities/hours', p_entity_type: 'staff_absence', p_entity_id: null });
    } catch (err) { console.warn('[work-time] notify failed:', err.message); }
  }
}
async function teamUserIds() {
  const { data } = await supabase.from('profiles').select('id').eq('is_active', true).in('role', TEAM_ROLES);
  return (data || []).map((p) => p.id);
}
async function rollupDay(userId, day) {
  const settings = await wt.getSettings();
  const { data: profile } = await supabase.from('profiles').select('id, shift').eq('id', userId).maybeSingle();
  const window = wt.shiftWindowForDay(wt.shiftFor(profile, settings), day);
  return wt.rollupUser(userId, { settings, profile, window });
}

router.get('/absences', requireStaffAuth, async (req, res) => {
  try {
    const me = req.staffUser;
    const { from, to, userId, all } = req.query;
    let q = supabase.from('staff_absences').select('*').order('day', { ascending: false }).order('requested_at', { ascending: false });
    if (isTeamRole(me.role) && all === '1') { /* everyone */ }
    else if (isTeamRole(me.role) && userId) q = q.eq('user_id', userId);
    else q = q.eq('user_id', me.id);
    if (from) q = q.gte('day', from);
    if (to) q = q.lte('day', to);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ absences: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/absences', requireStaffAuth, async (req, res) => {
  try {
    const me = req.staffUser;
    const { day, reason } = req.body || {};
    const minutes = Math.round(Number(req.body?.minutes));
    const forOther = req.body?.userId && req.body.userId !== me.id;
    if (forOther && !isTeamRole(me.role)) return res.status(403).json({ error: 'Only a manager can add an absence for someone else.' });
    if (!DAY_RE.test(String(day || ''))) return res.status(400).json({ error: 'Pick a day.' });
    if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 24 * 60) return res.status(400).json({ error: 'Hours must be between 0 and 24.' });
    const userId = forOther ? req.body.userId : me.id;
    const approved = forOther; // a manager entering it for a rep = already approved
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('staff_absences').insert({
      user_id: userId, day, minutes, reason: String(reason || '').trim() || null,
      status: approved ? 'approved' : 'pending', requested_by: me.id,
      decided_by: approved ? me.id : null, decided_at: approved ? now : null,
    }).select('*').single();
    if (error) throw error;
    if (approved) {
      await rollupDay(userId, day);
    } else {
      const { data: p } = await supabase.from('profiles').select('full_name').eq('id', me.id).maybeSingle();
      const hrs = (minutes / 60).toFixed(minutes % 60 ? 1 : 0);
      await notify((await teamUserIds()).filter((id) => id !== me.id), 'absence_request',
        `${p?.full_name || me.email} asks for ${hrs}h off on ${day}`, reason || '', '/activities/hours');
    }
    res.json({ absence: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/absences/:id', requireStaffRole(...TEAM_ROLES), async (req, res) => {
  try {
    const me = req.staffUser;
    const status = req.body?.status;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'status must be approved or rejected' });
    const { data: row } = await supabase.from('staff_absences').select('*').eq('id', req.params.id).maybeSingle();
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.user_id === me.id && me.role !== 'super_admin') return res.status(403).json({ error: 'You cannot decide your own request.' });
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('staff_absences')
      .update({ status, decided_by: me.id, decided_at: now, note: String(req.body?.note || '').trim() || null })
      .eq('id', row.id).select('*').single();
    if (error) throw error;
    await rollupDay(row.user_id, row.day);
    const hrs = (row.minutes / 60).toFixed(row.minutes % 60 ? 1 : 0);
    await notify([row.user_id], `absence_${status}`, `Your ${hrs}h off on ${row.day} was ${status}`, req.body?.note || '', '/activities/hours');
    res.json({ absence: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/absences/:id', requireStaffAuth, async (req, res) => {
  try {
    const me = req.staffUser;
    const { data: row } = await supabase.from('staff_absences').select('*').eq('id', req.params.id).maybeSingle();
    if (!row) return res.status(404).json({ error: 'Not found' });
    const own = row.user_id === me.id;
    if (!(isTeamRole(me.role) || (own && row.status === 'pending'))) return res.status(403).json({ error: 'Only a pending request of your own can be withdrawn.' });
    const { error } = await supabase.from('staff_absences').delete().eq('id', row.id);
    if (error) throw error;
    if (row.status === 'approved') await rollupDay(row.user_id, row.day);
    res.json({ ok: true });
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
