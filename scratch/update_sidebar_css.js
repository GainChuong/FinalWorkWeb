const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'css', 'buyer.css');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `.shop-sidebar { position: relative; background-color: var(--card); padding: 2rem; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 4px 20px var(--shadow); }`;

const replacementStr = `.shop-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.filter-card { background-color: var(--card); padding: 1.75rem 2rem; border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 4px 20px var(--shadow); }
.filter-card .filter-section { margin-bottom: 0; }`;

const normalize = s => s.replace(/\r\n/g, '\n').trim();
if (normalize(content).includes(normalize(targetStr))) {
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(normalize(targetStr), normalize(replacementStr));
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated buyer.css to define separate filter-cards!');
} else {
  console.error('Error: target CSS not found in buyer.css');
}
