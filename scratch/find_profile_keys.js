const fs = require('fs');
const content = fs.readFileSync('d:/FinalWorkWeb/js/ai-recommend.js', 'utf8');

// Match styles, categories, keywords, etc.
const styleMatches = content.match(/profile\.styles\[[^\]]+\]/g) || [];
const catMatches = content.match(/profile\.categories\[[^\]]+\]/g) || [];
const kwMatches = content.match(/profile\.keywords\[[^\]]+\]/g) || [];

console.log('Styles matches count:', styleMatches.length);
console.log('Categories matches count:', catMatches.length);
console.log('Keywords matches count:', kwMatches.length);

// Let's print out lines containing "profile.styles" or "profile.keywords" or "profile.categories"
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('profile.styles') || line.includes('profile.categories') || line.includes('profile.keywords')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
