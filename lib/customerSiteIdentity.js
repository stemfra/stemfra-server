// Customer onboarding keeps the chosen design, never the source business's identity.
const SOCIAL_FIELDS = ['instagram_handle', 'facebook_handle', 'youtube_handle', 'tiktok_handle', 'twitter_handle'];
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function masked(value, brand) {
  let text = JSON.stringify(value ?? '').toLowerCase();
  for (const name of new Set([brand, brand?.replace(/&/g, 'and'), brand?.replace(/\band\b/gi, '&')])) {
    if (name) text = text.split(name.toLowerCase()).join('@business@');
  }
  return text;
}
function customerIdentityPatch({ theme = {}, source = {}, companyName, sourceName, city, fresh = false, year = new Date().getUTCFullYear() }) {
  if (!companyName) return {};
  const inherited = (current, original) => original != null && masked(current, companyName) === masked(original, sourceName);
  const patch = {};
  for (const field of SOCIAL_FIELDS) {
    if ((fresh || (source[field] && theme[field] === source[field])) && theme[field] != null) patch[field] = null;
  }
  if (fresh || (source.copyright_year != null && theme.copyright_year === source.copyright_year)) patch.copyright_year = year;
  if ((fresh || inherited(theme.footer_text, source.footer_text)) && theme.footer_text != null) patch.footer_text = null;
  const metadata = { ...(theme.metadata || {}) }, seo = { ...(metadata.seo || {}) }, labels = { ...(metadata.labels || {}) };
  const marker = { ...(metadata.customer_identity || {}) };
  const description = `${String(companyName).trim()}${city ? ` in ${String(city).trim()}` : ''}.`;
  if (fresh || !seo.default_description || inherited(seo.default_description, source.metadata?.seo?.default_description) || seo.default_description === marker.description) {
    seo.default_description = description;
    marker.description = description;
  }
  if (fresh || !seo.default_title || inherited(seo.default_title, source.metadata?.seo?.default_title) || seo.default_title === marker.title) {
    seo.default_title = companyName;
    marker.title = companyName;
  }
  if (fresh || inherited(labels.footer_copyright, source.metadata?.labels?.footer_copyright)) delete labels.footer_copyright;
  metadata.seo = seo;
  if (metadata.labels) metadata.labels = labels;
  metadata.customer_identity = { ...marker, version: 1 };
  patch.metadata = metadata;
  return Object.fromEntries(Object.entries(patch).filter(([key, value]) => !same(theme[key], value)));
}
async function repairCustomerIdentity(db, { siteId, sourceSiteId, companyName, city, fresh = false }) {
  if (sourceSiteId === siteId) return false;
  const results = await Promise.all([
    db.from('site_theme_settings').select('*').eq('site_id', siteId).maybeSingle(),
    sourceSiteId ? db.from('site_theme_settings').select('*').eq('site_id', sourceSiteId).maybeSingle() : { data: null },
    sourceSiteId ? db.from('sites').select('company:companies(name)').eq('id', sourceSiteId).maybeSingle() : { data: null },
  ]);
  for (const result of results) if (result.error) throw result.error;
  const theme = results[0].data;
  const patch = customerIdentityPatch({ theme: theme || {}, source: results[1].data || {}, sourceName: results[2].data?.company?.name, companyName, city, fresh });
  if (!Object.keys(patch).length) return false;
  // Fence against simultaneous owner edits; a later Finish can retry safely.
  let query = theme ? db.from('site_theme_settings').update(patch).eq('site_id', siteId) : db.from('site_theme_settings').insert({ site_id: siteId, ...patch });
  if (theme?.updated_at) query = query.eq('updated_at', theme.updated_at);
  const result = await query.select('site_id');
  if (result.error) throw result.error;
  if (!result.data?.length) throw Error('Your business details changed in another window. Please try again.');
  return true;
}
module.exports = { customerIdentityPatch, repairCustomerIdentity, SOCIAL_FIELDS };
