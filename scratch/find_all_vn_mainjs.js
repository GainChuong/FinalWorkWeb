const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'mainjs.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Scanning all lines of ${filePath}...`);
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/[^\x00-\x7F]/.test(line)) {
    console.log(`${i + 1}: ${line.trim()}`);
    count++;
  }
}
console.log(`Total non-ASCII lines in mainjs.js: ${count}`);
