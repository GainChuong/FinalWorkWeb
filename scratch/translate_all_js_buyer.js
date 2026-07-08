const fs = require('fs');
const path = require('path');

const BUYER_JS_PATH = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(BUYER_JS_PATH, 'utf8');

const replacements = [
  // Badges & Labels
  { from: 'Gợi Ý Cho Bạn', to: 'Recommended For You' },
  { from: 'Giảm 20%', to: '20% OFF' },
  { from: 'đánh giá)</span>', to: 'reviews)</span>' },
  { from: 'Xem Chi Tiết</a>', to: 'View Details</a>' },
  { from: 'Gợi Ý</span>', to: 'Recommended</span>' },
  { from: 'Thử Đồ AI</span>', to: 'AI Try-On</span>' },
  { from: 'Tại sao tôi thấy gợi ý này?', to: 'Why am I seeing this recommendation?' },
  { from: 'Xem Hộ Chiếu Số DPP', to: 'View Digital Product Passport (DPP)' },
  { from: 'Hướng dẫn chọn size', to: 'Size Guide' },
  { from: 'Thêm vào Giỏ Hàng', to: 'Add to Cart' },
  { from: 'Mua Ngay', to: 'Buy Now' },
  { from: 'Chi tiết Thiết kế & Tác động', to: 'Design Details & Impact' },
  { from: 'Đánh Giá & Nhận Xét từ Khách Hàng', to: 'Customer Reviews & Feedback' },
  { from: 'Đánh Giá Sản Phẩm', to: 'Product Review' },
  { from: 'Họ & Tên', to: 'Full Name' },
  { from: 'Nhập tên của bạn...', to: 'Enter your name...' },
  { from: 'Đánh giá số sao', to: 'Rating Star' },
  { from: '5 sao - Tuyệt vời', to: '5 stars - Excellent' },
  { from: '4 sao - Tốt', to: '4 stars - Good' },
  { from: '3 sao - Bình thường', to: '3 stars - Average' },
  { from: '2 sao - Kém', to: '2 stars - Poor' },
  { from: '1 sao - Rất tệ', to: '1 star - Terrible' },
  { from: 'Nội dung nhận xét', to: 'Review Content' },
  { from: 'Viết đánh giá của bạn tại đây...', to: 'Write your review here...' },
  { from: 'Gửi Nhận Xét', to: 'Submit Review' },
  
  // Category mapping references in if/else checks
  { from: 'name.indexOf("Áo Khoác") !== -1', fromRegex: /name\.indexOf\("Áo Khoác"\)/g, to: 'name.indexOf("Jacket") !== -1' },
  { from: 'name.indexOf("Balo") !== -1', fromRegex: /name\.indexOf\("Balo"\)/g, to: 'name.indexOf("Backpack") !== -1' },
  { from: 'name.indexOf("Túi") !== -1', fromRegex: /name\.indexOf\("Túi"\)/g, to: 'name.indexOf("Bag") !== -1' },
  { from: 'name.indexOf("Áo Thun") !== -1', fromRegex: /name\.indexOf\("Áo\s+Thun"\)/g, to: 'name.indexOf("T-shirt") !== -1' },
  { from: 'name.indexOf("Quần") !== -1', fromRegex: /name\.indexOf\("Quần"\)/g, to: 'name.indexOf("Pants") !== -1' },
  { from: 'name.indexOf("Giày") !== -1', fromRegex: /name\.indexOf\("Giày"\)/g, to: 'name.indexOf("Shoes") !== -1' },
  { from: 'name.indexOf("Dép") !== -1', fromRegex: /name\.indexOf\("Dép"\)/g, to: 'name.indexOf("Sandal") !== -1' }
];

replacements.forEach(r => {
  if (r.fromRegex) {
    content = content.replace(r.fromRegex, r.to);
  } else {
    content = content.split(r.from).join(r.to);
  }
});

fs.writeFileSync(BUYER_JS_PATH, content, 'utf8');
console.log('js/buyer.js UI strings successfully translated!');
