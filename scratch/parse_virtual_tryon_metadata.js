const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
const captionsPath = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'captions.json');
const shapePath = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'labels', 'labels', 'shape', 'shape_anno_all.txt');
const fabricPath = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'labels', 'labels', 'texture', 'fabric_ann.txt');
const patternPath = path.join(__dirname, '..', 'datasets', 'Virtual_try_on', 'labels', 'labels', 'texture', 'pattern_ann.txt');

console.log('Starting Virtual Try-On metadata parsing and catalog integration...');

// 1. Load catalog
if (!fs.existsSync(catalogPath)) {
  console.error(`Catalog file not found: ${catalogPath}`);
  process.exit(1);
}
const catalogRaw = fs.readFileSync(catalogPath, 'utf8');
const catalog = JSON.parse(catalogRaw);
console.log(`Loaded catalog with ${catalog.products.length} products.`);

// 2. Load captions
let captions = {};
if (fs.existsSync(captionsPath)) {
  let captionsRaw = fs.readFileSync(captionsPath, 'utf8').trim();
  if (!captionsRaw.startsWith('{')) {
    captionsRaw = '{' + captionsRaw;
  }
  if (!captionsRaw.endsWith('}')) {
    captionsRaw = captionsRaw + '}';
  }
  captions = JSON.parse(captionsRaw);
  console.log(`Loaded ${Object.keys(captions).length} captions.`);
} else {
  console.warn(`Captions file not found: ${captionsPath}`);
}

// 3. Helper to parse space-delimited text annotation files
function parseTextAnnotations(filePath, expectedNumbers) {
  const map = {};
  if (!fs.existsSync(filePath)) {
    console.warn(`Annotation file not found: ${filePath}`);
    return map;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let count = 0;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 1 + expectedNumbers) {
      const filename = parts[0];
      const numbers = parts.slice(1, 1 + expectedNumbers).map(Number);
      map[filename] = numbers;
      count++;
    }
  });
  console.log(`Parsed ${count} annotations from ${path.basename(filePath)}.`);
  return map;
}

// 4. Parse shape, fabric, pattern
const shapeMap = parseTextAnnotations(shapePath, 12);
const fabricMap = parseTextAnnotations(fabricPath, 3);
const patternMap = parseTextAnnotations(patternPath, 3);

// 5. Enrich catalog
let enrichCount = 0;
let captionCount = 0;
let shapeCount = 0;
let fabricCount = 0;
let patternCount = 0;

catalog.products.forEach(p => {
  // Extract filename from image path
  const imageField = p.image || p.clothFile || '';
  if (!imageField) return;
  
  const filename = path.basename(imageField);
  let enriched = false;
  
  // 1. Caption -> Description
  if (captions[filename]) {
    p.description = captions[filename];
    captionCount++;
    enriched = true;
  }
  
  // 2. Shape
  if (shapeMap[filename]) {
    p.shape = shapeMap[filename];
    shapeCount++;
    enriched = true;
  }
  
  // 3. Fabric
  if (fabricMap[filename]) {
    const fab = fabricMap[filename];
    p.fabric = {
      upper: fab[0],
      lower: fab[1],
      outer: fab[2]
    };
    fabricCount++;
    enriched = true;
  }
  
  // 4. Pattern
  if (patternMap[filename]) {
    const pat = patternMap[filename];
    p.colorPattern = {
      upper: pat[0],
      lower: pat[1],
      outer: pat[2]
    };
    patternCount++;
    enriched = true;
  }
  
  if (enriched) {
    enrichCount++;
  }
});

console.log(`Enrichment summary:
- Total products processed: ${catalog.products.length}
- Total products enriched: ${enrichCount}
- Captions enriched: ${captionCount}
- Shapes enriched: ${shapeCount}
- Fabrics enriched: ${fabricCount}
- Patterns enriched: ${patternCount}
`);

// 6. Save updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Successfully wrote enriched catalog back to zalando-catalog.json.');
