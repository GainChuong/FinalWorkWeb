const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    target: "category: p.category === 'jacket' ? 'Áo Khoác Nam/Nữ' : p.category === 'tshirt' ? 'Áo Thun Polo' : p.category === 'pants' ? 'Quần' : p.category === 'shoes' ? 'Giày' : 'Sản Phẩm Khác',",
    replacement: "category: p.category === 'jacket' ? 'Men/Women Jacket' : p.category === 'tshirt' ? 'Polo T-Shirt' : p.category === 'pants' ? 'Pants' : p.category === 'shoes' ? 'Shoes' : 'Other Products',"
  },
  {
    target: "price: minPrice.toLocaleString('vi-VN') + ' đ',",
    replacement: "price: minPrice.toLocaleString('vi-VN') + ' VND',"
  },
  {
    target: "carbonFootprint: '1.2 kg CO₂e (Giảm 60% so với trung bình)',",
    replacement: "carbonFootprint: '1.2 kg CO₂e (60% reduction vs average)',"
  },
  {
    target: "waterSaved: '450 Lít nước sạch',",
    replacement: "waterSaved: '450 Liters of clean water',"
  },
  {
    target: "'Chế tác tinh xảo từ chất liệu tái chế.',",
    replacement: "'Exquisitely crafted from recycled materials.',"
  },
  {
    target: "'Nguyên liệu upcycling bảo vệ tài nguyên.',",
    replacement: "'Upcycled materials protect resources.',"
  },
  {
    target: "'Phụ kiện tái sinh thân thiện môi trường.'",
    replacement: "'Regenerated accessories, environment friendly.'"
  },
  {
    target: "variants: p.variants || [{ size: 'Tiêu chuẩn', color: 'Mộc', price: minPrice, stock: 10 }]",
    replacement: "variants: p.variants || [{ size: 'Standard', color: 'Raw', price: minPrice, stock: 10 }]"
  },
  {
    target: "category: zalandoProd.category === 'upper' ? 'Áo' : zalandoProd.category === 'lower' ? 'Quần' : 'Đồ Bộ',",
    replacement: "category: zalandoProd.category === 'upper' ? 'Top' : zalandoProd.category === 'lower' ? 'Bottom' : 'Suit',"
  },
  {
    target: "carbonFootprint: '1.5 kg CO₂e (Giảm 55% so với sản phẩm mới)',",
    replacement: "carbonFootprint: '1.5 kg CO₂e (55% reduction vs new product)',"
  },
  {
    target: "waterSaved: '1.200 Lít nước sạch',",
    replacement: "waterSaved: '1,200 Liters of clean water',"
  },
  {
    target: "'Chế tác từ chất liệu tái chế chất lượng cao.',",
    replacement: "'Crafted from high-quality recycled materials.',"
  },
  {
    target: "'Quy trình upcycling giảm thiểu rác thải dệt may.',",
    replacement: "'Upcycling process minimizes textile waste.',"
  },
  {
    target: "'Thiết kế bền vững, kéo dài vòng đời sản phẩm.',",
    replacement: "'Sustainable design, extending product lifespan.',"
  },
  {
    target: "'Mang lại giá trị kinh tế tuần hoàn cho cộng đồng.'",
    replacement: "'Brings circular economy value to the community.'"
  },
  {
    target: "{ size: 'S', color: 'Mặc định', price: zalandoProd.price, stock: 15 },",
    replacement: "{ size: 'S', color: 'Default', price: zalandoProd.price, stock: 15 },"
  },
  {
    target: "{ size: 'M', color: 'Mặc định', price: zalandoProd.price, stock: 20 },",
    replacement: "{ size: 'M', color: 'Default', price: zalandoProd.price, stock: 20 },"
  },
  {
    target: "{ size: 'L', color: 'Mặc định', price: zalandoProd.price, stock: 10 }",
    replacement: "{ size: 'L', color: 'Default', price: zalandoProd.price, stock: 10 }"
  },
  {
    target: "'<span class=\"variant-label\" style=\"font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;\">Kích cỡ:</span>'",
    replacement: "'<span class=\"variant-label\" style=\"font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;\">Size:</span>'"
  },
  {
    target: "'<span class=\"variant-label\" style=\"font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;\">Màu sắc:</span>'",
    replacement: "'<span class=\"variant-label\" style=\"font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;\">Color:</span>'"
  },
  {
    target: "'Kho hàng: <span id=\"detail-stock-value\" style=\"font-weight:700; color:var(--foreground);\">' + (product.stock || 0) + '</span> sản phẩm có sẵn'",
    replacement: "'Stock: <span id=\"detail-stock-value\" style=\"font-weight:700; color:var(--foreground);\">' + (product.stock || 0) + '</span> items available'"
  },
  {
    target: "4.9/5.0 (250+ Đánh giá)",
    replacement: "4.9/5.0 (250+ reviews)"
  },
  {
    target: "Xem Cửa Hàng",
    replacement: "Visit Store"
  },
  {
    target: "'<div class=\"detail-breadcrumb\"><a href=\"index.html\">Trang chủ</a> / <a href=\"shop.html\">Cửa hàng</a> / <span style=\"color:var(--primary);font-weight:600\">' + product.name + '</span></div>' +",
    replacement: "'<div class=\"detail-breadcrumb\"><a href=\"index.html\">Home</a> / <a href=\"shop.html\">Shop</a> / <span style=\"color:var(--primary);font-weight:600\">' + product.name + '</span></div>' +"
  },
  {
    target: "Dấu chân Carbon",
    replacement: "Carbon Footprint"
  },
  {
    target: "Nước Tiết Kiệm",
    replacement: "Water Saved"
  },
  {
    target: "Vui lòng chọn Kích cỡ!",
    replacement: "Please select a size!"
  },
  {
    target: "Vui lòng chọn Màu sắc!",
    replacement: "Please select a color!"
  },
  {
    target: "Tiêu chuẩn",
    replacement: "Standard"
  },
  {
    target: "'🛍️ Đã thêm \"' + product.name + ' (' + variantStr + ')\" vào giỏ hàng thành công!'",
    replacement: "'🛍️ Added \"' + product.name + ' (' + variantStr + ')\" to cart successfully!'"
  },
  {
    target: "' Th\\u1eed \\u0110\\u1ed3 AI \\u2013 Virtual Try-On'",
    replacement: "' AI Try-On \\u2013 Virtual Try-On'"
  },
  {
    target: "'<span class=\"badge\" style=\"background:rgba(91,116,83,0.1);color:var(--primary);border:1px solid var(--primary);font-size:0.72rem;margin-left:6px\"><i class=\"fa-solid fa-wand-magic-sparkles\"></i> H\\u1ed7 tr\\u1ee3 Th\\u1eed \\u0110\\u1ed3 AI</span>'",
    replacement: "'<span class=\"badge\" style=\"background:rgba(91,116,83,0.1);color:var(--primary);border:1px solid var(--primary);font-size:0.72rem;margin-left:6px\"><i class=\"fa-solid fa-wand-magic-sparkles\"></i> AI Try-On Supported</span>'"
  }
];

let appliedCount = 0;
for (const rep of replacements) {
  if (content.includes(rep.target)) {
    content = content.replace(rep.target, rep.replacement);
    appliedCount++;
  } else {
    // Try to find variations with different spacing or single/double quotes
    const targetSingle = rep.target.replace(/"/g, "'");
    if (content.includes(targetSingle)) {
      content = content.replace(targetSingle, rep.replacement.replace(/"/g, "'"));
      appliedCount++;
    } else {
      console.warn(`WARNING: Target not found:\n${rep.target}\n`);
    }
  }
}

// Perform global replacement of any remaining "Tiêu chuẩn" or "Mặc định"
content = content.replace(/['"]Tiêu chuẩn['"]/g, "'Standard'");
content = content.replace(/['"]Mặc định['"]/g, "'Default'");

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully applied ${appliedCount} detail-page translations to buyer.js!`);
