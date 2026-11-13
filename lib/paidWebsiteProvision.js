// Paid onboarding prepares the established clone in memory, then commits it
// with its purchase checkpoint in one database transaction. No provider writes.
const { customerIdentityPatch } = require('./customerSiteIdentity');
const { randomUUID } = require('crypto');
const db = require('../config/supabase');
const { prepareClone, SEED_SOURCE_BY_VERTICAL } = require('./provisionSite');
const { getApprovedStarter } = require('./starters');
const { defaultsForCountry } = require('./localeDefaults');
const { soloTeamRows } = require('./soloTeam');
const { managedWebsiteAcceptance } = require('./managedWebsiteOffer');
const { LEGAL_DOCS } = require('./legalDocs');
const { isTestEmail } = require('./testData');
const { leadForClaimToken } = require('./claimTokens');
async function provision(p, user, company) {
  const starter = p.selection.starterId ? await getApprovedStarter(p.selection.starterId) : null;
  if (p.selection.starterId && !starter) throw Error('The selected website design is unavailable.');
  const sourceId = starter?.id || SEED_SOURCE_BY_VERTICAL[p.selection.vertical];
  if (!sourceId) throw Error('The selected business type is unavailable.');
  const existing = await db.from('contacts').select('id,full_name,first_name,last_name').eq('auth_user_id', user.id).maybeSingle();
  if (existing.error) throw existing.error;
  const contactId = existing.data?.id || randomUUID(), companyId = randomUUID(), siteId = randomUUID();
  const address = p.snapshot.billing_address || {};
  const name = p.snapshot.customer_name || user.user_metadata?.full_name || company;
  const names = String(name).trim().split(/\s+/);
  const now = new Date().toISOString();
  const country = address.country || p.selection.country;
  const fees = { accepted: true, accepted_at: p.selection.acceptedAt || now, ...managedWebsiteAcceptance(p.currency), policy_version: LEGAL_DOCS.fees.version, source: 'signup' };
  const prepared = await prepareClone({ sourceSiteId: sourceId, siteId, companyId, contactId, displayName: company,
    cloneThemeSettings: !!starter, overrides: { ...defaultsForCountry(country, address.state), metadata: {
      cloned_from: sourceId, ...(p.sandbox || isTestEmail(user.email) ? { is_test: true } : {}),
      onboarding: { tier: null, payment_methods: null, booking_provider: 'stemfra', fees_policy: fees } } } });
  const records = table => prepared.rows.find(r => r.table === table)?.records || [];
  const soloName = [existing.data?.first_name, existing.data?.last_name].filter(Boolean).join(' ') || existing.data?.full_name || name;
  const solo = soloTeamRows(siteId, soloName, prepared.site.business_hours, records('site_services'));
  // Same solo-owner team as ordinary signup, prepared before the transaction.
  prepared.rows = prepared.rows.filter(r => !['site_team_members','site_team_service_links','site_availability_rules'].includes(r.table));
  const testimonialIndex = prepared.rows.findIndex(r => r.table === 'site_testimonials');
  prepared.rows.splice(testimonialIndex < 0 ? prepared.rows.length : testimonialIndex, 0,
    { table: 'site_team_members', records: [solo.member] }, { table: 'site_team_service_links', records: solo.links }, { table: 'site_availability_rules', records: solo.rules });
  let theme = prepared.rows.find(r => r.table === 'site_theme_settings');
  if (!theme) { theme = { table: 'site_theme_settings', records: [{ id: randomUUID(), site_id: siteId, metadata: {} }] }; prepared.rows.push(theme); }
  for (const row of theme.records) {
    Object.assign(row, customerIdentityPatch({ theme: row, companyName: company, fresh: true }));
    row.metadata = { ...(row.metadata || {}), frontdesk_enabled: true };
  }
  const location = records('site_sections').find(r => r.section_type === 'location_map');
  if (location) location.content = { ...(location.content || {}), name: company };
  const lead = p.selection.claimToken ? await leadForClaimToken(p.selection.claimToken) : null;
  if (lead && location) {
    let signal = lead.raw_signal;
    if (typeof signal === 'string') { try { signal = JSON.parse(signal); } catch { signal = null; } }
    const businessAddress = signal?.address || [signal?.city, lead.region].filter(Boolean).join(', ');
    location.content = { ...location.content, ...(businessAddress ? { address: businessAddress } : {}), ...(lead.phone ? { phone: lead.phone } : {}) };
  }
  const legal = ['terms','privacy','fees'].map(document => ({ id: randomUUID(), contact_id: contactId, auth_user_id: user.id,
    email: user.email.toLowerCase(), site_id: siteId, document, version: p.selection.legalVersions?.[document]?.version || LEGAL_DOCS[document].version,
    accepted_at: p.selection.acceptedAt || now, source: 'signup', ip: p.selection.clientIp || null, user_agent: p.selection.userAgent || null,
    metadata: { ...managedWebsiteAcceptance(p.currency), purchaseConsent: { acceptedAt: p.selection.acceptedAt, legalVersions: p.selection.legalVersions, pricingVersion: p.selection.pricingVersion } } }));
  const rows = [{ table: 'companies', records: [{ id: companyId, name: company }] },
    ...(existing.data ? [] : [{ table: 'contacts', records: [{ id: contactId, full_name: name, first_name: names[0], last_name: names.slice(1).join(' ') || null,
      country, state: address.state || null, email: user.email, company_id: companyId, auth_user_id: user.id }] }]),
    { table: 'sites', records: [prepared.site] }, ...prepared.rows, { table: 'legal_acceptances', records: legal }];
  const result = await db.rpc('provision_paid_website', { p_purchase: p.id, p_user: user.id, p_source: sourceId, p_rows: rows, p_lead: lead?.id || null });
  if (result.error) throw Object.assign(Error('Your purchase is saved. Website preparation could not finish. Please try again.'), { status: 503 });
  return { site: { siteId: result.data } };
}
module.exports = { provision };
