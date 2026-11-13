const express = require('express');
const router = express.Router();
const catalogue = require('../../lib/managedWebsiteCatalogue');
router.use(catalogue.middleware);

function subscriptionQuoteGate(req, res, next) {
  if (req.body?.currency !== 'USD') {
    return res.status(409).json({ error: 'Branded subscriptions use USD. Check Billing before starting another payment.' });
  }
  return catalogue.newQuoteGate(req, res, next);
}

const { requireCmsAuth } = require('../../middleware/cmsAuth');
const { getBilling, updateBillingContact, changePlan, cancelSubscription, reactivateSubscription, invoicePdf, hostedInvoice, submitReceipt, claimPayment } = require('../../controllers/cms/billingController');

// Owner-facing System-A billing: see your Stemfra subscription + charges, edit
// billing details, change plan, cancel/reactivate, and download invoice PDFs.
router.get('/', requireCmsAuth, getBilling);
// Reopen existing hosted checkouts without creating a new provider session.
router.post('/checkout', requireCmsAuth, async (req, res) => {
  const { siteId, currency } = req.body || {};
  const { verifySiteOwnership } = require('../../middleware/cmsAuth');
  if (typeof siteId !== 'string' || !/^[0-9a-f-]{36}$/i.test(siteId) ||
      !await verifySiteOwnership(req.cmsUser.id, siteId, { allowSuspended: true })) {
    return res.status(403).json({ error: 'Choose a website you own.' });
  }
  try {
    return res.json(await require('../../lib/whop/service').resumeHosted(siteId, req.cmsUser.id, currency));
  } catch {
    return res.status(409).json({ error: 'Contact billing support to check your earlier payment.' });
  }
});
for (const action of ['quote', 'confirm']) {
  router.post(`/card-checkout/${action}`, requireCmsAuth, catalogue.requestGate, subscriptionQuoteGate, async (req, res) => {
    const { siteId, currency } = req.body || {};
    const { verifySiteOwnership } = require('../../middleware/cmsAuth');
    if (typeof siteId !== 'string' || !/^[0-9a-f-]{36}$/i.test(siteId) ||
        !await verifySiteOwnership(req.cmsUser.id, siteId, { allowSuspended: true })) {
      return res.status(403).json({ error: 'Choose a website you own.' });
    }
    try {
      const checkout = require('../../lib/whop/cmsCardCheckout');
      return res.json(await checkout[action](siteId, req.cmsUser.id, req.cmsUser.email, currency, req.body));
    } catch (error) {
      const safe = error.status === 400 || error.status === 409 || error.status === 403;
      return res.status(safe ? error.status : 503).json({
        error: safe ? error.message : action === 'quote' ? 'Card checkout is temporarily unavailable.' : 'Payment could not be confirmed. Check Billing before trying again.',
      });
    }
  });
}
router.get('/saved-cards', requireCmsAuth, async (req, res) => {
  if (process.env.WHOP_SAVED_CARD_ENABLED !== 'true') return res.json({ cards: [] });
  const siteId = req.query.siteId;
  if (siteId !== undefined && (typeof siteId !== 'string' || !/^[0-9a-f-]{36}$/i.test(siteId))) {
    return res.status(400).json({ error: 'Choose a website.' });
  }
  try { res.json({ cards: await require('../../lib/whop/savedCards').list(req.cmsUser.id, siteId) }); }
  catch { res.status(503).json({ error: 'Saved cards are temporarily unavailable.' }); }
});
async function ownsCardSetup(req, siteId) {
  const { verifySiteOwnership } = require('../../middleware/cmsAuth');
  return typeof siteId === 'string' && /^[0-9a-f-]{36}$/i.test(siteId) &&
    await verifySiteOwnership(req.cmsUser.id, siteId);
}
router.get('/card-setup', requireCmsAuth, async (req, res) => {
  const { siteId } = req.query;
  if (!await ownsCardSetup(req, siteId)) return res.status(403).json({ error: 'Choose a website you own.' });
  try { return res.json(await require('../../lib/whop/savedCards').setupConfig(siteId, req.cmsUser.id)); }
  catch { return res.status(409).json({ error: 'Card setup is unavailable for this subscription.' }); }
});
router.post('/card-setup', requireCmsAuth, async (req, res) => {
  const { siteId, tokenId } = req.body || {};
  if (!await ownsCardSetup(req, siteId)) return res.status(403).json({ error: 'Choose a website you own.' });
  if (typeof tokenId !== 'string' || !/^[A-Za-z0-9_-]{10,250}$/.test(tokenId)) {
    return res.status(400).json({ error: 'Could not read the card details. Try again.' });
  }
  try { return res.json(await require('../../lib/whop/savedCards').saveCard(siteId, req.cmsUser.id, tokenId)); }
  catch (error) {
    const message = error.message === 'card_requires_authentication'
      ? 'This card needs extra verification. Try another card or manage your payment method in Whop.'
      : 'Could not confirm that your card and address were saved. Check your payment methods before trying again.';
    return res.status(409).json({ error: message });
  }
});
router.post('/renewal-card', requireCmsAuth, async (req, res) => {
  const { siteId, methodId } = req.body || {};
  const { verifySiteOwnership } = require('../../middleware/cmsAuth');
  if (typeof siteId !== 'string' || typeof methodId !== 'string' || !await verifySiteOwnership(req.cmsUser.id, siteId)) {
    return res.status(403).json({ error: 'Choose a website you own.' });
  }
  try {
    await require('../../lib/whop/savedCards').changeRenewalCard(siteId, req.cmsUser.id, methodId);
    return res.json({ updated: true });
  } catch (error) {
    if (error.message === 'card_updated_address_pending') {
      return res.status(503).json({ error: 'Whop updated your renewal card. Select it again to sync the billing address.' });
    }
    return res.status(409).json({ error: 'Could not update your card here. Open Whop to manage your payment method.' });
  }
});
router.post('/saved-card-subscription', requireCmsAuth, catalogue.requestGate, subscriptionQuoteGate, async (req, res) => {
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
