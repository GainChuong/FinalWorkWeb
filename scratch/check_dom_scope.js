const fs = require('fs');
const path = require('path');

const sellerJsPath = path.join(__dirname, '..', 'js', 'seller.js');
const content = fs.readFileSync(sellerJsPath, 'utf8');

const lines = content.split('\n');
console.log("Total lines:", lines.length);

let openBraces = 0;
let domStartLine = -1;
let domEndLine = -1;

lines.forEach((line, index) => {
  if (line.includes("document.addEventListener('DOMContentLoaded'")) {
    domStartLine = index + 1;
  }
  
  if (domStartLine !== -1 && domEndLine === -1) {
    // Count braces in this line
    for (let char of line) {
      if (char === '{') openBraces++;
      if (char === '}') {
        openBraces--;
        if (openBraces === 0) {
          domEndLine = index + 1;
        }
      }
    }
  }
});

console.log(`DOMContentLoaded starts at line ${domStartLine} and ends at line ${domEndLine}`);
