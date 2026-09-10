// /api/admin/handover — staff handover + offboarding (P32 phase 1). super_admin + admin.
const express = require('express');
const { requireStaffRole } = require('../../middleware/staffAuth');
const { preview, run } = require('../../controllers/admin/handoverController');

const router = express.Router();
const gate = requireStaffRole('super_admin', 'admin');
router.get('/preview', gate, preview);
router.post('/run', gate, run);
module.exports = router;
