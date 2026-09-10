// /api/cms/brand-logo — "Find your logo" (P25 phase 1). Owner-auth + site ownership.
const express = require('express');
const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { lookup, importLogo, healthcheck } = require('../../controllers/cms/brandLogoController');

const router = express.Router();
router.get('/healthcheck', healthcheck);
router.get('/lookup', requireCmsAuth, lookup);      // ?siteId=&domain=
router.post('/import', requireCmsAuth, importLogo); // { siteId, src, source, label }
module.exports = router;
