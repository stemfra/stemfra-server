const router = require('express').Router();
router.post('/', async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) return res.status(400).json({ error: 'raw_body_required' });
    const result = await require('../lib/whop/service').receive(req.body.toString('utf8'), req.headers);
    return res.json({ received: true, ...result });
  } catch (error) {
    if (error.message !== 'invalid_signature') console.error('[whop] reconciliation failed:', error.message);
    return res.status(error.status || 503).json({ error: error.status === 401 ? 'Invalid signature' : 'Payment synchronization is temporarily unavailable.' });
  }
});
module.exports = router;
