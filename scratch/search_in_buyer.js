const fs = require('fs');

function searchFile(filepath, pattern) {
  console.log(`Searching for '${pattern}' in {filepath}...`);
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  const regex = new RegExp(pattern, 'i');
  lines.forEach((line, idx) => {
    if (regex.test(line)) {
      console.log(`L${idx + 1}: ${line.trim().slice(0, 150)}`);
    }
  });
}

searchFile('js/buyer.js', 'initDetailPage');
searchFile('js/buyer.js', 'detail-content');
searchFile('js/buyer.js', 'quay lại');
searchFile('js/buyer.js', 'back-btn');
searchFile('js/buyer.js', 'href');
