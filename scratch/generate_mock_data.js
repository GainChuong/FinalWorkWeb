const fs = require('fs');
const path = require('path');

const datasetsDir = path.join(__dirname, '..', 'datasets');
const catalogPath = path.join(datasetsDir, 'products.json');

// Read the catalog
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const products = catalog.products || [];

// Define Sellers
const sellersInfo = [
  { email: 'seller@refashion.vn', password: 'seller123', role: 'Seller', name: 'Eco Wear Store', store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
  { email: 'seller_hemp@refashion.vn', password: 'seller123', role: 'Seller', name: 'Hemp & Bamboo Store', store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
  { email: 'seller_retro@refashion.vn', password: 'seller123', role: 'Seller', name: 'Retro Chic Store', store: 'Retro Chic', storeLogo: '../images/store_retro_chic.png' },
  { email: 'seller_denim@refashion.vn', password: 'seller123', role: 'Seller', name: 'Denim Craft Store', store: 'Denim Craft', storeLogo: '../images/store_denim_craft.png' },
  { email: 'seller_greenthread@refashion.vn', password: 'seller123', role: 'Seller', name: 'Green Thread Store', store: 'Green Thread', storeLogo: '../images/store_green_thread.png' },
  { email: 'seller_zerowaste@refashion.vn', password: 'seller123', role: 'Seller', name: 'Zero Waste Store', store: 'Zero Waste', storeLogo: '../images/store_zero_waste.png' }
];

// Group products by store
const storeProducts = {};
products.forEach(p => {
  if (!storeProducts[p.store]) storeProducts[p.store] = [];
  storeProducts[p.store].push(p.id);
});

// 1. Generate accounts.json
const adminAccount = {
  email: 'admin@refashion.vn',
  password: 'admin123',
  role: 'Admin',
  name: 'Admin ReFashion',
  redirect: '/admin/index.html',
  username: 'admin',
  phone: "0999 999 999",
  address: "Quản trị viên"
};

const mockBuyers = [];
const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng"];
const middleNames = ["Văn", "Thị", "Hữu", "Thanh", "Minh", "Thu", "Ngọc", "Xuân"];
const lastNames = ["An", "Bình", "Cường", "Dung", "Hoa", "Lan", "Mai", "Tuấn", "Long", "Đức"];
const genders = ["men", "women"];

for (let i = 1; i <= 20; i++) {
  const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const mName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  
  mockBuyers.push({
    email: `buyer${i}@refashion.vn`,
    password: 'buyer123',
    role: 'Buyer',
    name: `${fName} ${mName} ${lName}`,
    redirect: '/buyer/index.html',
    username: `buyer${i}`,
    gender: gender,
    phone: `091${Math.floor(Math.random() * 9000000 + 1000000)}`,
    address: `${Math.floor(Math.random() * 200)} Đường abc, Quận xyz, TP HCM`,
    birthYear: 1980 + Math.floor(Math.random() * 25)
  });
}

// Ensure the demo buyer is there
mockBuyers.push({
  email: 'buyer@refashion.vn',
  password: 'buyer123',
  role: 'Buyer',
  name: 'Người Mua Demo',
  redirect: '/buyer/index.html',
  username: 'buyer_demo',
  gender: 'men',
  phone: '0912 345 678',
  address: '123 Đường Láng, Đống Đa, Hà Nội',
  birthYear: 1998
});

const accountsData = {
  accounts: [
    adminAccount,
    ...sellersInfo,
    ...mockBuyers
  ]
};
fs.writeFileSync(path.join(datasetsDir, 'accounts.json'), JSON.stringify(accountsData, null, 2));


// 2. Generate seller_product.json
const sellerProductData = {
  sellerProducts: sellersInfo.map(seller => ({
    sellerEmail: seller.email,
    store: seller.store,
    products: storeProducts[seller.store] || []
  }))
};
fs.writeFileSync(path.join(datasetsDir, 'seller_product.json'), JSON.stringify(sellerProductData, null, 2));


// 3. Generate order.json
const mockOrders = [];
let orderIdCounter = 10000;

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

for (let i = 0; i < 50; i++) {
  const buyer = mockBuyers[Math.floor(Math.random() * mockBuyers.length)];
  
  // Pick a random seller and some products
  const seller = sellersInfo[Math.floor(Math.random() * sellersInfo.length)];
  const availableProducts = storeProducts[seller.store] || [];
  
  if (availableProducts.length === 0) continue;
  
  const numItems = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let total = 0;
  
  for (let j = 0; j < numItems; j++) {
    const pId = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const pData = products.find(p => p.id === pId);
    if (!pData) continue;
    
    const qty = Math.floor(Math.random() * 2) + 1;
    items.push({
      productId: pData.id,
      name: pData.name,
      variant: "Size " + ["S", "M", "L", "XL"][Math.floor(Math.random() * 4)],
      qty: qty,
      price: pData.price,
      image: pData.image
    });
    total += pData.price * qty;
  }
  
  const d = new Date(2026, 0, 1 + Math.floor(Math.random() * 180));
  
  mockOrders.push({
    id: `ORD-${orderIdCounter++}`,
    createdAt: d.toISOString(),
    buyerEmail: buyer.email,
    customer: {
      name: buyer.name,
      phone: buyer.phone,
      address: buyer.address
    },
    items: items,
    total: total,
    sellerEmail: seller.email,
    store: seller.store,
    status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
    note: "Vui lòng giao giờ hành chính"
  });
}

const orderData = {
  orders: mockOrders
};
fs.writeFileSync(path.join(datasetsDir, 'order.json'), JSON.stringify(orderData, null, 2));


// 4. Generate admin_order.json
const mockAdminOrders = [];
const complaintTypes = ["Wrong item", "Damaged product", "Late delivery", "Quality issue"];
const complaintStatuses = ["open", "investigating", "resolved"];

for (let i = 0; i < 15; i++) {
  const order = mockOrders[Math.floor(Math.random() * mockOrders.length)];
  const item = order.items[Math.floor(Math.random() * order.items.length)];
  
  mockAdminOrders.push({
    complaintId: `COMP-${1000 + i}`,
    orderId: order.id,
    productId: item.productId,
    buyerEmail: order.buyerEmail,
    sellerEmail: order.sellerEmail,
    store: order.store,
    issue: complaintTypes[Math.floor(Math.random() * complaintTypes.length)],
    status: complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)],
    dateReported: new Date(new Date(order.createdAt).getTime() + 86400000 * (1 + Math.floor(Math.random() * 5))).toISOString()
  });
}

const adminOrderData = {
  adminOrders: mockAdminOrders
};
fs.writeFileSync(path.join(datasetsDir, 'admin_order.json'), JSON.stringify(adminOrderData, null, 2));

console.log('Successfully generated JSON files.');
