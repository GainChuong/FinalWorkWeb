const fs = require('fs');
const content = fs.readFileSync('d:/FinalWorkWeb/js/mainjs.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('refashion_user_profile') || line.includes('profile')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
