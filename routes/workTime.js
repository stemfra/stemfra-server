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

module.exports = router;
