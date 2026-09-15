// Account security notices (P39k item 3). The CMS reports what the owner just
// did in Supabase Auth (the server does not see those calls), and the sign-in
// device. Owner JWT only: an owner can only ever notify their own account.
const { notifySecurityEvent, registerDevice } = require('../../lib/securityEvents');

const CLIENT_KINDS = new Set(['password_changed', 'mfa_enabled', 'mfa_disabled', 'email_changed']);

// POST /api/cms/security/event { kind, newEmail? }
async function event(req, res) {
  try {
    const { kind, newEmail = null } = req.body || {};
    if (!CLIENT_KINDS.has(kind)) return res.status(400).json({ error: 'unknown kind' });
    const r = await notifySecurityEvent({ authUserId: req.cmsUser.id, email: req.cmsUser.email, kind, req, newEmail: typeof newEmail === 'string' ? newEmail.slice(0, 200) : null });
    res.json(r);
  } catch (err) {
    console.error('[cms/security] event failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/security/session { deviceId }
async function session(req, res) {
  try {
    const { deviceId } = req.body || {};
    if (!deviceId || typeof deviceId !== 'string') return res.status(400).json({ error: 'deviceId required' });
    res.json(await registerDevice({ authUserId: req.cmsUser.id, email: req.cmsUser.email, deviceId, req }));
  } catch (err) {
    console.error('[cms/security] session failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { event, session };
