function renderFeaturedProducts(prefix) {
  prefix = prefix || '';
  var grid = document.getElementById('featured-products-grid');
  if (!grid) return;
  var html = '';
  for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
    var p = SHOP_PRODUCTS[i];
    var stars = Math.round(p.sentimentScore / 20);
    var starHtml = '';
    for (var s = 0; s < 5; s++) {
      starHtml += s < stars ? '<i class="fa-solid fa-star" style="color:var(--accent);font-size:0.75rem"></i>' : '<i class="fa-regular fa-star" style="color:var(--accent);font-size:0.75rem"></i>';
    }
    var sale = i % 3 === 1;
    var saleBadge = sale ? '<span class="badge-sale">-20%</span>' : '';
    var salePrice = sale ? '<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.9rem;margin-right:6px">' + Math.round(p.price * 1.25).toLocaleString('vi-VN') + 'đ</span>' : '';
    html +=
      '<div class="product-card">' +
        (sale ? '<span class="badge-sale-corner">Giảm 20%</span>' : '') +
        '<div class="product-img-wrap"><img src="' + p.image + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'' + (p.storeLogo || '../images/store_logo.png') + '\'" /></div>' +
        '<div class="product-info">' +
          '<p class="product-category">' + p.store + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + salePrice + p.priceStr + '</span>' +
            saleBadge +
          '</div>' +
          '<div class="product-rating-row">' +
            starHtml +
            '<span class="product-rating-num">' + (p.sentimentScore / 20).toFixed(1) + '</span>' +
            '<span class="product-rating-count">(' + p.ratingCount + ' đánh giá)</span>' +
          '</div>' +
          '<a href="' + prefix + 'shop-detail.html?id=' + p.id + '" class="btn btn-primary" style="width:100%;border-radius:10px;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px"><i class="fa-solid fa-bolt"></i> Mua Ngay</a>' +
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

var shopState = { selectedCategory: 'all', selectedStore: 'all', searchQuery: '', sortBy: 'default' };

function initShopPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');

  var params = new URLSearchParams(window.location.search);
  var storeParam = params.get('store');
  if (storeParam) {
    shopState.selectedStore = storeParam;
  } else {
    shopState.selectedStore = 'all';
  }

  renderShopBanner();
  renderShopProducts();
  bindShopFilters();

  // Banner buttons (follow + chat)
  document.addEventListener('click', function(e) {
    var followBtn = e.target.closest('.btn-follow-store');
    if (followBtn) {
      var isFollowing = followBtn.classList.toggle('following');
      if (isFollowing) {
        followBtn.innerHTML = '<i class="fa-solid fa-check"></i> Đang Theo Dõi';
        showToast('Cảm ơn bạn đã theo dõi cửa hàng!');
      } else {
        followBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Theo Dõi';
        showToast('Đã hủy theo dõi cửa hàng');
      }
      return;
    }
    var chatBtn = e.target.closest('.btn-chat-store');
    if (chatBtn) {
      showToast('Sẽ sớm hỗ trợ chat trực tiếp với cửa hàng!');
    }
  });
}

function renderShopBanner() {
  var container = document.getElementById('shop-banner-container');
  if (!container) return;

  if (shopState.selectedStore === 'all') {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  // Find store logo from products DB or list of products
  var storeName = shopState.selectedStore;
  var storeLogo = '../images/store_logo.png';
  for (var key in PRODUCTS_DB) {
    if (PRODUCTS_DB[key].store === storeName && PRODUCTS_DB[key].storeLogo) {
      storeLogo = PRODUCTS_DB[key].storeLogo;
      break;
    }
  }

  container.innerHTML =
    '<div class="shop-banner-card" style="display: flex; gap: 2rem; background: linear-gradient(135deg, var(--primary), #3b5242); padding: 1.75rem 2rem; border-radius: 24px; color: white; align-items: center; justify-content: space-between; flex-wrap: wrap; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 2rem; position: relative; overflow: hidden;">' +
      '<div style="position: absolute; right: -50px; bottom: -50px; font-size: 10rem; opacity: 0.05; color: white; transform: rotate(-15deg); pointer-events: none;"><i class="fa-solid fa-store"></i></div>' +
      '<div style="display: flex; align-items: center; gap: 20px;">' +
        '<div style="position: relative;">' +
          '<img src="' + storeLogo + '" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.8); object-fit: cover; background: white;" />' +
          '<span style="position: absolute; bottom: 0; right: 0; background: var(--accent); color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">Yêu Thích</span>' +
        '</div>' +
        '<div>' +
          '<h2 style="font-family: var(--font-serif); font-size: 1.75rem; margin: 0; font-weight: 400; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">' + storeName + '</h2>' +
          '<p style="font-size: 0.8rem; opacity: 0.9; margin: 4px 0 0 0;"><i class="fa-solid fa-circle" style="color: #4ade80; font-size: 0.55rem; margin-right: 4px;"></i> Đang hoạt động</p>' +
        '</div>' +
      '</div>' +
      '<div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: center;">' +
        '<div style="display: flex; gap: 2rem; border-right: 1px solid rgba(255,255,255,0.2); padding-right: 2rem;">' +
          '<div style="text-align: center;">' +
            '<p style="font-size: 0.75rem; opacity: 0.75; margin: 0;">Đánh Giá</p>' +
            '<p style="font-size: 1.1rem; font-weight: 800; margin: 2px 0 0 0; color: var(--accent);">4.9 / 5.0</p>' +
          '</div>' +
          '<div style="text-align: center;">' +
            '<p style="font-size: 0.75rem; opacity: 0.75; margin: 0;">Sản Phẩm</p>' +
            '<p style="font-size: 1.1rem; font-weight: 800; margin: 2px 0 0 0; color: white;">24</p>' +
          '</div>' +
          '<div style="text-align: center;">' +
            '<p style="font-size: 0.75rem; opacity: 0.75; margin: 0;">Phản Hồi</p>' +
            '<p style="font-size: 1.1rem; font-weight: 800; margin: 2px 0 0 0; color: white;">98%</p>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 10px;">' +
          '<button type="button" class="btn btn-accent btn-chat-store" style="font-size: 0.8rem; padding: 10px 18px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer;"><i class="fa-solid fa-comments"></i> Chat</button>' +
          '<button type="button" class="btn btn-outline btn-follow-store" style="font-size: 0.8rem; padding: 10px 18px; border-radius: 12px; font-weight: 700; border: 1.5px solid white; color: white; background: transparent; cursor: pointer; transition: all 0.2s;"><i class="fa-solid fa-plus"></i> Theo Dõi</button>' +
          '<button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 10px 14px; border-radius: 12px; font-weight: 700; border: 1.5px solid white; color: white; background: transparent; cursor: pointer; transition: all 0.2s;" onclick="window.location.href=\x27shop.html\x27" title="Xem tất cả cửa hàng"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function filterShopProducts() {
  var result = SHOP_PRODUCTS.slice();
  if (shopState.selectedCategory !== 'all') result = result.filter(function(p) { return p.category === shopState.selectedCategory; });
  if (shopState.selectedStore !== 'all') result = result.filter(function(p) { return p.store === shopState.selectedStore; });
  if (shopState.searchQuery.trim() !== '') {
    var q = shopState.searchQuery.toLowerCase();
    result = result.filter(function(p) { return p.name.toLowerCase().indexOf(q) !== -1; });
  }
  if (shopState.sortBy === 'price-asc') result.sort(function(a, b) { return a.price - b.price; });
  else if (shopState.sortBy === 'price-desc') result.sort(function(a, b) { return b.price - a.price; });
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
    var stars = Math.round(p.sentimentScore / 20);
    var starHtml = '';
    for (var s = 0; s < 5; s++) {
      starHtml += s < stars ? '<i class="fa-solid fa-star" style="color:var(--accent);font-size:0.75rem"></i>' : '<i class="fa-regular fa-star" style="color:var(--accent);font-size:0.75rem"></i>';
    }
    var sale = i % 3 === 1;
    var saleBadge = sale ? '<span class="badge-sale">-20%</span>' : '';
    var salePrice = sale ? '<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.9rem;margin-right:6px">' + Math.round(p.price * 1.25).toLocaleString('vi-VN') + 'đ</span>' : '';
    html +=
      '<div class="product-card">' +
        (sale ? '<span class="badge-sale-corner">Giảm 20%</span>' : '') +
        '<div class="product-img-wrap"><img src="' + p.image + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'' + (p.storeLogo || '../images/store_logo.png') + '\'" /></div>' +
        '<div class="product-info">' +
          '<p class="product-category">' + p.store + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + salePrice + p.priceStr + '</span>' +
            saleBadge +
          '</div>' +
          '<div class="product-rating-row">' +
            starHtml +
            '<span class="product-rating-num">' + (p.sentimentScore / 20).toFixed(1) + '</span>' +
            '<span class="product-rating-count">(' + p.ratingCount + ' đánh giá)</span>' +
          '</div>' +
          '<a href="shop-detail.html?id=' + p.id + '" class="btn btn-primary" style="width:100%;border-radius:10px;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px"><i class="fa-solid fa-bolt"></i> Mua Ngay</a>' +
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
    shopState.selectedStore = 'all';
    shopState.searchQuery = '';
    shopState.sortBy = 'default';
    if (window.history.pushState) {
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({path:newurl}, '', newurl);
    }
    renderShopBanner();
    var radioCat = document.querySelector('input[name="category"][value="all"]');
    if (radioCat) radioCat.checked = true;
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
            '<div><h3 style="font-size:1.05rem;font-weight:700">' + item.name + '</h3>' +
            '<p style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0"><i class="fa-solid fa-tags" style="font-size:0.7rem;margin-right:0.25rem"></i>Phân loại: ' + (item.variant || 'Tiêu chuẩn') + '</p></div>' +
            '<button onclick="removeCartItem(\'' + item.productId + '\', \'' + (item.variant || 'Tiêu chuẩn') + '\')" style="background:transparent;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0.25rem;border-radius:8px" title="Xóa sản phẩm"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div>' +
          '<p class="cart-item-price">' + item.priceStr + '</p>' +
          '<div style="display:flex;align-items:center;gap:0.75rem">' +
            '<span style="font-size:0.85rem;color:var(--text-muted);font-weight:500">Số lượng:</span>' +
            '<div class="quantity-control">' +
              '<button onclick="updateQty(\'' + item.productId + '\', \'' + (item.variant || 'Tiêu chuẩn') + '\', ' + (item.quantity - 1) + ')"><i class="fa-solid fa-minus" style="font-size:0.7rem"></i></button>' +
              '<span class="qty-value">' + item.quantity + '</span>' +
              '<button onclick="updateQty(\'' + item.productId + '\', \'' + (item.variant || 'Tiêu chuẩn') + '\', ' + (item.quantity + 1) + ')"><i class="fa-solid fa-plus" style="font-size:0.7rem"></i></button>' +
            '</div>' +
            '<span style="font-size:0.85rem;color:var(--text-muted)">= <strong style="color:var(--accent)">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' đ</strong></span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  var itemsSummaryHtml = '';
  for (var i = 0; i < cart.length; i++) {
    var item = cart[i];
    itemsSummaryHtml +=
      '<div style="display:flex;justify-content:space-between;font-size:0.9rem;color:var(--text-muted)">' +
        '<span style="max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + ' (' + (item.variant || 'Tiêu chuẩn') + ') x' + item.quantity + '</span>' +
        '<span style="font-weight:600;color:var(--foreground)">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' đ</span>' +
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

function removeCartItem(productId, variant) {
  RefashionAuth.removeFromCart(productId, variant);
  showToast('✅ Đã xóa phân loại sản phẩm khỏi giỏ hàng');
  renderCart();
}

function updateQty(productId, variant, qty) {
  RefashionAuth.updateCartQuantity(productId, variant, qty);
  renderCart();
}

/* ==================== PRODUCT DETAIL PAGE ==================== */
var PRODUCTS_DB = {
  '1': {
    id: '1',
    name: 'Áo Khoác Gió Tái Chế',
    category: 'Áo Khoác Nam/Nữ',
    price: '1,250,000 đ',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200',
    description: 'Chiếc áo khoác gió siêu nhẹ, chống gió và chống nước cực tốt, được tái chế từ áo khoác cũ và vải thừa cao cấp.',
    carbonFootprint: '3.2 kg CO₂e (Thấp hơn 52% trung bình ngành)',
    waterSaved: '1,200 Lít nước sạch',
    details: [
      'Chất liệu chống thấm nước DWR thân thiện không chứa PFC.',
      'Có mũ trùm đầu điều chỉnh được và khóa kéo YKK tái sinh.',
      'Túi ngực có khóa kéo rộng rãi để đựng vật dụng.',
      'Có thể gấp gọn vào túi ngực tiện lợi khi di chuyển.'
    ],
    sizeChart: '../images/sizeselection.jpg',
    store: 'Eco Wear',
    storeLogo: '../images/store_eco_wear.png',
    variants: [
      { size: 'S', color: 'Xanh Biển', price: 1250000, stock: 15 },
      { size: 'M', color: 'Xanh Biển', price: 1250000, stock: 15 },
      { size: 'L', color: 'Xanh Biển', price: 1250000, stock: 10 },
      { size: 'XL', color: 'Xanh Biển', price: 1280000, stock: 5 }
    ]
  },
  '2': {
    id: '2',
    name: 'Balo Tái Chế 30L',
    category: 'Phụ Kiện Dã Ngoại',
    price: '1,890,000 đ',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200',
    description: 'Balo chuyên dụng cho dã ngoại và leo núi với dung tích 30L. Được tái sinh từ các loại balo cũ và vải dù thừa chất lượng cao.',
    carbonFootprint: '4.8 kg CO₂e (Thấp hơn 38% trung bình ngành)',
    waterSaved: '850 Lít nước sạch',
    details: [
      'Khung đệm lưng bằng lưới thoáng khí tổ ong chống mồ hôi.',
      'Đai hông và đai ngực có thể điều chỉnh linh hoạt.',
      'Tích hợp ngăn đựng túi nước chuyên dụng.',
      'Vải Nylon chống xước cao cấp, bảo hành 5 năm.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '30L', color: 'Xanh Rêu', price: 1890000, stock: 15 },
      { size: '30L', color: 'Xám', price: 1890000, stock: 15 }
    ]
  },
  '3': {
    id: '3',
    name: 'Áo Thun Từ Vải Thừa',
    category: 'Áo Thun Unisex',
    price: '450,000 đ',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200',
    description: 'Áo thun polo cổ điển lịch sự, được tái chế từ vải thừa xưởng may và áo thun cũ chọn lọc.',
    carbonFootprint: '1.5 kg CO₂e (Thấp hơn 60% trung bình ngành)',
    waterSaved: '2,400 Lít nước sạch',
    details: [
      'Vải dệt thun cá sấu dày dặn, đứng phom.',
      'Nhuộm màu tự nhiên chiết xuất từ cỏ cây thảo mộc.',
      'Cúc áo làm từ vỏ dừa tự nhiên ép nhiệt.',
      'Bền màu và hạn chế co rút tối đa khi giặt máy.'
    ],
    store: 'Eco Wear',
    storeLogo: '../images/store_eco_wear.png',
    variants: [
      { size: 'S', color: 'Trắng', price: 450000, stock: 10 },
      { size: 'M', color: 'Trắng', price: 450000, stock: 10 },
      { size: 'L', color: 'Trắng', price: 450000, stock: 10 },
      { size: 'S', color: 'Đen', price: 450000, stock: 10 },
      { size: 'M', color: 'Đen', price: 450000, stock: 10 },
      { size: 'L', color: 'Đen', price: 450000, stock: 10 }
    ]
  },
  '4': {
    id: '4',
    name: 'Quần Kaki Từ Quần Cũ Tái Chế',
    category: 'Quần Nam/Nữ',
    price: '890,000 đ',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1200',
    description: 'Quần kaki ống đứng bền bỉ được chế tác từ quần kaki cũ vẫn còn chất lượng tốt, tái sinh phong cách với form dáng thời thượng.',
    carbonFootprint: '2.1 kg CO₂e (Quy trình tái chế hấp thụ lượng carbon lớn)',
    waterSaved: '1,600 Lít nước sạch',
    details: [
      'Chất vải thô mộc đặc trưng, thoáng mát, càng mặc càng mềm.',
      'Đường may gia cố các điểm chịu lực kéo.',
      'Nhuộm màu an toàn không chứa kim loại nặng.',
      'Thích hợp mặc hàng ngày hoặc đi dã ngoại.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '30', color: 'Be', price: 890000, stock: 10 },
      { size: '32', color: 'Be', price: 890000, stock: 15 },
      { size: '32', color: 'Đen', price: 890000, stock: 10 }
    ]
  },
  '5': {
    id: '5',
    name: 'Túi Đeo Vai Canvas Tái Sinh',
    category: 'Balo & Túi',
    price: '180,000 đ',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200',
    description: 'Túi tote canvas dày dặn tiện dụng cho việc mua sắm, được tái sinh từ các loại vải canvas quần áo cũ.',
    carbonFootprint: '0.6 kg CO₂e (Giảm 80% khí thải sản xuất)',
    waterSaved: '800 Lít nước sạch',
    details: [
      'Có ngăn phụ nhỏ bên trong đựng chìa khóa, điện thoại.',
      'Quai xách gia cố chỉ chéo chắc chắn, chịu lực đến 10kg.',
      'Họa tiết in mực nước thân thiện môi trường.',
      'Kích thước rộng rãi đựng vừa laptop 15.6 inch.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: 'Tiêu chuẩn', color: 'Trắng Ngà', price: 180000, stock: 25 },
      { size: 'Tiêu chuẩn', color: 'Đen', price: 180000, stock: 15 }
    ]
  },
  '6': {
    id: '6',
    name: 'Giày Thể Thao Từ Vải Tái Chế',
    category: 'Giày Bền Vững',
    price: '1,450,000 đ',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1200',
    description: 'Giày sneaker thể thao thoáng khí được chế tác từ vải vụn và quần áo denim cũ chọn lọc.',
    carbonFootprint: '2.9 kg CO₂e (Quy trình sản xuất ít phát thải)',
    waterSaved: '900 Lít nước sạch',
    details: [
      'Vải dệt tái chế mềm mịn ôm sát bàn chân, không gây ma sát đau gót.',
      'Đế cao su tự nhiên lưu hóa cực kỳ êm ái và đàn hồi.',
      'Lót giày làm từ bọt sinh học kháng khuẩn.',
      'Hộp giày làm hoàn toàn bằng giấy carton tái chế.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '39', color: 'Trắng', price: 1450000, stock: 5 },
      { size: '40', color: 'Trắng', price: 1450000, stock: 10 },
      { size: '41', color: 'Trắng', price: 1450000, stock: 10 }
    ]
  },
  '7': {
    id: '7',
    name: 'Quần Jeans Denim Tái Bản',
    category: 'Quần Nam/Nữ',
    price: '950,000 đ',
    image: '../images/sh_denim_jeans.png',
    description: 'Quần jeans dáng suông thời thượng được làm từ denim tái chế chất lượng cao, giữ được sự thô mộc đặc trưng của chất liệu denim truyền thống.',
    carbonFootprint: '2.8 kg CO₂e (Giảm 45% so với quần jeans thường)',
    waterSaved: '1,500 Lít nước sạch',
    details: [
      'Chất liệu denim dày dặn bền bỉ.',
      'Công nghệ giặt tiết kiệm nước và không hóa chất độc hại.',
      'Khóa kéo kim loại và khuy nút bền chắc.',
      'Tông màu xanh indigo tự nhiên sang trọng.'
    ],
    store: 'Denim Craft',
    storeLogo: '../images/store_denim_craft.png',
    variants: [
      { size: '30', color: 'Xanh Indigo', price: 950000, stock: 10 },
      { size: '32', color: 'Xanh Indigo', price: 950000, stock: 10 },
      { size: '32', color: 'Xanh Nhạt', price: 950000, stock: 8 }
    ]
  },
  '8': {
    id: '8',
    name: 'Áo Sơ Mi Denim Upcycled',
    category: 'Áo Nam/Nữ',
    price: '650,000 đ',
    image: '../images/sh_denim_shirt.png',
    description: 'Áo sơ mi denim thời trang được thiết kế từ các mảnh denim tuyển chọn từ quần áo cũ, tạo nên sự phối màu độc đáo và mang đậm dấu ấn phong cách.',
    carbonFootprint: '1.2 kg CO₂e (Giảm 75% khí thải sản xuất)',
    waterSaved: '2,200 Lít nước sạch',
    details: [
      'Thiết kế chắp vá cá tính, mỗi chiếc áo là độc nhất.',
      'Form dáng rộng unisex cá tính.',
      'Đường may chỉ nổi tương phản ấn tượng.',
      'Khuy bấm chắc chắn và bền bỉ.'
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
    name: 'Đầm Tái Chế Từ Áo Cũ',
    category: 'Đầm/Váy Nữ',
    price: '780,000 đ',
    image: '../images/sh_linen_dress.png',
    description: 'Đầm mềm mại với form dáng xòe nhẹ nhàng, được tái sinh từ áo sơ mi cũ và vải thừa chất liệu linen/voan cao cấp.',
    carbonFootprint: '1.9 kg CO₂e (Thân thiện môi trường tối đa)',
    waterSaved: '600 Lít nước sạch',
    details: [
      'Chất liệu mộc mạc, thấm hút mồ hôi cực tốt.',
      'Nhuộm màu hữu cơ chiết xuất thực vật nhẹ dịu với làn da.',
      'Thiết kế cổ chữ V thanh lịch và nữ tính.',
      'Túi sườn hai bên sâu và tiện lợi đựng điện thoại.'
    ],
    store: 'Retro Chic',
    storeLogo: '../images/store_retro_chic.png',
    variants: [
      { size: 'S', color: 'Be Mộc', price: 780000, stock: 5 },
      { size: 'M', color: 'Be Mộc', price: 780000, stock: 10 },
      { size: 'L', color: 'Be Mộc', price: 800000, stock: 5 }
    ]
  },
  '10': {
    id: '10',
    name: 'Túi Patchwork Vải Mộc',
    category: 'Balo & Túi',
    price: '320,000 đ',
    image: '../images/sh_patchwork_bag.png',
    description: 'Túi đeo vai patchwork thiết kế độc bản từ các mảnh vải canvas thô và denim thừa của xưởng may. Phong cách bohemian phóng khoáng.',
    carbonFootprint: '0.5 kg CO₂e (Tái sử dụng nguyên liệu thừa)',
    waterSaved: '400 Lít nước sạch',
    details: [
      'Kích thước rộng rãi đựng vừa laptop 14 inch.',
      'Quai đeo bản to êm ái chống đau vai.',
      'Bên trong lót vải mộc tự nhiên có ngăn kéo nhỏ.',
      'Khóa kéo YKK kim loại mượt mà và bền bỉ.'
    ],
    store: 'Denim Craft',
    storeLogo: '../images/store_denim_craft.png',
    variants: [
      { size: 'Tiêu chuẩn', color: 'Canvas Patchwork', price: 320000, stock: 15 }
    ]
  },
  '11': {
    id: '11',
    name: 'Khăn Lụa Từ Vải Thừa Cao Cấp',
    category: 'Phụ Kiện Khác',
    price: '290,000 đ',
    image: '../images/sh_silk_scarf.png',
    description: 'Khăn choàng cổ được chế tác từ lụa vải thừa cao cấp của xưởng may, họa tiết in retro sang trọng. Chất vải mềm mượt, ấm áp vào mùa đông và mát mẻ vào mùa hè.',
    carbonFootprint: '0.8 kg CO₂e (Tái sử dụng nguyên liệu)',
    waterSaved: '300 Lít nước sạch',
    details: [
      'Sản xuất thủ công từ vải thừa xưởng may.',
      'Họa tiết cổ điển tinh tế, không phai màu.',
      'Kích thước vuông 70x70cm đa năng.',
      'Hộp đựng bằng giấy kraft tái sinh sang trọng phù hợp làm quà tặng.'
    ],
    store: 'Retro Chic',
    storeLogo: '../images/store_retro_chic.png',
    variants: [
      { size: '70x70cm', color: 'Đỏ Bordeaux', price: 290000, stock: 15 },
      { size: '70x70cm', color: 'Vàng Mù Tạt', price: 290000, stock: 15 }
    ]
  },
  '12': {
    id: '12',
    name: 'Áo Khoác Dạ Len Tái Chế',
    category: 'Áo Khoác Nam/Nữ',
    price: '1,650,000 đ',
    image: '../images/sh_wool_jacket.png',
    description: 'Áo khoác dạ len dày dặn và ấm áp vượt trội, được chế tác từ sợi len tái chế chất lượng cao thu gom từ các sản phẩm len cũ.',
    carbonFootprint: '5.2 kg CO₂e (Giảm 48% so với dạ len nguyên sinh)',
    waterSaved: '950 Lít nước sạch',
    details: [
      'Chất dạ đanh mịn, đứng form cực đẹp.',
      'Lớp lót bên trong bằng cotton tái chế thoáng khí.',
      'Thiết kế hai hàng khuy cổ điển lịch lãm.',
      'Túi cơi tiện lợi hai bên sườn áo.'
    ],
    store: 'Eco Wear',
    storeLogo: '../images/store_eco_wear.png',
    variants: [
      { size: 'M', color: 'Nâu Đất', price: 1650000, stock: 5 },
      { size: 'L', color: 'Nâu Đất', price: 1650000, stock: 5 },
      { size: 'M', color: 'Ghi Xám', price: 1650000, stock: 3 },
      { size: 'L', color: 'Ghi Xám', price: 1650000, stock: 3 }
    ]
  },
  '13': {
    id: '13',
    name: 'Giày Sneaker Từ Vải Jeans Cũ',
    category: 'Giày Bền Vững',
    price: '850,000 đ',
    image: '../images/shoes.jpg',
    description: 'Giày Sneaker năng động với thân giày làm từ vải denim jeans cũ tái chế, phần đế cao su tự nhiên lưu hóa êm ái.',
    carbonFootprint: '2.5 kg CO₂e (Thấp hơn 55% giày sneaker mới)',
    waterSaved: '700 Lít nước sạch',
    details: [
      'Vải denim dệt chắc chắn, thoáng mát cho chân.',
      'Đế cao su tự nhiên chống trơn trượt cực tốt.',
      'Lót giày bằng bọt EVA tái sinh mềm mại.',
      'Thiết kế cổ thấp basic dễ phối đồ.'
    ],
    store: 'Hemp & Bamboo',
    storeLogo: '../images/store_hemp_bamboo.png',
    variants: [
      { size: '38', color: 'Trắng Ngà', price: 850000, stock: 5 },
      { size: '40', color: 'Trắng Ngà', price: 850000, stock: 5 },
      { size: '40', color: 'Đen Canvas', price: 850000, stock: 5 },
      { size: '42', color: 'Đen Canvas', price: 870000, stock: 5 }
    ]
  },
  '14': {
    id: '14',
    name: 'Áo Sơ Mi Thêu Hoa Đậu Biếc Organic',
    category: 'Áo Thun Polo',
    price: '520,000 đ',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600',
    description: 'Áo sơ mi dáng rộng chế tác từ linen và thêu hoa đậu biếc thủ công bằng chỉ hữu cơ.',
    carbonFootprint: '0.8 kg CO₂e',
    waterSaved: '320 Lít nước sạch',
    details: [
      'Chất liệu 100% linen tự nhiên.',
      'Họa tiết thêu tay độc bản.',
      'Nút áo làm từ vỏ sò tự nhiên.'
    ],
    store: 'Green Thread',
    storeLogo: '../images/store_green_thread.png',
    variants: [
      { size: 'S', color: 'Trắng Thêu Xanh', price: 520000, stock: 8 },
      { size: 'M', color: 'Trắng Thêu Xanh', price: 520000, stock: 10 }
    ]
  },
  '15': {
    id: '15',
    name: 'Chân Váy Đũi Thêu Tay Eco-Flora',
    category: 'Quần',
    price: '680,000 đ',
    image: 'https://images.unsplash.com/photo-1583496661160-fb48862c4a4e?q=80&w=600',
    description: 'Chân váy dáng xòe nữ tính từ vải đũi mộc mạc kết hợp hoa văn thêu tỉ mỉ dọc gấu váy.',
    carbonFootprint: '0.9 kg CO₂e',
    waterSaved: '400 Lít nước sạch',
    details: [
      'Vải đũi xước tự nhiên siêu thoáng mát.',
      'Thiết kế eo thun co giãn thoải mái.',
      'Sơn nhuộm gốc thực vật thân thiện môi trường.'
    ],
    store: 'Green Thread',
    storeLogo: '../images/store_green_thread.png',
    variants: [
      { size: 'M', color: 'Be Nhạt', price: 680000, stock: 6 },
      { size: 'L', color: 'Be Nhạt', price: 690000, stock: 6 }
    ]
  },
  '16': {
    id: '16',
    name: 'Áo Cardigan Dệt Kim Hữu Cơ Cúc Gỗ',
    category: 'Áo Khoác Nam/Nữ',
    price: '950,000 đ',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600',
    description: 'Áo len cardigan mỏng nhẹ từ sợi dệt tái chế zero-waste cực êm ái.',
    carbonFootprint: '1.4 kg CO₂e',
    waterSaved: '550 Lít nước sạch',
    details: [
      'Sợi len organic thân thiện làn da nhạy cảm.',
      'Hàng cúc gỗ dừa mộc mạc và sang trọng.',
      'Phom dáng unisex trẻ trung.'
    ],
    store: 'Zero Waste',
    storeLogo: '../images/store_zero_waste.png',
    variants: [
      { size: 'M', color: 'Kem Mộc', price: 950000, stock: 8 },
      { size: 'L', color: 'Kem Mộc', price: 950000, stock: 7 }
    ]
  },
  '17': {
    id: '17',
    name: 'Túi Tote Canvas Zero-Waste Khâu Tay',
    category: 'Sản Phẩm Khác',
    price: '220,000 đ',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200',
    description: 'Túi tote được khâu tay chắc chắn từ vải canvas thô hữu cơ cao cấp.',
    carbonFootprint: '0.4 kg CO₂e',
    waterSaved: '200 Lít nước sạch',
    details: [
      'Đường chỉ khâu tay tinh tế bền bỉ.',
      'Thiết kế không thừa rác thải dệt may.',
      'Quai xách chắc chắn chịu lực tốt.'
    ],
    store: 'Zero Waste',
    storeLogo: '../images/store_zero_waste.png',
    variants: [
      { size: 'Tiêu chuẩn', color: 'Trắng Kem', price: 220000, stock: 30 }
    ]
  }
};

function syncSellerProductsToDB() {
  try {
    for (var k = 0; k < localStorage.length; k++) {
      var key = localStorage.key(k);
      if (key && key.indexOf('refashion_seller_products_') === 0) {
        var storeName = key.replace('refashion_seller_products_', '');
        var stored = localStorage.getItem(key);
        if (!stored) continue;
        var sellerProds = JSON.parse(stored);
        
        var storeLogo = '../images/store_' + storeName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') + '.png';
        
        for (var j = 0; j < sellerProds.length; j++) {
          var p = sellerProds[j];
          var idStr = String(p.id);
          if (PRODUCTS_DB[idStr]) continue;
          
          var minPrice = p.price || 0;
          if (p.variants && p.variants.length > 0) {
            var prices = p.variants.map(function(v) { return v.price || 0; });
            minPrice = Math.min.apply(null, prices);
          }
          
          PRODUCTS_DB[idStr] = {
            id: idStr,
            name: p.name,
            category: p.category === 'jacket' ? 'Áo Khoác Nam/Nữ' : p.category === 'tshirt' ? 'Áo Thun Polo' : p.category === 'pants' ? 'Quần' : p.category === 'shoes' ? 'Giày' : 'Sản Phẩm Khác',
            price: minPrice.toLocaleString('vi-VN') + ' đ',
            image: p.images && p.images.length > 0 ? p.images[0] : (p.image || '../images/store_logo.png'),
            description: p.description || '',
            carbonFootprint: '1.2 kg CO₂e (Giảm 60% so với trung bình)',
            waterSaved: '450 Lít nước sạch',
            details: [
              'Chế tác tinh xảo từ chất liệu tái chế.',
              'Nguyên liệu upcycling bảo vệ tài nguyên.',
              'Phụ kiện tái sinh thân thiện môi trường.'
            ],
            sizeChart: p.sizeChart || '../images/sizeselection.jpg',
            store: storeName,
            storeLogo: storeLogo,
            variants: p.variants || [{ size: 'Tiêu chuẩn', color: 'Mộc', price: minPrice, stock: 10 }]
          };
        }
      }
    }
  } catch(e) {
    console.error('Error syncing seller products into PRODUCTS_DB:', e);
  }
}
syncSellerProductsToDB();

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

  // Wire size chart modal
  var scModal = document.getElementById('sizechart-modal');
  var scImg = document.getElementById('sizechart-modal-img');
  if (scImg && product.sizeChart) {
    scImg.src = product.sizeChart;
  }
  if (scModal) {
    scModal.addEventListener('click', function(e) {
      if (e.target === scModal) scModal.classList.remove('show');
    });
  }

  // Parse variants
  var uniqueSizes = [];
  var uniqueColors = [];
  var variants = product.variants || [];
  for (var i = 0; i < variants.length; i++) {
    var v = variants[i];
    if (v.size && uniqueSizes.indexOf(v.size) === -1) uniqueSizes.push(v.size);
    if (v.color && uniqueColors.indexOf(v.color) === -1) uniqueColors.push(v.color);
  }

  var sizeHtml = '';
  if (uniqueSizes.length > 0) {
    sizeHtml = '<div class="variant-select-section" style="margin: 0.75rem 0;">' +
                 '<span class="variant-label" style="font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;">Kích cỡ:</span>' +
                 '<div class="variant-options size-options-group" style="display: flex; gap: 6px; flex-wrap: wrap;">' +
                   uniqueSizes.map(function(s) {
                     return '<button type="button" class="btn-variant-opt btn-size-opt" data-size="' + s + '">' + s + '</button>';
                   }).join('') +
                 '</div>' +
               '</div>';
  }

  var colorHtml = '';
  if (uniqueColors.length > 0) {
    colorHtml = '<div class="variant-select-section" style="margin: 0.75rem 0;">' +
                 '<span class="variant-label" style="font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;">Màu sắc:</span>' +
                 '<div class="variant-options color-options-group" style="display: flex; gap: 6px; flex-wrap: wrap;">' +
                   uniqueColors.map(function(c) {
                     return '<button type="button" class="btn-variant-opt btn-color-opt" data-color="' + c + '">' + c + '</button>';
                   }).join('') +
                 '</div>' +
               '</div>';
  }

  var stockHtml = '<div class="variant-stock-info" style="margin: 0.5rem 0 0.75rem 0; font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">' +
                    'Kho hàng: <span id="detail-stock-value" style="font-weight:700; color:var(--foreground);">' + (product.stock || 0) + '</span> sản phẩm có sẵn' +
                  '</div>';

  var shopCardHtml = '<div class="shop-info-card" style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; margin: 1rem 0; gap: 0.75rem; flex-wrap: wrap;">' +
                       '<div style="display: flex; align-items: center; gap: 10px;">' +
                         '<img src="' + (product.storeLogo || '../images/store_logo.png') + '" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border);" onerror="this.onerror=null;this.src=\'../images/store_logo.png\'" />' +
                         '<div>' +
                           '<h4 style="font-weight: 800; font-size: 0.9rem; color: var(--primary); margin: 0;">' + (product.store || 'Eco Wear') + '</h4>' +
                           '<p style="font-size: 0.7rem; color: var(--text-muted); margin: 2px 0 0 0;"><i class="fa-solid fa-star" style="color: var(--accent); margin-right: 4px;"></i>4.9/5.0 (250+ Đánh giá)</p>' +
                         '</div>' +
                       '</div>' +
                       '<a href="shop.html?store=' + encodeURIComponent(product.store || 'Eco Wear') + '" class="btn btn-outline" style="font-size: 0.7rem; padding: 5px 10px; border-radius: 8px; border-color: var(--primary); color: var(--primary); font-weight: 600;">Xem Cửa Hàng</a>' +
                     '</div>';

  var priceNum = parseInt(product.price.replace(/[^0-9]/g, ''), 10);
  container.innerHTML =
    '<div class="container">' +
      '<div class="detail-breadcrumb"><a href="index.html">Trang chủ</a> / <a href="shop.html">Cửa hàng</a> / <span style="color:var(--primary);font-weight:600">' + product.name + '</span></div>' +
      '<div class="detail-grid">' +
        '<div class="detail-image"><img src="' + product.image + '" alt="' + product.name + '" onerror="this.onerror=null;this.src=\'' + (product.storeLogo || '../images/store_logo.png') + '\'" /></div>' +
        '<div class="detail-info">' +
          '<div class="detail-badges"><span class="badge badge-accent" style="font-size:0.8rem">1% For Planet</span></div>' +
          '<h1 class="detail-name">' + product.name + '</h1>' +
          '<p class="detail-price" style="font-size: 1.75rem; font-weight: 900; color: var(--accent); margin: 0.5rem 0;">' + product.price + '</p>' +
          '<p class="detail-desc">' + product.description + '</p>' +
          '<div class="detail-impact">' +
            '<div class="impact-item"><span class="impact-label">Dấu chân Carbon</span><p class="impact-value">' + product.carbonFootprint + '</p></div>' +
            '<div class="impact-item accent"><span class="impact-label">Nước Tiết Kiệm</span><p class="impact-value">' + product.waterSaved + '</p></div>' +
          '</div>' +
          sizeHtml +
          colorHtml +
          stockHtml +
          '<div class="detail-sizechart" id="detail-sizechart" style="' + (product.sizeChart ? '' : 'display:none') + '">' +
            '<button type="button" class="btn-sizeguide" onclick="document.getElementById(\'sizechart-modal\').classList.add(\'show\')">' +
              '<i class="fa-solid fa-ruler-combined"></i> Hướng dẫn chọn size' +
            '</button>' +
          '</div>' +
          shopCardHtml +
          '<div class="detail-actions" style="margin-top: 0.75rem; display: flex; gap: 10px; flex-wrap: wrap;">' +
            '<button class="btn btn-outline btn-add-cart" style="border-color:var(--primary);color:var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px;"><i class="fa-solid fa-bag-shopping"></i>Thêm vào Giỏ Hàng</button>' +
            '<button class="btn btn-primary btn-buy-now" style="display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px;"><i class="fa-solid fa-bolt"></i>Mua Ngay</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-specs">' +
        '<div><h3 style="font-family:var(--font-serif);font-size:1.35rem;margin-bottom:1rem;color:var(--primary)">Chi tiết Thiết kế & Tác động</h3><ul class="specs-list">' +
          product.details.map(function(d) { return '<li><i class="fa-solid fa-circle-check"></i><span>' + d + '</span></li>'; }).join('') +
        '</ul></div>' +
      '</div>' +
      '<div class="review-section" id="review-section">' +
        '<h3>Đánh Giá & Nhận Xét từ Khách Hàng</h3>' +
        '<div class="review-layout">' +
          '<div class="review-form-card" id="review-form-card">' +
            '<h4>Đánh Giá Sản Phẩm</h4>' +
            '<form id="review-form">' +
              '<div class="form-group"><label>Họ & Tên</label><input type="text" id="review-name" placeholder="Nhập tên của bạn..." required /></div>' +
              '<div class="form-group"><label>Đánh giá số sao</label><select id="review-rating"><option value="5">⭐⭐⭐⭐⭐ (5 sao - Tuyệt vời)</option><option value="4">⭐⭐⭐⭐ (4 sao - Tốt)</option><option value="3">⭐⭐⭐ (3 sao - Bình thường)</option><option value="2">⭐⭐ (2 sao - Kém)</option><option value="1">⭐ (1 sao - Rất tệ)</option></select></div>' +
              '<div class="form-group"><label>Nội dung nhận xét</label><textarea id="review-text" rows="4" placeholder="Viết đánh giá của bạn tại đây..." required></textarea></div>' +
              '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px">Gửi Nhận Xét</button>' +
            '</form>' +
          '</div>' +
          '<div class="review-list" id="review-list"></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Bind interactive variant selection
  var selectedSize = '';
  var selectedColor = '';

  function updatePriceAndStock() {
    var match = null;
    if (variants.length > 0) {
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        var sizeMatch = !v.size || v.size === selectedSize;
        var colorMatch = !v.color || v.color === selectedColor;
        if (sizeMatch && colorMatch) {
          match = v;
          break;
        }
      }
    }

    var priceEl = container.querySelector('.detail-price');
    var stockEl = document.getElementById('detail-stock-value');
    var buyNowBtn = container.querySelector('.btn-buy-now');
    var addToCartBtn = container.querySelector('.btn-add-cart');

    if (match) {
      if (priceEl) priceEl.textContent = match.price.toLocaleString('vi-VN') + ' đ';
      if (stockEl) stockEl.textContent = match.stock;

      if (match.stock <= 0) {
        if (stockEl) stockEl.innerHTML = '<strong style="color:var(--sentiment-neg)">Hết hàng</strong>';
        if (buyNowBtn) { buyNowBtn.disabled = true; buyNowBtn.style.opacity = '0.5'; }
        if (addToCartBtn) { addToCartBtn.disabled = true; addToCartBtn.style.opacity = '0.5'; }
      } else {
        if (buyNowBtn) { buyNowBtn.disabled = false; buyNowBtn.style.opacity = '1'; }
        if (addToCartBtn) { addToCartBtn.disabled = false; addToCartBtn.style.opacity = '1'; }
      }
    } else {
      if (priceEl) priceEl.textContent = product.price;
      if (stockEl) stockEl.textContent = product.stock || 0;
    }
  }

  var sizeBtns = container.querySelectorAll('.btn-size-opt');
  for (var i = 0; i < sizeBtns.length; i++) {
    sizeBtns[i].addEventListener('click', function() {
      for (var j = 0; j < sizeBtns.length; j++) sizeBtns[j].classList.remove('selected');
      this.classList.add('selected');
      selectedSize = this.getAttribute('data-size');
      updatePriceAndStock();
    });
  }

  var colorBtns = container.querySelectorAll('.btn-color-opt');
  for (var i = 0; i < colorBtns.length; i++) {
    colorBtns[i].addEventListener('click', function() {
      for (var j = 0; j < colorBtns.length; j++) colorBtns[j].classList.remove('selected');
      this.classList.add('selected');
      selectedColor = this.getAttribute('data-color');
      updatePriceAndStock();
    });
  }

  // Pre-select first options if available
  if (sizeBtns.length > 0) sizeBtns[0].click();
  if (colorBtns.length > 0) colorBtns[0].click();

  // Add click handlers dynamically to avoid global scope bugs
  var addToCartBtn = container.querySelector('.btn-add-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      if (uniqueSizes.length > 0 && !selectedSize) { showToast('Vui lòng chọn Kích cỡ!'); return; }
      if (uniqueColors.length > 0 && !selectedColor) { showToast('Vui lòng chọn Màu sắc!'); return; }

      var variantStr = '';
      if (selectedSize && selectedColor) variantStr = selectedSize + ' - ' + selectedColor;
      else if (selectedSize) variantStr = selectedSize;
      else if (selectedColor) variantStr = selectedColor;
      else variantStr = 'Tiêu chuẩn';

      var finalPrice = priceNum;
      var finalPriceStr = product.price;
      var match = null;
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        if ((!v.size || v.size === selectedSize) && (!v.color || v.color === selectedColor)) {
          match = v;
          break;
        }
      }
      if (match) {
        finalPrice = match.price;
        finalPriceStr = match.price.toLocaleString('vi-VN') + ' đ';
      }

      var user = RefashionAuth._getUser();
      if (!user) { window.location.href = '../auth/login.html?redirect=shop-detail.html?id=' + product.id; return; }
      
      RefashionAuth.addToCart({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        priceStr: finalPriceStr,
        image: product.image,
        variant: variantStr
      });
      showToast('🛍️ Đã thêm "' + product.name + ' (' + variantStr + ')" vào giỏ hàng thành công!');
    });
  }

  var buyNowBtn = container.querySelector('.btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function() {
      if (uniqueSizes.length > 0 && !selectedSize) { showToast('Vui lòng chọn Kích cỡ!'); return; }
      if (uniqueColors.length > 0 && !selectedColor) { showToast('Vui lòng chọn Màu sắc!'); return; }

      var variantStr = '';
      if (selectedSize && selectedColor) variantStr = selectedSize + ' - ' + selectedColor;
      else if (selectedSize) variantStr = selectedSize;
      else if (selectedColor) variantStr = selectedColor;
      else variantStr = 'Tiêu chuẩn';

      var finalPrice = priceNum;
      var finalPriceStr = product.price;
      var match = null;
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i];
        if ((!v.size || v.size === selectedSize) && (!v.color || v.color === selectedColor)) {
          match = v;
          break;
        }
      }
      if (match) {
        finalPrice = match.price;
        finalPriceStr = match.price.toLocaleString('vi-VN') + ' đ';
      }

      var user = RefashionAuth._getUser();
      if (!user) { window.location.href = '../auth/login.html?redirect=shop-detail.html?id=' + product.id; return; }

      RefashionAuth.addToCart({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        priceStr: finalPriceStr,
        image: product.image,
        variant: variantStr
      });
      window.location.href = 'checkout.html';
    });
  }
}

function initReviewSystem(product) {
  var reviews = JSON.parse(JSON.stringify(product.initialReviews || []));
  if (!reviews || reviews.length === 0) {
    loadExternalReviews(product, function (extReviews) {
      Array.prototype.unshift.apply(reviews, extReviews);
      renderReviews(reviews);
    });
  } else {
    renderReviews(reviews);
  }

  var form = document.getElementById('review-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('review-name').value;
      var rating = parseInt(document.getElementById('review-rating').value);
      var text = document.getElementById('review-text').value;
      if (!name.trim() || !text.trim()) return;
      var review = {
        id: reviews.length + 1,
        user: name,
        avatar: name.charAt(0).toUpperCase(),
        rating: rating,
        date: new Date().toLocaleDateString('vi-VN'),
        comment: text
      };
      reviews.unshift(review);
      renderReviews(reviews);
      document.getElementById('review-name').value = '';
      document.getElementById('review-text').value = '';
      document.getElementById('review-rating').value = '5';
    });
  }
}

function loadExternalReviews(product, callback) {
  var xhr = new XMLHttpRequest();
  var pagePath = window.location.pathname;
  var base = pagePath.indexOf('/buyer/') !== -1 ? '../datasets/reviews.json' : 'datasets/reviews.json';
  xhr.open('GET', base, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        callback(data[product.id] || []);
      } catch (e) {
        callback([]);
      }
    } else {
      callback([]);
    }
  };
  xhr.onerror = function () { callback([]); };
  xhr.send();
}




function renderReviews(reviews) {
  var container = document.getElementById('review-list');
  if (!container) return;
  var html = '';
  for (var i = 0; i < reviews.length; i++) {
    var r = reviews[i];
    html +=
      '<div class="review-item">' +
        '<div class="review-header">' +
          '<div class="review-user">' +
            '<div class="review-avatar" style="background-color:var(--primary-light);color:var(--primary)">' + r.avatar + '</div>' +
            '<div><h4 style="font-weight:700;font-size:0.95rem">' + r.user + '</h4><span style="font-size:0.75rem;color:var(--text-muted)">' + r.date + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="review-stars">' + '\u2b50'.repeat(r.rating) + '</div>' +
        '<p class="review-text">' + r.comment + '</p>' +
      '</div>';
  }
  container.innerHTML = html;
}

function handleAddToCart(id, name, price, priceStr, image) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=shop-detail.html?id=' + id; return; }
  RefashionAuth.addToCart({ productId: id, name: name, price: price, priceStr: priceStr, image: image });
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
    items = [{ productId: p.id, name: p.name, price: priceNum, priceStr: p.price, image: p.image, quantity: 1 }];
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
        '<div style="flex:1;overflow:hidden">' +
          '<p style="font-size:0.85rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + '</p>' +
          '<p style="font-size:0.78rem;color:var(--text-muted);margin:2px 0 0 0">Phân loại: ' + (item.variant || 'Tiêu chuẩn') + ' • x' + item.quantity + '</p>' +
        '</div>' +
        '<span style="font-weight:700;font-size:0.9rem">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' đ</span>' +
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
        '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="profile.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Xem \u0110\u01a1n H\u00e0ng</a><a href="order-tracking.html?order=' + orderId + '" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Theo D\u00f5i</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Ti\u1ebfp T\u1ee5c Mua S\u1eafm</a></div>' +
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
      var profStatusMap = {
        pending: { badge: 'var(--sentiment-neu-light)', color: 'var(--sentiment-neu)', text: '\u23f3 \u0110ang x\u1eed l\u00fd' },
        confirmed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: '\u2705 \u0110\u00e3 x\u00e1c nh\u1eadn' },
        packed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: '\ud83d\udce6 \u0110\u00e3 \u0111\u00f3ng g\u00f3i' },
        shipping: { badge: 'var(--accent-light)', color: 'var(--accent)', text: '\ud83d\ude9a \u0110ang giao' },
        completed: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: '\u2705 \u0110\u00e3 giao' },
        delivered: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: '\u2705 \u0110\u00e3 giao' },
        cancelled: { badge: 'var(--danger-light)', color: 'var(--danger)', text: '\u274c \u0110\u00e3 h\u1ee7y' }
      };
      var ps = profStatusMap[o.status] || profStatusMap.pending;
      var statusBadge = ps.badge;
      var statusColor = ps.color;
      var statusText = ps.text;
      var firstItemId = o.items.length > 0 ? o.items[0].id : '1';
      var itemsHtml = '';
      for (var j = 0; j < o.items.length; j++) {
        var item = o.items[j];
        itemsHtml +=
          '<div onclick="window.location.href=\'shop-detail.html?id=' + item.id + '\'" style="cursor:pointer;display:flex;align-items:center;gap:0.75rem;background-color:var(--card);padding:0.6rem 1rem;border-radius:12px;border:1px solid var(--border);transition:all 0.25s ease;" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.transform=\'translateY(-2px)\';" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'none\';">' +
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
          '<div style="margin-top:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;border-top:1px dashed var(--border);padding-top:1rem">' +
            '<div style="display:flex;align-items:center;gap:0.35rem;font-size:0.8rem;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i><span>+' + o.greenCoinEarned + ' GreenCoin \u0111\u01b0\u1ee3c c\u1ed9ng t\u1eeb \u0111\u01a1n h\u00e0ng n\u00e0y</span></div>' +
            '<div style="display:flex;gap:0.5rem">' +
              '<button class="btn btn-outline" onclick="window.location.href=\'order-tracking.html?order=' + o.id + '\'" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;border-color:var(--primary);color:var(--primary);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Theo D\u00f5i</button>' +
              '<button class="btn btn-primary" onclick="window.location.href=\'shop-detail.html?id=' + firstItemId + '\'" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;background-color:var(--accent);border-color:var(--accent);color:var(--foreground);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\'">Mua L\u1ea1i</button>' +
            '</div>' +
          '</div>' +
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
        '<div class="wallet-card animate-pulse-soft"><div class="wallet-card-bg"><i class="fa-solid fa-leaf"></i></div><div><span style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:var(--accent)">V\u00ed GreenCoin C\u1ee7a B\u1ea1n</span>' + walletHtml + '</div><div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:1.5rem"><p style="font-size:0.85rem;opacity:0.85;line-height:1.5">\ud83c\udf40 C\u00e1ch ki\u1ebfm GreenCoin:<br />\u2022 Mua s\u1eafm t\u1ea1i ReFashion (+5 coin/100k)<br />\u2022 Pass \u0111\u1ed3 mi\u1ec5n ph\u00ed (+15 coin/s\u1ea3n ph\u1ea9m)<br />\u2022 \u0110i\u1ec3m danh h\u1eb1ng ng\u00e0y (+10 coin)</p><button onclick="dailyCheckin()" class="btn btn-outline" style="margin-top:1rem;width:100%;border-radius:12px;padding:0.7rem;font-size:0.85rem;font-weight:700;background-color:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25);color:#fff" id="checkin-btn"><i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> \u0110i\u1ec3m Danh Nh\u1eadn 10 Coin</button></div></div>' +
        '<div style="background-color:var(--card);border-radius:24px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow)"><h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:1.25rem">Chi\u1ebfn D\u1ecbch B\u1ea3o V\u1ec7 M\u00f4i Tr\u01b0\u1eddng \u0110ang Di\u1ec5n Ra</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1.25rem">' +
            '<div style="display:flex;gap:1rem;border-bottom:1px solid var(--border);padding-bottom:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-primary" style="font-size:0.65rem;margin-bottom:0.25rem">Ho\u1ea1t \u0111\u1ed9ng th\u00e1ng 6</span><h4 style="font-weight:700;font-size:0.95rem">Ng\u00e0y h\u1ed9i D\u1ecdn R\u00e1c & L\u00e0m S\u1ea1ch B\u1edd Bi\u1ec3n V\u0169ng T\u00e0u</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Tham gia c\u00f9ng h\u01a1n 200 t\u00ecnh nguy\u1ec7n vi\u00ean nh\u1eb7t r\u00e1c nh\u1ef1a, b\u1ea3o v\u1ec7 \u0111\u1ea1i d\u01b0\u01a1ng.</p><a href="https://tnmtvungtau.vn" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> Xem Chi Ti\u1ebft</a></div></div>' +
            '<div style="display:flex;gap:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-accent" style="font-size:0.65rem;margin-bottom:0.25rem">D\u1ef1 \u00e1n r\u1eebng xanh</span><h4 style="font-weight:700;font-size:0.95rem">Quy\u00ean G\u00f3p Ph\u1ee7 Xanh 10 Hecta R\u1eebng Ng\u1eadp M\u1eb7n</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Ph\u1ed1i h\u1ee3p tr\u1ed3ng r\u1eebng ch\u1ed1ng ng\u1eadp. Nh\u1ea5n \u0111\u1ed5i 50 GreenCoin \u0111\u1ec3 thay th\u1ebf 1 c\u00e2y con.</p><a href="https://www.thiennhien.net" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> Xem Chi Ti\u1ebft</a></div></div>' +
          '</div></div>' +
      '</div>' +
      '<div class="donation-rewards-layout">' +
'<div class="donation-form">' +
        '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem">Pass \u0110\u1ed3 Free</h3><p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem">Qu\u1ea7n \u00e1o kh\u00f4ng d\u00f9ng n\u1eefa c\u1ee7a b\u1ea1n s\u1ebd \u0111\u01b0\u1ee3c chuy\u1ec3n t\u1eebt ti\u1ebfp cho ng\u01b0\u1eddi c\u1ea7n. B\u1ea1n nh\u1eadn +15 GreenCoin m\u1ed7i m\u00f3n.</p>' +
          '<div id="donation-success" style="display:none" class="success-alert"><i class="fa-solid fa-circle-check"></i> Quy\u00ean g\u00f3p th\u00e0nh c\u00f4ng! GreenCoin \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1ed9ng v\u00e0o v\u00ed.</div>' +
          '<form id="donation-form">' +
            '<div class="form-group"><label>Lo\u1ea1i s\u1ea3n ph\u1ea9m</label><select id="donation-type"><option value="shirt">\u00c1o Thun / \u00c1o S\u01a1 Mi</option><option value="jacket">\u00c1o Kho\u00e1c</option><option value="pants">Qu\u1ea7n Jean / Kaki</option><option value="dress">V\u00e1y / \u0110\u1ea7m</option><option value="others">Kh\u00e1c</option></select></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">' +
              '<div class="form-group"><label>S\u1ed1 l\u01b0\u1ee3ng</label><input type="number" id="donation-qty" min="1" max="50" value="1" /></div>' +
              '<div class="form-group"><label>T\u00ecnh tr\u1ea1ng \u0111\u1ed3</label><select id="donation-condition"><option value="new">C\u00f2n r\u1ea5t m\u1edbi</option><option value="good">C\u00f2n t\u1ed1t</option><option value="reusable">H\u01a1i c\u0169 (C\u00f3 th\u1ec3 k\u00e9o s\u1ee3i)</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label>\u0110\u1ecba ch\u1ec9 giao \u0111\u1ed3</label><input type="text" id="donation-address" placeholder="Nh\u1eadp \u0111\u1ecba ch\u1ec9 giao \u0111\u1ed3..." required /></div>' +
            '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px;margin-top:1rem">' + (isLoggedIn ? 'Pass \u0110\u1ed3 Ngay' : '\u0110\u0103ng Nh\u1eadp \u0111\u1ec3 Pass \u0110\u1ed3') + '</button>' +
          '</form>' +
        '</div>' +
        '<div><h3 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary);margin-bottom:0.5rem">C\u1eeda H\u00e0ng Qu\u00e0 T\u1eb7ng Xanh</h3><p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:2rem">Quy \u0111\u1ed5i s\u1ed1 \u0111i\u1ec3m GreenCoin t\u00edch l\u0169y \u0111\u01b0\u1ee3c \u0111\u1ec3 nh\u1eadn c\u00e1c s\u1ea3n ph\u1ea9m ho\u1eb7c \u0111\u00f3ng g\u00f3p cho Tr\u00e1i \u0110\u1ea5t.</p><div class="rewards-grid">' + rewardsHtml + '</div></div>' +
      '</div>' +
    '</div></div>';
  bindDonationForm(isLoggedIn);
}

function dailyCheckin() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=community.html'; return; }
  var today = new Date().toLocaleDateString('vi-VN');
  var lastCheckin = user.lastCheckin || '';
  if (lastCheckin === today) {
    showToast('\u274c H\u00f4m nay b\u1ea1n \u0111\u00e3 \u0111i\u1ec3m danh r\u1ed3i! H\u00e3y quay l\u1ea1i ng\u00e0y mai.');
    return;
  }
  var bonus = 10;
  user.greenCoin = (user.greenCoin || 0) + bonus;
  user.lastCheckin = today;
  RefashionAuth._saveUser(user);
  showToast('\ud83c\udf40 \u0110i\u1ec3m danh th\u00e0nh c\u00f4ng! B\u1ea1n nh\u1eadn +' + bonus + ' GreenCoin.');
  document.getElementById('checkin-btn').disabled = true;
  document.getElementById('checkin-btn').innerHTML = '<i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> \u0110\u00e3 \u0110i\u1ec3m Danh';
  document.getElementById('checkin-btn').style.opacity = '0.6';
  document.getElementById('checkin-btn').style.cursor = 'not-allowed';
  renderCommunity();
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

/* ==================== SECONDHAND MARKETPLACE ==================== */
var secondhandState = {
  activeTab: 'feed', // 'feed' or 'post'
  selectedCategory: 'all',
  searchQuery: ''
};

// Helper to get/save shared secondhand items via localStorage
function getSecondhandItems() {
  try {
    return JSON.parse(localStorage.getItem('refashion_secondhand_items')) || [];
  } catch(e) { return []; }
}

function saveSecondhandItems(items) {
  localStorage.setItem('refashion_secondhand_items', JSON.stringify(items));
}

function initSecondhandPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');

  var user = RefashionAuth._getUser();
  if (user && user.role === 'Seller') {
    secondhandState.activeTab = 'feed';
  } else {
    secondhandState.activeTab = 'post';
  }

  // Seed from shared JSON if localStorage is empty
  var stored = localStorage.getItem('refashion_secondhand_items');
  if (!stored || JSON.parse(stored).length === 0) {
    // Try AJAX load from shared JSON dataset
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '../datasets/secondhand.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          saveSecondhandItems(data.items || []);
        } catch(e) {}
      }
      renderSecondhandContainer();
    };
    xhr.send();
  } else {
    renderSecondhandContainer();
  }
}


function renderSecondhandContainer() {
  var container = document.getElementById('secondhand-content');
  if (!container) return;

  var user = RefashionAuth._getUser();
  var headerTitle = '';
  var headerDesc = '';
  var headerBadge = '';

  if (user && user.role === 'Seller') {
    headerBadge = '<span class="badge badge-primary" style="margin-bottom:1rem"><i class="fa-solid fa-scissors"></i> Nguồn nguyên liệu thô</span>';
    headerTitle = 'Chợ Đồ Cũ Cho Designer';
    headerDesc = 'Nơi các Nhà thiết kế (Designer) tìm kiếm và thu mua lại các sản phẩm quần áo cũ từ cộng đồng để làm nguyên liệu tái chế, thiết kế Upcycle.';
  } else {
    headerBadge = '<span class="badge badge-accent" style="margin-bottom:1rem"><i class="fa-solid fa-bullhorn"></i> Thanh lý & Ký gửi</span>';
    headerTitle = 'Ký Gửi & Thanh Lý Đồ Cũ';
    headerDesc = 'Đăng bán thanh lý quần áo cũ của bạn làm nguyên liệu cho các Designer của ReFashion thu mua thiết kế lại, giúp giảm thiểu rác thải thời trang.';
  }

  container.innerHTML =
    '<div class="secondhand-section">' +
      '<div class="container">' +
        '<div class="secondhand-header">' +
          headerBadge +
          '<h1>' + headerTitle + '</h1>' +
          '<p style="color:var(--text-muted);font-size:1.1rem">' + headerDesc + '</p>' +
        '</div>' +
        '<div id="secondhand-tab-content"></div>' +
      '</div>' +
    '</div>';

  renderSecondhandTabContent();
}

function switchSecondhandTab(tabName) {
  // Access control check
  var user = RefashionAuth._getUser();
  if (user && user.role === 'Seller' && tabName === 'post') return;
  if ((!user || user.role === 'Buyer') && tabName === 'feed') return;

  secondhandState.activeTab = tabName;
  renderSecondhandTabContent();
}

function renderSecondhandTabContent() {
  var tabContainer = document.getElementById('secondhand-tab-content');
  if (!tabContainer) return;

  if (secondhandState.activeTab === 'feed') {
    renderSecondhandFeed(tabContainer);
  } else {
    renderSecondhandPostManager(tabContainer);
  }
}

function getSecondhandItems() {
  try {
    return JSON.parse(localStorage.getItem('refashion_secondhand_items')) || [];
  } catch(e) {
    return [];
  }
}

function saveSecondhandItems(items) {
  localStorage.setItem('refashion_secondhand_items', JSON.stringify(items));
}

function renderSecondhandFeed(container) {
  var items = getSecondhandItems();
  
  // Filter items
  var filtered = items.slice();
  if (secondhandState.selectedCategory !== 'all') {
    filtered = filtered.filter(function(i) { return i.category === secondhandState.selectedCategory; });
  }
  if (secondhandState.searchQuery.trim() !== '') {
    var q = secondhandState.searchQuery.toLowerCase();
    filtered = filtered.filter(function(i) {
      return i.name.toLowerCase().indexOf(q) !== -1 || i.description.toLowerCase().indexOf(q) !== -1;
    });
  }

  // Categories list
  var categories = [
    { id: 'all', name: 'Tất Cả' },
    { id: 'shirt', name: 'Áo Thun/Sơ Mi' },
    { id: 'pants', name: 'Quần Jeans/Kaki' },
    { id: 'jacket', name: 'Áo Khoác' },
    { id: 'dress', name: 'Váy/Đầm' },
    { id: 'others', name: 'Khác' }
  ];

  var filterHtml = categories.map(function(c) {
    var activeClass = secondhandState.selectedCategory === c.id ? 'badge-primary' : 'badge-accent';
    return '<span class="badge ' + activeClass + '" style="cursor:pointer;padding:0.4rem 1rem;font-size:0.8rem;text-transform:none" onclick="filterSecondhandCategory(\'' + c.id + '\')">' + c.name + '</span>';
  }).join(' ');

  var feedGridHtml = '';
  if (filtered.length === 0) {
    feedGridHtml =
      '<div class="not-found" style="grid-column:1/-1">' +
        '<i class="fa-solid fa-box-open" style="font-size:3rem;color:var(--text-muted);margin-bottom:1.5rem"></i>' +
        '<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">Chưa có sản phẩm nào</h3>' +
        '<p style="color:var(--text-muted);font-size:0.95rem">Không tìm thấy đồ secondhand nào phù hợp với bộ lọc hiện tại.</p>' +
      '</div>';
  } else {
    for (var i = 0; i < filtered.length; i++) {
      var item = filtered[i];
      var priceText = item.price === 0 ? 'Tặng Miễn Phí (0đ)' : item.price.toLocaleString('vi-VN') + ' đ';
      var conditionText = item.condition === 'new' ? 'Còn rất mới' : item.condition === 'good' ? 'Còn tốt' : 'Hơi cũ';
      var condColor = item.condition === 'new' ? 'var(--primary)' : 'var(--accent)';
      
      feedGridHtml +=
        '<div class="secondhand-card">' +
          '<div class="secondhand-card-img">' +
            '<span class="designer-badge-tag"><i class="fa-solid fa-scissors"></i> Upcycling Raw</span>' +
            '<img src="' + item.image + '" alt="' + item.name + '" />' +
          '</div>' +
          '<div class="secondhand-card-body">' +
            '<h3 class="secondhand-card-title">' + item.name + '</h3>' +
            '<div class="secondhand-card-meta">' +
              '<span class="secondhand-card-price" style="color:' + (item.price === 0 ? 'var(--primary)' : 'var(--accent)') + ';font-weight:800">' + priceText + '</span>' +
              '<span class="secondhand-card-condition" style="background-color:var(--sentiment-pos-light);color:' + condColor + '">' + conditionText + '</span>' +
            '</div>' +
            '<p class="secondhand-card-details">' + item.description + '</p>' +
            '<div class="secondhand-card-location">' +
              '<i class="fa-solid fa-location-dot" style="color:var(--accent)"></i> <span>' + item.location + '</span>' +
            '</div>' +
            '<div class="secondhand-card-footer">' +
              '<a href="tel:' + item.phone + '" class="btn btn-outline" style="flex:1;border-radius:10px;padding:0.5rem;font-size:0.8rem;text-align:center"><i class="fa-solid fa-phone"></i> Gọi Điện</a>' +
              '<a href="https://zalo.me/' + item.phone.replace(/\s+/g, '') + '" target="_blank" class="btn btn-primary" style="flex:1;border-radius:10px;padding:0.5rem;font-size:0.8rem;text-align:center;background-color:#0068ff"><i class="fa-solid fa-comment-dots"></i> Chat Zalo</a>' +
            '</div>' +
          '</div>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<div class="secondhand-layout">' +
      '<div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">' +
          '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">' + filterHtml + '</div>' +
          '<div style="position:relative;display:flex;align-items:center;width:240px">' +
            '<input type="text" placeholder="Tìm tên đồ cũ..." value="' + secondhandState.searchQuery + '" style="padding:0.5rem 1rem 0.5rem 2.25rem;border-radius:30px;border:1px solid var(--border);background-color:var(--card);color:var(--foreground);font-size:0.85rem;width:100%" id="secondhand-search" />' +
            '<i class="fa-solid fa-magnifying-glass" style="position:absolute;left:0.85rem;color:var(--text-muted);font-size:0.85rem"></i>' +
          '</div>' +
        '</div>' +
        '<div class="secondhand-grid">' + feedGridHtml + '</div>' +
      '</div>' +
      
      '<div>' +
        '<div class="donation-pitch-card">' +
          '<div style="width:60px;height:60px;border-radius:50%;background-color:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem"><i class="fa-solid fa-hand-holding-heart" style="font-size:1.8rem"></i></div>' +
          '<h3>Quyên Góp Từ Thiện</h3>' +
          '<p>Nếu bạn không muốn bán mà chỉ muốn quyên góp quần áo cũ một cách nhanh chóng, hãy gửi chúng đến ReFashion. Chúng tôi sẽ giặt ủi sạch sẽ và chuyển cho các hội đồng sinh thái hoặc Designer để tích thêm GreenCoin đổi voucher quà tặng nhé!</p>' +
          '<a href="community.html" class="btn btn-accent" style="width:100%;background-color:white;color:var(--primary);font-weight:700;border-radius:12px;display:block;text-align:center"><i class="fa-solid fa-heart"></i> Tới trang quyên góp</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Bind search input
  var search = document.getElementById('secondhand-search');
  if (search) {
    search.addEventListener('input', function() {
      secondhandState.searchQuery = this.value;
      renderSecondhandFeed(container);
    });
  }
}

function filterSecondhandCategory(cat) {
  secondhandState.selectedCategory = cat;
  renderSecondhandTabContent();
}

function renderSecondhandPostManager(container) {
  var user = RefashionAuth._getUser();
  var isLoggedIn = !!user;

  if (!isLoggedIn) {
    container.innerHTML =
      '<div class="not-found" style="padding:5rem 2rem">' +
        '<i class="fa-solid fa-lock" style="font-size:3rem;color:var(--text-muted);margin-bottom:1.5rem"></i>' +
        '<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">Vui lòng đăng nhập</h3>' +
        '<p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.5rem">Bạn cần đăng nhập bằng tài khoản Buyer để đăng thanh lý đồ secondhand hoặc quản lý tin đăng của mình.</p>' +
        '<a href="../auth/login.html?redirect=secondhand.html" class="btn btn-primary" style="border-radius:12px">Đăng Nhập Ngay</a>' +
      '</div>';
    return;
  }

  var items = getSecondhandItems();
  var myItems = items.filter(function(i) { return i.sellerEmail === user.email; });

  var myItemsHtml = '';
  if (myItems.length === 0) {
    myItemsHtml = '<p style="color:var(--text-muted);font-size:0.9rem;text-align:center;padding:2rem 0">Bạn chưa đăng tin thanh lý nào.</p>';
  } else {
    for (var i = 0; i < myItems.length; i++) {
      var item = myItems[i];
      var priceText = item.price === 0 ? 'Tặng Miễn Phí' : item.price.toLocaleString('vi-VN') + ' đ';
      myItemsHtml +=
        '<div class="post-manager-item">' +
          '<div class="post-manager-info">' +
            '<img src="' + item.image + '" class="post-manager-img" />' +
            '<div class="post-manager-meta">' +
              '<h4>' + item.name + '</h4>' +
              '<p style="color:var(--accent);font-weight:700">' + priceText + '</p>' +
            '</div>' +
          '</div>' +
          '<button onclick="deleteSecondhandItem(\'' + item.id + '\')" class="btn btn-outline" style="border-color:#ef4444;color:#ef4444;padding:0.4rem 0.8rem;border-radius:8px;font-size:0.75rem"><i class="fa-solid fa-trash-can"></i> Xóa tin</button>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<div class="secondhand-post-section">' +
      '<div class="donation-form">' +
        '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem">Đăng Tin Thanh Lý Đồ Cũ</h3>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem">Cung cấp thông tin chi tiết về món đồ cũ của bạn để các Designer có nhu cầu upcycle tìm mua.</p>' +
        
        '<form id="secondhand-post-form">' +
          '<div class="form-group"><label>Tên món đồ *</label><input type="text" id="sh-post-name" placeholder="VD: Quần bò jean cũ rách nhẹ gối..." required /></div>' +
          
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">' +
            '<div class="form-group"><label>Danh mục *</label><select id="sh-post-category"><option value="shirt">Áo Thun/Sơ Mi</option><option value="pants">Quần Jeans/Kaki</option><option value="jacket">Áo Khoác</option><option value="dress">Váy/Đầm</option><option value="others">Khác</option></select></div>' +
            '<div class="form-group"><label>Tình trạng đồ *</label><select id="sh-post-condition"><option value="new">Còn rất mới</option><option value="good">Còn tốt</option><option value="reusable">Hơi cũ (Vẫn may vá tốt)</option></select></div>' +
          '</div>' +
          
          '<div class="form-group"><label>Giá bán (đ) - Nhập 0 để Tặng Miễn Phí *</label><input type="number" id="sh-post-price" min="0" placeholder="VD: 50000" required /></div>' +
          '<div class="form-group"><label>Khu vực lấy đồ *</label><input type="text" id="sh-post-location" placeholder="VD: Quận 1, TP. Hồ Chí Minh" required /></div>' +
          '<div class="form-group"><label>Số điện thoại liên hệ (SĐT / Zalo) *</label><input type="tel" id="sh-post-phone" placeholder="VD: 0901234567" required /></div>' +
          
          '<div class="form-group">' +
            '<label>Hình ảnh món đồ</label>' +
            '<input type="file" id="sh-post-file" accept="image/*" style="display:none" />' +
            '<div class="image-upload-preview" id="sh-post-image-placeholder" onclick="document.getElementById(\'sh-post-file\').click()">' +
              '<i class="fa-solid fa-cloud-arrow-up" style="font-size:1.8rem;color:var(--primary);margin-bottom:0.5rem"></i>' +
              '<span style="font-size:0.8rem;color:var(--text-muted)">Nhấp để tải lên ảnh thực tế</span>' +
            '</div>' +
            '<div class="image-upload-preview" id="sh-post-image-preview-wrap" style="display:none" onclick="document.getElementById(\'sh-post-file\').click()">' +
              '<img src="" id="sh-post-image-preview-img" style="max-height: 150px; width: auto; object-fit: contain;" />' +
              '<span style="font-size:0.75rem;color:var(--primary);font-weight:700;margin-top:0.5rem">Nhấp để thay đổi ảnh</span>' +
            '</div>' +
          '</div>' +
          
          '<div class="form-group"><label>Mô tả chi tiết *</label><textarea id="sh-post-description" rows="3" placeholder="Ghi rõ chất liệu, kích cỡ, lỗi rách (nếu có) để designer dễ hình dung..." required></textarea></div>' +
          
          '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px;margin-top:1rem"><i class="fa-solid fa-bullhorn"></i> Đăng Bán Ngay</button>' +
        '</form>' +
      '</div>' +

      '<div class="post-manager-section">' +
        '<h3>Tin Đăng Của Bạn</h3>' +
        '<div class="post-manager-list">' + myItemsHtml + '</div>' +
      '</div>' +
    '</div>';

  // Bind file change preview
  var fileInput = document.getElementById('sh-post-file');
  var placeholder = document.getElementById('sh-post-image-placeholder');
  var previewWrap = document.getElementById('sh-post-image-preview-wrap');
  var previewImg = document.getElementById('sh-post-image-preview-img');
  
  window._secondhandUploadedBase64 = null;

  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
          window._secondhandUploadedBase64 = e.target.result;
          if (previewImg) previewImg.src = e.target.result;
          if (placeholder) placeholder.style.display = 'none';
          if (previewWrap) previewWrap.style.display = 'flex';
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  // Bind submit form
  var form = document.getElementById('secondhand-post-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('sh-post-name').value.trim();
      var category = document.getElementById('sh-post-category').value;
      var condition = document.getElementById('sh-post-condition').value;
      var price = parseInt(document.getElementById('sh-post-price').value) || 0;
      var locationStr = document.getElementById('sh-post-location').value.trim();
      var phone = document.getElementById('sh-post-phone').value.trim();
      var description = document.getElementById('sh-post-description').value.trim();

      var defaultImages = {
        shirt: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600',
        pants: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600',
        jacket: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600',
        dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600',
        others: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600'
      };

      var image = window._secondhandUploadedBase64 || defaultImages[category] || defaultImages.others;

      var newItem = {
        id: 'SH-' + Date.now(),
        name: name,
        category: category,
        condition: condition,
        price: price,
        location: locationStr,
        phone: phone,
        description: description,
        image: image,
        sellerEmail: user.email,
        date: new Date().toLocaleDateString('vi-VN')
      };

      var currentItems = getSecondhandItems();
      currentItems.unshift(newItem);
      saveSecondhandItems(currentItems);

      showToast('🎉 Đăng bán đồ secondhand thành công!');
      secondhandState.activeTab = 'feed';
      renderSecondhandContainer();
    });
  }
}

function deleteSecondhandItem(id) {
  var items = getSecondhandItems();
  var updated = items.filter(function(i) { return i.id !== id; });
  saveSecondhandItems(updated);
  showToast('🗑️ Đã xóa tin đăng.');
  renderSecondhandTabContent();
}

/* ==================== ABOUT PAGE ==================== */
function initAboutPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');
}

/* ==================== ORDER TRACKING ==================== */
function initTrackingPage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '../auth/login.html?redirect=order-tracking.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  if (!orderId) {
    document.getElementById('tracking-content').innerHTML = '<div style="text-align:center;padding:4rem"><h3>Không tìm thấy đơn hàng</h3><a href="profile.html" class="btn btn-primary" style="border-radius:12px">Quay lại Hồ Sơ</a></div>';
    return;
  }
  renderOrderTracking(orderId);
}

function renderOrderTracking(orderId) {
  var container = document.getElementById('tracking-content');
  if (!container) return;
  var orders = RefashionAuth._getOrders();
  var order = null;
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].id === orderId) { order = orders[i]; break; }
  }
  if (!order) {
    container.innerHTML = '<div style="text-align:center;padding:4rem"><h3>Không tìm thấy đơn hàng</h3><a href="profile.html" class="btn btn-primary" style="border-radius:12px">Quay lại Hồ Sơ</a></div>';
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '../datasets/tracking.json', true);
  xhr.onload = function() {
    var trackingData = null;
    if (xhr.status === 200) {
      var allTracking = JSON.parse(xhr.responseText);
      trackingData = allTracking[orderId] || null;
    }
    renderTrackingUI(container, order, trackingData);
  };
  xhr.onerror = function() { renderTrackingUI(container, order, null); };
  xhr.send();
}

function renderTrackingUI(container, order, trackingData) {
  var statusMap = {
    pending: { label: 'Ch\u1edd X\u00e1c Nh\u1eadn', icon: 'fa-clipboard-list', color: 'var(--sentiment-neu)' },
    confirmed: { label: '\u0110\u00e3 X\u00e1c Nh\u1eadn', icon: 'fa-check-circle', color: 'var(--primary)' },
    packed: { label: '\u0110\u00e3 \u0110\u00f3ng G\u00f3i', icon: 'fa-box', color: 'var(--primary)' },
    shipping: { label: '\u0110ang Giao', icon: 'fa-truck', color: 'var(--accent)' },
    completed: { label: '\u0110\u00e3 Giao', icon: 'fa-circle-check', color: 'var(--sentiment-pos)' },
    cancelled: { label: '\u0110\u00e3 H\u1ee7y', icon: 'fa-circle-xmark', color: 'var(--danger)' }
  };
  var currentStatus = order.status;
  var isCancelled = currentStatus === 'cancelled';
  var defaultSteps = [
    { status: 'pending', label: 'Ch\u1edd X\u00e1c Nh\u1eadn', time: order.date + ' 00:00', completed: true },
    { status: 'confirmed', label: '\u0110\u00e3 X\u00e1c Nh\u1eadn', time: null, completed: false },
    { status: 'packed', label: '\u0110\u00e3 \u0110\u00f3ng G\u00f3i', time: null, completed: false },
    { status: 'shipping', label: '\u0110ang Giao', time: null, completed: false },
    { status: 'completed', label: '\u0110\u00e3 Giao', time: null, completed: false }
  ];
  var steps = trackingData ? trackingData.steps : defaultSteps;
  var route = trackingData ? trackingData.route : [];
  var courier = trackingData ? trackingData.courier : '\u0110ang ch\u1edd x\u1eed l\u00fd';
  var estimatedDelivery = trackingData ? trackingData.estimatedDelivery : '\u0110ang c\u1eadp nh\u1eadt';
  var currentStepIdx = trackingData ? trackingData.currentStep : 0;
  if (isCancelled) currentStepIdx = -1;
  var itemsHtml = '';
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i];
    itemsHtml +=
      '<div class="tracking-item-row">' +
        '<img src="' + item.image + '" alt="' + item.name + '" />' +
        '<div><p class="tracking-item-name">' + item.name + '</p><p class="tracking-item-meta">' + (item.variant || '') + ' x' + item.quantity + '</p></div>' +
        '<span class="tracking-item-price">' + item.priceStr + '</span>' +
      '</div>';
  }
  var stepsHtml = '';
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    var isActive = i <= currentStepIdx;
    var isCurrent = i === currentStepIdx;
    var stepIcon = statusMap[s.status] ? statusMap[s.status].icon : 'fa-circle';
    stepsHtml +=
      '<div class="tracking-step' + (isActive ? ' active' : '') + (isCurrent ? ' current' : '') + '">' +
        '<div class="tracking-step-dot"><i class="fa-solid ' + stepIcon + '"></i></div>' +
        '<div class="tracking-step-body">' +
          '<p class="tracking-step-label">' + s.label + '</p>' +
          '<p class="tracking-step-time">' + (isActive && s.time ? s.time : '\u2014') + '</p>' +
        '</div>' +
      '</div>';
  }
  if (isCancelled) {
    stepsHtml +=
      '<div class="tracking-step active cancelled">' +
        '<div class="tracking-step-dot"><i class="fa-solid fa-circle-xmark"></i></div>' +
        '<div class="tracking-step-body">' +
          '<p class="tracking-step-label">\u0110\u00e3 H\u1ee7y</p>' +
          '<p class="tracking-step-time">' + order.date + '</p>' +
        '</div>' +
      '</div>';
  }
  var mapId = 'tracking-map-' + Date.now();
  container.innerHTML =
    '<div class="tracking-container">' +
      '<a href="profile.html" class="tracking-back"><i class="fa-solid fa-arrow-left"></i> Quay l\u1ea1i H\u1ed3 S\u01a1</a>' +
      '<div class="tracking-header">' +
        '<div>' +
          '<span class="tracking-badge">' + (isCancelled ? '\u0110\u00e3 H\u1ee7y' : (statusMap[currentStatus] ? statusMap[currentStatus].label : currentStatus)) + '</span>' +
          '<h1>Theo D\u00f5i \u0110\u01a1n H\u00e0ng</h1>' +
          '<p class="tracking-id">M\u00e3 \u0111\u01a1n: <strong>' + order.id + '</strong> &middot; \u0110\u1eb7t ng\u00e0y ' + order.date + '</p>' +
        '</div>' +
        '<div class="tracking-total">' + order.totalStr + '</div>' +
      '</div>' +
      '<div class="tracking-body">' +
        '<div class="tracking-main">' +
          '<div class="tracking-card">' +
            '<h3><i class="fa-solid fa-clock-rotate-left" style="margin-right:0.5rem"></i> L\u1ecbch Tr\u00ecnh \u0110\u01a1n H\u00e0ng</h3>' +
            '<div class="tracking-steps">' + stepsHtml + '</div>' +
          '</div>' +
          (route.length > 1 ? '<div class="tracking-card"><h3><i class="fa-solid fa-map" style="margin-right:0.5rem"></i> L\u1ed9 Tr\u00ecnh V\u1eadn Chuy\u1ec3n</h3><div id="' + mapId + '" class="tracking-map"></div></div>' : '') +
          '<div class="tracking-card">' +
            '<h3><i class="fa-solid fa-bag-shopping" style="margin-right:0.5rem"></i> S\u1ea3n Ph\u1ea9m trong \u0110\u01a1n</h3>' +
            '<div class="tracking-items">' + itemsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tracking-sidebar">' +
          '<div class="tracking-card">' +
            '<h4><i class="fa-solid fa-truck-fast" style="margin-right:0.5rem"></i> Th\u00f4ng Tin Giao H\u00e0ng</h4>' +
            '<div class="tracking-info-row"><span class="tracking-info-label">\u0110\u01a1n v\u1ecb v\u1eadn chuy\u1ec3n</span><span>' + courier + '</span></div>' +
            '<div class="tracking-info-row"><span class="tracking-info-label">D\u1ef1 ki\u1ebfn giao</span><span>' + estimatedDelivery + '</span></div>' +
            '<div class="tracking-info-row"><span class="tracking-info-label">\u0110\u1ecba ch\u1ec9 nh\u1eadn</span><span style="font-size:0.85rem">' + (order.address || '\u0110ang c\u1eadp nh\u1eadt') + '</span></div>' +
            (order.note ? '<div class="tracking-info-row"><span class="tracking-info-label">Ghi ch\u00fa</span><span>' + order.note + '</span></div>' : '') +
          '</div>' +
          '<div class="tracking-card">' +
            '<h4><i class="fa-solid fa-leaf" style="margin-right:0.5rem"></i> T\u00e1c \u0110\u1ed9ng Xanh</h4>' +
            '<p class="tracking-greencoin"><i class="fa-solid fa-leaf" style="color:var(--accent)"></i> +' + order.greenCoinEarned + ' GreenCoin</p>' +
            '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">S\u1ed1 coin n\u00e0y \u0111\u00e3 \u0111\u01b0\u1ee3c c\u1ed9ng v\u00e0o v\u00ed GreenCoin c\u1ee7a b\u1ea1n.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  if (route.length > 1) {
    setTimeout(function() { initTrackingMap(mapId, route); }, 100);
  }
}

function initTrackingMap(mapId, route) {
  var mapEl = document.getElementById(mapId);
  if (!mapEl || typeof L === 'undefined') return;
  var bounds = [];
  var latlngs = [];
  for (var i = 0; i < route.length; i++) {
    var p = [route[i].lat, route[i].lng];
    latlngs.push(p);
    bounds.push(p);
  }
  var map = L.map(mapId, { zoomControl: false }).setView(bounds[0], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);
  L.polyline(latlngs, { color: '#2a9d8f', weight: 4, opacity: 0.7 }).addTo(map);
  for (var i = 0; i < route.length; i++) {
    var isStart = i === 0;
    var isEnd = i === route.length - 1;
    var iconColor = isStart ? '#e76f51' : isEnd ? '#2a9d8f' : '#f4a261';
    var iconSize = isStart || isEnd ? 32 : 28;
    var iconFa = isStart ? 'fa-store' : isEnd ? 'fa-location-dot' : 'fa-warehouse';
    var markerHtml = '<div style="background:' + iconColor + ';width:' + iconSize + 'px;height:' + iconSize + 'px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:' + (iconSize * 0.44) + 'px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><i class="fa-solid ' + iconFa + '"></i></div>';
    var marker = L.marker(latlngs[i], {
      icon: L.divIcon({ html: markerHtml, className: '', iconSize: [iconSize, iconSize], iconAnchor: [iconSize / 2, iconSize / 2] })
    }).addTo(map);
    marker.bindPopup('<strong>' + route[i].label + '</strong><br>' + route[i].address);
  }
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  setTimeout(function() { map.invalidateSize(); }, 200);
}

/* ==================== INIT DISPATCH ==================== */
document.addEventListener('DOMContentLoaded', function() {
  var session = RefashionAuth._getUser();
  if (session && (session.role === 'Seller' || session.role === 'Admin')) {
    window.location.href = session.role === 'Seller' ? '../seller/seller_dashboard.html' : '../admin/index.html';
    return;
  }

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
    case 'secondhand.html': initSecondhandPage(); break;
    case 'order-tracking.html': initTrackingPage(); break;
    case 'about.html': initAboutPage(); break;
    default: initBuyerPage(); break;
  }
});
