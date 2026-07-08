const fs = require('fs');
const path = require('path');

const buyerJsPath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(buyerJsPath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('openBuyerChatWithStore') || line.includes('btn-chat-store')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
