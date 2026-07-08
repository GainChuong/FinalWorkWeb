const fs = require('fs');
const path = require('path');

const buyerJsPath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(buyerJsPath, 'utf8');

const lines = content.split('\n');
console.log("Total lines:", lines.length);

lines.forEach((line, index) => {
  if (line.includes('DOMContentLoaded')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
  if (line.includes('initBuyerPage')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
