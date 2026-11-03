const express = require('express');
const router = express.Router();
router.use((_req, res, next) => process.env.MANAGED_WEBSITE_PURCHASE_ENABLED === 'true'
  ? res.status(409).json({ error: 'Please subscribe before setting up your account.', code: 'checkout_required' }) : next());
const catalogue = require('../lib/managedWebsiteCatalogue');
router.use(catalogue.middleware, catalogue.requestGate, catalogue.quoteGate);
const { signup, signupAuthenticated } = require('../controllers/onboardingController');

// Public — creates the account + provisions a previewing site.
router.post('/signup', signup);
router.post('/signup-authenticated', signupAuthenticated); // Google sign-up (Bearer JWT = the new owner)

module.exports = router;
