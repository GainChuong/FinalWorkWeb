const fs = require('fs');
const path = require('path');

const buyerJsPath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(buyerJsPath, 'utf8');

const matches = [...content.matchAll(/function initBuyerChatWidget\(\)/g)];
console.log("Number of times function initBuyerChatWidget() is defined:", matches.length);

const occurrences = [];
let index = content.indexOf('function initBuyerChatWidget()');
while (index !== -1) {
  occurrences.push(index);
  index = content.indexOf('function initBuyerChatWidget()', index + 1);
}
occurrences.forEach((idx, i) => {
  const lineNum = content.substring(0, idx).split('\n').length;
  console.log(`Occurrence ${i + 1} at line ${lineNum}`);
});
