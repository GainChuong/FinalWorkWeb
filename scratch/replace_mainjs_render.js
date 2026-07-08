const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'mainjs.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      // Re-render components already on the page
      if (typeof renderShopProducts === 'function') renderShopProducts();`;

const replacementStr = `      // Re-render components already on the page
      if (typeof renderShopFilters === 'function') renderShopFilters();
      if (typeof renderShopProducts === 'function') renderShopProducts();`;

const normalize = s => s.replace(/\r\n/g, '\n').trim();
if (normalize(content).includes(normalize(targetStr))) {
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(normalize(targetStr), normalize(replacementStr));
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated mainjs.js to render shop filters on catalog load!');
} else {
  console.error('Error: target code not found in mainjs.js');
}
