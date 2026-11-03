// Retired after provider-document decision, 2 November 2026.
// Preserve existing outbox rows as audit history. No flag can restart duplicate mail.
async function drainReceipts() { return { skipped: 'whop_owns_payment_documents' }; }
function startReceiptSweeper() { return null; }
module.exports = { drainReceipts, startReceiptSweeper };
