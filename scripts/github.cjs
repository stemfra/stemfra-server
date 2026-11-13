// Local release tooling. Never import this helper from the application runtime.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parse } = require('dotenv');

const file = path.resolve(__dirname, '../.env');
const token = fs.existsSync(file) ? parse(fs.readFileSync(file)).PERSONAL_ACCESS_TOKEN : null;
if (!token) {
  console.error('PERSONAL_ACCESS_TOKEN is missing from the ignored server .env. Check the documented local GitHub setup.');
  process.exit(1);
}
if (process.argv.length < 3) {
  console.error('Usage: node scripts/github.cjs <gh arguments>');
  process.exit(1);
}
const result = spawnSync('gh', process.argv.slice(2), {
  stdio: 'inherit', env: { ...process.env, GH_TOKEN: token },
});
if (result.error) console.error('GitHub CLI could not start. Check that gh is installed.');
process.exit(result.status ?? 1);
