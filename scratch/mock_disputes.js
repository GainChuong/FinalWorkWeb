const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../datasets/order.json');
const disputesPath = path.join(__dirname, '../datasets/dispute.json');

const data = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));

// Pick 3 orders to modify
const order1 = data.orders.find(o => o.id === 'ORD-10001'); // We will make it return_pending
const order2 = data.orders.find(o => o.id === 'ORD-10002'); // We will make it disputed
const order3 = data.orders.find(o => o.id === 'ORD-10003'); // We will make it return_pending

if (order1) order1.status = 'return_pending';
if (order2) order2.status = 'disputed';
if (order3) order3.status = 'return_pending';

fs.writeFileSync(ordersPath, JSON.stringify(data, null, 2));

const disputes = {
  disputes: [
    {
      id: "DSP-5001",
      orderId: "ORD-10001",
      buyerEmail: order1 ? order1.buyerEmail : "buyer14@refashion.vn",
      sellerEmail: order1 ? order1.sellerEmail : "seller_zerowaste@refashion.vn",
      reason: "Sản phẩm bị lỗi đường may, không giống mô tả.",
      status: "pending",
      createdAt: new Date().toISOString(),
      history: [
        {
          actor: "Buyer",
          action: "Opened Return Request",
          note: "Áo bị rách một đường nhỏ ở tay.",
          timestamp: new Date().toISOString()
        }
      ]
    },
    {
      id: "DSP-5002",
      orderId: "ORD-10002",
      buyerEmail: order2 ? order2.buyerEmail : "buyer16@refashion.vn",
      sellerEmail: order2 ? order2.sellerEmail : "seller_retro@refashion.vn",
      reason: "Giao sai mẫu, tôi đặt màu xanh nhưng giao màu đỏ.",
      status: "admin_review",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      history: [
        {
          actor: "Buyer",
          action: "Opened Return Request",
          note: "Giao nhầm size và màu.",
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          actor: "Seller",
          action: "Disputed",
          note: "Tôi đã giao đúng hàng, có video đóng gói.",
          timestamp: new Date().toISOString()
        }
      ]
    },
    {
      id: "DSP-5003",
      orderId: "ORD-10003",
      buyerEmail: order3 ? order3.buyerEmail : "buyer19@refashion.vn",
      sellerEmail: order3 ? order3.sellerEmail : "seller_denim@refashion.vn",
      reason: "Hàng cũ hơn so với đánh giá 95% New.",
      status: "pending",
      createdAt: new Date().toISOString(),
      history: [
        {
          actor: "Buyer",
          action: "Opened Return Request",
          note: "Chất liệu bị sờn nhiều.",
          timestamp: new Date().toISOString()
        }
      ]
    }
  ]
};

fs.writeFileSync(disputesPath, JSON.stringify(disputes, null, 2));
console.log('Successfully generated disputes and updated orders!');
