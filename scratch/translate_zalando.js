const fs = require('fs');
const path = require('path');

const ZALANDO_JSON_PATH = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');
let content = fs.readFileSync(ZALANDO_JSON_PATH, 'utf8');

const replacements = [
  { from: 'họa tiết In hình (Graphic)', to: 'Graphic' },
  { from: 'họa tiết Floral', to: 'Floral' },
  { from: 'họa tiết Kẻ sọc (Striped)', to: 'Striped' },
  { from: 'họa tiết Kẻ ô (Lattice)', to: 'Lattice' },
  { from: 'họa tiết Dệt (Other)', to: 'Woven' },
  { from: 'tay lỡ', to: '3/4 sleeves' },
  { from: 'Pants dài', to: 'Long Pants' },
  { from: 'cổ vuông', to: 'Square Neck' }
];

replacements.forEach(r => {
  content = content.split(r.from).join(r.to);
});

fs.writeFileSync(ZALANDO_JSON_PATH, content, 'utf8');
console.log('datasets/zalando-catalog.json fully translated to English!');
