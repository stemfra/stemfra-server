const express = require('express');
const router = express.Router();
const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { getInfo, save, find, use } = require('../../controllers/cms/googleProfileController');

// CMS "Google Business Profile" surface (Task #23). Owner-auth gated; each handler
// also runs verifySiteOwnership against the passed siteId.
router.get('/', requireCmsAuth, getInfo);   // ?siteId= → website/bookUrl/NAP/status
router.post('/', requireCmsAuth, save);     // { siteId, has_profile?, profile_url?, created?, linked? }
router.post('/find', requireCmsAuth, find); // { siteId, name, where } → candidates from Google Maps (Apify)
router.post('/use', requireCmsAuth, use);   // { siteId, candidate } → hours + socials + gbp snapshot saved

module.exports = router;
