const fs = require('fs');
let code = fs.readFileSync('js/seller.js', 'utf8');

const replacements = {
  'Không tìm thấy sản phẩm': 'No products found',
  'Thử thay đổi bộ lọc hoặc tìm kiếm khác nhé.': 'Try changing your filters or search terms.',
  "new: 'Còn rất mới', good: 'Còn tốt', reusable: 'Hơi cũ'": "new: 'Like New', good: 'Good', reusable: 'Fair'",
  "'Miễn Phí'": "'Free'",
  "toLocaleString('vi-VN') + ' đ'": "toLocaleString('en-US') + ' VND'",
  "'Đã Qua Dùng'": "'Used'",
  "'Người bán'": "'Seller'",
  "'Người bán ẩn danh'": "'Anonymous Seller'",
  '> Thu Mua<': '> Source Item<',
  'Đã Liên Hệ Thu Mua Thành Công!': 'Successfully Contacted Seller!',
  'Giá: ': 'Price: ',
  'SĐT: ': 'Phone: '
};

for (const [vn, en] of Object.entries(replacements)) {
  code = code.split(vn).join(en);
}

fs.writeFileSync('js/seller.js', code);
console.log('Translated secondhand market to English');
