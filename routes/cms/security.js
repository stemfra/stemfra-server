const express = require('express');
const router = express.Router();
const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { event, session } = require('../../controllers/cms/securityController');

// Account security notices (lib/securityEvents.js).
router.post('/event', requireCmsAuth, event);     // { kind: password_changed | mfa_enabled | mfa_disabled | email_changed }
router.post('/session', requireCmsAuth, session); // { deviceId } on every sign-in

module.exports = router;
