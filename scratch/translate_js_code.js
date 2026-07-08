const fs = require('fs');
const path = require('path');

const BUYER_JS_PATH = path.join(__dirname, '..', 'js', 'buyer.js');
const AI_REC_JS_PATH = path.join(__dirname, '..', 'js', 'ai-recommend.js');

// Helper to replace text in file
function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const r of replacements) {
    if (r.target instanceof RegExp) {
      content = content.replace(r.target, r.replacement);
    } else {
      // Escape special regex characters for literal replace if needed, or use split/join
      content = content.split(r.target).join(r.replacement);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// ----------------------------------------------------
// 1. TRANSLATING AI-RECOMMEND.JS
// ----------------------------------------------------
console.log('Translating js/ai-recommend.js...');
const aiRecReplacements = [
  // Clicks match info
  {
    target: 'return "Sản phẩm được gợi ý nhờ tính tương thích cao với các tương tác trước đó của bạn.";',
    replacement: 'return "Recommended based on high compatibility with your previous interactions.";'
  },
  // Benchmarks & Shapley labels
  { target: "Chất liệu'", replacement: "Fabric'" },
  { target: "Họa tiết'", replacement: "Pattern'" },
  { target: "Kiểu tay'", replacement: "Sleeve'" },
  { target: "Kiểu cổ'", replacement: "Neckline'" },
  { target: "Danh mục'", replacement: "Category'" },
  { target: "Tìm kiếm/Lịch sử'", replacement: "Search/History'" },
  { target: 'Yếu tố đóng góp (Shapley)', replacement: 'Contributing Factors (Shapley)' },
  { target: '<span>Trọng số</span>', replacement: '<span>Weight</span>' },
  { target: 'Chỉ số Tuần hoàn của Sản phẩm (Benchmarks)', replacement: 'Product Circularity Benchmarks' },
  { target: 'Giảm phát thải:', replacement: 'Carbon Savings:' },
  { target: 'Tránh chôn lấp:', replacement: 'Landfill Avoided:' },
  { target: 'Thu hồi vật liệu:', replacement: 'Material Recovery:' },
  { target: 'Vận chuyển:', replacement: 'Transport Distance:' },
  
  // Materials VN to EN mapping
  { target: 'Sợi bông hữu cơ', replacement: 'Organic Cotton Fiber' },
  { target: 'Spandex tái chế', replacement: 'Recycled Spandex' },
  { target: 'Denim tái sinh', replacement: 'Repurposed Denim Scrap' },
  { target: 'Lót Polyester tái chế', replacement: 'Recycled Polyester Lining' },
  { target: 'Eco-Elastane co giãn', replacement: 'Eco-Elastane Stretch' },
  { target: 'Sợi Denim tái chế', replacement: 'Recycled Cotton Denim Yarn' },
  { target: 'Chiffon tái chế', replacement: 'Upcycled Chiffon Fabric' },
  { target: 'Lót Nylon tái chế', replacement: 'Recycled Nylon Lining' },
  { target: 'Sợi dệt sinh học', replacement: 'Bio-Synthetic Weave' },
  { target: 'Sợi Linen tái chế', replacement: 'Recycled Linen Fiber' },
  { target: 'Lót Cotton hữu cơ', replacement: 'Organic Cotton Lining' },
  { target: 'Thành phần: ', replacement: 'Composition: ' },
  
  // Fabric values
  { target: "'Lông',", replacement: "'Furry'," },
  { target: "'Dệt kim',", replacement: "'Knitted'," },
  { target: "'vải sinh học'", replacement: "'Bio-synthetic fabric'" },
  { target: "|| 'chất liệu dệt';", replacement: "|| 'textile';" },
  
  // Pattern values
  { target: "'trơn tối giản',", replacement: "'solid minimal'," },
  { target: "'kẻ sọc',", replacement: "'striped'," },
  { target: "'hoa nhã nhặn',", replacement: "'elegant floral'," },
  { target: "'in hình',", replacement: "'graphic printed'," },
  { target: "'kẻ caro',", replacement: "'lattice checked'," },
  { target: "'phối màu'", replacement: "'color block'" },
  { target: "|| 'họa tiết';", replacement: "|| 'patterned';" },
  
  // Categories
  { target: "'áo thời trang',", replacement: "'fashion tops'," },
  { target: "'quần/váy thời trang',", replacement: "'fashion bottoms/dresses'," },
  { target: "'áo khoác'", replacement: "'jacket/outerwear'" },
  { target: "|| 'trang phục';", replacement: "|| 'apparel';" },
  
  // Match descriptions
  { target: "matchDesc.push('chất liệu ' + this.getFabricVn(attrs.style));", replacement: "matchDesc.push(this.getFabricVn(attrs.style) + ' material');" },
  { target: "matchDesc.push('họa tiết ' + this.getPatternVn(attrs.pattern));", replacement: "matchDesc.push(this.getPatternVn(attrs.pattern) + ' pattern');" },
  { target: "matchDesc.push('danh mục ' + this.getCategoryVn(attrs.category));", replacement: "matchDesc.push(this.getCategoryVn(attrs.category) + ' category');" },
  
  // Suggestion defaults
  { target: 'return "Thiết kế được gợi ý nhờ sở hữu kiểu dáng hiện đại và được hoàn thiện tinh xảo từ chất liệu dệt bền vững.";', replacement: 'return "This design is recommended for its modern styling and fine craftsmanship using sustainable textiles.";' },
  { target: "label = 'chất vải ' + self.getFabricVn(fVal) + ' thoáng mát';", replacement: "label = 'breathable ' + self.getFabricVn(fVal) + ' fabric';" },
  { target: "label = 'phong cách họa tiết ' + self.getPatternVn(pVal);", replacement: "label = self.getPatternVn(pVal) + ' style';" },
  
  // Sleeves & Necklines
  { target: "'kiểu dáng sát nách phóng khoáng',", replacement: "'breezy sleeveless style'," },
  { target: "'kiểu tay ngắn năng động',", replacement: "'active short-sleeve style'," },
  { target: "'kiểu lỡ tay thanh lịch',", replacement: "'elegant 3/4-sleeve style'," },
  { target: "'kiểu tay dài ấm áp',", replacement: "'warm long-sleeve style'," },
  { target: "'thiết kế phom tay năng động'", replacement: "'active sleeve fit'" },
  { target: "|| 'kiểu tay thời trang';", replacement: "|| 'stylish sleeves';" },
  { target: "'thiết kế cổ chữ V tôn dáng',", replacement: "'flattering V-neck design'," },
  { target: "'cổ vuông thanh lịch',", replacement: "'elegant square neck'," },
  { target: "'cổ tròn cơ bản',", replacement: "'basic crew neck'," },
  { target: "'cổ đứng cổ điển',", replacement: "'classic stand-up collar'," },
  { target: "'cổ bẻ thanh lịch',", replacement: "'elegant lapel collar'," },
  { target: "'cổ hai dây quyến rũ'", replacement: "'charming strappy neckline'" },
  { target: "|| 'dáng cổ áo tinh tế';", replacement: "|| 'refined neckline';" },
  { target: "label = 'nhóm sản phẩm ' + self.getCategoryVn(cVal);", replacement: "label = self.getCategoryVn(cVal) + ' collection';" },
  
  // Dynamic explanations
  { target: 'ReFashion gợi ý sản phẩm này do sự tương đồng lớn với các tìm kiếm gần đây của bạn về <strong>', replacement: 'ReFashion recommends this product based on its strong similarity to your recent searches for <strong>' },
  { target: 'Hệ thống gợi ý sản phẩm này dựa trên hành vi mua sắm gần đây: Bạn đã từng <strong>', replacement: 'Recommended based on your recent shopping behavior: You recently <strong>' },
  { target: '</strong> sản phẩm <em>"', replacement: '</strong> the product <em>"' },
  { target: '"</em> (chung ', replacement: '"</em> (sharing ' },
  { target: 'Hệ thống đề xuất sản phẩm này dựa trên sự tương thích cao với xu hướng lựa chọn thời trang bền vững của bạn.', replacement: 'Recommended for its high alignment with your sustainable fashion choices.' },
  { target: 'Mẫu thiết kế này đặc biệt đồng điệu nhờ tối ưu tốt cho ', replacement: 'This design matches your preference for ' },
  { target: ' của bạn.', replacement: '.' },
  { target: 'Sản phẩm là lựa chọn tối ưu nhờ sự kết hợp lý tưởng giữa ', replacement: 'This product is an optimal choice combining ' },
  { target: ' và ', replacement: ' and ' },
  { target: 'Thiết kế đáp ứng trọn vẹn sở thích cá nhân nhờ quy tụ các đặc tính: ', replacement: 'This design matches your personal preferences with ' },
  { target: ' cùng với ', replacement: ', along with ' },
  { target: 'Sản phẩm có độ tương thích cao với phom dáng và chất liệu thiết kế ưa thích gần đây của bạn.', replacement: 'This product highly matches your preferred fits and design materials.' },
  { target: ' Về đặc tính sản phẩm, ', replacement: ' Product highlights: ' },
  { target: 'sản phẩm được làm từ sợi Cotton hữu cơ dệt tự nhiên, giúp thấm hút mồ hôi tối đa và cực kỳ êm dịu cho làn da.', replacement: 'crafted from natural organic cotton fibers, providing maximum sweat absorption and a soft feel on the skin.' },
  { target: 'chất liệu Denim dệt chắc chắn từ bông tái chế mang lại độ bền vượt trội, hạn chế phai màu và giữ phom quần áo cực chuẩn.', replacement: 'durable denim woven from recycled cotton, offering exceptional durability and shape retention.' },
  { target: 'sự kết hợp của lớp Da cao cấp mang lại vẻ ngoài thời thượng, giữ ấm tốt và có tuổi thọ vòng đời dài lâu.', replacement: 'premium circular leather construction, offering a stylish look, excellent warmth, and long lifecycle.' },
  { target: 'vải Dệt kim với độ co giãn tốt mang lại sự ấm áp và vô cùng dễ chịu khi vận động hàng ngày.', replacement: 'knitted fabric with comfortable stretch, providing warmth and flexibility for daily wear.' },
  { target: 'chất vải dệt sinh học thân thiện giúp dễ dàng phân hủy sinh học tự nhiên khi hết vòng đời sử dụng.', replacement: 'eco-friendly bio-synthetic weave designed for natural biodegradation at the end of its lifecycle.' }
];
replaceInFile(AI_REC_JS_PATH, aiRecReplacements);
console.log('js/ai-recommend.js translated successfully!');

// ----------------------------------------------------
// 2. TRANSLATING AND INJECTING SEARCH LOGIC IN BUYER.JS
// ----------------------------------------------------
console.log('Translating and patching js/buyer.js...');
const buyerJsReplacements = [
  // Model names in Try-on
  { target: "name: 'Nam da trắng'", replacement: "name: 'Male Light Skin'" },
  { target: "name: 'Nữ 1'", replacement: "name: 'Female 1'" },
  { target: "name: 'Nữ 2'", replacement: "name: 'Female 2'" },
  { target: "name: 'Nữ 3'", replacement: "name: 'Female 3'" },
  
  // Vton explanations and toasts
  { target: "showToast('Sản phẩm này chưa hỗ trợ thử đồ AI.');", replacement: "showToast('AI Try-on is not supported for this product yet.');" },
  { target: "showToast('✅ Đã tải ảnh của bạn!');", replacement: "showToast('✅ Your photo has been uploaded!');" },
  { target: "showToast('Vui lòng chọn người mẫu!');", replacement: "showToast('Please select a model!');" },
  { target: "showToast('Không tìm thấy ảnh trang phục.');", replacement: "showToast('Garment image not found.');" },
  { target: "logVton('Khởi động Simulation Engine...');", replacement: "logVton('Initializing Simulation Engine...');" },
  { target: "logVton('Phân tích hình dáng người mẫu...');", replacement: "logVton('Analyzing model shape...');" },
  { target: "logVton('Ánh xạ điểm trang phục lên cơ thể...');", replacement: "logVton('Mapping garment points to body...');" },
  { target: "logVton('Tổng hợp kết quả hình ảnh...');", replacement: "logVton('Synthesizing image results...');" },
  { target: "logVton('Hoàn tất! Đang hiển thị kết quả...');", replacement: "logVton('Complete! Rendering results...');" },
  { target: "logVton('Đang kết nối với Hugging Face Space (IDM-VTON)...');", replacement: "logVton('Connecting to Hugging Face Space (IDM-VTON)...');" },
  { target: "logVton('Đang tải module Gradio Client...');", replacement: "logVton('Loading Gradio Client module...');" },
  { target: "logVton('Đang kết nối tới Space: ' + hfSpace);", replacement: "logVton('Connecting to Space: ' + hfSpace);" },
  { target: "logVton('Đang tải và chuẩn bị ảnh...');", replacement: "logVton('Loading and preparing images...');" },
  { target: "logVton('Đang tải ảnh model và trang phục lên Gradio server...');", replacement: "logVton('Uploading model and garment images to Gradio server...');" },
  { target: "throw new Error('Tải ảnh lên Gradio server thất bại');", replacement: "throw new Error('Failed to upload images to Gradio server');" },
  { target: "logVton('Đang gửi yêu cầu inference...');", replacement: "logVton('Sending inference request...');" },
  { target: "logVton('Nhận kết quả từ API...');", replacement: "logVton('Receiving result from API...');" },
  { target: "throw new Error('API không trả về ảnh kết quả');", replacement: "throw new Error('API did not return a result image');" },
  { target: "logVton('Hoàn tất thử đồ AI!');", replacement: "logVton('AI try-on completed!');" },
  { target: "logVton('Lỗi: ' + (err.message || String(err)));", replacement: "logVton('Error: ' + (err.message || String(err)));" },
  { target: "showToast('❌ Lỗi API: ' + (err.message || 'Không kết nối được').substring(0, 80));", replacement: "showToast('❌ API Error: ' + (err.message || 'Connection failed').substring(0, 80));" },
  { target: "showToast('Chưa có ảnh kết quả để lưu.');", replacement: "showToast('No result image to save.');" },
  { target: "showToast('Vui lòng đăng nhập để thêm vào giỏ!');", replacement: "showToast('Please login to add to cart!');" },
  { target: "variant: 'M - Mặc định'", replacement: "variant: 'M - Default'" },
  { target: 'showToast(\'🛍️ Đã thêm "\' + vtonState.currentProductName + \'" vào giỏ hàng!\');', replacement: 'showToast(\'🛍️ Added "\' + vtonState.currentProductName + \'" to cart!\');' },
  
  // Checkout & cart toasts
  { target: "showToast('Thanh toán thành công!", replacement: "showToast('Payment successful!" },
  { target: "Vui lòng điền đầy đủ thông tin!", replacement: "Please fill in all fields!" },
  { target: "Đơn hàng đã được đặt thành công", replacement: "Order placed successfully" },
  { target: "Cảm ơn bạn đã ủng hộ thời trang tuần hoàn", replacement: "Thank you for supporting circular fashion" },
  { target: "Mã giảm giá áp dụng thành công", replacement: "Coupon applied successfully" },
  { target: "Mã giảm giá không hợp lệ", replacement: "Invalid coupon code" },
  { target: "Mã giảm giá đã hết hạn", replacement: "Coupon has expired" },
  { target: "Vui lòng chọn size và màu sắc", replacement: "Please select size and color" },
  { target: "Sản phẩm đã được thêm vào giỏ hàng", replacement: "Product added to cart" },
  { target: "Số lượng vượt quá tồn kho", replacement: "Quantity exceeds stock availability" },

  // Styling explanation title
  { target: '<h3 style="margin:0; font-family:\'Outfit\', sans-serif; font-weight:600; color:var(--primary); font-size:1.15rem;">Stylist AI giải thích</h3>', replacement: '<h3 style="margin:0; font-family:\'Outfit\', sans-serif; font-weight:600; color:var(--primary); font-size:1.15rem;">AI Stylist Explanation</h3>' },
  { target: '<i class="fa-solid fa-circle-notch fa-spin" style="margin-right:6px;"></i> Đang phân tích đóng góp đặc tính Shapley...', replacement: '<i class="fa-solid fa-circle-notch fa-spin" style="margin-right:6px;"></i> Analyzing Shapley feature contributions...' },
  { target: 'Sản phẩm được gợi ý vì đây là chiếc áo khoác gió tuần hoàn tiêu biểu từ', replacement: 'This product is recommended as a signature circular windbreaker from' },
  { target: ', giúp tiết kiệm năng lượng và giảm thiểu carbon đáng kể. Nó bổ sung hoàn hảo cho bộ trang phục ngoài trời của bạn, đồng thời nâng đỡ lối sống bền vững.', replacement: ', helping save energy and significantly reduce carbon footprint. It perfectly complements your outdoor apparel while supporting a sustainable lifestyle.' },
  { target: 'Chúng tôi gợi ý balo này dựa trên khả năng lưu trữ tối ưu của nó cho các hoạt động thể thao dã ngoại. Chế tác từ bạt và dù cũ siêu bền bỉ, balo là biểu trưng của thiết kế thông minh kéo dài vòng đời vật liệu.', replacement: 'We suggest this backpack for its optimized storage capacity for outdoor activities. Crafted from ultra-durable upcycled tarps and paragliders, it represents smart design extending material lifespans.' },
  { target: 'Áo thun cotton unisex được đề xuất vì tính đa dụng cực cao trong tủ đồ tối giản. Với 100% sợi dệt tự nhiên tái sinh và cúc vỏ dừa mộc mạc, sản phẩm mang lại sự mát mẻ tự nhiên và an lành cho làn da.', replacement: 'This unisex cotton T-shirt is recommended for its high versatility in minimalist wardrobes. Made of 100% natural recycled fibers with rustic coconut shell buttons, it provides a cooling comfort.' },
  { target: 'Được gợi ý nhờ thiết kế form đứng kaki cổ điển dễ phối hợp. Quy trình tái chế chất lượng cao từ quần cũ không chỉ gìn giữ chất liệu thô mộc đặc trưng mà còn giảm thiểu lượng rác thải dệt may xả ra môi trường.', replacement: 'Recommended for its classic kaki straight-leg design. The premium recycling process from pre-loved trousers preserves its rustic textures while reducing textile waste.' },
  { target: 'Đôi giày/sandal thân thiện này sử dụng cao su tái chế và sợi dứa Piñatex bền chắc. Phù hợp cho những ai yêu thích dịch chuyển nhẹ nhàng, êm chân và ủng hộ nền kinh tế tuần hoàn, bảo vệ môi trường.', replacement: 'This eco-friendly shoe/sandal uses recycled rubber and durable Piñatex pineapple fiber. Ideal for comfortable walking and supporting the circular economy.' },
  { target: 'Sản phẩm được khuyên dùng dựa trên sự tương tương thích cao với xu hướng thời trang bền vững. Nguồn nguyên liệu thu hồi chất lượng cao và quy trình hoàn thiện lành nghề mang lại phom dáng hiện đại và lâu bền.', replacement: 'Recommended based on high alignment with sustainable fashion trends. Premium reclaimed materials and expert finish deliver a modern, long-lasting silhouette.' },

  // SDG/ESG badges in DPP Modal
  { target: 'isEn ? "SDG 12: Responsible Consumption" : "SDG 12: Tiêu dùng Trách nhiệm"', replacement: '"SDG 12: Responsible Consumption"' },
  { target: 'isEn ? "ESG: Environmental - Circular Economy" : "ESG: Môi trường - Kinh tế Tuần hoàn"', replacement: '"ESG: Environmental - Circular Economy"' },
  { target: "isEn ? 'Refurbishment Journey (3R)' : 'Hành Trình Làm Mới (3R)'", replacement: "'Refurbishment Journey (3R)'" },
  { target: "isEn ? '🔧 Repair:' : '🔧 Repair (Sửa chữa):'", replacement: "'🔧 Repair:'" },
  { target: "isEn ? '✨ Refurbish:' : '✨ Refurbish (Làm mới):'", replacement: "'✨ Refurbish:'" },
  { target: "isEn ? '✂️ Remaking/Redesign:' : '✂️ Remaking/Redesign (Thiết kế lại):'", replacement: "'✂️ Remaking/Redesign:'" },
  { target: 'isEn ? "SDG 9: Industry & Infrastructure" : "SDG 9: Công nghiệp & Hạ tầng"', replacement: '"SDG 9: Industry & Infrastructure"' },
  { target: 'isEn ? "ESG: Environmental - Scope 3 Transport" : "ESG: Môi trường - Vận tải Phạm vi 3"', replacement: '"ESG: Environmental - Scope 3 Transport"' },
  { target: "isEn ? 'Supply Chain & Transit Transparency' : 'Chuỗi Cung Ứng & Minh Bạch Vận Tải'", replacement: "'Supply Chain & Transit Transparency'" },
  { target: "isEn ? 'Tier 1: Assembly & Distribution' : 'Tier 1: Hoàn thiện & Phân Phối'", replacement: "'Tier 1: Assembly & Distribution'" },
  { target: "isEn ? 'Location' : 'Địa điểm'", replacement: "'Location'" },
  { target: "isEn ? 'Certification' : 'Chứng nhận'", replacement: "'Certification'" },
  { target: "isEn ? 'Tier 2: Upcycling Creative Studio' : 'Tier 2: Xưởng Tái Tạo Thiết Kế'", replacement: "'Tier 2: Upcycling Creative Studio'" },
  { target: "isEn ? 'Tier 3: Fiber Processing & Spin-Opening' : 'Tier 3: Trạm Xử Lý Vải Mộc'", replacement: "'Tier 3: Fiber Processing & Spin-Opening'" },
  { target: "isEn ? 'Tier 4: Material Sourcing & Collection' : 'Tier 4: Nguồn Vật Liệu Thu Gom'", replacement: "'Tier 4: Material Sourcing & Collection'" },

  // Inject initAdvancedSearch call inside bindShopFilters
  {
    target: `    var clearBtn = document.getElementById('filter-search-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() {
      shopState.searchQuery = '';
      searchInput.value = '';
      shopState.currentPage = 1;
      saveShopState();
      renderShopProducts();
    });`,
    replacement: `    var clearBtn = document.getElementById('filter-search-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() {
      shopState.searchQuery = '';
      searchInput.value = '';
      shopState.currentPage = 1;
      saveShopState();
      renderShopProducts();
    });
    
    // Initialize advanced search & voice suggestions
    if (typeof initAdvancedSearch === 'function') {
      initAdvancedSearch();
    }`
  }
];

replaceInFile(BUYER_JS_PATH, buyerJsReplacements);
console.log('js/buyer.js text translated and event call injected!');

// ----------------------------------------------------
// 3. REPLACING PRODUCTS_DB STATIC DEFINITION IN BUYER.JS
// ----------------------------------------------------
console.log('Updating static PRODUCTS_DB in js/buyer.js...');
let buyerJsContent = fs.readFileSync(BUYER_JS_PATH, 'utf8');

const englishProductsDbStr = `var PRODUCTS_DB = {
  '1': {
    id: '1',
    name: 'Recycled Windbreaker Jacket',
    category: 'Jacket',
    price: '1,250,000 VND',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200',
    description: 'Ultra-lightweight windbreaker, highly wind-resistant and water-repellent, upcycled from pre-loved jackets and premium factory surplus.',
    carbonFootprint: '3.2 kg CO₂e (52% lower than industry average)',
    waterSaved: '1,200 Liters of fresh water',
    details: [
      'PFC-free eco-friendly DWR water-repellent finish.',
      'Adjustable hood and recycled YKK zipper.',
      'Spacious zippered chest pocket for essentials.',
      'Conveniently packs down into chest pocket for easy travel.'
    ],
    sizeChart: '../images/sizeselection.jpg',
    store: 'Eco Wear',
    storeLogo: '../images/store_eco_wear.png',
    variants: [
      { size: 'S', color: 'Blue', price: 1250000, stock: 15 },
      { size: 'M', color: 'Blue', price: 1250000, stock: 15 },
      { size: 'L', color: 'Blue', price: 1250000, stock: 10 },
      { size: 'XL', color: 'Blue', price: 1280000, stock: 5 }
    ]
  },
  '2': {
    id: '2',
    name: 'Recycled Backpack 30L',
    category: 'Outdoor Accessories',
    price: '1,890,000 VND',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200',
    description: 'Technical outdoor and hiking backpack with 30L capacity. Reconstructed from discarded backpacks and high-grade surplus parachute fabrics.',
    carbonFootprint: '4.8 kg CO₂e (38% lower than industry average)',
    waterSaved: '850 Liters of fresh water',
    details: [
      'Honeycomb breathable mesh back panel to prevent sweat.',
      'Flexible adjustable hip and chest straps.',
      'Integrated dedicated water reservoir compartment.',
      'Premium scratch-resistant nylon, 5-year warranty.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '30L', color: 'Moss Green', price: 1890000, stock: 15 },
      { size: '30L', color: 'Grey', price: 1890000, stock: 15 }
    ]
  },
  '3': {
    id: '3',
    name: 'Upcycled T-Shirt',
    category: 'T-Shirt',
    price: '450,000 VND',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200',
    description: 'Classic and elegant polo shirt, upcycled from garment factory surplus and selected pre-loved t-shirts.',
    carbonFootprint: '1.5 kg CO₂e (60% lower than industry average)',
    waterSaved: '2,400 Liters of fresh water',
    details: [
      'Thick, structured pique knit fabric.',
      'Naturally dyed using plant and herbal extracts.',
      'Buttons made from heat-pressed natural coconut shells.',
      'Colorfast and highly shrink-resistant for machine washing.'
    ],
    store: 'Eco Wear',
    storeLogo: '../images/store_eco_wear.png',
    variants: [
      { size: 'S', color: 'White', price: 450000, stock: 10 },
      { size: 'M', color: 'White', price: 450000, stock: 10 },
      { size: 'L', color: 'White', price: 450000, stock: 10 },
      { size: 'S', color: 'Black', price: 450000, stock: 10 },
      { size: 'M', color: 'Black', price: 450000, stock: 10 },
      { size: 'L', color: 'Black', price: 450000, stock: 10 }
    ]
  },
  '4': {
    id: '4',
    name: 'Recycled Kaki Pants',
    category: 'Pants',
    price: '890,000 VND',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200',
    description: 'Durable straight-leg kaki pants crafted from premium pre-loved kaki trousers, redesigned into a modern fit.',
    carbonFootprint: '2.1 kg CO₂e (Recycling offsets substantial carbon)',
    waterSaved: '1,600 Liters of fresh water',
    details: [
      'Signature raw texture, breathable, becomes softer with wear.',
      'Reinforced stitching at high-tension points.',
      'Safe dyes, containing no heavy metals.',
      'Suitable for daily wear or outdoor trips.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '30', color: 'Beige', price: 890000, stock: 10 },
      { size: '32', color: 'Beige', price: 890000, stock: 15 },
      { size: '32', color: 'Black', price: 890000, stock: 10 }
    ]
  },
  '5': {
    id: '5',
    name: 'Recycled Canvas Tote Bag',
    category: 'Bags & Backpacks',
    price: '180,000 VND',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200',
    description: 'Thick and practical canvas tote bag for daily shopping, upcycled from pre-loved canvas clothing.',
    carbonFootprint: '0.6 kg CO₂e (80% lower than standard production)',
    waterSaved: '800 Liters of fresh water',
    details: [
      'Small inner pocket for keys and phone.',
      'Cross-stitched reinforced handle, holds up to 10kg.',
      'Eco-friendly water-based print pattern.',
      'Spacious size fits 15.6-inch laptop.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: 'Standard', color: 'Ivory', price: 180000, stock: 25 },
      { size: 'Standard', color: 'Black', price: 180000, stock: 15 }
    ]
  },
  '6': {
    id: '6',
    name: 'Recycled Fabric Sneaker',
    category: 'Sustainable Shoes',
    price: '1,450,000 VND',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200',
    description: 'Breathable athletic sneakers crafted from selected textile scraps and pre-loved denim clothing.',
    carbonFootprint: '2.9 kg CO₂e (Low-emission production process)',
    waterSaved: '900 Liters of fresh water',
    details: [
      'Soft, smooth recycled knit fabric hugs the foot, prevents heel friction.',
      'Extremely comfortable and elastic vulcanized natural rubber sole.',
      'Antimicrobial bio-foam insole.',
      'Shoe box made entirely of recycled cardboard.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '39', color: 'White', price: 1450000, stock: 5 },
      { size: '40', color: 'White', price: 1450000, stock: 10 },
      { size: '41', color: 'White', price: 1450000, stock: 10 }
    ]
  },
  '7': {
    id: '7',
    name: 'Recycled Denim Jeans',
    category: 'Pants',
    price: '950,000 VND',
    image: '../images/sh_denim_jeans.png',
    description: 'Fashionable straight-fit jeans made from high-quality recycled denim, preserving the raw texture of traditional denim.',
    carbonFootprint: '2.8 kg CO₂e (45% lower than standard jeans)',
    waterSaved: '1,500 Liters of fresh water',
    details: [
      'Thick, durable denim material.',
      'Water-saving and chemical-free washing technology.',
      'Sturdy metal zipper and button closure.',
      'Elegant natural indigo blue tone.'
    ],
    store: 'Denim Craft',
    storeLogo: '../images/store_denim_craft.png',
    variants: [
      { size: '30', color: 'Indigo Blue', price: 950000, stock: 10 },
      { size: '32', color: 'Indigo Blue', price: 950000, stock: 10 },
      { size: '32', color: 'Light Blue', price: 950000, stock: 8 }
    ]
  },
  '8': {
    id: '8',
    name: 'Upcycled Denim Shirt',
    category: 'Shirt',
    price: '650,000 VND',
    image: '../images/sh_denim_shirt.png',
    description: 'Fashionable denim shirt designed from selected pre-loved denim patches, featuring a unique colorway and personal style.',
    carbonFootprint: '1.2 kg CO₂e (75% lower than standard production)',
    waterSaved: '2,200 Liters of fresh water',
    details: [
      'Unique patchwork design, every shirt is one-of-a-kind.',
      'Cool unisex oversized fit.',
      'Striking contrast topstitching.',
      'Durable and secure snap buttons.'
    ],
    store: 'Eco Wear',
    storeLogo: '../images/store_eco_wear.png',
    variants: [
      { size: 'S', color: 'Denim Patchwork', price: 650000, stock: 8 },
      { size: 'M', color: 'Denim Patchwork', price: 650000, stock: 10 },
      { size: 'L', color: 'Denim Patchwork', price: 670000, stock: 6 }
    ]
  },
  '9': {
    id: '9',
    name: 'Upcycled Linen Dress',
    category: 'Dress & Skirt',
    price: '780,000 VND',
    image: '../images/sh_linen_dress.png',
    description: 'Soft dress with a gentle flared fit, upcycled from pre-loved shirts and premium linen/voal scraps.',
    carbonFootprint: '1.9 kg CO₂e (Eco-friendly organic dyes)',
    waterSaved: '600 Liters of fresh water',
    details: [
      'Raw linen/cotton texture, excellent sweat absorption.',
      'Organic plant-extract dye gentle on the skin.',
      'Elegant and feminine V-neck design.',
      'Deep, convenient side pockets for phone.'
    ],
    store: 'Retro Chic',
    storeLogo: '../images/store_retro_chic.png',
    variants: [
      { size: 'S', color: 'Natural Beige', price: 780000, stock: 5 },
      { size: 'M', color: 'Natural Beige', price: 780000, stock: 10 },
      { size: 'L', color: 'Natural Beige', price: 800000, stock: 5 }
    ]
  },
  '10': {
    id: '10',
    name: 'Upcycled Patchwork Canvas Bag',
    category: 'Bags & Backpacks',
    price: '320,000 VND',
    image: '../images/sh_patchwork_bag.png',
    description: 'One-of-a-kind patchwork shoulder bag handcrafted from raw canvas scraps and factory surplus denim. Bohemian style.',
    carbonFootprint: '0.5 kg CO₂e (Upcycled from factory scraps)',
    waterSaved: '400 Liters of fresh water',
    details: [
      'Spacious size fits 14-inch laptop.',
      'Wide, padded shoulder strap prevents shoulder fatigue.',
      'Inside lined with natural raw cotton, features a small zipper pocket.',
      'Smooth and durable metal YKK zipper.'
    ],
    store: 'Denim Craft',
    storeLogo: '../images/store_denim_craft.png',
    variants: [
      { size: 'Standard', color: 'Canvas Patchwork', price: 320000, stock: 15 }
    ]
  },
  '11': {
    id: '11',
    name: 'Premium Upcycled Silk Scarf',
    category: 'Accessories',
    price: '290,000 VND',
    image: '../images/sh_silk_scarf.png',
    description: 'Scarf crafted from premium factory silk remnants, featuring elegant retro prints. Soft and smooth, warm in winter and cool in summer.',
    carbonFootprint: '0.8 kg CO₂e (Upcycled from silk scraps)',
    waterSaved: '300 Liters of fresh water',
    details: [
      'Handcrafted from factory surplus fabric.',
      'Exquisite classic pattern, fade-resistant.',
      'Versatile 70x70cm square size.',
      'Elegant recycled kraft gift box, perfect for gifting.'
    ],
    store: 'Retro Chic',
    storeLogo: '../images/store_retro_chic.png',
    variants: [
      { size: '70x70cm', color: 'Bordeaux Red', price: 290000, stock: 15 },
      { size: '70x70cm', color: 'Mustard Yellow', price: 290000, stock: 15 }
    ]
  },
  '12': {
    id: '12',
    name: 'Recycled Wool Jacket',
    category: 'Jacket',
    price: '1,650,000 VND',
    image: '../images/sh_wool_jacket.png',
    description: 'Thick and exceptionally warm wool jacket, crafted from high-quality recycled wool fibers collected from pre-loved knitwear.',
    carbonFootprint: '5.2 kg CO₂e (48% lower than virgin wool)',
    waterSaved: '950 Liters of fresh water',
    details: [
      'Thick, textured wool surface, holds shape beautifully.',
      'Breathable lining made of recycled cotton.',
      'Classic double-breasted design, smart look.',
      'Spacious and convenient welt pockets on both sides.'
    ],
    store: 'Retro Chic',
    storeLogo: '../images/store_retro_chic.png',
    variants: [
      { size: 'M', color: 'Earth Brown', price: 1650000, stock: 5 },
      { size: 'L', color: 'Earth Brown', price: 1650000, stock: 5 },
      { size: 'M', color: 'Charcoal Grey', price: 1650000, stock: 3 },
      { size: 'L', color: 'Charcoal Grey', price: 1650000, stock: 3 }
    ]
  },
  '13': {
    id: '13',
    name: 'Recycled Denim Jeans (Washed)',
    category: 'Pants',
    price: '850,000 VND',
    image: '../images/sh_denim_jeans.png',
    description: 'Casual dynamic sneakers with uppers crafted from pre-loved denim jeans, resting on vulcanized natural rubber soles.',
    carbonFootprint: '2.5 kg CO₂e (55% lower than new sneakers)',
    waterSaved: '700 Liters of fresh water',
    details: [
      'Sturdy denim weave, highly breathable.',
      'Natural rubber sole, anti-slip and flexible.',
      'Soft insole made from recycled EVA bio-foam.',
      'Low-top basic design, easy to style.'
    ],
    store: 'Denim Craft',
    storeLogo: '../images/store_denim_craft.png',
    variants: [
      { size: '38', color: 'Ivory', price: 850000, stock: 5 },
      { size: '40', color: 'Ivory', price: 850000, stock: 5 },
      { size: '40', color: 'Canvas Black', price: 850000, stock: 5 },
      { size: '42', color: 'Canvas Black', price: 870000, stock: 5 }
    ]
  },
  '14': {
    id: '14',
    name: 'Organic Butterfly Pea Shirt',
    category: 'Shirt',
    price: '520,000 VND',
    image: '../images/sh_denim_shirt.png',
    description: 'Oversized shirt crafted from organic linen, featuring hand-embroidered butterfly pea flower accents in organic thread.',
    carbonFootprint: '1.4 kg CO₂e (Low-emission handmade processing)',
    waterSaved: '1,800 Liters of fresh water',
    details: [
      '100% natural, soft, breathable organic linen.',
      'Naturally colored with eco-friendly dyes.',
      'Delicate, high-durability hand embroidery.',
      'Elegant loose silhouette for maximum styling ease.'
    ],
    store: 'Retro Chic',
    storeLogo: '../images/store_retro_chic.png',
    variants: [
      { size: 'S', color: 'Natural Beige', price: 520000, stock: 5 },
      { size: 'M', color: 'Natural Beige', price: 520000, stock: 10 },
      { size: 'L', color: 'Natural Beige', price: 520000, stock: 5 }
    ]
  }
};`;

// Replace PRODUCTS_DB block
// Find PRODUCTS_DB definition in file
const startIdx = buyerJsContent.indexOf('var PRODUCTS_DB = {');
if (startIdx !== -1) {
  // Find matching closing brace
  let openBraces = 0;
  let endIdx = -1;
  for (let i = startIdx; i < buyerJsContent.length; i++) {
    if (buyerJsContent[i] === '{') {
      openBraces++;
    } else if (buyerJsContent[i] === '}') {
      openBraces--;
      if (openBraces === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx !== -1) {
    console.log(`Found PRODUCTS_DB block from index ${startIdx} to ${endIdx}. Replacing...`);
    buyerJsContent = buyerJsContent.substring(0, startIdx) + englishProductsDbStr + buyerJsContent.substring(endIdx + 1);
  }
}

fs.writeFileSync(BUYER_JS_PATH, buyerJsContent, 'utf8');
console.log('PRODUCTS_DB successfully replaced inside js/buyer.js!');


// ----------------------------------------------------
// 4. INJECTING ADVANCED SEARCH FUNCTION DEFINITION IN BUYER.JS
// ----------------------------------------------------
console.log('Injecting initAdvancedSearch function into js/buyer.js...');
let finalBuyerJs = fs.readFileSync(BUYER_JS_PATH, 'utf8');

const advancedSearchFuncStr = `
/* ==================== ADVANCED SEARCH & VOICE SEARCH LOGIC ==================== */
function initAdvancedSearch() {
  var searchInput = document.getElementById('filter-search');
  var voiceBtn = document.getElementById('voice-search-btn');
  var dropdown = document.getElementById('search-suggestions-dropdown');
  if (!searchInput) return;

  // 1. Voice Search (Microphone) Logic
  if (voiceBtn) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.style.display = 'none';
    } else {
      var recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      var isListening = false;
      
      recognition.onstart = function() {
        isListening = true;
        voiceBtn.innerHTML = '<i class="fa-solid fa-microphone-lines fa-bounce" style="color:var(--primary)"></i>';
        searchInput.placeholder = 'Listening... Speak now';
        showToast('🎙️ Microphone active. Speak to search...');
      };
      
      recognition.onend = function() {
        isListening = false;
        voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        searchInput.placeholder = 'Search eco-products...';
      };
      
      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('❌ Microphone permission denied');
        } else {
          showToast('❌ Voice recognition error: ' + event.error);
        }
      };
      
      recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        shopState.searchQuery = transcript;
        shopState.currentPage = 1;
        saveShopState();
        renderShopProducts();
        
        if (typeof AI_REC_SYSTEM !== 'undefined') {
          AI_REC_SYSTEM.trackSearch(transcript);
        }
        showToast('🎙️ Found: "' + transcript + '"');
      };
      
      voiceBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isListening) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });
    }
  }

  // 2. Search Suggestions Dropdown Logic
  function showSuggestions() {
    if (!dropdown) return;
    
    var history = [];
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.profile && AI_REC_SYSTEM.profile.history) {
      history = AI_REC_SYSTEM.profile.history;
    }
    
    var html = '';
    
    // Recent search keywords if any
    var keywords = [];
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.profile && AI_REC_SYSTEM.profile.keywords) {
      for (var kw in AI_REC_SYSTEM.profile.keywords) {
        if (AI_REC_SYSTEM.profile.keywords[kw] > 0) {
          keywords.push({ kw: kw, weight: AI_REC_SYSTEM.profile.keywords[kw] });
        }
      }
      keywords.sort(function(a, b) { return b.weight - a.weight; });
    }

    // Recent items from history
    if (history.length > 0) {
      html += '<div class="suggestion-group-title">Based on your recent clicks</div>';
      
      // Let's get up to 4 unique products from history
      var seenProds = {};
      var count = 0;
      for (var i = 0; i < history.length && count < 4; i++) {
        var hItem = history[i];
        if (seenProds[hItem.productId]) continue;
        seenProds[hItem.productId] = true;
        count++;
        
        // Find product image
        var pImg = 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200';
        if (typeof SHOP_PRODUCTS !== 'undefined') {
          for (var j = 0; j < SHOP_PRODUCTS.length; j++) {
            if (String(SHOP_PRODUCTS[j].id) === String(hItem.productId)) {
              pImg = SHOP_PRODUCTS[j].image;
              break;
            }
          }
        }
        
        html += '<div class="suggestion-item product-suggestion" data-id="' + hItem.productId + '">' +
                  '<img src="' + pImg + '" style="width:36px;height:36px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" />' +
                  '<div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
                    '<div style="font-weight:600;font-size:0.85rem;color:var(--foreground)">' + hItem.name + '</div>' +
                    '<div style="font-size:0.75rem;color:var(--text-muted)">Recently ' + hItem.action + 'ed</div>' +
                  '</div>' +
                '</div>';
      }
    }

    // Popular tags / keywords
    if (keywords.length > 0) {
      html += '<div class="suggestion-group-title">Suggested Searches</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;padding:0.4rem 1rem 0.6rem 1rem">';
      var maxKeywords = Math.min(6, keywords.length);
      for (var i = 0; i < maxKeywords; i++) {
        html += '<span class="suggestion-tag" data-val="' + keywords[i].kw + '">' + keywords[i].kw + '</span>';
      }
      html += '</div>';
    }

    // Recommended fallback if empty
    if (!html) {
      html += '<div style="padding:1rem;text-align:center;font-size:0.85rem;color:var(--text-muted)">Type to search or browse categories below</div>';
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
    
    // Add click listeners to items
    var prodItems = dropdown.querySelectorAll('.product-suggestion');
    prodItems.forEach(function(el) {
      el.addEventListener('click', function() {
        var pId = this.getAttribute('data-id');
        // Redirect to detail page
        window.location.href = '/buyer/shop-detail.html?id=' + pId;
      });
    });

    var tags = dropdown.querySelectorAll('.suggestion-tag');
    tags.forEach(function(el) {
      el.addEventListener('click', function() {
        var val = this.getAttribute('data-val');
        searchInput.value = val;
        shopState.searchQuery = val;
        shopState.currentPage = 1;
        saveShopState();
        renderShopProducts();
        dropdown.style.display = 'none';
      });
    });
  }

  searchInput.addEventListener('focus', function() {
    showSuggestions();
  });

  document.addEventListener('click', function(e) {
    if (dropdown && !searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
`;

// Append this function to buyer.js if not already present
if (finalBuyerJs.indexOf('function initAdvancedSearch') === -1) {
  finalBuyerJs += advancedSearchFuncStr;
  fs.writeFileSync(BUYER_JS_PATH, finalBuyerJs, 'utf8');
  console.log('initAdvancedSearch injected successfully into js/buyer.js!');
} else {
  console.log('initAdvancedSearch already present in js/buyer.js. Skipping injection.');
}
