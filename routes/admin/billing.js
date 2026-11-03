// Admin System-A billing routes — provider-agnostic collection ledger.
// Gated by PLATFORM_ADMIN (super_admin/admin/manager), same as subscriptions.
const express = require('express');
const { requireStaffRole, PLATFORM_ADMIN } = require('../../middleware/staffAuth');
const {
  getProvider, setProvider, listCharges, invoicePdf, bookingExport, requestDetails,
  startBilling, openCycle, markRequested, markPaid, getPlans, putPlans, runCommission,
} = require('../../controllers/admin/billingController');

const router = express.Router();
const gate = requireStaffRole(...PLATFORM_ADMIN);

const catalogueAdmin = require('../../controllers/admin/managedWebsiteCatalogueController');
const catalogueGate = requireStaffRole('super_admin', 'admin');
router.get('/managed-website-catalogue', catalogueGate, catalogueAdmin.get);
router.put('/managed-website-catalogue', catalogueGate, catalogueAdmin.save);
router.put('/managed-website-availability', catalogueGate, catalogueAdmin.availability);

router.get('/whop/activity', gate, require('../../controllers/admin/whopOperationsController').list);
router.post('/whop/events/:id/retry', gate, require('../../controllers/admin/whopOperationsController').retry);
router.get('/provider', gate, getProvider);
router.post('/provider', gate, setProvider);
router.get('/plans', gate, getPlans);
router.put('/plans', gate, putPlans);
router.get('/charges', gate, listCharges);
router.get('/charges/:id/invoice.pdf', gate, invoicePdf);
router.get('/charges/:id/booking-export.csv', gate, bookingExport);
router.get('/charges/:id/request-details', gate, requestDetails);
router.post('/charges/:id/requested', gate, markRequested);
router.post('/charges/:id/paid', gate, markPaid);
router.post('/commission/run', gate, runCommission);
router.post('/:siteId/start', gate, startBilling);
router.post('/:siteId/open-cycle', gate, openCycle);

module.exports = router;
