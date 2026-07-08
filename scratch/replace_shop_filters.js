const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'buyer.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetFunction = `function renderShopFilters() {
  var group = document.getElementById('filter-shop-group');
  if (!group) return;

  var stores = [];
  for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
    if (stores.indexOf(SHOP_PRODUCTS[i].store) === -1) {
      stores.push(SHOP_PRODUCTS[i].store);
    }
  }
  stores.sort();

  var html = '<label><input type="radio" name="shop-filter" value="all" ' + (shopState.selectedStore === 'all' ? 'checked' : '') + ' /><span>All Shops</span></label>';
  for (var j = 0; j < stores.length; j++) {
    var checked = shopState.selectedStore === stores[j] ? 'checked' : '';
    html += '<label><input type="radio" name="shop-filter" value="' + stores[j].replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" ' + checked + ' /><span>' + stores[j] + '</span></label>';
  }
  group.innerHTML = html;
}`;

const replacementFunction = `function renderShopFilters() {
  var group = document.getElementById('filter-shop-group');
  if (!group) return;

  var stores = [];
  for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
    if (SHOP_PRODUCTS[i].store && stores.indexOf(SHOP_PRODUCTS[i].store) === -1) {
      stores.push(SHOP_PRODUCTS[i].store);
    }
  }
  stores.sort();

  var html = '<label><input type="radio" name="shop-filter" value="all" ' + (shopState.selectedStore === 'all' ? 'checked' : '') + ' onchange="onShopFilterChange(this)" /><span>All Shops</span></label>';
  for (var j = 0; j < stores.length; j++) {
    var checked = shopState.selectedStore === stores[j] ? 'checked' : '';
    html += '<label><input type="radio" name="shop-filter" value="' + stores[j].replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" ' + checked + ' onchange="onShopFilterChange(this)" /><span>' + stores[j] + '</span></label>';
  }
  group.innerHTML = html;
}

window.onShopFilterChange = function(radio) {
  if (radio.checked) {
    shopState.selectedStore = radio.value;
    shopState.currentPage = 1;
    saveShopState();
    renderShopBanner();
    renderShopProducts();
  }
};`;

// Replace ignoring line ending styles
const normalize = s => s.replace(/\r\n/g, '\n').trim();
if (normalize(content).includes(normalize(targetFunction))) {
  // Find where it starts and ends
  const normContent = normalize(content);
  const normTarget = normalize(targetFunction);
  const index = normContent.indexOf(normTarget);
  
  // We can also do a simple split/replace
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(normTarget, normalize(replacementFunction));
  
  // Convert back to CRLF if file was CRLF originally
  content = content.replace(/\n/g, '\r\n');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully replaced renderShopFilters in buyer.js!');
} else {
  console.error('Error: target function not found in buyer.js');
}
