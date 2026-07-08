const fs = require('fs');
const path = require('path');

const buyerDir = path.join(__dirname, '..', 'buyer');
const files = fs.readdirSync(buyerDir);

files.forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(buyerDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let fileLogged = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Search for non-ASCII, but ignore lines with SVG, URLs, or icons if possible,
      // or simply print them to let us verify.
      if (/[^\x00-\x7F]/.test(line)) {
        if (!fileLogged) {
          console.log(`\n--- Vietnamese strings in ${file} ---`);
          fileLogged = true;
        }
        console.log(`${i + 1}: ${line.trim()}`);
      }
    }
  }
});
