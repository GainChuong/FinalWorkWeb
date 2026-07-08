const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`\n=== Non-ASCII in zalando-catalog.json ===`);
for (let i = 0; i < lines.length; i++) {
  if (/[^\x00-\x7F]/.test(lines[i])) {
    console.log(`${i + 1}: ${lines[i].trim()}`);
  }
}
