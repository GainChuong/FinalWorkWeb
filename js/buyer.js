function renderFeaturedProducts(prefix) {
  prefix = prefix || '';
  var grid = document.getElementById('featured-products-grid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
    var p = SHOP_PRODUCTS[i];
    html +=
      '<div class="product-card">' +
        '<span class="product-eco-badge">Eco-Score: ' + p.ecoScore + '</span>' +
        '<div class="product-img-wrap"><img src="' + p.image + '" alt="' + p.name + '" /></div>' +
        '<div class="product-info">' +
          '<p class="product-category">' + p.material + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + p.priceStr + '</span>' +
            '<div class="product-sentiment"><i class="fa-solid fa-leaf" style="font-size:0.75rem"></i><span>' + p.sentimentScore + '% AI</span></div>' +
          '</div>' +
          '<hr class="product-divider" />' +
          '<a href="' + prefix + 'shop-detail.html?id=' + p.id + '" class="btn btn-outline" style="width:100%;border-radius:10px">\u0110\u00e1nh gi\u00e1 C\u1ea3m x\u00fac & Mua</a>' +
        '</div>' +
      '</div>';
  }
  grid.innerHTML = html;
}

function initBuyerPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderFeaturedProducts();

  var searchInput = document.getElementById('nav-search');
  if (searchInput) {
    searchInput.addEventListener('focus', function() { this.style.width = '260px'; });
    searchInput.addEventListener('blur', function() { this.style.width = '200px'; });
  }

  var cartLink = document.getElementById('nav-cart-link');
  if (cartLink) {
    cartLink.addEventListener('click', function(e) {
      if (!RefashionAuth.isLoggedIn) {
        e.preventDefault();
        window.location.href = '../auth/login.html?redirect=cart.html';
      }
    });
  }

  window.addEventListener('scroll', function() {
    var nav = document.querySelector('.navbar-header');
    if (nav) {
      if (window.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  });
}

/* ==================== SHOP PAGE ==================== */

var shopState = { selectedCategory: 'all', selectedEcoScore: 'all', selectedMaterial: 'all', searchQuery: '', sortBy: 'default' };

function initShopPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderShopProducts();
  bindShopFilters();
}

function filterShopProducts() {
  var result = SHOP_PRODUCTS.slice();
  if (shopState.selectedCategory !== 'all') result = result.filter(function(p) { return p.category === shopState.selectedCategory; });
  if (shopState.selectedEcoScore !== 'all') result = result.filter(function(p) { return p.ecoScore === shopState.selectedEcoScore; });
  if (shopState.selectedMaterial !== 'all') result = result.filter(function(p) { return p.material.toLowerCase().indexOf(shopState.selectedMaterial.toLowerCase()) !== -1; });
  if (shopState.searchQuery.trim() !== '') {
    var q = shopState.searchQuery.toLowerCase();
    result = result.filter(function(p) { return p.name.toLowerCase().indexOf(q) !== -1 || p.material.toLowerCase().indexOf(q) !== -1; });
  }
  if (shopState.sortBy === 'price-asc') result.sort(function(a, b) { return a.price - b.price; });
  else if (shopState.sortBy === 'price-desc') result.sort(function(a, b) { return b.price - a.price; });
  else if (shopState.sortBy === 'sentiment') result.sort(function(a, b) { return b.sentimentScore - a.sentimentScore; });
  return result;
}

function renderShopProducts() {
  var grid = document.getElementById('shop-product-grid');
  var count = document.getElementById('shop-result-count');
  if (!grid) return;
  var results = filterShopProducts();
  if (count) count.innerHTML = results.length.toString();
  if (results.length === 0) {
    grid.innerHTML =
      '<div class="not-found">' +
        '<i class="fa-solid fa-folder-open" style="font-size:3rem;color:var(--text-muted);margin-bottom:1.5rem"></i>' +
        '<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">Kh\u00f4ng t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m n\u00e0o</h3>' +
        '<p style="color:var(--text-muted);font-size:0.95rem">H\u00e3y th\u1eed x\u00f3a b\u1edbt c\u00e1c b\u1ed9 l\u1ecdc \u0111\u1ec3 t\u00ecm ki\u1ebfm th\u00eam s\u1ea3n ph\u1ea9m th\u00e2n thi\u1ec7n v\u1edbi m\u00f4i tr\u01b0\u1eddng kh\u00e1c nh\u00e9.</p>' +
      '</div>';
    return;
  }
  var html = '';
  for (var i = 0; i < results.length; i++) {
    var p = results[i];
    html +=
      '<div class="product-card">' +
        '<span class="product-eco-badge">Eco-Score: ' + p.ecoScore + '</span>' +
        '<div class="product-img-wrap"><img src="' + p.image + '" alt="' + p.name + '" /></div>' +
        '<div class="product-info">' +
          '<p class="product-category">' + p.material + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + p.priceStr + '</span>' +
            '<div class="product-sentiment"><i class="fa-solid fa-leaf" style="font-size:0.75rem"></i><span>' + p.sentimentScore + '% AI</span></div>' +
          '</div>' +
          '<hr class="product-divider" />' +
          '<a href="shop-detail.html?id=' + p.id + '" class="btn btn-outline" style="width:100%;border-radius:10px">\u0110\u00e1nh gi\u00e1 C\u1ea3m x\u00fac & Mua</a>' +
        '</div>' +
      '</div>';
  }
  grid.innerHTML = html;
}

function bindShopFilters() {
  var catRadios = document.querySelectorAll('input[name="category"]');
  for (var i = 0; i < catRadios.length; i++) {
    catRadios[i].addEventListener('change', function() {
      if (this.checked) { shopState.selectedCategory = this.value; renderShopProducts(); }
    });
  }
  var ecoRadios = document.querySelectorAll('input[name="ecoscore"]');
  for (var i = 0; i < ecoRadios.length; i++) {
    ecoRadios[i].addEventListener('change', function() {
      if (this.checked) { shopState.selectedEcoScore = this.value; renderShopProducts(); }
    });
  }
  var matSelect = document.getElementById('filter-material');
  if (matSelect) matSelect.addEventListener('change', function() { shopState.selectedMaterial = this.value; renderShopProducts(); });
  var searchInput = document.getElementById('filter-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() { shopState.searchQuery = this.value; renderShopProducts(); });
    var clearBtn = document.getElementById('filter-search-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() {
      shopState.searchQuery = '';
      searchInput.value = '';
      renderShopProducts();
    });
  }
  var sortSelect = document.getElementById('shop-sort');
  if (sortSelect) sortSelect.addEventListener('change', function() { shopState.sortBy = this.value; renderShopProducts(); });
  var resetBtn = document.getElementById('filter-reset');
  if (resetBtn) resetBtn.addEventListener('click', function() {
    shopState.selectedCategory = 'all';
    shopState.selectedEcoScore = 'all';
    shopState.selectedMaterial = 'all';
    shopState.searchQuery = '';
    shopState.sortBy = 'default';
    var radioCat = document.querySelector('input[name="category"][value="all"]');
    if (radioCat) radioCat.checked = true;
    var radioEco = document.querySelector('input[name="ecoscore"][value="all"]');
    if (radioEco) radioEco.checked = true;
    if (matSelect) matSelect.value = 'all';
    if (sortSelect) sortSelect.value = 'default';
    if (searchInput) searchInput.value = '';
    renderShopProducts();
  });
}

/* ==================== CART PAGE ==================== */
function initCartPage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=cart.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderCart();
}

function renderCart() {
  var cart = RefashionAuth._getCart();
  var container = document.getElementById('cart-content');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML =
      '<div class="empty-cart">' +
        '<div style="width:100px;height:100px;border-radius:50%;background-color:var(--primary-light);display:flex;align-items:center;justify-content:center;margin:0 auto 2rem auto"><i class="fa-solid fa-bag-shopping" style="font-size:2.5rem;color:var(--primary);opacity:0.5"></i></div>' +
        '<h2 style="font-family:var(--font-serif);font-size:1.75rem;margin-bottom:0.75rem">Gi\u1ecf h\u00e0ng tr\u1ed1ng</h2>' +
        '<p style="color:var(--text-muted);font-size:1rem;margin-bottom:2rem">B\u1ea1n ch\u01b0a th\u00eam s\u1ea3n ph\u1ea9m n\u00e0o v\u00e0o gi\u1ecf h\u00e0ng. H\u00e3y kh\u00e1m ph\u00e1 b\u1ed9 s\u01b0u t\u1eadp th\u1eddi trang xanh c\u1ee7a ch\u00fang t\u00f4i!</p>' +
        '<a href="shop.html" class="btn btn-primary" style="padding:1rem 2.5rem;border-radius:14px;font-size:1rem"><i class="fa-solid fa-bag-shopping" style="margin-right:0.4rem"></i>Kh\u00e1m Ph\u00e1 C\u1eeda H\u00e0ng</a>' +
      '</div>';
    return;
  }
  var total = RefashionAuth.getCartTotal();
  var greenCoinEst = Math.floor(total / 100000) * 5;
  var itemsHtml = '';
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    itemsHtml +=
      '<div class="cart-item">' +
        '<div class="cart-item-img"><img src="' + item.image + '" alt="' + item.name + '" /></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-header">' +
            '<div><span class="badge badge-primary" style="font-size:0.65rem;margin-bottom:0.35rem">Eco-Score: ' + item.ecoScore + '</span><h3 style="font-size:1.05rem;font-weight:700">' + item.name + '</h3></div>' +
            '<button onclick="removeCartItem(\'' + item.productId + '\')" style="background:transparent;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0.25rem;border-radius:8px" title="X\u00f3a s\u1ea3n ph\u1ea9m"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div>' +
          '<p class="cart-item-price">' + item.priceStr + '</p>' +
          '<div style="display:flex;align-items:center;gap:0.75rem">' +
            '<span style="font-size:0.85rem;color:var(--text-muted);font-weight:500">S\u1ed1 l\u01b0\u1ee3ng:</span>' +
            '<div class="quantity-control">' +
              '<button onclick="updateQty(\'' + item.productId + '\', ' + (item.quantity - 1) + ')"><i class="fa-solid fa-minus" style="font-size:0.7rem"></i></button>' +
              '<span class="qty-value">' + item.quantity + '</span>' +
              '<button onclick="updateQty(\'' + item.productId + '\', ' + (item.quantity + 1) + ')"><i class="fa-solid fa-plus" style="font-size:0.7rem"></i></button>' +
            '</div>' +
            '<span style="font-size:0.85rem;color:var(--text-muted)">= <strong style="color:var(--accent)">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' \u0111</strong></span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  var itemsSummaryHtml = '';
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    itemsSummaryHtml +=
      '<div style="display:flex;justify-content:space-between;font-size:0.9rem;color:var(--text-muted)">' +
        '<span style="max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + ' x' + item.quantity + '</span>' +
        '<span style="font-weight:600;color:var(--foreground)">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' \u0111</span>' +
      '</div>';
  }
  container.innerHTML =
    '<div class="cart-layout">' +
      '<div class="cart-items">' + itemsHtml + '</div>' +
      '<div class="order-summary">' +
        '<h3>T\u00f3m T\u1eaft \u0110\u01a1n H\u00e0ng</h3>' +
        '<div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem">' + itemsSummaryHtml + '</div>' +
        '<hr style="border:0;border-top:1px solid var(--border);margin-bottom:1.5rem" />' +
        '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem">' +
          '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">T\u1ea1m t\u00ednh</span><span style="font-weight:600">' + total.toLocaleString('vi-VN') + ' \u0111</span></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Ph\u00ed v\u1eadn chuy\u1ec3n</span><span style="font-weight:600;color:var(--sentiment-pos)">Mi\u1ec5n ph\u00ed</span></div>' +
        '</div>' +
        '<hr style="border:0;border-top:2px solid var(--primary);margin-bottom:1.25rem" />' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:1rem"><span style="font-size:1.15rem;font-weight:700">T\u1ed5ng c\u1ed9ng</span><span style="font-size:1.5rem;font-weight:900;color:var(--accent)">' + total.toLocaleString('vi-VN') + ' \u0111</span></div>' +
        '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:0.85rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;font-weight:600;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i> B\u1ea1n s\u1ebd nh\u1eadn \u0111\u01b0\u1ee3c +' + greenCoinEst + ' GreenCoin sau khi \u0111\u1eb7t h\u00e0ng!</div>' +
        '<a href="checkout.html" class="btn btn-primary" style="width:100%;padding:1rem;border-radius:14px;font-size:1.05rem;font-weight:700;display:block;text-align:center"><i class="fa-solid fa-lock" style="margin-right:0.35rem"></i>Ti\u1ebfn H\u00e0nh Thanh To\u00e1n</a>' +
        '<p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:1rem"><i class="fa-solid fa-shield-halved" style="margin-right:0.25rem"></i>Thanh to\u00e1n an to\u00e0n & b\u1ea3o m\u1eadt</p>' +
      '</div>' +
    '</div>';
}

function removeCartItem(productId) {
  RefashionAuth.removeFromCart(productId);
  showToast('\u2705 \u0110\u00e3 x\u00f3a s\u1ea3n ph\u1ea9m kh\u1ecfi gi\u1ecf h\u00e0ng');
  renderCart();
}

function updateQty(productId, qty) {
  RefashionAuth.updateCartQuantity(productId, qty);
  renderCart();
}

/* ==================== PRODUCT DETAIL PAGE ==================== */
var PRODUCTS_DB = {
  '1': { id: '1', name: '\u00c1o Kho\u00e1c Gi\u00f3 Recycled Ocean-Plastic', category: '\u00c1o Kho\u00e1c Nam/N\u1eef', price: '1,250,000 \u0111', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200', ecoScore: 'A+', material: '100% Recycled Polyester (t\u1eeb r\u00e1c th\u1ea3i nh\u1ef1a \u0111\u1ea1i d\u01b0\u01a1ng)', description: 'Chi\u1ebfc \u00e1o kho\u00e1c gi\u00f3 si\u00eau nh\u1eb9, ch\u1ed1ng gi\u00f3 v\u00e0 ch\u1ed1ng n\u01b0\u1edbc c\u1ef1c t\u1ed1t, \u0111\u01b0\u1ee3c d\u1ec7t ho\u00e0n to\u00e0n t\u1eeb chai nh\u1ef1a thu gom tr\u00ean c\u00e1c v\u00f9ng bi\u1ec3n.', carbonFootprint: '3.2 kg CO\u2082e (Th\u1ea5p h\u01a1n 52% trung b\u00ecnh ng\u00e0nh)', waterSaved: '1,200 L\u00edt n\u01b0\u1edbc s\u1ea1ch', details: ['Ch\u1ea5t li\u1ec7u ch\u1ed1ng th\u1ea5m n\u01b0\u1edbc DWR th\u00e2n thi\u1ec7n kh\u00f4ng ch\u1ee9a PFC.', 'C\u00f3 m\u0169 tr\u00f9m \u0111\u1ea7u \u0111i\u1ec1u ch\u1ec9nh \u0111\u01b0\u1ee3c v\u00e0 kh\u00f3a k\u00e9o YKK t\u00e1i sinh.', 'T\u00fai ng\u1ef1c c\u00f3 kh\u00f3a k\u00e9o r\u1ed9ng r\u00e3i \u0111\u1ec3 \u0111\u1ef1ng v\u1eadt d\u1ee5ng.', 'C\u00f3 th\u1ec3 g\u1ea5p g\u1ecdn v\u00e0o t\u00fai ng\u1ef1c ti\u1ec7n l\u1ee3i khi di chuy\u1ec3n.'] },
  '2': { id: '2', name: 'Balo Leo N\u00fai Eco-Trail 30L', category: 'Ph\u1ee5 Ki\u1ec7n D\u00e3 Ngo\u1ea1i', price: '1,890,000 \u0111', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200', ecoScore: 'A', material: '100% Recycled Nylon (t\u1eeb l\u01b0\u1edbi \u0111\u00e1nh c\u00e1 c\u0169)', description: 'Balo chuy\u00ean d\u1ee5ng cho d\u00e3 ngo\u1ea1i v\u00e0 leo n\u00fai v\u1edbi dung t\u00edch 30L. \u0110\u01b0\u1ee3c s\u1ea3n xu\u1ea5t t\u1eeb l\u01b0\u1edbi \u0111\u00e1nh c\u00e1 b\u1ecf hoang t\u00e1i ch\u1ebf.', carbonFootprint: '4.8 kg CO\u2082e (Th\u1ea5p h\u01a1n 38% trung b\u00ecnh ng\u00e0nh)', waterSaved: '850 L\u00edt n\u01b0\u1edbc s\u1ea1ch', details: ['Khung \u0111\u1ec7m l\u01b0ng b\u1eb1ng l\u01b0\u1edbi tho\u00e1ng kh\u00ed t\u1ed5 ong ch\u1ed1ng m\u1ed3 h\u00f4i.', '\u0110ai h\u00f4ng v\u00e0 \u0111ai ng\u1ef1c c\u00f3 th\u1ec3 \u0111i\u1ec1u ch\u1ec9nh linh ho\u1ea1t.', 'T\u00edch h\u1ee3p ng\u0103n \u0111\u1ef1ng t\u00fai n\u01b0\u1edbc chuy\u00ean d\u1ee5ng.', 'V\u1ea3i Nylon ch\u1ed1ng x\u01b0\u1edbc cao c\u1ea5p, b\u1ea3o h\u00e0nh 5 n\u0103m.'] },
  '3': { id: '3', name: '\u00c1o Thun Polo Organic Cotton', category: '\u00c1o Thun Unisex', price: '450,000 \u0111', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200', ecoScore: 'A+', material: '100% Cotton H\u1eefu C\u01a1 (Organic Cotton)', description: '\u00c1o thun polo c\u1ed5 \u0111i\u1ec3n l\u1ecbch s\u1ef1, \u0111\u01b0\u1ee3c l\u00e0m t\u1eeb b\u00f4ng h\u1eefu c\u01a1 tr\u1ed3ng t\u1ef1 nhi\u00ean kh\u00f4ng s\u1eed d\u1ee5ng thu\u1ed1c tr\u1eeb s\u00e2u h\u00f3a h\u1ecdc.', carbonFootprint: '1.5 kg CO\u2082e (Th\u1ea5p h\u01a1n 60% trung b\u00ecnh ng\u00e0nh)', waterSaved: '2,400 L\u00edt n\u01b0\u1edbc s\u1ea1ch', details: ['V\u1ea3i d\u1ec7t thun c\u00e1 s\u1ea5u d\u00e0y d\u1eb7n, \u0111\u1ee9ng phom.', 'Nhu\u1ed9m m\u00e0u t\u1ef1 nhi\u00ean chi\u1ebft xu\u1ea5t t\u1eeb c\u1ecf c\u00e2y th\u1ea3o m\u1ed9c.', 'C\u00fac \u00e1o l\u00e0m t\u1eeb v\u1ecf d\u1eeba t\u1ef1 nhi\u00ean \u00e9p nhi\u1ec7t.', 'B\u1ec1n m\u00e0u v\u00e0 h\u1ea1n ch\u1ebf co r\u00fat t\u1ed1i \u0111a khi gi\u1eb7t m\u00e1y.'] }
};

function initDetailPage() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id') || '1';
  var product = PRODUCTS_DB[id] || PRODUCTS_DB['1'];
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderProductDetail(product);
  initReviewSystem(product);
}

function renderProductDetail(product) {
  var container = document.getElementById('detail-content');
  if (!container) return;
  var priceNum = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
  container.innerHTML =
    '<div class="container">' +
      '<div class="detail-breadcrumb"><a href="index.html">Trang ch\u1ee7</a> / <a href="shop.html">C\u1eeda h\u00e0ng</a> / <span style="color:var(--primary);font-weight:600">' + product.name + '</span></div>' +
      '<div class="detail-grid">' +
        '<div class="detail-image"><img src="' + product.image + '" alt="' + product.name + '" /></div>' +
        '<div class="detail-info">' +
          '<div class="detail-badges"><span class="badge badge-primary" style="font-size:0.8rem">Eco-Score: ' + product.ecoScore + '</span><span class="badge badge-accent" style="font-size:0.8rem">1% For Planet</span></div>' +
          '<h1 class="detail-name">' + product.name + '</h1>' +
          '<p class="detail-price">' + product.price + '</p>' +
          '<div class="detail-material"><p style="font-weight:700;font-size:0.95rem;margin-bottom:0.5rem">\ud83c\udf3f Nguy\u00ean li\u1ec7u th\u00e2n thi\u1ec7n:</p><p style="color:var(--text-muted);font-size:0.95rem">' + product.material + '</p></div>' +
          '<p class="detail-desc">' + product.description + '</p>' +
          '<div class="detail-impact">' +
            '<div class="impact-item"><span class="impact-label">D\u1ea5u ch\u00e2n Carbon</span><p class="impact-value">' + product.carbonFootprint + '</p></div>' +
            '<div class="impact-item accent"><span class="impact-label">N\u01b0\u1edbc Ti\u1ebft Ki\u1ec7m</span><p class="impact-value">' + product.waterSaved + '</p></div>' +
          '</div>' +
          '<div class="detail-actions">' +
            '<button onclick="handleAddToCart(\'' + product.id + '\',\'' + product.name + '\',' + priceNum + ',\'' + product.price + '\',\'' + product.image + '\',\'' + product.ecoScore + '\')" class="btn btn-outline" style="border-color:var(--primary);color:var(--primary)"><i class="fa-solid fa-bag-shopping" style="margin-right:0.35rem"></i>Th\u00eam v\u00e0o Gi\u1ecf H\u00e0ng</button>' +
            '<button onclick="handleBuyNow(\'' + product.id + '\')" class="btn btn-primary"><i class="fa-solid fa-bolt" style="margin-right:0.35rem"></i>Mua Ngay</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-specs">' +
        '<div><h3 style="font-family:var(--font-serif);font-size:1.5rem;margin-bottom:1.25rem;color:var(--primary)">Chi ti\u1ebft Thi\u1ebft k\u1ebf & T\u00e1c \u0111\u1ed9ng</h3><ul class="specs-list">' +
          product.details.map(function(d) { return '<li><i class="fa-solid fa-circle-check"></i><span>' + d + '</span></li>'; }).join('') +
        '</ul></div>' +
        '<div id="ai-dashboard" class="ai-dashboard"></div>' +
      '</div>' +
      '<div class="review-section" id="review-section">' +
        '<h3>\u0110\u00e1nh Gi\u00e1 & Nh\u1eadn X\u00e9t t\u1eeb Kh\u00e1ch H\u00e0ng</h3>' +
        '<div class="review-layout">' +
          '<div class="review-form-card" id="review-form-card">' +
            '<h4>\u0110\u00e1nh Gi\u00e1 S\u1ea3n Ph\u1ea9m</h4>' +
            '<form id="review-form">' +
              '<div class="form-group"><label>H\u1ecd & T\u00ean</label><input type="text" id="review-name" placeholder="Nh\u1eadp t\u00ean c\u1ee7a b\u1ea1n..." required /></div>' +
              '<div class="form-group"><label>\u0110\u00e1nh gi\u00e1 s\u1ed1 sao</label><select id="review-rating"><option value="5">\u2b50\u2b50\u2b50\u2b50\u2b50 (5 sao - Tuy\u1ec7t v\u1eddi)</option><option value="4">\u2b50\u2b50\u2b50\u2b50 (4 sao - T\u1ed1t)</option><option value="3">\u2b50\u2b50\u2b50 (3 sao - B\u00ecnh th\u01b0\u1eddng)</option><option value="2">\u2b50\u2b50 (2 sao - K\u00e9m)</option><option value="1">\u2b50 (1 sao - R\u1ea5t t\u1ec7)</option></select></div>' +
              '<div class="form-group"><label>N\u1ed9i dung nh\u1eadn x\u00e9t</label><textarea id="review-text" rows="4" placeholder="Vi\u1ebft \u0111\u00e1nh gi\u00e1 c\u1ee7a b\u1ea1n t\u1ea1i \u0111\u00e2y..." required></textarea></div>' +
              '<div id="ai-visualizer" class="ai-visualizer" style="display:none"></div>' +
              '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px">G\u1eedi Nh\u1eadn X\u00e9t & Ph\u00e2n T\u00edch</button>' +
            '</form>' +
          '</div>' +
          '<div class="review-list" id="review-list"></div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function initReviewSystem(product) {
  var reviews = JSON.parse(JSON.stringify(product.initialReviews || []));
  renderReviews(reviews);
  renderAIDashboard(reviews);

  var textarea = document.getElementById('review-text');
  var visualizer = document.getElementById('ai-visualizer');
  if (textarea && visualizer) {
    textarea.addEventListener('input', function() {
      if (this.value.trim().length > 0) {
        visualizer.style.display = 'block';
        analyzeSentiment(this.value, visualizer);
      } else {
        visualizer.style.display = 'none';
      }
    });
  }

  var form = document.getElementById('review-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('review-name').value;
      var rating = parseInt(document.getElementById('review-rating').value);
      var text = document.getElementById('review-text').value;
      if (!name.trim() || !text.trim()) return;
      var analysis = analyzeText(text);
      var isGreen = analysis.detectedGreenKeywords.length > 0;
      var review = {
        id: reviews.length + 1,
        user: name,
        avatar: name.charAt(0).toUpperCase(),
        rating: rating,
        date: new Date().toLocaleDateString('vi-VN'),
        comment: text,
        sentiment: analysis.sentiment,
        isGreenReview: isGreen
      };
      reviews.unshift(review);
      renderReviews(reviews);
      renderAIDashboard(reviews);
      if (isGreen) { showRewardPopup(15); } else { showRewardPopup(5); }
      document.getElementById('review-name').value = '';
      document.getElementById('review-text').value = '';
      document.getElementById('review-rating').value = '5';
      visualizer.style.display = 'none';
    });
  }
}

function analyzeText(text) {
  var t = text.toLowerCase();
  var posWords = ['b\u1ec1n','t\u1ed1t','\u0111\u1eb9p','m\u00e1t','\u00eam','th\u00edch','h\u00e0i l\u00f2ng','y\u00eau','x\u1ecbn','ch\u1ea5t l\u01b0\u1ee3ng','\u01b0ng \u00fd','recommend'];
  var negWords = ['t\u1ec7','h\u1ecfng','r\u00e1ch','k\u00e9m','m\u1ecfng','\u0111\u1eaft','ch\u1eadt','r\u00edt','th\u1ea5t v\u1ecdng','x\u1ea5u','n\u00f3ng','b\u00ed'];
  var greenWords = ['t\u00e1i ch\u1ebf','recycled','h\u1eefu c\u01a1','organic','thi\u00ean nhi\u00ean','m\u00f4i tr\u01b0\u1eddng','xanh','b\u1ec1n v\u1eefng','t\u1ef1 nhi\u00ean','eco','v\u1ecf d\u1eeba','gi\u1ea3m thi\u1ec3u'];
  var posCount = 0, negCount = 0;
  var detectedGreens = [];
  for (var i = 0; i < posWords.length; i++) { if (t.indexOf(posWords[i]) !== -1) posCount += 1.5; }
  for (var i = 0; i < negWords.length; i++) { if (t.indexOf(negWords[i]) !== -1) negCount += 1.5; }
  for (var i = 0; i < greenWords.length; i++) {
    if (t.indexOf(greenWords[i]) !== -1) {
      posCount += 0.5;
      if (detectedGreens.indexOf(greenWords[i]) === -1) detectedGreens.push(greenWords[i]);
    }
  }
  var total = posCount + negCount;
  var score = total > 0 ? Math.round((posCount / total) * 100) : 50;
  var sentiment = 'neutral';
  if (score > 60) sentiment = 'positive';
  else if (score < 40) sentiment = 'negative';
  return { sentiment: sentiment, score: score, detectedGreenKeywords: detectedGreens };
}

function analyzeSentiment(text, container) {
  var result = analyzeText(text);
  var scoreColor = result.score > 60 ? 'var(--sentiment-pos)' : result.score < 40 ? 'var(--sentiment-neg)' : 'var(--sentiment-neu)';
  var sentimentBadge = result.sentiment === 'positive' ? '\ud83d\ude0a T\u00edch c\u1ef1c' : result.sentiment === 'negative' ? '\ud83d\ude20 Ti\u00eau c\u1ef1c' : '\ud83d\ude10 Trung l\u1eadp';
  var badgeBg = result.sentiment === 'positive' ? 'var(--sentiment-pos-light)' : result.sentiment === 'negative' ? 'var(--sentiment-neg-light)' : 'var(--sentiment-neu-light)';
  var badgeColor = result.sentiment === 'positive' ? 'var(--sentiment-pos)' : result.sentiment === 'negative' ? 'var(--sentiment-neg)' : 'var(--sentiment-neu)';
  var greenHtml = '';
  if (result.detectedGreenKeywords.length > 0) {
    greenHtml = '<div class="ai-keywords-detected"><i class="fa-solid fa-leaf"></i><span>Ph\u00e1t hi\u1ec7n t\u1eeb kh\u00f3a Xanh: </span>';
    for (var i = 0; i < result.detectedGreenKeywords.length; i++) {
      greenHtml += '<strong style="background-color:var(--sentiment-pos-light);padding:0.05rem 0.25rem;border-radius:4px">#' + result.detectedGreenKeywords[i] + '</strong>';
    }
    greenHtml += '<span style="color:var(--accent);margin-left:0.25rem">(\u0110\u01b0\u1ee3c t\u1eb7ng +15 GreenCoin!)</span></div>';
  } else {
    greenHtml = '<p style="font-size:0.7rem;color:var(--text-muted)">\ud83d\udca1 Nh\u1eafc t\u1edbi v\u1eadt li\u1ec7u <strong>h\u1eefu c\u01a1, t\u00e1i ch\u1ebf, b\u1ea3o v\u1ec7 m\u00f4i tr\u01b0\u1eddng, xanh</strong> \u0111\u1ec3 nh\u1eadn ngay +15 GreenCoin!</p>';
  }
  container.innerHTML =
    '<div class="ai-visualizer-header">' +
      '<span style="font-size:0.8rem;font-weight:700;color:var(--primary)"><i class="fa-solid fa-robot"></i> M\u00f4 Ph\u1ecfng Ph\u00e2n T\u00edch AI:</span>' +
      '<span class="badge" style="background-color:' + badgeBg + ';color:' + badgeColor + ';text-transform:none;font-size:0.7rem">' + sentimentBadge + '</span>' +
    '</div>' +
    '<div class="ai-score-bar">' +
      '<div class="ai-score-track"><div class="ai-score-fill" style="width:' + result.score + '%;background-color:' + scoreColor + '"></div></div>' +
      '<span style="font-size:0.75rem;font-weight:700">' + result.score + '%</span>' +
    '</div>' +
    greenHtml;
}

function renderAIDashboard(reviews) {
  var container = document.getElementById('ai-dashboard');
  if (!container) return;
  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem">Ch\u01b0a c\u00f3 \u0111\u00e1nh gi\u00e1 n\u00e0o.</p>';
    return;
  }
  var pos = 0, neu = 0, neg = 0, greenCount = 0;
  for (var i = 0; i < reviews.length; i++) {
    if (reviews[i].sentiment === 'positive') pos++;
    else if (reviews[i].sentiment === 'neutral') neu++;
    else neg++;
    if (reviews[i].isGreenReview) greenCount++;
  }
  var total = reviews.length;
  var posPct = Math.round((pos / total) * 100);
  var neuPct = Math.round((neu / total) * 100);
  var negPct = Math.round((neg / total) * 100);
  var trustScore = Math.min(100, Math.round(((pos + (greenCount * 0.2)) / total) * 100));
  container.innerHTML =
    '<div class="ai-header">' +
      '<div><span class="badge badge-success" style="margin-bottom:0.5rem">AI Analytics</span><h3 style="font-size:1.35rem;font-weight:800">Ch\u1ec9 S\u1ed1 C\u1ea3m X\u00fac Kh\u00e1ch H\u00e0ng</h3></div>' +
      '<div style="text-align:right"><p class="ai-trust-score">' + trustScore + '%</p><p class="ai-trust-label">Green Trust Score</p></div>' +
    '</div>' +
    '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem">\u0110\u01b0\u1ee3c t\u1ef1 \u0111\u1ed9ng t\u1ed5ng h\u1ee3p b\u1eb1ng m\u00f4 h\u00ecnh AI ph\u00e2n t\u00edch s\u1eafc th\u00e1i c\u1ee7a t\u1ea5t c\u1ea3 c\u00e1c b\u00e0i review th\u1ef1c t\u1ebf.</p>' +
    '<div class="ai-bar">' +
      '<div><div class="ai-bar-row"><span style="color:var(--sentiment-pos)"><i class="fa-solid fa-face-smile"></i> T\u00edch c\u1ef1c</span><span>' + posPct + '%</span></div><div class="ai-bar-track"><div class="ai-bar-fill" style="width:' + posPct + '%;background-color:var(--sentiment-pos)"></div></div></div>' +
      '<div><div class="ai-bar-row"><span style="color:var(--sentiment-neu)"><i class="fa-solid fa-face-meh"></i> Trung l\u1eadp</span><span>' + neuPct + '%</span></div><div class="ai-bar-track"><div class="ai-bar-fill" style="width:' + neuPct + '%;background-color:var(--sentiment-neu)"></div></div></div>' +
      '<div><div class="ai-bar-row"><span style="color:var(--sentiment-neg)"><i class="fa-solid fa-face-frown"></i> Ti\u00eau c\u1ef1c</span><span>' + negPct + '%</span></div><div class="ai-bar-track"><div class="ai-bar-fill" style="width:' + negPct + '%;background-color:var(--sentiment-neg)"></div></div></div>' +
    '</div>' +
    '<div class="ai-keywords"><span style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:var(--text-muted);display:block;width:100%;margin-bottom:0.5rem">T\u1eeb kh\u00f3a n\u1ed5i b\u1eadt t\u1eeb AI:</span>' +
      '<span class="badge badge-primary" style="text-transform:none;font-size:0.75rem">#si\u00eau_nh\u1eb9</span>' +
      '<span class="badge badge-primary" style="text-transform:none;font-size:0.75rem">#v\u1ea3i_t\u00e1i_ch\u1ebf_m\u01b0\u1ee3t</span>' +
      '<span class="badge badge-primary" style="text-transform:none;font-size:0.75rem">#c\u1ea3n_gi\u00f3_t\u1ed1t</span>' +
      '<span class="badge badge-accent" style="text-transform:none;font-size:0.75rem">#b\u1ec1n_v\u1eefng</span>' +
      '<span class="badge badge-success" style="text-transform:none;font-size:0.75rem">#b\u1ea3o_v\u1ec7_m\u00f4i_tr\u01b0\u1eddng</span>' +
    '</div>';
}

function renderReviews(reviews) {
  var container = document.getElementById('review-list');
  if (!container) return;
  var html = '';
  for (var i = 0; i < reviews.length; i++) {
    var r = reviews[i];
    var sentimentBadge = r.sentiment === 'positive' ? '\ud83d\ude0a T\u00edch c\u1ef1c' : r.sentiment === 'negative' ? '\ud83d\ude20 Ti\u00eau c\u1ef1c' : '\ud83d\ude10 Trung l\u1eadp';
    var badgeBg = r.sentiment === 'positive' ? 'var(--sentiment-pos-light)' : r.sentiment === 'negative' ? 'var(--sentiment-neg-light)' : 'var(--sentiment-neu-light)';
    var badgeColor = r.sentiment === 'positive' ? 'var(--sentiment-pos)' : r.sentiment === 'negative' ? 'var(--sentiment-neg)' : 'var(--sentiment-neu)';
    var greenBadge = r.isGreenReview ? '<span class="badge badge-primary" style="font-size:0.65rem;text-transform:none"><i class="fa-solid fa-leaf"></i> \u0110\u00e1nh Gi\u00e1 Xanh</span>' : '';
    html +=
      '<div class="review-item">' +
        '<div class="review-header">' +
          '<div class="review-user">' +
            '<div class="review-avatar" style="background-color:var(--primary-light);color:var(--primary)">' + r.avatar + '</div>' +
            '<div><h4 style="font-weight:700;font-size:0.95rem">' + r.user + '</h4><span style="font-size:0.75rem;color:var(--text-muted)">' + r.date + '</span></div>' +
          '</div>' +
          '<div class="review-badges">' + greenBadge +
            '<span class="badge" style="background-color:' + badgeBg + ';color:' + badgeColor + ';text-transform:none;font-size:0.65rem">' + sentimentBadge + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="review-stars">' + '\u2b50'.repeat(r.rating) + '</div>' +
        '<p class="review-text">' + r.comment + '</p>' +
      '</div>';
  }
  container.innerHTML = html;
}

function showRewardPopup(coin) {
  var existing = document.getElementById('reward-popup');
  if (existing) existing.remove();
  var popup = document.createElement('div');
  popup.id = 'reward-popup';
  popup.style.cssText = 'position:fixed;top:20px;right:20px;background-color:var(--primary);color:white;padding:1rem 2rem;border-radius:15px;box-shadow:0 10px 30px var(--shadow-lg);z-index:9999;display:flex;align-items:center;gap:1rem;border:2px solid var(--accent);animation:fadeInUp 0.3s ease';
  popup.innerHTML =
    '<i class="fa-solid fa-circle-check" style="font-size:1.5rem;color:var(--accent)"></i>' +
    '<div><h4 style="font-weight:700">Ph\u00e2n t\u00edch AI ho\u00e0n t\u1ea5t!</h4><p style="font-size:0.85rem">C\u1ea3m \u01a1n \u0111\u00e1nh gi\u00e1 c\u1ee7a b\u1ea1n. B\u1ea1n \u0111\u01b0\u1ee3c c\u1ed9ng <strong>+' + coin + ' GreenCoin</strong>! \ud83c\udf40</p></div>' +
    '<button onclick="this.parentElement.remove()" style="background:transparent;border:0;color:white;cursor:pointer;margin-left:1rem"><i class="fa-solid fa-xmark"></i></button>';
  document.body.appendChild(popup);
  setTimeout(function() { if (popup.parentElement) popup.remove(); }, 5000);
}

function handleAddToCart(id, name, price, priceStr, image, ecoScore) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=shop-detail.html?id=' + id; return; }
  RefashionAuth.addToCart({ productId: id, name: name, price: price, priceStr: priceStr, image: image, ecoScore: ecoScore });
  showToast('\u0110\u00e3 th\u00eam "' + name + '" v\u00e0o gi\u1ecf h\u00e0ng!');
}

function handleBuyNow(id) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=checkout.html?buyNow=' + id; return; }
  window.location.href = 'checkout.html?buyNow=' + id;
}

/* ==================== CHECKOUT PAGE ==================== */
var PROVINCES = ['TP. H\u1ed3 Ch\u00ed Minh','H\u00e0 N\u1ed9i','\u0110\u00e0 N\u1eb5ng','C\u1ea7n Th\u01a1','H\u1ea3i Ph\u00f2ng','B\u00ecnh D\u01b0\u01a1ng','\u0110\u1ed3ng Nai','Long An','B\u00e0 R\u1ecba \u2013 V\u0169ng T\u00e0u','B\u1eafc Ninh','Kh\u00e1nh H\u00f2a','L\u00e2m \u0110\u1ed3ng','Ngh\u1ec7 An','Th\u1eeba Thi\u00ean Hu\u1ebf','Qu\u1ea3ng Ninh'];

function initCheckoutPage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=checkout.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderCheckoutForm();
}

function renderCheckoutForm() {
  var container = document.getElementById('checkout-content');
  if (!container) return;
  var user = RefashionAuth._getUser();
  var params = new URLSearchParams(window.location.search);
  var buyNowId = params.get('buyNow');
  var cart = RefashionAuth._getCart();
  var items = [];
  if (buyNowId && PRODUCTS_DB[buyNowId]) {
    var p = PRODUCTS_DB[buyNowId];
    var priceNum = parseInt(p.price.replace(/[^0-9]/g, ''), 10);
    items = [{ productId: p.id, name: p.name, price: priceNum, priceStr: p.price, image: p.image, quantity: 1, ecoScore: p.ecoScore }];
  } else {
    items = JSON.parse(JSON.stringify(cart));
  }
  if (items.length === 0) {
    container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:40vh;flex-direction:column;gap:1rem"><i class="fa-solid fa-bag-shopping" style="font-size:3rem;color:var(--text-muted);opacity:0.3"></i><p style="color:var(--text-muted);font-size:1.1rem">Kh\u00f4ng c\u00f3 s\u1ea3n ph\u1ea9m n\u00e0o \u0111\u1ec3 thanh to\u00e1n.</p><a href="shop.html" class="btn btn-primary" style="border-radius:12px">Quay l\u1ea1i C\u1eeda H\u00e0ng</a></div>';
    return;
  }
  var subtotal = items.reduce(function(s, i) { return s + i.price * i.quantity; }, 0);
  var getDeliveryRange = function() {
    var now = new Date();
    var from = new Date(now); from.setDate(from.getDate() + 3);
    var to = new Date(now); to.setDate(to.getDate() + 5);
    return ('0' + from.getDate()).slice(-2) + '/' + ('0' + (from.getMonth()+1)).slice(-2) + '/' + from.getFullYear() + ' \u2014 ' +
           ('0' + to.getDate()).slice(-2) + '/' + ('0' + (to.getMonth()+1)).slice(-2) + '/' + to.getFullYear();
  };
  window._checkoutData = { items: items, subtotal: subtotal, buyNowId: buyNowId };
  var itemsHtml = '';
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    itemsHtml +=
      '<div style="display:flex;gap:0.75rem;align-items:center">' +
        '<img src="' + item.image + '" style="width:56px;height:56px;border-radius:10px;object-fit:cover;border:1px solid var(--border)" />' +
        '<div style="flex:1;overflow:hidden"><p style="font-size:0.85rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</p><p style="font-size:0.78rem;color:var(--text-muted)">x' + item.quantity + ' \u2022 ' + item.priceStr + '</p></div>' +
        '<span style="font-weight:700;font-size:0.9rem">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' \u0111</span>' +
      '</div>';
  }
  container.innerHTML =
    '<div class="checkout-layout" id="checkout-layout">' +
      '<div class="checkout-form-section">' +
        '<div class="checkout-card">' +
          '<h3><i class="fa-solid fa-location-dot"></i> Th\u00f4ng Tin Giao H\u00e0ng</h3>' +
          '<div class="form-row">' +
            '<div><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">H\u1ecd v\u00e0 T\u00ean *</label><input type="text" id="checkout-name" value="' + (user.username || '') + '" placeholder="Nguy\u1ec5n V\u0103n A" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;box-sizing:border-box" /></div>' +
            '<div><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">S\u1ed1 \u0110i\u1ec7n Tho\u1ea1i *</label><input type="tel" id="checkout-phone" value="' + (user.phone || '') + '" placeholder="0912 345 678" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;box-sizing:border-box" /></div>' +
          '</div>' +
          '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">T\u1ec9nh / Th\u00e0nh Ph\u1ed1 *</label><select id="checkout-province" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem"><option value="">\u2014 Ch\u1ecdn t\u1ec9nh/th\u00e0nh ph\u1ed1 \u2014</option>' + PROVINCES.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join('') + '</select></div>' +
          '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">\u0110\u1ecba Ch\u1ec9 Chi Ti\u1ebft *</label><input type="text" id="checkout-address" placeholder="S\u1ed1 nh\u00e0, t\u00ean \u0111\u01b0\u1eddng, ph\u01b0\u1eddng/x\u00e3, qu\u1eadn/huy\u1ec7n" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;box-sizing:border-box" /></div>' +
          '<div><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Ghi Ch\u00fa (T\u00f9y ch\u1ecdn)</label><textarea id="checkout-note" rows="3" placeholder="V\u00ed d\u1ee5: Giao ngo\u00e0i gi\u1edd h\u00e0nh ch\u00ednh, g\u1ecdi tr\u01b0\u1edbc 30 ph\u00fat..." style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;resize:vertical;box-sizing:border-box"></textarea></div>' +
        '</div>' +
        '<div class="checkout-card">' +
          '<h3><i class="fa-solid fa-credit-card"></i> Ph\u01b0\u01a1ng Th\u1ee9c Thanh To\u00e1n</h3>' +
          '<div style="display:flex;flex-direction:column;gap:0.75rem">' +
            '<div class="payment-option selected" id="payment-cod" onclick="selectPayment(\'cod\')">' +
              '<div class="payment-radio"></div>' +
              '<div><p style="font-weight:700;font-size:0.95rem"><i class="fa-solid fa-money-bill-wave" style="margin-right:0.35rem;color:var(--sentiment-pos)"></i> Thanh to\u00e1n khi nh\u1eadn h\u00e0ng (COD)</p><p style="font-size:0.8rem;color:var(--text-muted)">Thanh to\u00e1n b\u1eb1ng ti\u1ec1n m\u1eb7t khi nh\u1eadn h\u00e0ng</p></div>' +
            '</div>' +
            '<div class="payment-option" id="payment-momo" onclick="selectPayment(\'momo\')">' +
              '<div class="payment-radio" style="border-color:var(--border)"></div>' +
              '<div><p style="font-weight:700;font-size:0.95rem"><i class="fa-solid fa-wallet" style="margin-right:0.35rem;color:#a50064"></i> V\u00ed MoMo <span class="badge" style="margin-left:0.5rem;background-color:#fef0f8;color:#a50064;font-size:0.6rem;border:1px solid #a50064">Sandbox</span></p><p style="font-size:0.8rem;color:var(--text-muted)">Thanh to\u00e1n qua v\u00ed \u0111i\u1ec7n t\u1eed MoMo (m\u00f4i tr\u01b0\u1eddng test)</p></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="delivery-estimate"><i class="fa-solid fa-truck-fast" style="font-size:2rem;opacity:0.8"></i><div><p style="font-weight:700;font-size:0.95rem;margin-bottom:0.25rem">Th\u1eddi gian giao h\u00e0ng d\u1ef1 ki\u1ebfn</p><p style="font-size:1.25rem;font-weight:900">\ud83d\udce6 ' + getDeliveryRange() + '</p><p style="font-size:0.8rem;opacity:0.85;margin-top:0.25rem">Mi\u1ec5n ph\u00ed v\u1eadn chuy\u1ec3n cho \u0111\u01a1n h\u00e0ng th\u00e2n thi\u1ec7n m\u00f4i tr\u01b0\u1eddng</p></div></div>' +
      '</div>' +
      '<div style="position:sticky;top:90px" id="checkout-summary">' +
        '<div class="checkout-card">' +
          '<h3>T\u00f3m T\u1eaft \u0110\u01a1n H\u00e0ng</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">' + itemsHtml + '</div>' +
          '<hr style="border:0;border-top:1px solid var(--border);margin-bottom:1.25rem" />' +
          '<div style="margin-bottom:1.25rem">' +
            '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.5rem"><i class="fa-solid fa-ticket" style="margin-right:0.35rem;color:var(--accent)"></i> M\u00e3 Voucher</label>' +
            '<div id="voucher-section" style="display:flex;gap:0.5rem">' +
              '<input type="text" id="voucher-input" placeholder="Nh\u1eadp m\u00e3 voucher..." style="flex:1;padding:0.65rem 1rem;border-radius:10px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.85rem" />' +
              '<button onclick="applyVoucherCode()" class="btn btn-outline" style="padding:0.65rem 1rem;border-radius:10px;font-size:0.8rem">\u00c1p d\u1ee5ng</button>' +
            '</div>' +
            '<div id="voucher-applied" style="display:none"></div>' +
            '<p id="voucher-error" style="font-size:0.72rem;color:#ef4444;margin-top:0.25rem;display:none"></p>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid var(--border);margin-bottom:1.25rem" />' +
          '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">T\u1ea1m t\u00ednh</span><span style="font-weight:600" id="checkout-subtotal">' + subtotal.toLocaleString('vi-VN') + ' \u0111</span></div>' +
            '<div id="checkout-discount-row" style="display:none"><div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--sentiment-pos)">Gi\u1ea3m gi\u00e1</span><span style="font-weight:600;color:var(--sentiment-pos)" id="checkout-discount-amount">0 \u0111</span></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Ph\u00ed v\u1eadn chuy\u1ec3n</span><span style="font-weight:600;color:var(--sentiment-pos)">Mi\u1ec5n ph\u00ed</span></div>' +
          '</div>' +
          '<hr style="border:0;border-top:2px solid var(--primary);margin-bottom:1.25rem" />' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:1rem"><span style="font-size:1.15rem;font-weight:700">T\u1ed5ng c\u1ed9ng</span><span style="font-size:1.5rem;font-weight:900;color:var(--accent)" id="checkout-total">' + subtotal.toLocaleString('vi-VN') + ' \u0111</span></div>' +
          '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:0.75rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;font-weight:600;color:var(--sentiment-pos)" id="checkout-greencoin-estimate"><i class="fa-solid fa-leaf"></i> Nh\u1eadn +' + (Math.floor(subtotal / 100000) * 5) + ' GreenCoin sau khi \u0111\u1eb7t h\u00e0ng!</div>' +
          '<button onclick="placeOrder()" class="btn btn-primary" style="width:100%;padding:1rem;border-radius:14px;font-size:1.05rem;font-weight:700;display:block;text-align:center" id="place-order-btn"><i class="fa-solid fa-lock" style="margin-right:0.35rem"></i>X\u00e1c Nh\u1eadn \u0110\u1eb7t H\u00e0ng (COD)</button>' +
          '<p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:1rem"><i class="fa-solid fa-shield-halved" style="margin-right:0.25rem"></i>Thanh to\u00e1n an to\u00e0n & b\u1ea3o m\u1eadt</p>' +
        '</div>' +
      '</div>' +
    '</div>';
}

var checkoutPaymentMethod = 'cod';

function selectPayment(method) {
  checkoutPaymentMethod = method;
  var cod = document.getElementById('payment-cod');
  var momo = document.getElementById('payment-momo');
  var btn = document.getElementById('place-order-btn');
  if (cod) {
    cod.className = method === 'cod' ? 'payment-option selected' : 'payment-option';
    if (method === 'cod') cod.querySelector('.payment-radio').style.cssText = 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:6px solid var(--primary)';
    else cod.querySelector('.payment-radio').style.cssText = 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:2px solid var(--border)';
  }
  if (momo) {
    momo.className = method === 'momo' ? 'payment-option selected' : 'payment-option';
    if (method === 'momo') momo.querySelector('.payment-radio').style.cssText = 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:6px solid #a50064';
    else momo.querySelector('.payment-radio').style.cssText = 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:2px solid var(--border)';
  }
  if (btn) {
    if (method === 'momo') {
      btn.innerHTML = '<i class="fa-solid fa-wallet" style="margin-right:0.35rem"></i> Thanh To\u00e1n Qua MoMo';
      btn.style.background = 'linear-gradient(135deg, #a50064, #d82d8b)';
    } else {
      btn.innerHTML = '<i class="fa-solid fa-lock" style="margin-right:0.35rem"></i> X\u00e1c Nh\u1eadn \u0110\u1eb7t H\u00e0ng (COD)';
      btn.style.background = '';
    }
  }
}

function applyVoucherCode() {
  var input = document.getElementById('voucher-input');
  var code = input ? input.value.trim() : '';
  var errorEl = document.getElementById('voucher-error');
  if (!code) { if (errorEl) { errorEl.textContent = 'Vui l\u00f2ng nh\u1eadp m\u00e3 voucher.'; errorEl.style.display = 'block'; } return; }
  var voucher = RefashionAuth.applyVoucher(code);
  if (voucher) {
    var section = document.getElementById('voucher-section');
    var applied = document.getElementById('voucher-applied');
    if (section) section.style.display = 'none';
    if (applied) {
      applied.style.display = 'block';
      applied.innerHTML =
        '<div class="voucher-applied">' +
          '<div><p style="font-weight:700;font-size:0.85rem;color:var(--sentiment-pos)"><i class="fa-solid fa-check-circle" style="margin-right:0.25rem"></i>' + voucher.code + ' \u2014 Gi\u1ea3m ' + voucher.discount + '%</p><p style="font-size:0.75rem;color:var(--text-muted)">' + voucher.description + '</p></div>' +
          '<button onclick="removeVoucher()" style="background:transparent;border:none;cursor:pointer;color:var(--sentiment-neg);font-size:0.85rem"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>';
    }
    if (errorEl) errorEl.style.display = 'none';
    updateCheckoutTotal(voucher.discount);
  } else {
    if (errorEl) { errorEl.textContent = 'M\u00e3 voucher kh\u00f4ng h\u1ee3p l\u1ec7, \u0111\u00e3 h\u1ebft h\u1ea1n ho\u1eb7c \u0111\u00e3 \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng.'; errorEl.style.display = 'block'; }
  }
}

function removeVoucher() {
  var section = document.getElementById('voucher-section');
  var applied = document.getElementById('voucher-applied');
  if (section) section.style.display = 'flex';
  if (applied) { applied.style.display = 'none'; applied.innerHTML = ''; }
  updateCheckoutTotal(0);
}

function updateCheckoutTotal(discountPercent) {
  var data = window._checkoutData;
  if (!data) return;
  var discountAmount = Math.floor(data.subtotal * discountPercent / 100);
  var total = data.subtotal - discountAmount;
  var gcEst = Math.floor(total / 100000) * 5;
  var subtotalEl = document.getElementById('checkout-discount-amount');
  var totalEl = document.getElementById('checkout-total');
  var gcEl = document.getElementById('checkout-greencoin-estimate');
  var discountRow = document.getElementById('checkout-discount-row');
  if (discountPercent > 0) {
    if (discountRow) discountRow.style.display = 'block';
    if (subtotalEl) subtotalEl.textContent = '-' + discountAmount.toLocaleString('vi-VN') + ' \u0111';
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }
  if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + ' \u0111';
  if (gcEl) gcEl.innerHTML = '<i class="fa-solid fa-leaf"></i> Nh\u1eadn +' + gcEst + ' GreenCoin sau khi \u0111\u1eb7t h\u00e0ng!';
}

function placeOrder() {
  var data = window._checkoutData;
  if (!data) return;
  var name = document.getElementById('checkout-name').value.trim();
  var phone = document.getElementById('checkout-phone').value.trim();
  var province = document.getElementById('checkout-province').value;
  var address = document.getElementById('checkout-address').value.trim();
  var note = document.getElementById('checkout-note').value.trim();
  var errs = [];
  if (!name) errs.push('H\u1ecd t\u00ean');
  if (!phone || phone.length < 9) errs.push('S\u1ed1 \u0111i\u1ec7n tho\u1ea1i');
  if (!province) errs.push('T\u1ec9nh/th\u00e0nh ph\u1ed1');
  if (!address) errs.push('\u0110\u1ecba ch\u1ec9 chi ti\u1ebft');
  if (errs.length > 0) { showToast('Vui l\u00f2ng nh\u1eadp: ' + errs.join(', ')); return; }
  var discountPercent = 0;
  var voucherCode = null;
  var applied = document.querySelector('.voucher-applied');
  if (applied) {
    var match = applied.textContent.match(/Gi\u1ea3m (\d+)%/);
    if (match) discountPercent = parseInt(match[1]);
    var codeMatch = applied.textContent.match(/(RF\d+-\w+)/);
    if (codeMatch) voucherCode = codeMatch[1];
  }
  if (checkoutPaymentMethod === 'momo') {
    showToast('\u0110ang chuy\u1ec3n \u0111\u1ebfn MoMo...');
    var btn = document.getElementById('place-order-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:0.35rem"></i> \u0110ang chuy\u1ec3n \u0111\u1ebfn MoMo...'; }
    var orderId = 'RF-' + Date.now().toString(36).toUpperCase();
    RefashionAuth.placeOrderWithDetails({ items: data.items, discountPercent: discountPercent, voucherCode: voucherCode, phone: phone, address: address + ', ' + province, note: note });
    window.open('momo-return.html?resultCode=0&orderId=' + orderId + '&amount=' + (data.subtotal - Math.floor(data.subtotal * discountPercent / 100)), '_blank');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-wallet" style="margin-right:0.35rem"></i> Thanh To\u00e1n Qua MoMo'; }
    showSuccessView(orderId, data.subtotal, discountPercent);
    return;
  }
  var order = RefashionAuth.placeOrderWithDetails({ items: data.items, discountPercent: discountPercent, voucherCode: voucherCode, phone: phone, address: address + ', ' + province, note: note });
  if (order) showSuccessView(order.id, order.total, 0);
}

function showSuccessView(orderId, total, gcEst) {
  var now = new Date();
  var from = new Date(now); from.setDate(from.getDate() + 3);
  var to = new Date(now); to.setDate(to.getDate() + 5);
  var deliveryRange = ('0' + from.getDate()).slice(-2) + '/' + ('0' + (from.getMonth()+1)).slice(-2) + '/' + from.getFullYear() + ' \u2014 ' +
    ('0' + to.getDate()).slice(-2) + '/' + ('0' + (to.getMonth()+1)).slice(-2) + '/' + to.getFullYear();
  var container = document.getElementById('checkout-content');
  if (!container) return;
  container.innerHTML =
    '<div class="success-view">' +
      '<div class="success-card animate-fade-in-up">' +
        '<div class="success-icon" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
        '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">\u0110\u1eb7t H\u00e0ng Th\u00e0nh C\u00f4ng! \ud83c\udf89</h2>' +
        '<p style="color:var(--text-muted);margin-bottom:0.5rem">M\u00e3 \u0111\u01a1n h\u00e0ng: <strong style="color:var(--primary)">#' + orderId + '</strong></p>' +
        '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;text-align:left">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;font-weight:700;color:var(--primary)"><i class="fa-solid fa-truck-fast"></i> Th\u1eddi gian giao h\u00e0ng d\u1ef1 ki\u1ebfn</div>' +
          '<p style="font-size:1.1rem;font-weight:800;color:var(--foreground)">\ud83d\udce6 ' + deliveryRange + '</p>' +
        '</div>' +
        '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:1rem;margin-bottom:2rem;display:inline-flex;align-items:center;gap:0.5rem;color:var(--sentiment-pos);font-weight:700;font-size:1rem"><i class="fa-solid fa-leaf"></i> B\u1ea1n \u0111\u01b0\u1ee3c c\u1ed9ng +' + (gcEst) + ' GreenCoin!</div>' +
        '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="profile.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Xem \u0110\u01a1n H\u00e0ng</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Ti\u1ebfp T\u1ee5c Mua S\u1eafm</a></div>' +
      '</div>' +
    '</div>';
}

/* ==================== PROFILE PAGE ==================== */
function initProfilePage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=profile.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderProfile();
}

function renderProfile() {
  var user = RefashionAuth._getUser();
  var container = document.getElementById('profile-content');
  if (!user || !container) return;
  var orders = RefashionAuth._getOrders();
  var donations = RefashionAuth._getDonations();
  var cartCount = RefashionAuth.getCartCount();
  var totalSpent = orders.reduce(function(s, o) { return s + o.total; }, 0);
  var totalCoinEarned = orders.reduce(function(s, o) { return s + o.greenCoinEarned; }, 0) + donations.reduce(function(s, d) { return s + d.coinEarned; }, 0);
  var totalDonatedItems = donations.reduce(function(s, d) { return s + d.quantity; }, 0);
  var estimatedCO2 = (totalSpent / 1000000 * 2.5 + totalDonatedItems * 0.3).toFixed(1);
  var ordersHtml = '';
  if (orders.length > 0) {
    for (var i = 0; i < orders.length; i++) {
      var o = orders[i];
      var statusBadge = o.status === 'delivered' ? 'var(--sentiment-pos-light)' : o.status === 'shipped' ? 'var(--accent-light)' : 'var(--sentiment-neu-light)';
      var statusColor = o.status === 'delivered' ? 'var(--sentiment-pos)' : o.status === 'shipped' ? 'var(--accent)' : 'var(--sentiment-neu)';
      var statusText = o.status === 'processing' ? '\u23f3 \u0110ang x\u1eed l\u00fd' : o.status === 'shipped' ? '\ud83d\ude9a \u0110ang giao' : '\u2705 \u0110\u00e3 giao';
      var itemsHtml = '';
      for (var j = 0; j < o.items.length; j++) {
        var item = o.items[j];
        itemsHtml +=
          '<div style="display:flex;align-items:center;gap:0.75rem;background-color:var(--card);padding:0.6rem 1rem;border-radius:12px;border:1px solid var(--border)">' +
            '<img src="' + item.image + '" style="width:40px;height:40px;border-radius:8px;object-fit:cover" />' +
            '<div><p style="font-size:0.8rem;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</p><p style="font-size:0.72rem;color:var(--text-muted)">x' + item.quantity + ' \u2022 ' + item.priceStr + '</p></div>' +
          '</div>';
      }
      ordersHtml +=
        '<div style="background-color:var(--background);border-radius:16px;border:1px solid var(--border);padding:1.5rem">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">' +
            '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap"><span style="font-weight:800;font-size:0.95rem;color:var(--primary)">#' + o.id + '</span><span style="font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-calendar" style="margin-right:0.3rem"></i>' + o.date + '</span></div>' +
            '<div style="display:flex;gap:0.75rem;align-items:center"><span class="badge" style="background-color:' + statusBadge + ';color:' + statusColor + ';text-transform:none;font-size:0.75rem">' + statusText + '</span><span style="font-weight:800;font-size:1.05rem;color:var(--accent)">' + o.totalStr + '</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;flex-wrap:wrap">' + itemsHtml + '</div>' +
          '<div style="margin-top:0.75rem;display:flex;align-items:center;gap:0.35rem;font-size:0.8rem;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i><span>+' + o.greenCoinEarned + ' GreenCoin \u0111\u01b0\u1ee3c c\u1ed9ng t\u1eeb \u0111\u01a1n h\u00e0ng n\u00e0y</span></div>' +
        '</div>';
    }
  } else {
    ordersHtml =
      '<div style="text-align:center;padding:4rem 2rem;color:var(--text-muted)">' +
        '<i class="fa-solid fa-receipt" style="font-size:3rem;margin-bottom:1rem;opacity:0.3"></i>' +
        '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o</h3>' +
        '<p style="font-size:0.9rem;margin-bottom:1.5rem">H\u00e3y b\u1eaft \u0111\u1ea7u mua s\u1eafm xanh \u0111\u1ec3 t\u1ea1o \u0111\u01a1n h\u00e0ng \u0111\u1ea7u ti\u00ean nh\u00e9!</p>' +
        '<a href="shop.html" class="btn btn-primary" style="border-radius:12px">Kh\u00e1m ph\u00e1 C\u1eeda H\u00e0ng</a>' +
      '</div>';
  }
  var donationsHtml = '';
  if (donations.length > 0) {
    for (var i = 0; i < donations.length; i++) {
      var d = donations[i];
      var typeName = d.clothingType === 'shirt' ? '\u00c1o Thun / \u00c1o S\u01a1 Mi' : d.clothingType === 'jacket' ? '\u00c1o Kho\u00e1c' : d.clothingType === 'pants' ? 'Qu\u1ea7n Jean / Kaki' : d.clothingType === 'dress' ? 'V\u00e1y / \u0110\u1ea7m' : 'Kh\u00e1c';
      var condName = d.condition === 'new' ? 'C\u00f2n r\u1ea5t m\u1edbi' : d.condition === 'good' ? 'C\u00f2n t\u1ed1t' : 'H\u01a1i c\u0169';
      donationsHtml +=
        '<div style="background-color:var(--background);border-radius:16px;border:1px solid var(--border);padding:1.25rem">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:0.75rem"><span style="font-weight:700;font-size:0.85rem;color:var(--primary)">#' + d.id + '</span><span style="font-size:0.75rem;color:var(--text-muted)">' + d.date + '</span></div>' +
          '<p style="font-size:0.9rem;font-weight:600;margin-bottom:0.35rem">' + typeName + ' \u2014 ' + d.quantity + ' m\u00f3n</p>' +
          '<p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.5rem">T\u00ecnh tr\u1ea1ng: ' + condName + '</p>' +
          '<div style="display:flex;align-items:center;gap:0.35rem;font-size:0.8rem;color:var(--sentiment-pos);font-weight:700"><i class="fa-solid fa-leaf"></i>+' + d.coinEarned + ' GreenCoin</div>' +
        '</div>';
    }
  } else {
    donationsHtml =
      '<div style="text-align:center;padding:4rem 2rem;color:var(--text-muted)">' +
        '<i class="fa-solid fa-hand-holding-heart" style="font-size:3rem;margin-bottom:1rem;opacity:0.3"></i>' +
        '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Ch\u01b0a c\u00f3 l\u01b0\u1ee3t quy\u00ean g\u00f3p n\u00e0o</h3>' +
        '<p style="font-size:0.9rem;margin-bottom:1.5rem">H\u00e3y quy\u00ean g\u00f3p qu\u1ea7n \u00e1o c\u0169 \u0111\u1ec3 nh\u1eadn GreenCoin v\u00e0 b\u1ea3o v\u1ec7 m\u00f4i tr\u01b0\u1eddng!</p>' +
        '<a href="community.html" class="btn btn-accent" style="border-radius:12px">Quy\u00ean G\u00f3p Ngay</a>' +
      '</div>';
  }
  container.innerHTML =
    '<div class="profile-hero">' +
      '<div class="profile-hero-bg"><i class="fa-solid fa-leaf"></i></div>' +
      '<div class="profile-hero-content">' +
        '<div class="profile-avatar">' + user.username.charAt(0).toUpperCase() + '</div>' +
        '<div class="profile-info"><h1>' + user.username + '</h1><div class="profile-meta"><span><i class="fa-solid fa-envelope" style="margin-right:0.4rem"></i>' + user.email + '</span><span><i class="fa-solid fa-phone" style="margin-right:0.4rem"></i>' + (user.phone || 'Ch\u01b0a c\u1eadp nh\u1eadt') + '</span><span><i class="fa-solid fa-calendar" style="margin-right:0.4rem"></i>Tham gia: ' + user.joinDate + '</span></div></div>' +
        '<div class="greencoin-badge"><p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;margin-bottom:0.35rem;color:var(--accent)">GreenCoin</p><p style="font-size:2.5rem;font-weight:900;display:flex;align-items:center;gap:0.5rem">' + (user.greenCoin || 0) + ' <i class="fa-solid fa-leaf" style="font-size:1.75rem;color:var(--accent)"></i></p></div>' +
      '</div>' +
    '</div>' +
    '<div class="stats-grid">' +
      '<div class="stat-card"><div class="stat-icon" style="background-color:var(--primary-light)"><i class="fa-solid fa-bag-shopping" style="font-size:1.2rem;color:var(--primary)"></i></div><div><p style="font-size:1.5rem;font-weight:800;color:var(--primary)">' + orders.length + '</p><p style="font-size:0.8rem;color:var(--text-muted);font-weight:500">\u0110\u01a1n h\u00e0ng</p></div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background-color:var(--accent-light)"><i class="fa-solid fa-cart-shopping" style="font-size:1.2rem;color:var(--accent)"></i></div><div><p style="font-size:1.5rem;font-weight:800;color:var(--accent)">' + cartCount + '</p><p style="font-size:0.8rem;color:var(--text-muted);font-weight:500">Trong gi\u1ecf</p></div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-hand-holding-heart" style="font-size:1.2rem;color:var(--sentiment-pos)"></i></div><div><p style="font-size:1.5rem;font-weight:800;color:var(--sentiment-pos)">' + totalDonatedItems + ' m\u00f3n</p><p style="font-size:0.8rem;color:var(--text-muted);font-weight:500">\u0110\u1ed3 \u0111\u00e3 quy\u00ean g\u00f3p</p></div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background-color:var(--primary-light)"><i class="fa-solid fa-cloud-arrow-down" style="font-size:1.2rem;color:var(--primary)"></i></div><div><p style="font-size:1.5rem;font-weight:800;color:var(--primary)">' + estimatedCO2 + ' kg</p><p style="font-size:0.8rem;color:var(--text-muted);font-weight:500">CO\u2082 \u0111\u00e3 gi\u1ea3m</p></div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background-color:var(--accent-light)"><i class="fa-solid fa-coins" style="font-size:1.2rem;color:var(--accent)"></i></div><div><p style="font-size:1.5rem;font-weight:800;color:var(--accent)">' + totalCoinEarned + '</p><p style="font-size:0.8rem;color:var(--text-muted);font-weight:500">T\u1ed5ng coin ki\u1ebfm \u0111\u01b0\u1ee3c</p></div></div>' +
    '</div>' +
    '<div class="orders-section"><div class="section-header"><div><span class="badge badge-primary" style="margin-bottom:0.5rem">L\u1ecbch s\u1eed mua h\u00e0ng</span><h2 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary)">\u0110\u01a1n H\u00e0ng C\u1ee7a B\u1ea1n</h2></div><a href="shop.html" class="btn btn-outline" style="border-radius:12px;font-size:0.85rem"><i class="fa-solid fa-bag-shopping"></i> Ti\u1ebfp t\u1ee5c mua s\u1eafm</a></div><div style="display:flex;flex-direction:column;gap:1.25rem">' + ordersHtml + '</div></div>' +
    '<div class="donations-section"><div class="section-header"><div><span class="badge badge-accent" style="margin-bottom:0.5rem">Ho\u1ea1t \u0111\u1ed9ng xanh</span><h2 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary)">L\u1ecbch S\u1eed Quy\u00ean G\u00f3p</h2></div><a href="community.html" class="btn btn-outline" style="border-radius:12px;font-size:0.85rem"><i class="fa-solid fa-hand-holding-heart"></i> Quy\u00ean g\u00f3p th\u00eam</a></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem">' + donationsHtml + '</div></div>';
}

/* ==================== COMMUNITY PAGE ==================== */
var REWARDS_DB = [
  { id: 1, name: 'G\u00f3p S\u1ee9c Tr\u1ed3ng 1 C\u00e2y Xanh', cost: 50, image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300', description: 'ReFashion s\u1ebd thay m\u1eb7t b\u1ea1n tr\u1ed3ng 1 c\u00e2y xanh t\u1ea1i r\u1eebng ng\u1eadp m\u1eb7n C\u1ea7n Gi\u1edd.', category: 'action' },
  { id: 2, name: 'Voucher Gi\u1ea3m Gi\u00e1 20%', cost: 100, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=300', description: 'M\u00e3 gi\u1ea3m gi\u00e1 20% \u00e1p d\u1ee5ng cho m\u1ecdi \u0111\u01a1n h\u00e0ng xanh ti\u1ebfp theo t\u1ea1i ReFashion.', category: 'discount' },
  { id: 3, name: 'B\u00ecnh N\u01b0\u1edbc Th\u00e9p Kh\u00f4ng G\u1ec9 Eco', cost: 200, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300', description: 'B\u00ecnh gi\u1eef nhi\u1ec7t ch\u1ea5t li\u1ec7u th\u00e9p kh\u00f4ng g\u1ec9 cao c\u1ea5p.', category: 'gift' },
  { id: 4, name: 'T\u00fai Tote S\u1ee3i \u0110ay M\u1ed9c M\u1ea1c', cost: 80, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300', description: 'T\u00fai v\u1ea3i tote d\u1ec7t t\u1eeb s\u1ee3i \u0111ay t\u1ef1 nhi\u00ean si\u00eau b\u1ec1n.', category: 'gift' }
];

function initCommunityPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderCommunity();
}

function renderCommunity() {
  var user = RefashionAuth._getUser();
  var isLoggedIn = !!user;
  var balance = user ? (user.greenCoin || 0) : 0;
  var container = document.getElementById('community-content');
  if (!container) return;
  var walletHtml = isLoggedIn
    ? '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">' + balance + ' <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2>'
    : '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">\u2014 <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2><p style="font-size:0.85rem;opacity:0.85"><a href="../auth/login.html?redirect=community.html" style="color:var(--accent);font-weight:700;text-decoration:underline">\u0110\u0103ng nh\u1eadp</a> \u0111\u1ec3 xem s\u1ed1 d\u01b0 GreenCoin</p>';
  var rewardsHtml = '';
  for (var i = 0; i < REWARDS_DB.length; i++) {
    var item = REWARDS_DB[i];
    var canRedeem = isLoggedIn && balance >= item.cost;
    rewardsHtml +=
      '<div class="reward-card">' +
        '<div class="reward-img"><img src="' + item.image + '" alt="' + item.name + '" /></div>' +
        '<div class="reward-body">' +
          '<h4 style="font-weight:700;font-size:0.95rem;margin-bottom:0.5rem">' + item.name + '</h4>' +
          '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.4;flex-grow:1">' + item.description + '</p>' +
          '<div class="reward-footer">' +
            '<span style="font-size:1.1rem;font-weight:800;color:var(--primary);display:flex;align-items:center;gap:0.25rem">' + item.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.9rem;color:var(--accent)"></i></span>' +
            '<button onclick="handleRedeem(' + item.id + ')" class="btn btn-outline" style="padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:8px;background-color:' + (canRedeem ? 'var(--primary-light)' : 'transparent') + ';color:' + (canRedeem ? 'var(--primary)' : 'var(--foreground)') + ';border-color:' + (canRedeem ? 'var(--primary)' : 'var(--border)') + '">' + (isLoggedIn ? '\u0110\u1ed5i Qu\u00e0' : '\u0110\u0103ng Nh\u1eadp') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  container.innerHTML =
    '<div class="community-section"><div class="container">' +
      '<div class="community-header"><span class="badge badge-accent" style="margin-bottom:1rem">C\u1ed9ng \u0110\u1ed3ng H\u00e0nh Tinh</span><h1>Tr\u00e1i \u0110\u1ea5t Xanh H\u01a1n M\u1ed7i Ng\u00e0y</h1><p style="color:var(--text-muted);font-size:1.1rem">Tham gia quy\u00ean g\u00f3p qu\u1ea7n \u00e1o c\u0169 \u0111\u1ec3 nh\u1eadn \u0111i\u1ec3m th\u01b0\u1edfng GreenCoin v\u00e0 c\u00f9ng chung tay t\u00e0i tr\u1ee3 c\u00e1c d\u1ef1 \u00e1n ph\u1ee5c h\u1ed3i sinh th\u00e1i.</p></div>' +
      '<div class="top-panel">' +
        '<div class="wallet-card animate-pulse-soft"><div class="wallet-card-bg"><i class="fa-solid fa-leaf"></i></div><div><span style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:var(--accent)">V\u00ed GreenCoin C\u1ee7a B\u1ea1n</span>' + walletHtml + '</div><div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:1.5rem"><p style="font-size:0.85rem;opacity:0.85;line-height:1.5">\ud83c\udf40 C\u00e1ch ki\u1ebfm th\u00eam coin:<br />\u2022 Vi\u1ebft \u0111\u00e1nh gi\u00e1 s\u1ea3n ph\u1ea9m c\u00f3 t\u1eeb kh\u00f3a xanh (+15 coin)<br />\u2022 Quy\u00ean g\u00f3p qu\u1ea7n \u00e1o c\u0169 (+15 coin/s\u1ea3n ph\u1ea9m)</p></div></div>' +
        '<div style="background-color:var(--card);border-radius:24px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow)"><h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:1.25rem">Chi\u1ebfn D\u1ecbch B\u1ea3o V\u1ec7 M\u00f4i Tr\u01b0\u1eddng \u0110ang Di\u1ec5n Ra</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1.25rem">' +
            '<div style="display:flex;gap:1rem;border-bottom:1px solid var(--border);padding-bottom:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-primary" style="font-size:0.65rem;margin-bottom:0.25rem">Ho\u1ea1t \u0111\u1ed9ng th\u00e1ng 6</span><h4 style="font-weight:700;font-size:0.95rem">Ng\u00e0y h\u1ed9i D\u1ecdn R\u00e1c & L\u00e0m S\u1ea1ch B\u1edd Bi\u1ec3n V\u0169ng T\u00e0u</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Tham gia c\u00f9ng h\u01a1n 200 t\u00ecnh nguy\u1ec7n vi\u00ean nh\u1eb7t r\u00e1c nh\u1ef1a, b\u1ea3o v\u1ec7 \u0111\u1ea1i d\u01b0\u01a1ng.</p><a href="https://tnmtvungtau.vn" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> Xem Chi Ti\u1ebft</a></div></div>' +
            '<div style="display:flex;gap:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-accent" style="font-size:0.65rem;margin-bottom:0.25rem">D\u1ef1 \u00e1n r\u1eebng xanh</span><h4 style="font-weight:700;font-size:0.95rem">Quy\u00ean G\u00f3p Ph\u1ee7 Xanh 10 Hecta R\u1eebng Ng\u1eadp M\u1eb7n</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Ph\u1ed1i h\u1ee3p tr\u1ed3ng r\u1eebng ch\u1ed1ng ng\u1eadp. Nh\u1ea5n \u0111\u1ed5i 50 GreenCoin \u0111\u1ec3 thay th\u1ebf 1 c\u00e2y con.</p><a href="https://www.thiennhien.net" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> Xem Chi Ti\u1ebft</a></div></div>' +
          '</div></div>' +
      '</div>' +
      '<div class="donation-rewards-layout">' +
        '<div class="donation-form">' +
          '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem">Quy\u00ean G\u00f3p Qu\u1ea7n \u00c1o C\u0169</h3><p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem">Qu\u1ea7n \u00e1o kh\u00f4ng d\u00f9ng n\u1eefa c\u1ee7a b\u1ea1n s\u1ebd \u0111\u01b0\u1ee3c ph\u00e2n lo\u1ea1i \u0111\u1ec3 l\u00e0m t\u1eeb thi\u1ec7n ho\u1eb7c t\u00e1i sinh k\u00e9o s\u1ee3i l\u00e0m v\u1ea3i m\u1edbi.</p>' +
          '<div id="donation-success" style="display:none" class="success-alert"><i class="fa-solid fa-circle-check"></i> Quy\u00ean g\u00f3p th\u00e0nh c\u00f4ng! GreenCoin \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1ed9ng v\u00e0o v\u00ed.</div>' +
          '<form id="donation-form">' +
            '<div class="form-group"><label>Lo\u1ea1i s\u1ea3n ph\u1ea9m</label><select id="donation-type"><option value="shirt">\u00c1o Thun / \u00c1o S\u01a1 Mi</option><option value="jacket">\u00c1o Kho\u00e1c</option><option value="pants">Qu\u1ea7n Jean / Kaki</option><option value="dress">V\u00e1y / \u0110\u1ea7m</option><option value="others">Kh\u00e1c</option></select></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">' +
              '<div class="form-group"><label>S\u1ed1 l\u01b0\u1ee3ng</label><input type="number" id="donation-qty" min="1" max="50" value="1" /></div>' +
              '<div class="form-group"><label>T\u00ecnh tr\u1ea1ng \u0111\u1ed3</label><select id="donation-condition"><option value="new">C\u00f2n r\u1ea5t m\u1edbi</option><option value="good">C\u00f2n t\u1ed1t</option><option value="reusable">H\u01a1i c\u0169 (C\u00f3 th\u1ec3 k\u00e9o s\u1ee3i)</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label>\u0110\u1ecba ch\u1ec9 l\u1ea5y \u0111\u1ed3</label><input type="text" id="donation-address" placeholder="Nh\u1eadp \u0111\u1ecba ch\u1ec9 nh\u00e0 c\u1ee7a b\u1ea1n..." required /></div>' +
            '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px;margin-top:1rem">' + (isLoggedIn ? '\u0110\u0103ng K\u00fd Quy\u00ean G\u00f3p Ngay' : '\u0110\u0103ng Nh\u1eadp \u0110\u1ec3 Quy\u00ean G\u00f3p') + '</button>' +
          '</form>' +
        '</div>' +
        '<div><h3 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary);margin-bottom:0.5rem">C\u1eeda H\u00e0ng Qu\u00e0 T\u1eb7ng Xanh</h3><p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:2rem">Quy \u0111\u1ed5i s\u1ed1 \u0111i\u1ec3m GreenCoin t\u00edch l\u0169y \u0111\u01b0\u1ee3c \u0111\u1ec3 nh\u1eadn c\u00e1c s\u1ea3n ph\u1ea9m ho\u1eb7c \u0111\u00f3ng g\u00f3p cho Tr\u00e1i \u0110\u1ea5t.</p><div class="rewards-grid">' + rewardsHtml + '</div></div>' +
      '</div>' +
    '</div></div>';
  bindDonationForm(isLoggedIn);
}

function bindDonationForm(isLoggedIn) {
  var form = document.getElementById('donation-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isLoggedIn) { window.location.href = '../auth/login.html?redirect=community.html'; return; }
    var address = document.getElementById('donation-address').value.trim();
    if (!address) { showToast('Vui l\u00f2ng nh\u1eadp \u0111\u1ecba ch\u1ec9.'); return; }
    var coins = RefashionAuth.addDonation({
      clothingType: document.getElementById('donation-type').value,
      quantity: parseInt(document.getElementById('donation-qty').value) || 1,
      condition: document.getElementById('donation-condition').value,
      address: address
    });
    document.getElementById('donation-success').style.display = 'flex';
    document.getElementById('donation-address').value = '';
    document.getElementById('donation-qty').value = '1';
    showToast('\ud83c\udf40 Quy\u00ean g\u00f3p th\u00e0nh c\u00f4ng! B\u1ea1n \u0111\u01b0\u1ee3c c\u1ed9ng +' + coins + ' GreenCoin.');
    setTimeout(function() {
      var el = document.getElementById('donation-success');
      if (el) el.style.display = 'none';
    }, 5000);
  });
}

function handleRedeem(itemId) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=community.html'; return; }
  var item = null;
  for (var i = 0; i < REWARDS_DB.length; i++) {
    if (REWARDS_DB[i].id === itemId) { item = REWARDS_DB[i]; break; }
  }
  if (!item) return;
  if (item.category === 'discount') {
    var match = item.name.match(/(\d+)%/);
    var discount = match ? parseInt(match[1]) : 20;
    var voucher = RefashionAuth.redeemVoucher(item.cost, discount, item.name);
    if (!voucher) { showToast('\u274c B\u1ea1n kh\u00f4ng \u0111\u1ee7 GreenCoin. C\u1ea7n th\u00eam ' + (item.cost - (user.greenCoin || 0)) + ' GreenCoin.'); return; }
    showToast('\ud83c\udf9f\ufe0f \u0110\u1ed5i voucher th\u00e0nh c\u00f4ng! M\u00e3 c\u1ee7a b\u1ea1n: ' + voucher.code + ' (Gi\u1ea3m ' + discount + '%, HSD: ' + voucher.expiresAt + ').');
  } else {
    var success = RefashionAuth.spendGreenCoin(item.cost);
    if (!success) { showToast('\u274c B\u1ea1n kh\u00f4ng \u0111\u1ee7 GreenCoin. C\u1ea7n th\u00eam ' + (item.cost - (user.greenCoin || 0)) + ' GreenCoin.'); return; }
    showToast('\ud83c\udf89 \u0110\u1ed5i qu\u00e0 th\u00e0nh c\u00f4ng! B\u1ea1n \u0111\u00e3 nh\u1eadn: "' + item.name + '".');
  }
  renderCommunity();
}

/* ==================== MOMO RETURN ==================== */
function initMoMoReturnPage() {
  var params = new URLSearchParams(window.location.search);
  var resultCode = params.get('resultCode');
  var orderId = params.get('orderId');
  var amount = params.get('amount');
  var transId = params.get('transId');
  var message = params.get('message');
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  var container = document.getElementById('momo-return-content');
  if (!container) return;
  if (resultCode === '0') {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">Thanh To\u00e1n Th\u00e0nh C\u00f4ng! \ud83c\udf89</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:1rem">\u0110\u01a1n h\u00e0ng <strong style="color:var(--primary)">#' + (orderId || '') + '</strong> \u0111\u00e3 \u0111\u01b0\u1ee3c thanh to\u00e1n qua MoMo.</p>' +
          '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;text-align:left">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:0.5rem"><span style="color:var(--text-muted)">M\u00e3 giao d\u1ecbch MoMo</span><span style="font-weight:700;color:var(--primary)">' + (transId || '') + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">S\u1ed1 ti\u1ec1n</span><span style="font-weight:700;color:var(--accent)">' + (amount ? Number(amount).toLocaleString('vi-VN') : '') + ' \u0111</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem"><a href="profile.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Xem \u0110\u01a1n H\u00e0ng</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Ti\u1ebfp T\u1ee5c Mua S\u1eafm</a></div>' +
          '<div style="margin-top:2rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-wallet" style="color:#a50064"></i> Thanh to\u00e1n qua V\u00ed MoMo (Sandbox Test)</div>' +
        '</div>' +
      '</div>';
  } else {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon" style="background-color:#fef2f2"><i class="fa-solid fa-xmark" style="font-size:2.5rem;color:#ef4444"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:#ef4444;margin-bottom:0.75rem">Thanh To\u00e1n Th\u1ea5t B\u1ea1i</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:2rem">' + (message || 'Giao d\u1ecbch kh\u00f4ng th\u00e0nh c\u00f4ng. Vui l\u00f2ng th\u1eed l\u1ea1i.') + '</p>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="checkout.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Th\u1eed L\u1ea1i</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Quay L\u1ea1i</a></div>' +
        '</div>' +
      '</div>';
  }
}

/* ==================== ABOUT PAGE ==================== */
function initAboutPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');
}

/* ==================== INIT DISPATCH ==================== */
document.addEventListener('DOMContentLoaded', function() {
  var path = window.location.pathname;
  var dir = path.substring(0, path.lastIndexOf('/'));
  if (dir.length > 1 && !dir.endsWith('/buyer')) return;

  var page = path.split('/').filter(function(s) { return s !== ''; }).pop() || 'index.html';
  switch (page) {
    case 'index.html': initBuyerPage(); break;
    case 'shop.html': initShopPage(); break;
    case 'shop-detail.html': initDetailPage(); break;
    case 'cart.html': initCartPage(); break;
    case 'checkout.html': initCheckoutPage(); break;
    case 'momo-return.html': initMoMoReturnPage(); break;
    case 'profile.html': initProfilePage(); break;
    case 'community.html': initCommunityPage(); break;
    case 'about.html': initAboutPage(); break;
    default: initBuyerPage(); break;
  }
});
