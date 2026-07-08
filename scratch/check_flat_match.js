const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const withFlat = catalog.products.filter(p => p.clothFile && p.clothFile.includes('flat'));
console.log(`Products with flat clothFile in catalog: ${withFlat.length}`);
withFlat.forEach(p => {
  console.log(`ID: ${p.id}, clothFile: ${p.clothFile}, image: ${p.image}`);
});
