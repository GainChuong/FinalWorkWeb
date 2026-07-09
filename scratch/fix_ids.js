const fs = require('fs');
let code = fs.readFileSync('js/seller.js', 'utf8');

code = code.replace(/productsData\.forEach\(function\(p\) \{ if \(p\.id >= maxId\) maxId = p\.id \+ 1; \}\);/, 
  'productsData.forEach(function(p) { var numId = parseInt(String(p.id).replace(/\\D/g, "")) || 0; if (numId >= maxId) maxId = numId + 1; });');

code = code.replace(/openEditModal\(parseInt\(this\.dataset\.id\)\);/g, 'openEditModal(this.dataset.id);');

code = code.replace(/const id = parseInt\(this\.dataset\.id\);/g, 'const id = this.dataset.id;');

code = code.replace(/productsData = productsData\.filter\(function\(p\) \{ return p\.id !== id; \}\);/g, 'productsData = productsData.filter(function(p) { return String(p.id) !== String(id); });');

code = code.replace(/productsData\.find\(function\(p\) \{ return p\.id === id; \}\);/g, 'productsData.find(function(p) { return String(p.id) === String(id); });');

code = code.replace(/productsData\.findIndex\(function\(p\) \{ return p\.id === editingProductId; \}\);/g, 'productsData.findIndex(function(p) { return String(p.id) === String(editingProductId); });');

code = code.replace(/id: nextProductId\+\+,/g, "id: 'P' + nextProductId++,");

code = code.replace(/id: parseInt\(p\.id\.replace\('P', ''\)\),/g, 'id: p.id,');

fs.writeFileSync('js/seller.js', code);
console.log('Fixed IDs');
