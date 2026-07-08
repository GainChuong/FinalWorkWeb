const fs = require('fs');
const content = fs.readFileSync('d:/FinalWorkWeb/js/ai-recommend.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('explainProduct') || line.includes('getDppData')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
