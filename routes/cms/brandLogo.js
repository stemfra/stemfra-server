// /api/cms/brand-logo — "Find your logo" (P25 phase 1). Owner-auth + site ownership.
const express = require('express');
const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { lookup, importLogo, iconSearch, iconData, fontFile, buildLogo, healthcheck } = require('../../controllers/cms/brandLogoController');

const router = express.Router();
router.get('/healthcheck', healthcheck);
router.get('/lookup', requireCmsAuth, lookup);      // ?siteId=&domain=
router.post('/import', requireCmsAuth, importLogo); // { siteId, src, source, label }
// SVG builder (phase 2): public-corpus proxies + the save
router.get('/icons', requireCmsAuth, iconSearch);    // ?q=
router.get('/icon', requireCmsAuth, iconData);       // ?name=prefix:icon
router.get('/font', requireCmsAuth, fontFile);       // ?family=&weight=
router.post('/build', requireCmsAuth, buildLogo);    // { siteId, svg, kind, label, params }
module.exports = router;
