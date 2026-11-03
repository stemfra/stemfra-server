const express = require('express');
const router = express.Router();
const catalogue = require('../../lib/managedWebsiteCatalogue');
router.use(catalogue.middleware);
const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { getBilling, updateBillingContact, changePlan, cancelSubscription, reactivateSubscription, invoicePdf, hostedInvoice, submitReceipt, claimPayment } = require('../../controllers/cms/billingController');

// Owner-facing System-A billing: see your Stemfra subscription + charges, edit
// billing details, change plan, cancel/reactivate, and download invoice PDFs.
router.get('/', requireCmsAuth, getBilling);
router.post('/checkout', requireCmsAuth, catalogue.requestGate, catalogue.quoteGate, async (req, res) => {
  const siteId = req.body?.siteId;
  if (typeof siteId !== 'string' || !/^[0-9a-f-]{36}$/i.test(siteId)) return res.status(400).json({ error: 'Choose a website.' });
  const { verifySiteOwnership } = require('../../middleware/cmsAuth');
  if (!await verifySiteOwnership(req.cmsUser.id, siteId, { allowSuspended: true })) return res.status(403).json({ error: 'Not your site' });
  try { return res.json(await require('../../lib/whop/service').prepare(siteId, req.cmsUser.id, req.cmsUser.email, req.body?.currency)); }
  catch (error) {
    console.error('[whop] checkout failed:', error.message);
    return res.status(/already|pending/.test(error.message) ? 409 : 503).json({ error: /already|pending/.test(error.message) ? 'An existing subscription or checkout needs to be managed before starting another.' : 'Subscriptions are temporarily unavailable. Please contact billing@stemfra.com.' });
  }
});
router.get('/saved-cards', requireCmsAuth, async (req, res) => {
  if (process.env.WHOP_SAVED_CARD_ENABLED !== 'true') return res.json({ cards: [] });
  try { res.json({ cards: await require('../../lib/whop/savedCards').list(req.cmsUser.id) }); }
  catch { res.status(503).json({ error: 'Saved cards are temporarily unavailable. You can use Whop checkout.' }); }
});
router.post('/saved-card-subscription', requireCmsAuth, catalogue.requestGate, catalogue.quoteGate, async (req, res) => {
  const { siteId, methodId } = req.body || {};
  const { verifySiteOwnership } = require('../../middleware/cmsAuth');
  if (typeof siteId !== 'string' || typeof methodId !== 'string' || !await verifySiteOwnership(req.cmsUser.id, siteId, { allowSuspended: true })) return res.status(403).json({ error: 'Not your site' });
  try { res.json(await require('../../lib/whop/savedCards').subscribe(siteId, req.cmsUser.id, req.cmsUser.email, methodId, req.body?.currency)); }
  catch { res.status(409).json({ error: 'Payment could not be confirmed. Check billing or contact support before trying another payment.' }); }
});
router.get('/saved-card-status', requireCmsAuth, async (req, res) => {
  const { siteId, paymentId } = req.query;
  const { verifySiteOwnership } = require('../../middleware/cmsAuth');
  if (typeof siteId !== 'string' || typeof paymentId !== 'string' || !await verifySiteOwnership(req.cmsUser.id, siteId, { allowSuspended: true })) return res.status(403).json({ error: 'Not your site' });
  try { res.json(await require('../../lib/whop/savedCards').status(siteId, req.cmsUser.id, paymentId)); }
  catch { res.status(503).json({ error: 'Payment status is temporarily unavailable.' }); }
});
// Refresh before payment help/dispute handoff; never submits a financial action.
router.post('/charges/:chargeId/payment-check', requireCmsAuth, async(req,res)=>{
 const db=require('../../config/supabase');
 const charge=await db.from('billing_charges').select('id,site_id,metadata,provider').eq('id',req.params.chargeId).maybeSingle();
 const {verifySiteOwnership}=require('../../middleware/cmsAuth');
 if(!charge.data||charge.data.provider!=='whop'||!await verifySiteOwnership(req.cmsUser.id,charge.data.site_id,{allowSuspended:true}))return res.status(403).json({error:'Not your payment'});
 try {const cfg=require('../../lib/whop/core').config();
  res.json(await require('../../lib/whop/financialState').refresh(cfg,charge.data.metadata.whop_payment_id,`owner-check-${require('node:crypto').randomUUID()}`));
 }catch{res.status(503).json({error:'Payment verification is temporarily unavailable. You can still contact Whop through Manage billing.'});}
});
router.patch('/contact', requireCmsAuth, updateBillingContact);
router.post('/change-plan', requireCmsAuth, changePlan);
router.post('/cancel', requireCmsAuth, cancelSubscription);
router.post('/reactivate', requireCmsAuth, reactivateSubscription);
router.get('/charges/:chargeId/invoice', requireCmsAuth, invoicePdf);
router.get('/charges/:chargeId/hosted-invoice', requireCmsAuth, hostedInvoice);
router.post('/charges/:chargeId/receipt', requireCmsAuth, submitReceipt);
router.post('/charges/:chargeId/claim', requireCmsAuth, claimPayment);

module.exports = router;
