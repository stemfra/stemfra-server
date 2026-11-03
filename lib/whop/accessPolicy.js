// Provider-verified lifecycle policy. A status alone never proves paid access.
const GRACE_MS = 7 * 24 * 60 * 60 * 1000;
function accessPolicy({ status, period_end, cancel_at_period_end }, now = Date.now()) {
  const paidEnd = Date.parse(period_end);
  if (!Number.isFinite(paidEnd)) return { state: 'review', reason: 'missing_paid_period' };
  if (cancel_at_period_end || status === 'cancelled') {
    return { state: now < paidEnd ? 'paid' : 'suspend', endsAt: new Date(paidEnd).toISOString(), reason: 'cancellation' };
  }
  if (!['active', 'past_due'].includes(status)) return { state: 'review', reason: 'unknown_provider_state' };
  if (now < paidEnd) return { state: 'paid', endsAt: new Date(paidEnd).toISOString() };
  // A stale active membership is not proof that renewal failed. Read provider
  // again rather than silently inventing a grace period or suspending a payer.
  if (status === 'active') return { state: 'review', reason: 'renewal_not_confirmed' };
  const endsAt = new Date(paidEnd + GRACE_MS).toISOString();
  return { state: now < paidEnd + GRACE_MS ? 'grace' : 'suspend', endsAt, reason: 'failed_renewal' };
}
module.exports = { accessPolicy, GRACE_MS };
