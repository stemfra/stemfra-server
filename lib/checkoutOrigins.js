function origin(name, { local = false, localhostOnly = false, optional = false, relay = false } = {}) {
  const value = process.env[name]?.trim();
  if (!value && optional) return undefined;
  try {
    const url = new URL(value);
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const protocolOk = (!isLocal && url.protocol === 'https:')
      || (local && url.hostname === 'localhost' && url.protocol === 'http:');
    if (protocolOk && (!localhostOnly || isLocal)
      && (relay || !url.hostname.endsWith('.trycloudflare.com'))
      && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/') {
      return url.origin;
    }
  } catch { /* Report the setting name without its value. */ }
  console.warn(`[checkout-config] Set ${name} to a valid checkout origin.`);
  throw Object.assign(Error('Checkout return is temporarily unavailable.'), { status: 503 });
}

function websiteReturnOrigin(sandbox, requestedOrigin) {
  if (sandbox) return origin('WHOP_WEBSITE_CUSTOM_RETURN_ORIGIN', { local: true, localhostOnly: true });
  const canonical = origin('CLIENT_URL');
  const alternate = origin('CLIENT_ALTERNATE_URL', { optional: true });
  return alternate && requestedOrigin === alternate ? alternate : canonical;
}

function cmsCardReturnUrl(sandbox, siteId) {
  const base = sandbox
    ? origin('WHOP_CMS_SANDBOX_RETURN_ORIGIN', { relay: true })
    : origin('WHOP_RETURN_ORIGIN', { optional: true }) || origin('CMS_URL');
  const url = new URL('/billing?checkout=returned', base);
  url.searchParams.set('site', siteId);
  return url;
}

module.exports = { origin, websiteReturnOrigin, cmsCardReturnUrl };
