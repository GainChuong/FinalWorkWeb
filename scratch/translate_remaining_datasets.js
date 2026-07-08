const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON_PATH = path.join(__dirname, '..', 'datasets', 'products.json');
const SECONDHAND_JSON_PATH = path.join(__dirname, '..', 'datasets', 'secondhand.json');

// Translate products.json
let productsContent = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');

const productsReplacements = [
  // Names
  { from: '"name": "Pants Jeans Denim Tái Bản"', to: '"name": "Recycled Denim Jeans (Washed)"' },
  { from: '"name": "Áo Sơ Mi Denim Upcycled"', to: '"name": "Upcycled Denim Shirt"' },
  { from: '"name": "Bag Patchwork Vải Mộc"', to: '"name": "Upcycled Patchwork Canvas Bag"' },
  { from: '"name": "Scarf Silk Tự Nhiên Retro"', to: '"name": "Premium Upcycled Silk Scarf"' },
  { from: '"name": "Áo Khoác Dạ Len Tái Chế"', to: '"name": "Recycled Wool Jacket"' },
  { from: '"name": "Giày Sneaker Vải Bố Canvas"', to: '"name": "Recycled Fabric Sneaker"' },
  { from: '"name": "Áo Sơ Mi Thêu Hoa Đậu Biếc Organic"', to: '"name": "Organic Butterfly Pea Shirt"' },
  { from: '"name": "Chân Dress Đũi Thêu Tay Eco-Flora"', to: '"name": "Upcycled Linen Dress"' },
  { from: '"name": "Áo Cardigan Dệt Kim Hữu Cơ Cúc Gỗ"', to: '"name": "Organic Knit Cardigan with Wooden Buttons"' },
  { from: '"name": "Bag Tote Canvas Zero-Waste Khâu Tay"', to: '"name": "Hand-Stitched Zero-Waste Canvas Tote Bag"' },

  // Colors
  { from: '"color": "Nâu Đất"', to: '"color": "Earth Brown"' },
  { from: '"color": "Ghi Xám"', to: '"color": "Charcoal Grey"' },
  { from: '"color": "Đen Canvas"', to: '"color": "Canvas Black"' },
  { from: '"color": "Trắng Thêu Xanh"', to: '"color": "White Blue Embroidery"' },
  { from: '"color": "Be Nhạt"', to: '"color": "Light Beige"' },
  { from: '"color": "Kem Mộc"', to: '"color": "Raw Cream"' },
  { from: '"color": "Trắng Kem"', to: '"color": "Cream White"' },

  // Categories
  { from: '"name": "Áo Khoác"', to: '"name": "Jacket"' },
  { from: '"name": "Balo & Túi"', to: '"name": "Bags & Backpacks"' },
  { from: '"name": "Áo Thun"', to: '"name": "T-Shirt"' },
  { from: '"name": "Quần"', to: '"name": "Pants"' },
  { from: '"name": "Giày"', to: '"name": "Sustainable Shoes"' },
  { from: '"name": "Phụ Kiện Khác"', to: '"name": "Accessories"' },

  // Designer / Customer / Personal names
  { from: 'Nguyễn Văn A', to: 'Nguyen Van A' },
  { from: 'Trần Thị B', to: 'Tran Thi B' },
  { from: 'Lê Văn C', to: 'Le Van C' },
  { from: 'Phạm Minh Đức', to: 'Pham Minh Duc' },
  { from: 'Vũ Thanh Hằng', to: 'Vu Thanh Hang' },
  { from: 'Phạm D', to: 'Pham D' },
  { from: 'Hoàng E', to: 'Hoang E' },
  { from: 'Trần Thị Mai', to: 'Tran Thi Mai' },
  { from: 'Lê Hoàng Long', to: 'Le Hoàng Long' },
  { from: 'Nguyễn Duy Anh', to: 'Nguyen Duy Anh' },
  { from: 'Đặng Kim Ngân', to: 'Dang Kim Ngan' }
];

productsReplacements.forEach(r => {
  productsContent = productsContent.split(r.from).join(r.to);
});

fs.writeFileSync(PRODUCTS_JSON_PATH, productsContent, 'utf8');
console.log('datasets/products.json fully translated to English!');

// Translate secondhand.json
let secondhandContent = fs.readFileSync(SECONDHAND_JSON_PATH, 'utf8');

const secondhandReplacements = [
  { from: 'Quận 3, HCMC', to: 'District 3, HCMC' },
  { from: 'Bình Thạnh, HCMC', to: 'Binh Thanh, HCMC' },
  { from: 'Hoàn Kiếm, Hanoi', to: 'Hoan Kiem, Hanoi' },
  { from: 'Cầu Giấy, Hanoi', to: 'Cau Giay, Hanoi' },
  { from: 'Ngũ Hành Sơn, Da Nang', to: 'Ngu Hanh Son, Da Nang' },
  { from: 'Ninh Kiều, Can Tho', to: 'Ninh Kieu, Can Tho' },
  { from: 'Liên Chiểu, Da Nang', to: 'Lien Chieu, Da Nang' },
  { from: 'Bắc Từ Liêm, Hanoi', to: 'Bac Tu Liem, Hanoi' },
  { from: 'Nguyễn Thị Lan', to: 'Nguyen Thi Lan' },
  { from: 'Trần Hoa', to: 'Tran Hoa' },
  { from: 'Lê Minh Khoa', to: 'Le Minh Khoa' },
  { from: 'Phan Ngọc Ánh', to: 'Phan Ngoc Anh' },
  { from: 'Võ Thị Thu', to: 'Vo Thi Thu' },
  { from: 'Nguyễn Hữu Phúc', to: 'Nguyen Huu Phuc' },
  { from: 'Đặng Thúy Linh', to: 'Dang Thuy Linh' },
  { from: 'Hồ Lan Phương', to: 'Ho Lan Phuong' }
];

secondhandReplacements.forEach(r => {
  secondhandContent = secondhandContent.split(r.from).join(r.to);
});

fs.writeFileSync(SECONDHAND_JSON_PATH, secondhandContent, 'utf8');
console.log('datasets/secondhand.json fully translated to English!');
