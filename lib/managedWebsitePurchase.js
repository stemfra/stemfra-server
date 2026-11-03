const crypto = require('node:crypto');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const fail = (message, status = 400) => Object.assign(new Error(message), { status });

function isPurchaseOwner(p, user) {
  return !!(user?.email_confirmed_at && p.auth_user_id && user.id === p.auth_user_id
    && user.email?.toLowerCase() === p.snapshot?.customer_email?.toLowerCase());
}

// This service never treats a return URL, a receipt number or a purchase secret
// as payment proof. Both webhook and return recovery use the Whop adapter.
function createService({ db, core, provision, mail, saveBilling, attach }) {
  async function load(id, key) {
    if (!/^[0-9a-f-]{36}$/i.test(id || '') || !/^[a-f0-9]{64}$/.test(key || '')) throw fail('Purchase not found.', 404);
    const r = await db.from('managed_website_purchases').select('*').eq('id', id).maybeSingle();
    if (r.error) throw fail('Purchase is temporarily unavailable.', 503);
    if (!r.data || r.data.secret_hash !== digest(key)) throw fail('Purchase not found.', 404);
    return r.data;
  }
  async function save(id, patch) {
    const r = await db.from('managed_website_purchases').update(patch).eq('id', id);
    if (r.error) throw fail('Could not save your purchase. Please try again.', 503);
  }
  async function start(selection, cfg) {
    const ready = await db.rpc('paid_website_provisioning_ready');
    if (ready.error || ready.data !== true) throw fail('Checkout is temporarily unavailable while setup is being updated.', 503);
    const offer = cfg.plans[selection.planKey];
    if (!offer?.plan) throw fail('Subscription is temporarily unavailable.', 503);
    const id = crypto.randomUUID(), key = crypto.randomBytes(32).toString('hex');
    const row = { id, secret_hash: digest(key), sandbox: cfg.sandbox, plan_key: selection.planKey,
      plan_id: offer.plan, currency: offer.currency || 'USD', monthly_cents: offer.cents, selection };
    const inserted = await db.from('managed_website_purchases').insert(row);
    if (inserted.error) throw fail('Could not start checkout.', 503);
    const origin = process.env.CMS_URL || 'http://localhost:5180';
    const back = new URL('/activate-purchase', origin);
    back.hash = new URLSearchParams({ purchase: id, key }).toString();
    const checkout = await core.checkout(cfg, { id, product: 'website', plan_key: row.plan_key, template_id: selection.starterId, business_type: selection.vertical }, back.href);
    await save(id, { checkout_id: checkout.checkoutId, checkout_url: checkout.url });
    return { id, key, url: checkout.url };
  }
  async function receive(cfg, snapshot) {
    if (!snapshot?.order_id) return false;
    const r = await db.from('managed_website_purchases').select('*').eq('id', snapshot.order_id).maybeSingle();
    // The feature is off until its migration is applied. Old subscriptions
    // must continue through their existing receiver without querying this table.
    if (r.error) throw r.error;
    const p = r.data;
    if (!p || p.state === 'complete') return false;
    if (p.sandbox !== cfg.sandbox || p.plan_id !== snapshot.plan_id
      || (snapshot.checkout_id && p.checkout_id !== snapshot.checkout_id)) throw fail('Purchase binding mismatch.');
    if ((snapshot.template_id || null) !== (p.selection.starterId || null)
      || (snapshot.business_type || null) !== (p.selection.vertical || null)) throw fail('Purchase design mismatch.');
    if (snapshot.paid) {
      if (!snapshot.customer_email || !snapshot.period_end || snapshot.status !== 'active' || !Number.isFinite(Date.parse(snapshot.period_end)) || Date.parse(snapshot.period_end) <= Date.now() || snapshot.currency !== p.currency
        || snapshot.monthly_cents !== p.monthly_cents) throw fail('Incomplete payment details.');
      // Do not regress an activation job when another delivery arrives.
      const updated = await db.from('managed_website_purchases').update({ snapshot,
        state: 'paid' }).eq('id', p.id).in('state', ['pending', 'paid']);
      if (updated.error) throw updated.error;
    }
    return true;
  }
  async function refresh(p, cfg, paymentId) {
    if (p.state === 'complete') return p;
    const id = paymentId || p.snapshot?.payment_id;
    if (id) {
      if (!/^pay_[a-zA-Z0-9]+$/.test(id)) throw fail('Invalid payment reference.');
      const snapshot = await core.snapshot(cfg, { type: 'payment.succeeded', data: { id } });
      if (!snapshot || snapshot.order_id !== p.id) throw fail('Payment does not belong to this purchase.');
      if (!snapshot.paid || snapshot.status !== 'active' || Date.parse(snapshot.period_end) <= Date.now())
        throw fail('This payment is not an active subscription. Open your Whop billing to check its status.', 409);
      await receive(cfg, snapshot);
    }
    const current = await db.from('managed_website_purchases').select('*').eq('id', p.id).single();
    if (current.error || !current.data) throw fail('Could not confirm your purchase. Please try again.', 503);
    return current.data;
  }
  async function sendCode(p, key) {
    if (!p.snapshot?.paid) throw fail('Payment is still being confirmed.', 409);
    const email = p.snapshot.customer_email.toLowerCase();
    // Claim the resend interval in the database, across tabs and API processes.
    const cutoff = new Date(Date.now() - 60000).toISOString();
    const claimed = await db.from('managed_website_purchases').update({ otp_sent_at: new Date().toISOString() })
      .eq('id', p.id).or(`otp_sent_at.is.null,otp_sent_at.lt.${cutoff}`).select('id').maybeSingle();
    if (claimed.error) throw claimed.error;
    if (!claimed.data) throw fail('Please wait a minute before requesting another code.', 429);
    let authId = p.auth_user_id, isNew = p.new_account;
    if (!authId) {
      const created = await db.auth.admin.createUser({ email, password: crypto.randomBytes(48).toString('base64url'),
        email_confirm: false, user_metadata: { full_name: p.snapshot.customer_name || null } });
      if (created.error && !/already|registered|exists/i.test(created.error.message)) throw created.error;
      if (created.data?.user) { authId = created.data.user.id; isNew = true; await save(p.id, { auth_user_id: authId, new_account: true }); }
    }
    const link = await db.auth.admin.generateLink({ type: 'magiclink', email });
    if (link.error || !link.data?.properties?.email_otp) throw fail('Could not send a verification code.', 503);
    if (authId && authId !== link.data.user.id) throw fail('Account verification mismatch.', 409);
    await save(p.id, { auth_user_id: link.data.user.id, new_account: isNew });
    const resume = new URL('/activate-purchase', process.env.CMS_URL || 'http://localhost:5180');
    resume.hash = new URLSearchParams({ purchase: p.id, key }).toString();
    const sent = await mail({ to: email, subject: 'Verify your Stemfra account',
      text: `Your Stemfra verification code is ${link.data.properties.email_otp}.\n\nEnter it to finish setting up your paid website.\nResume setup: ${resume.href}\n\nIf you did not request this code, you can ignore this email.` });
    if (!sent) throw fail('Could not send a verification code. Please try again.', 503);
    return { email, newAccount: p.state !== 'complete' && isNew };
  }
  async function complete(p, user, cfg, company) {
    if (!isPurchaseOwner(p, user)) throw fail('Verify the purchase email first.', 403);
    if (p.state === 'complete') return { siteId: p.site_id };
    if (p.state === 'provisioning' && !p.site_id) throw fail('This earlier setup needs support to resume. Your payment is saved. Do not pay again.', 409);
    if (!['paid','provisioning'].includes(p.state) || !p.snapshot?.paid) throw fail('Payment has not been confirmed.', 409);
    const address = p.snapshot.billing_address || {};
    // The transaction locks this purchase, creates all clone rows and saves the
    // site checkpoint together. Concurrent/repeated requests receive that site.
    const result = p.site_id ? { site: { siteId: p.site_id } } : await provision(p, user, company);
    await save(p.id, { site_id: result.site.siteId });
    const names = String(p.snapshot.customer_name || '').trim().split(/\s+/);
    await saveBilling(result.site.siteId, { ...address, first_name: names[0] || null, last_name: names.slice(1).join(' ') || null });
    const intent = await db.from('whop_checkout_intents').upsert({ id: p.id, site_id: result.site.siteId,
      requested_by: user.id, receipt_email: user.email, product: 'website', plan_key: p.plan_key,
      plan_id: p.plan_id, sandbox: p.sandbox, checkout_id: p.checkout_id, checkout_url: p.checkout_url,
      acquisition_mode: 'checkout' }, { onConflict: 'id', ignoreDuplicates: true });
    if (intent.error) throw intent.error;
    const reconciled = await db.rpc('whop_reconcile', { p_event: `purchase-${p.id}`, p_type: 'payment.succeeded',
      p_snapshot: p.snapshot, p_sandbox: cfg.sandbox });
    if (reconciled.error) throw reconciled.error;
    await attach(result.site.siteId);
    await save(p.id, { state: 'complete', completed_at: new Date().toISOString() });
    return { siteId: result.site.siteId };
  }
  return { start, load, receive, refresh, sendCode, complete };
}
module.exports = { createService, digest, isPurchaseOwner };
