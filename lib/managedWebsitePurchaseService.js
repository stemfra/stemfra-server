module.exports = require('./managedWebsitePurchase').createService({ db: require('../config/supabase'), core: require('./whop/core'),
  provision: require('./paidWebsiteProvision').provision,
  mail: require('./mailer').sendMail,
  saveBilling: require('./billingProfile').saveCompanyBillingProfile,
  attach: async siteId => { await require('./attachSiteDomain').attachSiteDomain(siteId); require('./localizeSiteMedia').scheduleLocalizeSiteMedia(siteId); } });
