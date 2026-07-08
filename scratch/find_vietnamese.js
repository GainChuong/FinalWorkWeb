const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log(`Checking file: ${filePath}`);
let count = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Regex to match non-ASCII characters
  if (/[^\x00-\x7F]/.test(line)) {
    console.log(`${i + 1}: ${line.trim()}`);
    count++;
    if (count > 100) {
      console.log('... truncated after 100 lines');
      break;
    }
  }
}
console.log(`Total lines with non-ASCII: ${count}`);
