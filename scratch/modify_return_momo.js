const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(filepath, 'utf8');

const target1 = `function initMoMoReturnPage() {
  var params = new URLSearchParams(window.location.search);
  var resultCode = params.get('resultCode');
  var orderId = params.get('orderId');
  var amount = params.get('amount');
  var transId = params.get('transId');
  var message = params.get('message');
  renderNavbar('navbar-container');
  renderFooter('footer-container');`;

const replacement1 = `function initMoMoReturnPage() {
  var params = new URLSearchParams(window.location.search);
  var resultCode = params.get('resultCode');
  var orderId = params.get('orderId');
  var amount = params.get('amount');
  var transId = params.get('transId');
  var message = params.get('message');
  
  if (resultCode === '0' && orderId) {
    try {
      var orders = JSON.parse(localStorage.getItem('refashion_orders')) || [];
      var orderUpdated = false;
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === orderId) {
          orders[i].paymentStatus = 'paid';
          orders[i].status = 'confirmed';
          orderUpdated = true;
          break;
        }
      }
      if (orderUpdated) {
        localStorage.setItem('refashion_orders', JSON.stringify(orders));
      }
    } catch (e) {
      console.warn("[MoMo Return] Failed to update order status:", e);
    }
  }

  renderNavbar('navbar-container');
  renderFooter('footer-container');`;

// Normalize content and target
const normalizedContent = content.split('\r\n').join('\n');
const normalizedTarget1 = target1.split('\r\n').join('\n');
const normalizedReplacement1 = replacement1.split('\r\n').join('\n');

// Replace all occurrences of target1 with replacement1
if (normalizedContent.includes(normalizedTarget1)) {
  // Use split-join to replace all occurrences
  const updatedContent = normalizedContent.split(normalizedTarget1).join(normalizedReplacement1);
  fs.writeFileSync(filepath, updatedContent, 'utf8');
  console.log("Success: return handler updated in buyer.js");
} else {
  console.error("Error: target return handler pattern not found in buyer.js");
}
