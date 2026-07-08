const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'images', 'images');
if (fs.existsSync(imgDir)) {
  const files = fs.readdirSync(imgDir);
  const matched = files.filter(f => f.includes('id_00000265-01'));
  console.log('Matched files for id_00000265-01:', matched);

  const flatFiles = files.filter(f => f.includes('flat'));
  console.log(`Total files with 'flat' in name: ${flatFiles.length}`);
  console.log('Sample flat files:', flatFiles.slice(0, 10));
} else {
  console.error('Images directory does not exist:', imgDir);
}
