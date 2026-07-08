const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const targets = [
  'Trang chủ',
  'Cửa hàng',
  'HỖ TRỢ THỬ ĐỒ AI',
  'Hỗ trợ thử đồ AI',
  'DẤU CHÂN CARBON',
  'Dấu chân Carbon',
  'Giảm 55%',
  'NƯỚC TIẾT KIỆM',
  'Nước tiết kiệm',
  'Lít nước sạch',
  'Kích cỡ',
  'Màu sắc',
  'Mặc định',
  'Kho hàng',
  'sản phẩm có sẵn',
  'Xem Cửa Hàng',
  'Thử Đồ AI - Virtual Try-On',
  'Chế tác từ chất liệu',
  'Quy trình upcycling',
  'Thiết kế bền vững',
  'Mang lại giá trị',
  'Hỗ trợ Thử đồ AI'
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  targets.forEach(t => {
    if (line.includes(t)) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  });
}
