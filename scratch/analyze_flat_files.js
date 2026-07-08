const fs = require('fs');
const path = require('path');

const imgSourceDir = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'images', 'images');
if (fs.existsSync(imgSourceDir)) {
  const sourceFiles = fs.readdirSync(imgSourceDir);
  const flatFiles = sourceFiles.filter(f => f.toLowerCase().includes('flat'));
  console.log(`Total flat files found: ${flatFiles.length}`);
  flatFiles.forEach((f, index) => {
    const match = f.match(/id_[0-9]+-[0-9]+/);
    console.log(`${index + 1}: Name: ${f} -> ID Match: ${match ? match[0] : 'NONE'}`);
  });
} else {
  console.error('Source directory not found');
}
