// Admin lead tools (2026-09-15): refresh a lead's Google Maps record from Apify
// (one lead, or a background sweep over every thin one). Staff-gated; the
// Apify token never leaves the server.
const express = require('express');
const { requireStaffAuth, requireStaffRole, PLATFORM_OPS } = require('../../middleware/staffAuth');
const { refreshLeadFromGoogle, startSweep, sweepStatus } = require('../../lib/leadGoogleRefresh');

const router = express.Router();

function actorOf(req) {
  const u = req.staffUser || {};
  return { id: u.id || null, name: u.user_metadata?.full_name || u.email || 'Stemfra' };
}

router.get('/google-refresh/status', requireStaffAuth, (req, res) => res.json(sweepStatus()));

router.post('/google-refresh/sweep', requireStaffRole(...PLATFORM_OPS), async (req, res) => {
  try {
    const { limit, dryRun } = req.body || {};
    const actor = actorOf(req);
    const state = await startSweep({ limit: Math.min(Number(limit) || 200, 500), dryRun: dryRun === true, requestedBy: actor.id, actor });
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/google-refresh', requireStaffAuth, async (req, res) => {
  try {
    const dryRun = req.body?.dryRun === true;
    // Our own Places data first (free); `force: true` asks Google again for newer numbers.
    const r = await refreshLeadFromGoogle(req.params.id, { dryRun, force: req.body?.force === true, actor: actorOf(req) });
    res.json(r);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
