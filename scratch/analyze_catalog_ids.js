const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const idCounts = {};
catalog.products.forEach(p => {
  idCounts[p.id] = (idCounts[p.id] || 0) + 1;
});

const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
console.log(`Total unique IDs: ${Object.keys(idCounts).length}`);
console.log(`Total duplicate IDs count: ${duplicates.length}`);
if (duplicates.length > 0) {
  console.log('Sample duplicates:', duplicates.slice(0, 10));
}
