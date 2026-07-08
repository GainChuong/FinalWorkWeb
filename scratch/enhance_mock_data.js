const fs = require('fs');
const path = require('path');

const datasetsDir = path.join(__dirname, '..', 'datasets');
const catalogPath = path.join(datasetsDir, 'products.json');
const accountsPath = path.join(datasetsDir, 'accounts.json');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const products = catalog.products || [];

const accountsData = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
const buyers = accountsData.accounts.filter(a => a.role === 'Buyer');
const sellers = accountsData.accounts.filter(a => a.role === 'Seller');

const randomBuyer = () => buyers[Math.floor(Math.random() * buyers.length)];
const randomSeller = () => sellers[Math.floor(Math.random() * sellers.length)];
const randomProduct = () => products[Math.floor(Math.random() * products.length)];

// 1. comment.json
const mockComments = [];
const chatScenarios = [
  ["Do you still have this in size M?", "Yes, we do. It's available.", "Great, I will order now.", "Thank you!"],
  ["Is this made from 100% recycled materials?", "Yes, our products use certified recycled cotton.", "Good to know. Placing an order.", "Thanks for supporting eco-friendly fashion."],
  ["When will you ship my order?", "We ship within 24 hours.", "Thanks!", "You're welcome."],
  ["Does the color fade after washing?", "No, the natural dye holds up very well.", "Perfect."],
  ["Can I return if it doesn't fit?", "Yes, we have a 7-day return policy.", "Ok, ordering now.", "Thanks!"]
];

let convId = 1;
for (let i = 0; i < 30; i++) {
  const b = randomBuyer();
  const s = randomSeller();
  const scenario = chatScenarios[Math.floor(Math.random() * chatScenarios.length)];
  
  const messages = [];
  let t = new Date();
  t.setDate(t.getDate() - Math.floor(Math.random() * 10)); // random day in the past
  
  scenario.forEach((text, index) => {
    t.setMinutes(t.getMinutes() + Math.floor(Math.random() * 10) + 1);
    messages.push({
      sender: index % 2 === 0 ? "buyer" : "store",
      text: text,
      time: t.toISOString()
    });
  });

  mockComments.push({
    id: `conv_${String(convId++).padStart(3, '0')}`,
    buyer: {
      name: b.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=random&color=fff`
    },
    store: s.store,
    storeLogo: s.storeLogo,
    lastMessage: messages[messages.length - 1].text,
    lastTime: messages[messages.length - 1].time,
    unread: Math.floor(Math.random() * 3),
    status: "active",
    messages: messages
  });
}

fs.writeFileSync(path.join(datasetsDir, 'comment.json'), JSON.stringify({ conversations: mockComments }, null, 2));


// 2. reviews.json (mapped to products instead of arbitrary "1", "2")
const mockReviews = {};
const reviewTexts = [
  "Super lightweight and warm jacket. Recycled material yet very durable.",
  "Good product, comfortable to wear. Minus 1 star because it's a bit roomier than described.",
  "Roomier than expected but still ok. Good quality. Support green products!",
  "Soft fabric, very comfortable to wear. Support green products!",
  "Durable, beautiful, reasonable price. Natural product, safe.",
  "Should buy! Natural material, breathable.",
  "Suitable for daily use. Will support long-term.",
  "Looks good, fabric stretches well. Waistband fits perfectly.",
  "True colors, thick material."
];

products.forEach(p => {
  mockReviews[p.id] = [];
  const numReviews = Math.floor(Math.random() * 5) + 2; // 2 to 6 reviews per product
  for (let i = 0; i < numReviews; i++) {
    const b = randomBuyer();
    mockReviews[p.id].push({
      user: b.name,
      avatar: b.name.charAt(0).toUpperCase(),
      rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
      date: new Date(new Date().getTime() - Math.random() * 10000000000).toLocaleDateString('vi-VN'),
      comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
    });
  }
});

fs.writeFileSync(path.join(datasetsDir, 'reviews.json'), JSON.stringify(mockReviews, null, 2));


// 3. seller.json
const mockSellersStats = {};

sellers.forEach(seller => {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const monthKey = `2026-${String(m).padStart(2, '0')}`;
    const baseRevenue = 8000000 + Math.floor(Math.random() * 5000000);
    months.push({
      key: monthKey,
      label: new Date(2026, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      stats: {
        revenue: baseRevenue,
        orders: Math.floor(baseRevenue / 500000),
        co2_saved: Math.floor(Math.random() * 50) + 10,
        esg_score: 70 + Math.floor(Math.random() * 20),
        revenue_trend: `+${Math.floor(Math.random() * 20)}%`,
        orders_trend: `${Math.floor(Math.random() * 10)} pending orders`,
        co2_trend: `From ${Math.floor(Math.random() * 20) + 5} Upcycling products`,
        environment_products: Math.floor(Math.random() * 20) + 5,
        environment_score_change: `+${Math.floor(Math.random() * 10)} points vs last month`
      },
      charts: {
        revenue_weekly: Array.from({length: 4}, () => Math.floor(baseRevenue / 4) + (Math.random() * 200000 - 100000)),
        revenue_daily: Array.from({length: 7}, () => Math.floor(baseRevenue / 28) + (Math.random() * 100000 - 50000)),
        category: [Math.floor(Math.random() * 40), Math.floor(Math.random() * 30), Math.floor(Math.random() * 20), Math.floor(Math.random() * 10)],
        environmental_products: Array.from({length: 4}, () => Math.floor(Math.random() * 15) + 5),
        environmental_co2: Array.from({length: 4}, () => Math.floor(Math.random() * 30) + 10)
      }
    });
  }
  
  mockSellersStats[seller.store] = {
    dashboard: {
      months: months
    }
  };
});

fs.writeFileSync(path.join(datasetsDir, 'seller.json'), JSON.stringify(mockSellersStats, null, 2));


// 4. secondhand.json
const mockSecondhand = [];
const conditions = ["upcyclable", "like new", "good", "fair"];

for (let i = 1; i <= 30; i++) {
  const p = randomProduct();
  const b = randomBuyer();
  mockSecondhand.push({
    id: `SH-${i}`,
    name: `Pre-loved ${p.name}`,
    category: p.category,
    price: Math.floor(p.price * (Math.random() * 0.4 + 0.3)), // 30-70% of original price
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    location: b.address,
    phone: b.phone,
    description: `Secondhand item derived from ${p.name}. Still in great shape.`,
    image: p.image,
    sellerEmail: b.email,
    sellerName: b.name,
    date: new Date(new Date().getTime() - Math.random() * 5000000000).toLocaleDateString('vi-VN'),
    status: Math.random() > 0.2 ? "available" : "sold"
  });
}

fs.writeFileSync(path.join(datasetsDir, 'secondhand.json'), JSON.stringify({ items: mockSecondhand }, null, 2));

console.log("Enhanced mock datasets successfully.");
