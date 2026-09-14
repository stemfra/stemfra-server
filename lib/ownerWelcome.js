// Registration success email (Peter, 2026-09-14). Sent once, right after
// onboardCustomer provisions the site, from BOTH signup paths (email/password
// and Google). Best-effort like every email here: a failure logs and never
// fails the signup. The primary button is a CMS magic link to /setup (single
// use, ~1 h), falling back to the plain URL. Template: transactionalEmails
// ownerWelcome; preview at /dev/preview/owner-welcome.
const { sendMail } = require('./mailer');
const { cmsMagicLink, CMS_URL } = require('./cmsMagicLink');
const tx = require('../templates/transactionalEmails');

const ZONE = process.env.TENANT_ZONE || 'stemfra.com';

async function sendOwnerWelcome({ authUserId, email, firstName, lastName, businessName, subdomain }) {
  if (!email) return false;
  const setupUrl = (await cmsMagicLink(authUserId, '/setup')) || `${CMS_URL}/setup`;
  const mail = tx.ownerWelcome({
    firstName, lastName, businessName, email,
    siteHost: `${subdomain}.${ZONE}`,
    setupUrl, dashboardUrl: CMS_URL,
  });
  return sendMail({ fromName: 'Stemfra', to: email, subject: mail.subject, text: mail.text, html: mail.html });
}

module.exports = { sendOwnerWelcome };
