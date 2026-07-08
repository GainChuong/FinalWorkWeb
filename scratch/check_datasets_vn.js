const fs = require('fs');
const path = require('path');

const datasetsDir = path.join(__dirname, '..', 'datasets');
const files = fs.readdirSync(datasetsDir);

files.forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(datasetsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/[^\x00-\x7F]/.test(lines[i])) {
        count++;
      }
    }
    console.log(`${file}: ${count} non-ASCII lines`);
  }
});
