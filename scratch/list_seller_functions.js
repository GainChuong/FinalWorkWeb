const fs = require('fs');
const path = require('path');

const sellerJsPath = path.join(__dirname, '..', 'js', 'seller.js');
const content = fs.readFileSync(sellerJsPath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('function ') && !line.includes('*')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
