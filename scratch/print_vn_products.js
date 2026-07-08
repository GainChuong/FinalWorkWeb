const fs = require('fs');
const path = require('path');

const filesToCheck = ['products.json', 'secondhand.json'];
const datasetsDir = path.join(__dirname, '..', 'datasets');

filesToCheck.forEach(file => {
  console.log(`\n=== Non-ASCII in ${file} ===`);
  const filePath = path.join(datasetsDir, file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/[^\x00-\x7F]/.test(lines[i])) {
      console.log(`${i + 1}: ${lines[i].trim()}`);
    }
  }
});
