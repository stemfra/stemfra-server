const db = require('../../config/supabase');
const core = require('./core');

async function invoicePdf(charge) {
  const cfg = core.config();
  const paymentId = charge.metadata?.whop_payment_id;
  if (charge.provider !== 'whop' || !paymentId || charge.metadata?.sandbox !== cfg.sandbox) throw new Error('whop_document_unavailable');
  const payment = await cfg.client.payments.retrieve({ id: paymentId });
  if (payment.account_id !== cfg.account) throw new Error('wrong_whop_account');
  const binding = await db.from('whop_checkout_intents').select('id').eq('site_id', charge.site_id)
    .eq('membership_id', payment.membership_id).eq('sandbox', cfg.sandbox).eq('state', 'paid').maybeSingle();
  if (binding.error || !binding.data) throw new Error('unbound_whop_document');
  const result = await cfg.client.payments.generatePdf({ id: paymentId });
  const url = new URL(result.url);
  if (url.protocol !== 'https:' || url.username || url.password
    || !(url.hostname.endsWith('.amazonaws.com') || url.hostname.endsWith('.whop.com'))) throw new Error('invalid_document_url');
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('document_download_failed');
  const data = Buffer.from(await response.arrayBuffer());
  if (data.length > 10 * 1024 * 1024 || data.subarray(0, 5).toString() !== '%PDF-') throw new Error('invalid_document');
  return { data, filename: `Whop-${paymentId}.pdf` };
}
async function sendInvoicePdf(res, charge) {
  try {
    const pdf = await invoicePdf(charge);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.send(pdf.data);
  } catch {
    return res.status(503).json({ error: 'Your Whop document is temporarily unavailable. Please try again shortly.' });
  }
}
module.exports = { invoicePdf, sendInvoicePdf };
