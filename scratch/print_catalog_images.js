const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Total products in catalog: ${catalog.products.length}`);
catalog.products.slice(0, 15).forEach(p => {
  console.log(`ID: ${p.id}, Image: ${p.image}, clothFile: ${p.clothFile}`);
});
