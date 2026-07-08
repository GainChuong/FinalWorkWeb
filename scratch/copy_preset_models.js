const fs = require('fs');
const path = require('path');

const presetFiles = [
  'MEN-Denim-id_00000080-01_7_additional.jpg',
  'MEN-Denim-id_00000089-02_7_additional.jpg',
  'MEN-Denim-id_00000089-26_7_additional.jpg',
  'MEN-Denim-id_00000182-01_7_additional.jpg',
  'WOMEN-Blouses_Shirts-id_00000183-01_1_front.jpg',
  'WOMEN-Blouses_Shirts-id_00000001-02_1_front.jpg',
  'WOMEN-Sweaters-id_00005890-05_1_front.jpg'
];

const sourceDir = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'images', 'images');
const targetDir = path.join(__dirname, '..', 'images', 'products');

presetFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied preset model: ${file}`);
  } else {
    console.warn(`Source preset model not found: ${sourcePath}`);
  }
});

// Now update js/buyer.js
const buyerJsPath = path.join(__dirname, '..', 'js', 'buyer.js');
let buyerContent = fs.readFileSync(buyerJsPath, 'utf8');

// Replace all "/datasets/Virtual_try_on/images/images/" with "/images/products/"
buyerContent = buyerContent.replace(
  /\/datasets\/Virtual_try_on\/images\/images\//g,
  '/images/products/'
);

fs.writeFileSync(buyerJsPath, buyerContent, 'utf8');
console.log('buyer.js updated with new preset model image paths!');
