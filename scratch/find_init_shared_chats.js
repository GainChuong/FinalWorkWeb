const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'js', 'mainjs.js');
const content = fs.readFileSync(mainJsPath, 'utf8');

const index = content.indexOf('function initSharedChats');
if (index !== -1) {
  const lineNum = content.substring(0, index).split('\n').length;
  console.log("initSharedChats starts on line:", lineNum);
} else {
  console.log("Not found");
}
