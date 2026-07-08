const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const imgSourceDir = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'images', 'images');
const imgTargetDir = path.join(__dirname, '..', 'images', 'products');

if (!fs.existsSync(catalogPath)) {
  console.error('Catalog not found:', catalogPath);
  process.exit(1);
}

if (!fs.existsSync(imgSourceDir)) {
  console.error('Virtual try-on source images directory not found:', imgSourceDir);
  process.exit(1);
}

if (!fs.existsSync(imgTargetDir)) {
  fs.mkdirSync(imgTargetDir, { recursive: true });
  console.log('Created target directory:', imgTargetDir);
}

// 1. Load catalog
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
console.log(`Loaded catalog with ${catalog.products.length} products.`);

// 2. Scan source directory and group files by Product ID
const sourceFiles = fs.readdirSync(imgSourceDir);
console.log(`Scanned ${sourceFiles.length} source images.`);

// Helper to extract product ID from filename
// Examples:
// - MEN-Denim-id_00000265-01_1_front.jpg -> id_00000265-01
// - MEN-Jackets_Vests-id_00000946-04_6_flat.jpg -> id_00000946-04
function extractProductId(filename) {
  const match = filename.match(/id_[0-9]+-[0-9]+/);
  return match ? match[0] : null;
}

// Group files by product ID
const idToFilesMap = {};
sourceFiles.forEach(file => {
  const pid = extractProductId(file);
  if (pid) {
    if (!idToFilesMap[pid]) {
      idToFilesMap[pid] = [];
    }
    idToFilesMap[pid].push(file);
  }
});

console.log(`Grouped files into ${Object.keys(idToFilesMap).length} unique product IDs.`);

// 3. Process each product in the catalog
let updatedClothFileCount = 0;
let totalCopiedCount = 0;

catalog.products.forEach(p => {
  const pid = p.id; // e.g. "id_00000265-01"
  const groupFiles = idToFilesMap[pid];

  if (!groupFiles || groupFiles.length === 0) {
    console.warn(`No source files found for product ID ${pid}`);
    return;
  }

  // Find if there is a flat image
  const flatFile = groupFiles.find(file => file.toLowerCase().includes('flat'));
  
  if (flatFile) {
    // We found a flat image! Use it for clothFile
    p.clothFile = `/images/products/${flatFile}`;
    updatedClothFileCount++;
  } else {
    // No flat image found, fall back to the first front/model image in the group or keep existing if valid
    const frontFile = groupFiles.find(file => file.toLowerCase().includes('front')) || groupFiles[0];
    p.clothFile = `/images/products/${frontFile}`;
  }

  // Ensure p.image is updated to the clean local image path
  const mainImageFile = groupFiles.find(file => file.toLowerCase().includes('front')) || groupFiles[0];
  p.image = `/images/products/${mainImageFile}`;

  // Copy ALL images in the group to the target folder
  groupFiles.forEach(file => {
    const srcPath = path.join(imgSourceDir, file);
    const destPath = path.join(imgTargetDir, file);
    
    // Copy file if it doesn't exist or we want to ensure fresh copies
    if (fs.existsSync(srcPath)) {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
      totalCopiedCount++;
    }
  });
});

// 4. Save updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log(`Processing complete:`);
console.log(`- Updated ${updatedClothFileCount} products with specialized 'flat' layout clothFile.`);
console.log(`- Copied/verified a total of ${totalCopiedCount} angle files to public directory.`);
console.log(`- Successfully updated and saved ${catalogPath}`);
