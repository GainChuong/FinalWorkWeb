const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('Tại sao') || line.includes('Xem Hộ Chiếu') || line.includes('Xem Chi Tiết') || line.includes('Thử Đồ AI') || line.includes('đánh giá') || line.includes('Giảm 20%')) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
}
