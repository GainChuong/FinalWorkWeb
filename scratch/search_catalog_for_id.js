const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const matched = catalog.products.filter(p => p.id.includes('00000265') || p.image.includes('00000265'));
console.log('Matched catalog products:', matched);
