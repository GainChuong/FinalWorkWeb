const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Loaded catalog with ${catalog.products.length} products.`);

catalog.products.forEach((p, idx) => {
  // Deterministic rating between 4.0 and 5.0
  const rating = 4.0 + (idx % 11) * 0.1;
  p.rating = Math.round(rating * 10) / 10;
  
  // Set default ratingCount if missing
  if (!p.ratingCount) {
    p.ratingCount = 10 + (idx % 45);
  }

  // Delete sentimentScore if it exists
  delete p.sentimentScore;
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Successfully added deterministic ratings to all catalog products! ✅');
