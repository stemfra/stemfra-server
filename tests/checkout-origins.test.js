const test = require('node:test');
const assert = require('node:assert/strict');
const { websiteReturnOrigin, cmsCardReturnUrl } = require('../lib/checkoutOrigins');

function withEnv(values, check) {
  const before = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  try {
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    check();
  } finally {
    for (const [key, value] of Object.entries(before)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}

test('marketing chooses only a configured return origin', () => {
  withEnv({ CLIENT_URL: 'https://checkout.example.test', CLIENT_ALTERNATE_URL: 'https://www.checkout.example.test',
    WHOP_WEBSITE_CUSTOM_RETURN_ORIGIN: 'http://localhost:5211' }, () => {
    assert.equal(websiteReturnOrigin(false, 'https://untrusted.example.test'), 'https://checkout.example.test');
    assert.equal(websiteReturnOrigin(false, 'https://www.checkout.example.test'), 'https://www.checkout.example.test');
    assert.equal(websiteReturnOrigin(true, 'https://www.checkout.example.test'), 'http://localhost:5211');
  });
});

test('CMS sandbox never borrows the production return and retains the website ID', () => {
  withEnv({ CMS_URL: 'https://cms.example.test', WHOP_RETURN_ORIGIN: undefined,
    WHOP_CMS_SANDBOX_RETURN_ORIGIN: undefined }, () => {
    assert.throws(() => cmsCardReturnUrl(true, 'site-1'), { status: 503 });
    assert.equal(cmsCardReturnUrl(false, 'site-1').href, 'https://cms.example.test/billing?checkout=returned&site=site-1');
  });
  withEnv({ WHOP_CMS_SANDBOX_RETURN_ORIGIN: 'https://relay.example.test' }, () => {
    assert.equal(cmsCardReturnUrl(true, 'site-1').href, 'https://relay.example.test/billing?checkout=returned&site=site-1');
  });
});
