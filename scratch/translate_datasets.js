const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'datasets', 'products.json');
const SECONDHAND_PATH = path.join(__dirname, '..', 'datasets', 'secondhand.json');
const ZALANDO_PATH = path.join(__dirname, '..', 'datasets', 'zalando-catalog.json');

// Color mapping
const colorMap = {
  'Xanh Biển': 'Blue',
  'Xanh Rêu': 'Moss Green',
  'Xám': 'Grey',
  'Trắng': 'White',
  'Đen': 'Black',
  'Be': 'Beige',
  'Trắng Ngà': 'Ivory',
  'Xanh Indigo': 'Indigo Blue',
  'Xanh Nhạt': 'Light Blue',
  'Denim Patchwork': 'Denim Patchwork',
  'Be Mộc': 'Natural Beige',
  'Canvas Patchwork': 'Canvas Patchwork',
  'Đỏ Bordeaux': 'Bordeaux Red',
  'Vàng Mù Tạt': 'Mustard Yellow',
  'Tiêu chuẩn': 'Standard'
};

// General Vietnamese string replacements for dynamic/unmapped text
function translateText(text) {
  if (!text) return text;
  let translated = text;

  // Exact product name replacements for main products
  const exactNames = {
    'Áo Khoác Gió Recycled Ocean-Plastic': 'Recycled Ocean-Plastic Windbreaker',
    'Balo Leo Núi Eco-Trail 30L': 'Eco-Trail 30L Hiking Backpack',
    'Áo Thun Polo Organic Cotton': 'Organic Cotton Polo T-Shirt',
    'Quần Kaki Bền Vững Sợi Gai Dầu (Hemp)': 'Sustainable Hemp Kaki Pants',
    'Túi Đeo Vai Canvas Tái Sinh': 'Recycled Canvas Tote Bag',
    'Giày Thể Thao Eco-Step Bamboo Fiber': 'Eco-Step Bamboo Fiber Sneakers',
    'Đầm Linen Mộc Tự Nhiên': 'Natural Linen Dress',
    'Áo Sơ Mi Denim Cotton Cũ Dày Dặn': 'Thick Pre-loved Cotton Denim Shirt',
    'Váy Linen Trắng Thô Tự Nhiên Bị Sờn Tà': 'Raw White Linen Dress (Frayed Hem)',
    'Quần Bò Jean Xanh Levi\'s Rách Gối Cá Tính': 'Levi\'s Knee-ripped Blue Denim Jeans',
    'Áo Khoác Dạ Cừu Dáng Dài Lỗi Khóa Kéo': 'Long Lambskin Wool Jacket (Broken Zipper)',
    'Khăn Lụa Vintage Hoa Nhỏ Năm 90s': '90s Vintage Floral Silk Scarf',
    'Túi Canvas Patchwork Nhiều Mảnh Ghép': 'Multi-patchwork Canvas Tote Bag',
    'Bộ Áo Thun Cotton Oversize Thêu Tay': 'Hand-embroidered Cotton Oversize T-Shirt',
    'Đầm Suông Floral Vải Nhẹ Hoa Nhỏ Xuống Gối': 'Light Floral Midi Dress'
  };

  if (exactNames[text]) {
    return exactNames[text];
  }

  // Component-wise translation for Zalando names
  // e.g. "Áo khoác Cotton Trơn (Pure color) tay dài cổ tròn (Nam) - Hemp & Bamboo"
  const mappings = [
    [/Áo khoác/g, 'Jacket'],
    [/Áo sơ mi/g, 'Shirt'],
    [/Áo thun/g, 'T-Shirt'],
    [/Áo len/g, 'Sweater'],
    [/Quần bò/g, 'Jeans'],
    [/Quần jean/g, 'Jeans'],
    [/Quần/g, 'Pants'],
    [/Váy/g, 'Dress'],
    [/Đầm/g, 'Dress'],
    [/Khăn/g, 'Scarf'],
    [/Balo/g, 'Backpack'],
    [/Túi/g, 'Bag'],
    
    // Fabrics
    [/Cotton/g, 'Cotton'],
    [/Denim/g, 'Denim'],
    [/Chiffon/g, 'Chiffon'],
    [/Linen/g, 'Linen'],
    [/Dạ len/g, 'Wool'],
    [/Lụa/g, 'Silk'],
    [/Gai dầu/g, 'Hemp'],
    
    // Patterns
    [/Trơn \(Pure color\)/g, 'Solid'],
    [/Sọc \(Striped\)/g, 'Striped'],
    [/Hoa \(Floral\)/g, 'Floral'],
    [/Hình in \(Graphic\)/g, 'Graphic'],
    [/Caro \(Lattice\)/g, 'Lattice'],
    [/Phối màu \(Color block\)/g, 'Color Block'],
    [/Khác \(Other\)/g, 'Patterned'],
    
    // Sleeves/necklines
    [/tay dài/g, 'Long-sleeve'],
    [/tay ngắn/g, 'Short-sleeve'],
    [/sát nách/g, 'Sleeveless'],
    [/cổ tròn/g, 'Round Neck'],
    [/cổ dựng/g, 'Standing Neck'],
    [/cổ bẻ/g, 'Lapel Neck'],
    [/cổ chữ V/g, 'V-Neck'],
    [/hai dây/g, 'Suspender'],
    
    // Gender
    [/\(Nam\)/g, '(Men)'],
    [/\(Nữ\)/g, '(Women)'],
    [/\(Unisex\)/g, '(Unisex)']
  ];

  for (const [pattern, replacement] of mappings) {
    translated = translated.replace(pattern, replacement);
  }

  return translated;
}

// 1. Process products.json
if (fs.existsSync(PRODUCTS_PATH)) {
  console.log('Processing products.json...');
  const data = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  if (data.products) {
    data.products.forEach(p => {
      p.name = translateText(p.name);
      if (p.variants) {
        p.variants.forEach(v => {
          if (colorMap[v.color]) v.color = colorMap[v.color];
          if (colorMap[v.size]) v.size = colorMap[v.size];
        });
      }
    });
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('products.json updated successfully!');
  }
}

// 2. Process secondhand.json
if (fs.existsSync(SECONDHAND_PATH)) {
  console.log('Processing secondhand.json...');
  const data = JSON.parse(fs.readFileSync(SECONDHAND_PATH, 'utf8'));
  if (data.items) {
    data.items.forEach(item => {
      item.name = translateText(item.name);
      
      // Descriptions
      const descMap = {
        'Vải denim cotton 100% dày dặn cực tốt, thích hợp làm nguyên liệu rã rập thiết kế túi xách hoặc chắp vá quần jean. Màu xanh đậm vẫn còn giữ màu tốt.': 'Thick 100% cotton denim fabric, perfect for upcycling into handbags or patchwork jeans. Deep blue color holds up well.',
        'Chất liệu Linen bột mộc mạc thoáng mát. Tặng lại miễn phí cho các bạn sinh viên thiết kế thời trang cần vải mộc upcycle. Giao hàng tận nơi trong Q. Bình Thạnh.': 'Rustic and breathable raw linen fabric. Free for fashion design students needing raw fabric for upcycling. Free delivery in Binh Thanh Dist.',
        'Quần jean hiệu cũ rách gối nhẹ ở đùi. Dáng ôm đứng form, cực phù hợp để cắt gấu may ví denim hoặc jacket jean vá. Size 29-30 mặc vừa.': 'Pre-loved branded jeans with minor knee distress. Slim fit, structured, highly suitable for making denim wallets or patchwork jackets. Fits size 29-30.',
        'Áo dạ cừu ép mịn dày, màu nâu tây cực Tây. Bị hỏng khóa kéo giữa. Designer mua về sửa khóa hoặc tái chế dạ cừu đều tốt. Còn 85% chất lượng.': 'Thick, smooth lambskin wool coat in elegant brown. Damaged center zipper. Great for fixing or upcycling wool fabric. 85% condition.',
        'Khăn lụa vintage cuối thập niên 90, họa tiết hoa nhí dày dặn, chất lụa mềm mịn. Có thể dùng làm nguyên liệu thêu tay hoặc ốp điện thoại cao cấp.': '90s vintage floral silk scarf, soft and smooth texture. Can be used for hand embroidery or custom premium accessories.',
        'Túi canvas tote cũ nhiều mảnh vải ghép nhiều màu rất đẹp mắt. Dây quai đang bị bung chỉ. Mua về khâu lại hoặc lấy vải canvas làm nguyên liệu đều phù hợp.': 'Pre-loved patchwork canvas tote bag. Handle threads are loose. Great for stitching or reusing the canvas fabric.',
        'Áo thun cotton 100% cỡ XL rộng thêu hình con cá kiri thủ công rất xinh. Còn mới 70%. Phù hợp làm nền may patch hoặc in mới lên trên.': '100% cotton oversize XL T-shirt with cute hand-embroidered fish. 70% condition. Ideal for patchwork background or re-printing.',
        'Đầm hoa nhỏ dáng suông xuống gối, chất vải nhẹ thoáng, màu xanh pastel nhạt. Vẫn đang rất đẹp và mặc được. Bán vì đổi style mới hoàn toàn.': 'Lightweight pastel green floral midi dress. Beautiful condition, highly wearable. Selling due to wardrobe style change.'
      };
      if (descMap[item.description]) item.description = descMap[item.description];
      
      // Condition
      const condMap = { 'reusable': 'upcyclable', 'good': 'good', 'new': 'like new' };
      if (condMap[item.condition]) item.condition = condMap[item.condition];
      
      // Location
      if (item.location) {
        item.location = item.location.replace('TP. Hồ Chí Minh', 'HCMC').replace('Hà Nội', 'Hanoi').replace('Đà Nẵng', 'Da Nang').replace('Cần Thơ', 'Can Tho');
      }
    });
    fs.writeFileSync(SECONDHAND_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('secondhand.json updated successfully!');
  }
}

// 3. Process zalando-catalog.json
if (fs.existsSync(ZALANDO_PATH)) {
  console.log('Processing zalando-catalog.json...');
  const data = JSON.parse(fs.readFileSync(ZALANDO_PATH, 'utf8'));
  if (data.products) {
    data.products.forEach(p => {
      p.name = translateText(p.name);
      if (p.priceStr) {
        p.priceStr = p.priceStr.replace(' đ', ' VND').replace(/\./g, ',');
      }
    });
    fs.writeFileSync(ZALANDO_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('zalando-catalog.json updated successfully!');
  }
}

console.log('All datasets successfully translated to English!');
