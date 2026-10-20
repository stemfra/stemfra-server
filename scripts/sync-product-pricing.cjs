// Run from any directory. Server config is the source; frontend copies are committed.
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../config/productPricing.json'), 'utf8');
const targets = ['../../stemfra-ops/src/lib/productPricing.json', '../../stemfra_client/src/app/data/productPricing.json'];
for (const relative of targets) {
  const target = path.join(__dirname, relative);
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(target, 'utf8') !== source) throw new Error(`Pricing copy differs: ${relative}`);
  } else fs.writeFileSync(target, source);
}
console.log('Product pricing copies match.');
