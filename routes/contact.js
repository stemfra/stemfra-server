const express = require('express');
const router  = express.Router();
const { requireStaffAuth } = require('../middleware/staffAuth');

const { submitContact, getContacts } = require('../controllers/contactController');

// POST /api/contact  — submit contact form
router.post('/', submitContact);

// GET  /api/contact  — list all submissions (internal/admin)
router.get('/', requireStaffAuth, getContacts);

module.exports = router;
