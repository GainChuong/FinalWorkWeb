const fs = require('fs');
const path = require('path');

const sellerCssPath = path.join(__dirname, '..', 'css', 'seller.css');
const content = fs.readFileSync(sellerCssPath, 'utf8');

const index = content.indexOf('.main-content');
if (index !== -1) {
  const lineNum = content.substring(0, index).split('\n').length;
  console.log(".main-content starts on line:", lineNum);
} else {
  console.log("Not found");
}
