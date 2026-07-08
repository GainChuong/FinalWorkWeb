const fs = require('fs');
const path = require('path');

const accountsPath = path.join(__dirname, '..', 'datasets', 'accounts.json');
const rawData = fs.readFileSync(accountsPath, 'utf8');
const accounts = JSON.parse(rawData);

const sourceBaseDir = path.join(__dirname, '..');
const targetDir = path.join(__dirname, '..', 'images', 'products');

let copiedCount = 0;
let missingCount = 0;

function processObject(obj) {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (typeof obj[key] === 'string' && obj[key].startsWith('/datasets/Virtual_try_on/images/images/')) {
      const originalPath = obj[key];
      const cleanRelPath = originalPath.replace(/^\//, ''); // remove leading slash
      const sourceFilePath = path.join(sourceBaseDir, cleanRelPath);
      const fileName = path.basename(cleanRelPath);
      const targetFilePath = path.join(targetDir, fileName);

      if (fs.existsSync(sourceFilePath)) {
        if (!fs.existsSync(targetFilePath)) {
          fs.copyFileSync(sourceFilePath, targetFilePath);
        }
        copiedCount++;
        obj[key] = `/images/products/${fileName}`;
      } else {
        console.warn(`Missing account file: ${sourceFilePath}`);
        missingCount++;
      }
    } else if (typeof obj[key] === 'object') {
      processObject(obj[key]);
    }
  }
}

processObject(accounts);

console.log(`Accounts processing done. Copied/Verified: ${copiedCount}, Missing: ${missingCount}`);

// Write updated accounts back
fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2), 'utf8');
console.log('accounts.json updated with deployable image paths!');
