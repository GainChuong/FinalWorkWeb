const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const words = ['thử đồ', 'Thử Đồ', 'thử', 'Thử', 'cửa hàng', 'Cửa Hàng', 'đánh giá', 'Đánh giá'];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let found = false;
  words.forEach(w => {
    if (line.includes(w)) {
      found = true;
    }
  });
  if (found) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
}
