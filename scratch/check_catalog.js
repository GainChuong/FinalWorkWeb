const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('d:/FinalWorkWeb/datasets/zalando-catalog.json', 'utf8'));
console.log('Number of products:', catalog.products.length);
