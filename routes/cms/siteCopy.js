const express = require('express');
const router = express.Router();
const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { draft } = require('../../controllers/cms/siteCopyController');

// The setup wizard's finish job: AI copy for the sections still carrying the
// demo's words (lib/siteCopy.js). { siteId, force?, dryRun? }
router.post('/draft', requireCmsAuth, draft);

module.exports = router;
