const fs = require('fs');
const path = require('path');

const buyerJsPath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(buyerJsPath, 'utf8');

const index = content.indexOf('function initBuyerChatWidget()');
if (index !== -1) {
  const lineNum = content.substring(0, index).split('\n').length;
  console.log("initBuyerChatWidget starts on line:", lineNum);
} else {
  console.log("Not found");
}
