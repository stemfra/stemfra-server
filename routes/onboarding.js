const express = require('express');
const router = express.Router();
const catalogue = require('../lib/managedWebsiteCatalogue');
router.use(catalogue.middleware, catalogue.requestGate, catalogue.quoteGate);
const { signup, signupAuthenticated } = require('../controllers/onboardingController');

// Public — creates the account + provisions a previewing site.
router.post('/signup', signup);
router.post('/signup-authenticated', signupAuthenticated); // Google sign-up (Bearer JWT = the new owner)

module.exports = router;
