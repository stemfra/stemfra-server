// ─── Presence — who's online for inbound call routing (Phase 3a) ─────────────
//
// Endpoints:
//   POST /api/presence/heartbeat — caller marks themselves online; ops UI
//                                  pings this every 30s while the app is open
//   POST /api/presence/offline   — explicit "I'm leaving" (best effort —
//                                  sendBeacon at tab close)
//
// Auth: standard Bearer JWT, same shape as the other authenticated endpoints.
//
// A background sweeper (see startStalePresenceSweeper) in index.js flips
// is_online → false for any row whose last_heartbeat is older than 90s,
// because we can't rely on browsers actually firing the offline beacon on
// tab close.

const express  = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

async function validateUserSession(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// Body (optional, P29 work-time monitor 2026-09-10): { idle, in_call,
// last_active_at, dnd }. `idle` = no input for work_time.idle_stop_minutes;
// `in_call` keeps the clock running through a call; `dnd` = Quick Actions
// "Do not disturb": the person is NOT rung (is_online false) but their
// activity still counts as work. Old clients send no body → online, active.
router.post('/heartbeat', async (req, res) => {
  const user = await validateUserSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const b = req.body || {};
    const now = new Date();
    const idle = b.idle === true;
    const inCall = b.in_call === true;
    let lastActive = b.last_active_at ? new Date(b.last_active_at) : null;
    if (!lastActive || Number.isNaN(lastActive.getTime()) || lastActive > now) lastActive = idle ? null : now;
    const row = {
      user_id:         user.id,
      is_online:       b.dnd !== true,
      twilio_identity: `user_${user.id}`,
      last_heartbeat:  now.toISOString(),
      updated_at:      now.toISOString(),
      idle,
      in_call:         inCall,
    };
    if (lastActive) row.last_active_at = lastActive.toISOString();
    await supabase.from('user_presence').upsert(row, { onConflict: 'user_id' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[presence] heartbeat error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/offline', async (req, res) => {
  const user = await validateUserSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await supabase.from('user_presence').upsert({
      user_id:    user.id,
      is_online:  false,
      idle:       true,   // closes the open work session at last_active_at
      in_call:    false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[presence] offline error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Periodic sweeper — flips presence to offline for users whose last heartbeat
 * is older than the threshold. The UI heartbeats every 30s and (post Phase 3a
 * fix) keeps doing so even when the tab is backgrounded. Browsers throttle
 * setInterval in hidden tabs, so we leave generous slack: 150s = 5 missed
 * beats before we flag someone offline. That's enough to ride out a brief
 * network blip or aggressive throttling without dropping calls.
 *
 * Exported so index.js can start it at boot.
 */
function startStalePresenceSweeper({ intervalMs = 60_000, staleMs = 150_000 } = {}) {
  const tick = async () => {
    try {
      const cutoff = new Date(Date.now() - staleMs).toISOString();
      await supabase
        .from('user_presence')
        .update({ is_online: false, updated_at: new Date().toISOString() })
        .eq('is_online', true)
        .lt('last_heartbeat', cutoff);
    } catch (err) {
      console.warn('[presence] sweeper error:', err.message);
    }
  };
  tick();
  return setInterval(tick, intervalMs);
}

module.exports = router;
module.exports.startStalePresenceSweeper = startStalePresenceSweeper;
