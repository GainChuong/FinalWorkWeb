function getTopRecommendedIds() {
  var topSet = new Set();
  var user = typeof RefashionAuth !== 'undefined' ? RefashionAuth._getUser() : null;
  var stylePrefs = user && user.stylePreferences ? user.stylePreferences : null;

  if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.initialized && AI_REC_SYSTEM.similarities && typeof SHOP_PRODUCTS !== 'undefined') {
    var sorted = SHOP_PRODUCTS.slice().sort(function(a, b) {
      var scoreA = AI_REC_SYSTEM.similarities[a.id] || 0;
      var scoreB = AI_REC_SYSTEM.similarities[b.id] || 0;
      if (stylePrefs) {
        var aDesc = (a.description + ' ' + a.name + ' ' + a.category).toLowerCase();
        var bDesc = (b.description + ' ' + b.name + ' ' + b.category).toLowerCase();
        if (stylePrefs.shapes) stylePrefs.shapes.forEach(function(s) { if (aDesc.indexOf(s) !== -1) scoreA += 15; if (bDesc.indexOf(s) !== -1) scoreB += 15; });
        if (stylePrefs.fabrics) stylePrefs.fabrics.forEach(function(f) { if (aDesc.indexOf(f) !== -1) scoreA += 20; if (bDesc.indexOf(f) !== -1) scoreB += 20; });
        if (stylePrefs.patterns) stylePrefs.patterns.forEach(function(p) { if (aDesc.indexOf(p) !== -1) scoreA += 15; if (bDesc.indexOf(p) !== -1) scoreB += 15; });
      }
      return scoreB - scoreA;
    });
    for (var i = 0; i < Math.min(12, sorted.length); i++) {
      var baseScore = AI_REC_SYSTEM.similarities[sorted[i].id] || 0;
      if (baseScore > 30 || stylePrefs) {
        topSet.add(sorted[i].id);
      }
    }
  }
  return topSet;
}

function renderFeaturedProducts(prefix) {
  prefix = prefix || '';
  var grid = document.getElementById('featured-products-grid');
  if (!grid) return;

  var list = SHOP_PRODUCTS.slice();
  var user = typeof RefashionAuth !== 'undefined' ? RefashionAuth._getUser() : null;
  var stylePrefs = user && user.stylePreferences ? user.stylePreferences : null;

  if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.initialized && AI_REC_SYSTEM.similarities) {
    list.sort(function(a, b) { 
      var scoreA = AI_REC_SYSTEM.similarities[a.id] || 0;
      var scoreB = AI_REC_SYSTEM.similarities[b.id] || 0;
      if (stylePrefs) {
        var aDesc = (a.description + ' ' + a.name + ' ' + a.category).toLowerCase();
        var bDesc = (b.description + ' ' + b.name + ' ' + b.category).toLowerCase();
        if (stylePrefs.shapes) stylePrefs.shapes.forEach(function(s) { if (aDesc.indexOf(s) !== -1) scoreA += 15; if (bDesc.indexOf(s) !== -1) scoreB += 15; });
        if (stylePrefs.fabrics) stylePrefs.fabrics.forEach(function(f) { if (aDesc.indexOf(f) !== -1) scoreA += 20; if (bDesc.indexOf(f) !== -1) scoreB += 20; });
        if (stylePrefs.patterns) stylePrefs.patterns.forEach(function(p) { if (aDesc.indexOf(p) !== -1) scoreA += 15; if (bDesc.indexOf(p) !== -1) scoreB += 15; });
      }
      return scoreB - scoreA; 
    });
  }

  var displayList = list.slice(0, 8);

  if (displayList.length === 0) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:4rem 2rem;color:var(--text-muted)">' +
        '<i class="fa-solid fa-compass" style="font-size:3rem;margin-bottom:1rem;opacity:0.3"></i>' +
        '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Discover Your Style</h3>' +
        '<p style="font-size:0.9rem;margin-bottom:1.5rem">Browse products and we\'ll recommend pieces tailored just for you.</p>' +
        '<a href="shop.html" class="btn btn-primary" style="border-radius:12px">Explore Shop</a>' +
      '</div>';
    return;
  }

  var html = '';
  var topRecIds = getTopRecommendedIds();
  for (var i = 0; i < displayList.length; i++) {
    var p = displayList[i];
    var stars = Math.round(p.rating || 4.5);
    var starHtml = '';
    for (var s = 0; s < 5; s++) {
      starHtml += s < stars ? '<i class="fa-solid fa-star" style="color:var(--accent);font-size:0.75rem"></i>' : '<i class="fa-regular fa-star" style="color:var(--accent);font-size:0.75rem"></i>';
    }
    var sale = i % 3 === 1;
    var saleBadge = sale ? '<span class="badge-sale">-20%</span>' : '';
    var salePrice = sale ? '<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.9rem;margin-right:6px">' + Math.round(p.price * 1.25).toLocaleString('vi-VN') + 'đ</span>' : '';
    var aiBadge = (topRecIds.has(p.id) ? '<span class="ai-match-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Suggest for You</span>' : '');
    html +=
      '<div class="product-card" style="cursor:pointer" onclick="goToDetail(\'' + p.id + '\')">' +
        (sale ? '<span class="badge-sale-corner">20% OFF</span>' : '') +
        '<div class="product-img-wrap">' +
          '<img src="' + p.image + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'' + (p.storeLogo || '../images/store_logo.png') + '\'" />' +
          aiBadge +
        '</div>' +
        '<div class="product-info">' +
          '<p class="product-category" style="cursor:pointer" onclick="event.stopPropagation(); goToShop(\'' + p.store.replace(/'/g, "\\'") + '\')">' + p.store + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + salePrice + p.priceStr + '</span>' +
            saleBadge +
          '</div>' +
          '<div class="product-rating-row">' +
            starHtml +
            '<span class="product-rating-num">' + (p.rating || 4.5).toFixed(1) + '</span>' +
            '<span class="product-rating-count">(' + p.ratingCount + ' reviews)</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;">' +
'<button class="btn btn-outline" style="flex:1;border-radius:10px;font-size:0.75rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="event.stopPropagation(); RefashionAuth.addToCart({productId:\'' + p.id + '\',name:\'' + p.name.replace(/'/g, "\\'") + '\',price:' + p.price + ',priceStr:\'' + p.priceStr + '\',image:\'' + p.image + '\'}); showToast(\'\u2705 Added to cart!\')"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>' +
'<button class="btn btn-primary" style="flex:1;border-radius:10px;font-size:0.75rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="event.stopPropagation(); RefashionAuth.addToCart({productId:\'' + p.id + '\',name:\'' + p.name.replace(/'/g, "\\'") + '\',price:' + p.price + ',priceStr:\'' + p.priceStr + '\',image:\'' + p.image + '\'}); window.location.href=\'/buyer/cart.html\'"><i class="fa-solid fa-bolt"></i> Buy Now</button>' +
'</div>' +
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
        window.location.href = '/auth/login.html?redirect=/buyer/cart.html';
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

var shopState = { selectedCategory: 'all', selectedStore: 'all', searchQuery: '', sortBy: 'default', currentPage: 1, itemsPerPage: 12 };

function saveShopState() {
  try {
    sessionStorage.setItem('refashion_shop_state', JSON.stringify(shopState));
  } catch (e) {}
}

function initShopPage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');

  // Restore previous filters and pagination index
  try {
    var saved = sessionStorage.getItem('refashion_shop_state');
    if (saved) {
      var parsed = JSON.parse(saved);
      shopState.selectedCategory = parsed.selectedCategory || 'all';
      shopState.selectedStore = parsed.selectedStore || 'all';
      shopState.searchQuery = parsed.searchQuery || '';
      shopState.sortBy = parsed.sortBy || 'default';
      shopState.currentPage = parsed.currentPage || 1;
    }
  } catch (e) {}

  // If returning from a product detail view, clear the transition flag while preserving current page
  try {
    if (sessionStorage.getItem('rf_from_detail') === '1') {
      sessionStorage.removeItem('rf_from_detail');
    }
  } catch(e) {}

  var params = new URLSearchParams(window.location.search);
  var storeParam = params.get('store');
  if (storeParam) {
    shopState.selectedStore = storeParam;
    saveShopState();
  }

  renderShopBanner();
  renderShopFilters();
  renderShopProducts();
  bindShopFilters();
  initAdvancedSearch();

  // Banner buttons (follow + chat)
  document.addEventListener('click', function(e) {
    var followBtn = e.target.closest('.btn-follow-store');
    if (followBtn) {
      var isFollowing = followBtn.classList.toggle('following');
      if (isFollowing) {
        followBtn.innerHTML = '<i class="fa-solid fa-check"></i> Following';
        showToast('Thank you for following!');
      } else {
        followBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Follow';
        showToast('Unfollowed store');
      }
      return;
    }
    var chatBtn = e.target.closest('.btn-chat-store');
    if (chatBtn) {
      var storeName = shopState.selectedStore || 'Eco Wear';
      if (typeof openBuyerChatWithStore === 'function') {
        openBuyerChatWithStore(storeName);
      } else {
        showToast('Direct chat with ' + storeName + ' coming soon!');
      }
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
          '<span style="position: absolute; bottom: 0; right: 0; background: var(--accent); color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">Favorite</span>' +
        '</div>' +
        '<div>' +
          '<h2 style="font-family: var(--font-serif); font-size: 1.75rem; margin: 0; font-weight: 400; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">' + storeName + '</h2>' +
          '<p style="font-size: 0.8rem; opacity: 0.9; margin: 4px 0 0 0;"><i class="fa-solid fa-circle" style="color: #4ade80; font-size: 0.55rem; margin-right: 4px;"></i> Active</p>' +
        '</div>' +
      '</div>' +
      '<div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: center;">' +
        '<div style="display: flex; gap: 2rem; border-right: 1px solid rgba(255,255,255,0.2); padding-right: 2rem;">' +
          '<div style="text-align: center;">' +
            '<p style="font-size: 0.75rem; opacity: 0.75; margin: 0;">Reviews</p>' +
            '<p style="font-size: 1.1rem; font-weight: 800; margin: 2px 0 0 0; color: var(--accent);">4.9 / 5.0</p>' +
          '</div>' +
          '<div style="text-align: center;">' +
            '<p style="font-size: 0.75rem; opacity: 0.75; margin: 0;">Products</p>' +
            '<p style="font-size: 1.1rem; font-weight: 800; margin: 2px 0 0 0; color: white;">24</p>' +
          '</div>' +
          '<div style="text-align: center;">' +
            '<p style="font-size: 0.75rem; opacity: 0.75; margin: 0;">Responses</p>' +
            '<p style="font-size: 1.1rem; font-weight: 800; margin: 2px 0 0 0; color: white;">98%</p>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; gap: 10px;">' +
          '<button type="button" class="btn btn-accent btn-chat-store" style="font-size: 0.8rem; padding: 10px 18px; border-radius: 12px; font-weight: 700; border: none; cursor: pointer;"><i class="fa-solid fa-comments"></i> Chat</button>' +
          '<button type="button" class="btn btn-outline btn-follow-store" style="font-size: 0.8rem; padding: 10px 18px; border-radius: 12px; font-weight: 700; border: 1.5px solid white; color: white; background: transparent; cursor: pointer; transition: all 0.2s;"><i class="fa-solid fa-plus"></i> Follow</button>' +
          '<button type="button" class="btn btn-outline" style="font-size: 0.8rem; padding: 10px 14px; border-radius: 12px; font-weight: 700; border: 1.5px solid white; color: white; background: transparent; cursor: pointer; transition: all 0.2s;" onclick="window.location.href=\x27/buyer/shop.html\x27" title="View all stores"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
}

function renderFeaturedStores() {
  var grid = document.getElementById('featured-stores-grid');
  if (!grid) return;

  var storeMap = {};
  for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
    var p = SHOP_PRODUCTS[i];
    if (p.store && !storeMap[p.store]) {
      storeMap[p.store] = p.storeLogo || '../images/store_logo.png';
    }
  }

  var stores = Object.keys(storeMap).sort();
  var html = '';

  for (var j = 0; j < stores.length; j++) {
    var storeName = stores[j];
    var logo = storeMap[storeName];
    html +=
      '<div class="partner-logo-item" onclick="goToShop(\'' + storeName.replace(/'/g, "\\'") + '\')" title="' + storeName + '">' +
        '<img src="' + logo + '" alt="' + storeName + '" class="partner-logo-img" onerror="this.onerror=null;this.src=\'../images/store_logo.png\'" />' +
      '</div>';
  }
  grid.innerHTML = html;
}

function renderShopFilters() {
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
  
  // Render Shopee-style prominent stores section
  renderFeaturedStores();
}

window.onShopFilterChange = function(radio) {
  if (radio.checked) {
    shopState.selectedStore = radio.value;
    shopState.currentPage = 1;
    saveShopState();
    renderShopBanner();
    renderShopProducts();
  }
};

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
  else if (shopState.sortBy === 'ai-rec' || (shopState.sortBy === 'default' && typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.hasPreferences())) {
    var user = typeof RefashionAuth !== 'undefined' ? RefashionAuth._getUser() : null;
    var stylePrefs = user && user.stylePreferences ? user.stylePreferences : null;

    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.similarities) {
      result.sort(function(a, b) { 
        var scoreA = AI_REC_SYSTEM.similarities[a.id] || 0;
        var scoreB = AI_REC_SYSTEM.similarities[b.id] || 0;
        if (stylePrefs) {
          var aDesc = (a.description + ' ' + a.name + ' ' + a.category).toLowerCase();
          var bDesc = (b.description + ' ' + b.name + ' ' + b.category).toLowerCase();
          if (stylePrefs.shapes) stylePrefs.shapes.forEach(function(s) { if (aDesc.indexOf(s) !== -1) scoreA += 15; if (bDesc.indexOf(s) !== -1) scoreB += 15; });
          if (stylePrefs.fabrics) stylePrefs.fabrics.forEach(function(f) { if (aDesc.indexOf(f) !== -1) scoreA += 20; if (bDesc.indexOf(f) !== -1) scoreB += 20; });
          if (stylePrefs.patterns) stylePrefs.patterns.forEach(function(p) { if (aDesc.indexOf(p) !== -1) scoreA += 15; if (bDesc.indexOf(p) !== -1) scoreB += 15; });
        }
        return scoreB - scoreA; 
      });
    }
  }
  return result;
}

function renderShopProducts() {
  var grid = document.getElementById('shop-product-grid');
  var count = document.getElementById('shop-result-count');
  if (!grid) return;

  // Render skeleton screen if AI recommendations are compiling and not ready yet
  if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.hasPreferences() && !AI_REC_SYSTEM.ready) {
    var skeletonHtml = '';
    for (var k = 0; k < 12; k++) {
      skeletonHtml += 
        '<div class="skeleton-card">' +
          '<div class="skeleton-img"></div>' +
          '<div class="skeleton-info">' +
            '<div class="skeleton-line title"></div>' +
            '<div class="skeleton-line price"></div>' +
            '<div class="skeleton-line rating"></div>' +
            '<div class="skeleton-btn"></div>' +
          '</div>' +
        '</div>';
    }
    grid.innerHTML = skeletonHtml;
    var pagDiv = document.getElementById('shop-pagination');
    if (pagDiv) pagDiv.innerHTML = '';
    return;
  }
  var results = filterShopProducts();
  if (count) count.innerHTML = results.length.toString();
  if (results.length === 0) {
    grid.innerHTML =
      '<div class="not-found">' +
        '<i class="fa-solid fa-folder-open" style="font-size:3rem;color:var(--text-muted);margin-bottom:1.5rem"></i>' +
'<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">No products found</h3>' +
'<p style="color:var(--text-muted);font-size:0.95rem">Try clearing some filters to discover more eco-friendly products.</p>' +
      '</div>';
    var pagDiv = document.getElementById('shop-pagination');
    if (pagDiv) pagDiv.innerHTML = '';
    return;
  }

  // Calculate pages
  var startIndex = (shopState.currentPage - 1) * shopState.itemsPerPage;
  var endIndex = Math.min(startIndex + shopState.itemsPerPage, results.length);
  var pageProducts = results.slice(startIndex, endIndex);
  var topRecIds = getTopRecommendedIds();
  var html = '';
  for (var i = 0; i < pageProducts.length; i++) {
    var p = pageProducts[i];
    var stars = Math.round(p.rating || 4.5);
    var starHtml = '';
    for (var s = 0; s < 5; s++) {
      starHtml += s < stars ? '<i class="fa-solid fa-star" style="color:var(--accent);font-size:0.75rem"></i>' : '<i class="fa-regular fa-star" style="color:var(--accent);font-size:0.75rem"></i>';
    }
    var sale = ((startIndex + i) % 3 === 1); // Maintain consistency with global index
    var saleBadge = sale ? '<span class="badge-sale">-20%</span>' : '';
    var salePrice = sale ? '<span style="text-decoration:line-through;color:var(--text-muted);font-size:0.9rem;margin-right:6px">' + Math.round(p.price * 1.25).toLocaleString('vi-VN') + 'đ</span>' : '';
    var isRecommended = topRecIds.has(p.id);
    var aiBadge = (isRecommended ? '<span class="ai-match-badge"><i class="fa-solid fa-wand-magic-sparkles"></i> Suggest for You</span>' : '');
    var xaiButton = (isRecommended ? '<button class="xai-btn-outline" onclick="event.stopPropagation(); showXaiModal(\'' + p.id + '\')"><i class="fa-solid fa-wand-magic-sparkles"></i> Why am I seeing this?</button>' : '');
    html +=
      '<div class="product-card" style="cursor:pointer" onclick="goToDetail(\'' + p.id + '\')">' +
        (sale ? '<span class="badge-sale-corner">20% OFF</span>' : '') +
        '<div class="product-img-wrap">' +
          '<img src="' + p.image + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'' + (p.storeLogo || '../images/store_logo.png') + '\'" />' +
          (p.clothFile ? '<span style="position:absolute;bottom:8px;left:8px;background:rgba(91,116,83,0.9);color:white;font-size:0.65rem;font-weight:700;padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:4px"><i class=\'fa-solid fa-wand-magic-sparkles\'></i>AI Try-On</span>'
        : '') +
          aiBadge +
        '</div>' +
        '<div class="product-info" style="display:flex; flex-direction:column">' +
          '<p class="product-category" style="cursor:pointer" onclick="event.stopPropagation(); goToShop(\'' + p.store.replace(/'/g, "\\'") + '\')">' + p.store + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + salePrice + p.priceStr + '</span>' +
          '</div>' +
          '<div class="product-rating-row">' +
            starHtml +
            '<span class="product-rating-num">' + (p.rating || 4.5).toFixed(1) + '</span>' +
            '<span class="product-rating-count">(' + p.ratingCount + ' reviews)</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;">' +
'<button class="btn btn-outline" style="flex:1;border-radius:10px;font-size:0.75rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="event.stopPropagation(); RefashionAuth.addToCart({productId:\'' + p.id + '\',name:\'' + p.name.replace(/'/g, "\\'") + '\',price:' + p.price + ',priceStr:\'' + p.priceStr + '\',image:\'' + p.image + '\'}); showToast(\'\u2705 Added to cart!\')"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>' +
'<button class="btn btn-primary" style="flex:1;border-radius:10px;font-size:0.75rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="event.stopPropagation(); RefashionAuth.addToCart({productId:\'' + p.id + '\',name:\'' + p.name.replace(/'/g, "\\'") + '\',price:' + p.price + ',priceStr:\'' + p.priceStr + '\',image:\'' + p.image + '\'}); window.location.href=\'/buyer/cart.html\'"><i class="fa-solid fa-bolt"></i> Buy Now</button>' +
'</div>' +
          xaiButton +
          '<button class="dpp-btn-outline" onclick="event.stopPropagation(); showDppModal(\'' + p.id + '\')"><i class="fa-solid fa-passport"></i> View DPP</button>' +
        '</div>' +
      '</div>';
  }
  grid.innerHTML = html;

  renderShopPagination(results.length);
}

function renderShopPagination(totalItems) {
  var paginationContainer = document.getElementById('shop-pagination');
  if (!paginationContainer) return;

  var totalPages = Math.ceil(totalItems / shopState.itemsPerPage);
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  var html = '';
  // Back button
  html += '<button class="pagination-btn" ' + (shopState.currentPage === 1 ? 'disabled' : '') + ' onclick="changeShopPage(' + (shopState.currentPage - 1) + ')"><i class="fa-solid fa-chevron-left"></i></button>';

  for (var i = 1; i <= totalPages; i++) {
    if (i === shopState.currentPage) {
      html += '<button class="pagination-btn active">' + i + '</button>';
    } else {
      html += '<button class="pagination-btn" onclick="changeShopPage(' + i + ')">' + i + '</button>';
    }
  }

  // Next button
  html += '<button class="pagination-btn" ' + (shopState.currentPage === totalPages ? 'disabled' : '') + ' onclick="changeShopPage(' + (shopState.currentPage + 1) + ')"><i class="fa-solid fa-chevron-right"></i></button>';

  paginationContainer.innerHTML = html;
}

window.changeShopPage = function(page) {
  shopState.currentPage = page;
  saveShopState();
  renderShopProducts();
  var shopSection = document.querySelector('.shop-section');
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: 'smooth' });
  }
};

function bindShopFilters() {
  var catRadios = document.querySelectorAll('input[name="category"]');
  for (var i = 0; i < catRadios.length; i++) {
    // Set checked state matching restored category value
    if (catRadios[i].value === shopState.selectedCategory) {
      catRadios[i].checked = true;
    }
    catRadios[i].addEventListener('change', function() {
      if (this.checked) {
        shopState.selectedCategory = this.value;
        shopState.currentPage = 1;
        saveShopState();
        renderShopProducts();
      }
    });
  }
  var shopRadios = document.querySelectorAll('input[name="shop-filter"]');
  for (var si = 0; si < shopRadios.length; si++) {
    if (shopRadios[si].value === shopState.selectedStore) {
      shopRadios[si].checked = true;
    }
    shopRadios[si].addEventListener('change', function() {
      if (this.checked) {
        shopState.selectedStore = this.value;
        shopState.currentPage = 1;
        saveShopState();
        renderShopBanner();
        renderShopProducts();
      }
    });
  }
  var searchInput = document.getElementById('filter-search');
  if (searchInput) {
    // Restore search input text
    searchInput.value = shopState.searchQuery;
    searchInput.addEventListener('input', function() {
      shopState.searchQuery = this.value;
      shopState.currentPage = 1;
      saveShopState();
      renderShopProducts();
      if (typeof AI_REC_SYSTEM !== 'undefined' && this.value.trim().length > 2) {
        AI_REC_SYSTEM.trackSearch(this.value);
      }
    });
    var clearBtn = document.getElementById('filter-search-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() {
      shopState.searchQuery = '';
      searchInput.value = '';
      shopState.currentPage = 1;
      saveShopState();
      renderShopProducts();
    });
  }
  var sortSelect = document.getElementById('shop-sort');
  if (sortSelect) {
    // Restore sort dropdown choice
    sortSelect.value = shopState.sortBy;
    sortSelect.addEventListener('change', function() {
      shopState.sortBy = this.value;
      shopState.currentPage = 1;
      saveShopState();
      renderShopProducts();
    });
  }
  var resetBtn = document.getElementById('filter-reset');
  if (resetBtn) resetBtn.addEventListener('click', function() {
    shopState.selectedCategory = 'all';
    shopState.selectedStore = 'all';
    shopState.searchQuery = '';
    shopState.sortBy = 'default';
    shopState.currentPage = 1;
    try {
      sessionStorage.removeItem('refashion_shop_state');
    } catch(e) {}
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
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/cart.html'; return; }
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
        '<h2 style="font-family:var(--font-serif);font-size:1.75rem;margin-bottom:0.75rem">Your Cart is Empty</h2>' +
        '<p style="color:var(--text-muted);font-size:1rem;margin-bottom:2rem">You haven\'t added any products yet. Explore our green fashion collection!</p>' +
        '<a href="/buyer/shop.html" class="btn btn-primary" style="padding:1rem 2.5rem;border-radius:14px;font-size:1rem"><i class="fa-solid fa-bag-shopping" style="margin-right:0.4rem"></i>Explore Store</a>' +
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
        '<div class="cart-item-img"><img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'../images/sh_denim_shirt.png\'" /></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-header">' +
            '<div><h3 style="font-size:1.05rem;font-weight:700">' + item.name + '</h3>' +
            '<p style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0"><i class="fa-solid fa-tags" style="font-size:0.7rem;margin-right:0.25rem"></i>Variant: ' + (item.variant || 'Standard') + '</p></div>' +
            '<button onclick="removeCartItem(\'' + item.productId + '\', \'' + (item.variant || 'Standard') + '\')" style="background:transparent;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem;padding:0.25rem;border-radius:8px" title="Remove product"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div>' +
          '<p class="cart-item-price">' + item.priceStr + '</p>' +
          '<div style="display:flex;align-items:center;gap:0.75rem">' +
            '<span style="font-size:0.85rem;color:var(--text-muted);font-weight:500">Qty:</span>' +
            '<div class="quantity-control">' +
              '<button onclick="updateQty(\'' + item.productId + '\', \'' + (item.variant || 'Standard') + '\', ' + (item.quantity - 1) + ')"><i class="fa-solid fa-minus" style="font-size:0.7rem"></i></button>' +
              '<span class="qty-value">' + item.quantity + '</span>' +
              '<button onclick="updateQty(\'' + item.productId + '\', \'' + (item.variant || 'Standard') + '\', ' + (item.quantity + 1) + ')"><i class="fa-solid fa-plus" style="font-size:0.7rem"></i></button>' +
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
        '<span style="max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item.name + ' (' + (item.variant || 'Standard') + ') x' + item.quantity + '</span>' +
        '<span style="font-weight:600;color:var(--foreground)">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' đ</span>' +
      '</div>';
  }
  container.innerHTML =
    '<div class="cart-layout">' +
      '<div class="cart-items">' + itemsHtml + '</div>' +
      '<div class="order-summary">' +
        '<h3>Order Summary</h3>' +
        '<div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem">' + itemsSummaryHtml + '</div>' +
        '<hr style="border:0;border-top:1px solid var(--border);margin-bottom:1.5rem" />' +
        '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem">' +
          '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Subtotal</span><span style="font-weight:600">' + total.toLocaleString('vi-VN') + ' \u0111</span></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Shipping</span><span style="font-weight:600;color:var(--sentiment-pos)">Free</span></div>' +
        '</div>' +
        '<hr style="border:0;border-top:2px solid var(--primary);margin-bottom:1.25rem" />' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:1rem"><span style="font-size:1.15rem;font-weight:700">Total</span><span style="font-size:1.5rem;font-weight:900;color:var(--accent)">' + total.toLocaleString('vi-VN') + ' \u0111</span></div>' +
        '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:0.85rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;font-weight:600;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i> You\'ll earn +' + greenCoinEst + ' GreenCoin after ordering!</div>' +
        '<a href="/buyer/checkout.html" class="btn btn-primary" style="width:100%;padding:1rem;border-radius:14px;font-size:1.05rem;font-weight:700;display:block;text-align:center;margin-top:1.25rem;"><i class="fa-solid fa-lock" style="margin-right:0.35rem"></i>Proceed to Checkout</a>' +
        '<p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:1rem"><i class="fa-solid fa-shield-halved" style="margin-right:0.25rem"></i>Secure & encrypted payment</p>' +
      '</div>' +
    '</div>';
}

function removeCartItem(productId, variant) {
  RefashionAuth.removeFromCart(productId, variant);
  showToast('✅ Removed product variant from cart');
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
      { size: 'Standard', color: 'Trắng Ngà', price: 180000, stock: 25 },
      { size: 'Standard', color: 'Đen', price: 180000, stock: 15 }
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
      { size: 'Standard', color: 'Canvas Patchwork', price: 320000, stock: 15 }
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
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600',
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
      { size: 'Standard', color: 'Trắng Kem', price: 220000, stock: 30 }
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
            category: p.category === 'jacket' ? 'Men/Women Jacket' : p.category === 'tshirt' ? 'Polo T-Shirt' : p.category === 'pants' ? 'Pants' : p.category === 'shoes' ? 'Shoes' : 'Other Products',
            price: minPrice.toLocaleString('vi-VN') + ' VND',
            image: p.images && p.images.length > 0 ? p.images[0] : (p.image || '../images/store_logo.png'),
            description: p.description || '',
            carbonFootprint: '1.2 kg CO₂e (60% reduction vs average)',
            waterSaved: '450 Liters of clean water',
            details: [
              'Exquisitely crafted from recycled materials.',
              'Upcycled materials protect resources.',
              'Regenerated accessories, environment friendly.'
            ],
            sizeChart: p.sizeChart || '../images/sizeselection.jpg',
            store: storeName,
            storeLogo: storeLogo,
            variants: p.variants || [{ size: 'Standard', color: 'Raw', price: minPrice, stock: 10 }]
          };
        }
      }
    }
  } catch(e) {
    console.error('Error syncing seller products into PRODUCTS_DB:', e);
  }
}
syncSellerProductsToDB();

function goToDetail(productId) {
  // Track interaction before navigating so profile is saved to localStorage
  if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.trackView) {
    AI_REC_SYSTEM.trackView(productId);
  }
  try { sessionStorage.setItem('rf_detail_product_id', productId); } catch(e) {}
  // Flag that we came from a product view so shop re-sorts on return
  try { sessionStorage.setItem('rf_from_detail', '1'); } catch(e) {}
  for (var _i = 0; _i < SHOP_PRODUCTS.length; _i++) {
    if (String(SHOP_PRODUCTS[_i].id) === String(productId)) {
      try { sessionStorage.setItem('rf_detail_product', JSON.stringify(SHOP_PRODUCTS[_i])); } catch(e) {}
      break;
    }
  }
  window.location.href = '/buyer/shop-detail.html?id=' + productId;
}
window.goToDetail = goToDetail;

function goToShop(storeName) {
  window.location.href = '/buyer/store-detail.html?store=' + encodeURIComponent(storeName);
}
window.goToShop = goToShop;

function initDetailPage() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id') || '';
  try {
    if (!id) {
      id = sessionStorage.getItem('rf_detail_product_id') || '';
    }
  } catch(e) {}
  
  renderNavbar('navbar-container');
  renderFooter('footer-container');

  var container = document.getElementById('detail-content');


  function buildAndRender(zalandoProd) {
    var p = {
      id: zalandoProd.id,
      name: zalandoProd.name,
      category: zalandoProd.category === 'upper' ? 'Top' : zalandoProd.category === 'lower' ? 'Bottom' : 'Suit',
      price: zalandoProd.priceStr,
      priceNum: zalandoProd.price,
      image: zalandoProd.image,
      description: zalandoProd.description || '',
      carbonFootprint: '1.5 kg CO₂e (55% reduction vs new product)',
      waterSaved: '1,200 Liters of clean water',
      details: [
        'Crafted from high-quality recycled materials.',
        'Upcycling process minimizes textile waste.',
        'Sustainable design, extending product lifespan.',
        'Brings circular economy value to the community.'
      ],
      store: zalandoProd.store,
      storeLogo: zalandoProd.storeLogo,
      clothFile: zalandoProd.clothFile,
      garmentType: zalandoProd.garmentType || zalandoProd.category,
      variants: [
        { size: 'S', color: 'Default', price: zalandoProd.price, stock: 15 },
        { size: 'M', color: 'Default', price: zalandoProd.price, stock: 20 },
        { size: 'L', color: 'Default', price: zalandoProd.price, stock: 10 }
      ]
    };
    renderProductDetail(p);
    initReviewSystem(p);
  }

  function findInProducts(products) {
    for (var i = 0; i < products.length; i++) {
      if (String(products[i].id) === String(id)) return products[i];
    }
    return null;
  }

  function showLoading() {
    if (container) {
      container.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1.5rem">' +
          '<i class="fa-solid fa-spinner fa-spin" style="font-size:2.5rem;color:var(--primary)"></i>' +
          '<p style="color:var(--text-muted);font-size:1.05rem">Loading product information...</p>' +
        '</div>';
    }
  }

  function showStaticFallback() {
    var product = PRODUCTS_DB[id] || PRODUCTS_DB['1'];
    renderProductDetail(product);
    initReviewSystem(product);
  }

  // Helper to check sessionStorage cached product as last-resort fallback
  function checkSessionCache() {
    try {
      var cached = sessionStorage.getItem('rf_detail_product');
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && (String(parsed.id) === String(id) || (!id && parsed.id))) {
          // If id was empty, we recover it from session cache
          id = parsed.id;
          buildAndRender(parsed);
          return true;
        }
      }
    } catch(e) {
      console.warn('[ReFashion] Failed to load from sessionStorage cache:', e);
    }
    return false;
  }

  // 1. If SHOP_PRODUCTS already populated (catalog loaded before us), use it immediately
  if (SHOP_PRODUCTS.length > 0) {
    var found = findInProducts(SHOP_PRODUCTS);
    if (found) { buildAndRender(found); return; }
    if (checkSessionCache()) return;
    showStaticFallback();
    return;
  }

  // 2. Catalog not yet loaded — show spinner, then fetch catalog ourselves
  showLoading();

  var catalogUrl = '/datasets/products.json';
  fetch(catalogUrl)
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(data) {
      var items = data.products || [];
      // Populate SHOP_PRODUCTS if still empty (help mainjs.js)
      if (SHOP_PRODUCTS.length === 0) {
        Array.prototype.push.apply(SHOP_PRODUCTS, items);
      }
      var found = findInProducts(items);
      if (found) {
        buildAndRender(found);
      } else if (checkSessionCache()) {
        // Recovered from cache
      } else {
        showStaticFallback();
      }
    })
    .catch(function(err) {
      console.warn('[ReFashion] Detail page catalog fetch failed:', err.message);
      if (!checkSessionCache()) {
        showStaticFallback();
      }
    });
}

/* ==================== STORE DETAIL PAGE ==================== */
var STORE_DESCRIPTIONS = {
  'Eco Wear': 'Specializing in recycling old Denim into unique high-end fashion products.',
  'Hemp & Bamboo': 'Store providing products made from sustainable natural hemp and bamboo fibers.',
  'Retro Chic': 'Classic-style recycled fashion, nostalgic and Earth-friendly.',
  'Denim Craft': 'Handcrafted workshop transforming old denim into fashionable pieces.',
  'Green Thread': 'Organic fashion combined with exquisite, original hand embroidery.',
  'Zero Waste': 'Committed to zero textile waste, optimizing leftover materials into unique accessories.'
};

function initStorePage() {
  renderNavbar('navbar-container');
  renderFooter('footer-container');

  var params = new URLSearchParams(window.location.search);
  var storeName = params.get('store');
  if (!storeName) {
    window.location.href = '/buyer/shop.html';
    return;
  }
  renderStoreDetail(storeName);

  // Re-render when catalog finishes loading (async fetch may not be done yet)
  document.addEventListener('zalandoCatalogReady', function () {
    renderStoreDetail(storeName);
  });
  
  setTimeout(function() {
      triggerShopVoucherPopup(storeName);
  }, 1000);
}

function triggerShopVoucherPopup(storeName) {
  var claimed = JSON.parse(localStorage.getItem('refashion_claimed_vouchers') || '{}');
  if (claimed[storeName]) return;

  fetch('../datasets/vouchers.json')
    .then(res => res.json())
    .then(data => {
      var voucher = data.find(v => v.store.toLowerCase() === storeName.toLowerCase());
      if (!voucher) return; // No mock voucher for this store

      var overlay = document.createElement('div');
      overlay.id = 'voucher-popup-overlay';
      overlay.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
      
      var popup = document.createElement('div');
      popup.style = 'background:white;padding:32px;border-radius:16px;width:350px;text-align:center;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.2)';
      
      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      closeBtn.style = 'position:absolute;top:16px;right:16px;background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--text-muted)';
      closeBtn.onclick = function() { document.body.removeChild(overlay); };
      
      var code = voucher.code;
      
      popup.innerHTML = 
        '<div style="background:var(--primary);color:white;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">' +
          '<i class="fa-solid fa-ticket"></i>' +
        '</div>' +
        '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:8px;">Welcome!</h3>' +
        '<p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:24px;">Claim your <strong>' + voucher.discountAmount.toLocaleString('vi-VN') + 'đ</strong> discount voucher for your purchase at ' + voucher.store + '.</p>' +
        '<div style="border:2px dashed var(--primary);border-radius:8px;padding:12px;margin-bottom:24px;font-weight:700;font-size:1.2rem;letter-spacing:1px;color:var(--primary);background:var(--surface)">' +
          code +
        '</div>' +
        '<button id="claim-voucher-btn" class="btn btn-primary" style="width:100%;border-radius:24px;padding:12px;font-weight:600;">Save Voucher</button>';
      
      popup.appendChild(closeBtn);
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
      
      document.getElementById('claim-voucher-btn').onclick = function() {
        claimed[storeName] = { code: voucher.code, amount: voucher.discountAmount, store: voucher.store };
        localStorage.setItem('refashion_claimed_vouchers', JSON.stringify(claimed));
        this.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
        this.style.background = 'var(--primary-green)';
        setTimeout(function() { document.body.removeChild(overlay); }, 1000);
      };
    })
    .catch(err => console.error("Could not load mock vouchers: ", err));
}

var storeDetailState = { currentPage: 1, itemsPerPage: 12 };

function renderStoreDetail(storeName, page) {
  var container = document.getElementById('store-detail-content');
  if (!container) return;
  page = page || 1;
  storeDetailState.currentPage = page;

  // Gather products from this store
  var storeProducts = [];
  for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
    if (SHOP_PRODUCTS[i].store === storeName) {
      storeProducts.push(SHOP_PRODUCTS[i]);
    }
  }

  var storeLogo = '../images/store_logo.png';
  for (var j = 0; j < storeProducts.length; j++) {
    if (storeProducts[j].storeLogo) {
      storeLogo = storeProducts[j].storeLogo;
      break;
    }
  }

  var description = STORE_DESCRIPTIONS[storeName] || 'Sustainable recycled fashion store.';

  // Paginate
  var totalItems = storeProducts.length;
  var totalPages = Math.ceil(totalItems / storeDetailState.itemsPerPage);
  var startIndex = (page - 1) * storeDetailState.itemsPerPage;
  var endIndex = Math.min(startIndex + storeDetailState.itemsPerPage, totalItems);
  var pageProducts = storeProducts.slice(startIndex, endIndex);

  // Build product cards HTML
  var productsHtml = '';
  for (var k = 0; k < pageProducts.length; k++) {
    var p = pageProducts[k];
    var stars = Math.round(p.rating || 4.5);
    var starHtml = '';
    for (var s = 0; s < 5; s++) {
      starHtml += s < stars ? '<i class="fa-solid fa-star" style="color:var(--accent);font-size:0.75rem"></i>' : '<i class="fa-regular fa-star" style="color:var(--accent);font-size:0.75rem"></i>';
    }
    productsHtml +=
      '<div class="product-card" style="cursor:pointer" onclick="goToDetail(\'' + p.id + '\')">' +
        '<div class="product-img-wrap">' +
          '<img src="' + p.image + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'' + (p.storeLogo || '../images/store_logo.png') + '\'" />' +
          (p.clothFile ? '<span style="position:absolute;bottom:8px;left:8px;background:rgba(91,116,83,0.9);color:white;font-size:0.65rem;font-weight:700;padding:3px 8px;border-radius:20px;display:flex;align-items:center;gap:4px"><i class=\'fa-solid fa-wand-magic-sparkles\'></i>AI Try-On</span>' : '') +
        '</div>' +
        '<div class="product-info" style="display:flex; flex-direction:column">' +
          '<p class="product-category">' + p.store + '</p>' +
          '<h2 class="product-name" style="height:44px;overflow:hidden">' + p.name + '</h2>' +
          '<div class="product-price-row">' +
            '<span class="product-price">' + p.priceStr + '</span>' +
          '</div>' +
          '<div class="product-rating-row">' +
            starHtml +
            '<span class="product-rating-num">' + (p.rating || 4.5).toFixed(1) + '</span>' +
            '<span class="product-rating-count">(' + (p.ratingCount || 0) + ' reviews)</span>' +
          '</div>' +
          '<div style="display:flex;gap:8px;margin-top:12px;">' +
'<button class="btn btn-outline" style="flex:1;border-radius:10px;font-size:0.75rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="event.stopPropagation(); RefashionAuth.addToCart({productId:\'' + p.id + '\',name:\'' + p.name.replace(/'/g, "\\'") + '\',price:' + p.price + ',priceStr:\'' + p.priceStr + '\',image:\'' + p.image + '\'}); showToast(\'\u2705 Added to cart!\')"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>' +
'<button class="btn btn-primary" style="flex:1;border-radius:10px;font-size:0.75rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;gap:4px;" onclick="event.stopPropagation(); RefashionAuth.addToCart({productId:\'' + p.id + '\',name:\'' + p.name.replace(/'/g, "\\'") + '\',price:' + p.price + ',priceStr:\'' + p.priceStr + '\',image:\'' + p.image + '\'}); window.location.href=\'/buyer/cart.html\'"><i class="fa-solid fa-bolt"></i> Buy Now</button>' +
'</div>' +
        '</div>' +
      '</div>';
  }

  // Build pagination HTML
  var paginationHtml = '';
  if (totalPages > 1) {
    paginationHtml = '<div class="store-pagination" style="display:flex;justify-content:center;gap:0.5rem;align-items:center;margin-top:2rem;flex-wrap:wrap">';
    paginationHtml += '<button class="pagination-btn"' + (page <= 1 ? ' disabled' : '') + ' onclick="changeStorePage(\'' + storeName + '\',' + (page - 1) + ')"><i class="fa-solid fa-chevron-left"></i></button>';
    for (var pi = 1; pi <= totalPages; pi++) {
      if (pi === page) {
        paginationHtml += '<button class="pagination-btn active">' + pi + '</button>';
      } else {
        paginationHtml += '<button class="pagination-btn" onclick="changeStorePage(\'' + storeName + '\',' + pi + ')">' + pi + '</button>';
      }
    }
    paginationHtml += '<button class="pagination-btn"' + (page >= totalPages ? ' disabled' : '') + ' onclick="changeStorePage(\'' + storeName + '\',' + (page + 1) + ')"><i class="fa-solid fa-chevron-right"></i></button>';
    paginationHtml += '</div>';
  }

  if (productsHtml === '' && totalItems === 0) {
    productsHtml = '<div class="not-found" style="text-align:center;padding:3rem"><i class="fa-solid fa-store" style="font-size:3rem;color:var(--text-muted);margin-bottom:1.5rem"></i><h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">No products from this store yet</h3><p style="color:var(--text-muted);font-size:0.95rem">Check back later for new arrivals.</p></div>';
  }

  container.innerHTML =
    '<div class="store-detail-wrap" style="max-width:1200px;margin:0 auto;padding:1rem 2rem 3rem">' +

      /* Breadcrumb */
      '<nav class="store-breadcrumb" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;flex-wrap:wrap;background:rgba(255,255,255,0.95);border:1px solid var(--border);padding:0.75rem 1.25rem;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.03);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">' +
        '<a href="/buyer/index.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'"><i class="fa-solid fa-house"></i> Home</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<a href="/buyer/shop.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Shop</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<span style="color:var(--primary);font-weight:600">' + storeName + '</span>' +
      '</nav>' +

      /* Store Header Card */
      '<div class="store-hero" style="background:linear-gradient(135deg,var(--primary),#3b5242);border-radius:24px;padding:2.5rem;color:white;display:flex;align-items:center;gap:2rem;flex-wrap:wrap;margin-bottom:2.5rem;position:relative;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08)">' +
        '<div style="position:absolute;right:-40px;bottom:-40px;font-size:12rem;opacity:0.06;color:white;pointer-events:none"><i class="fa-solid fa-store"></i></div>' +
        '<img src="' + storeLogo + '" style="width:100px;height:100px;border-radius:50%;border:3px solid rgba(255,255,255,0.8);object-fit:cover;background:white;flex-shrink:0" onerror="this.onerror=null;this.src=\'../images/store_logo.png\'" />' +
        '<div style="flex:1;min-width:200px">' +
          '<h1 style="font-family:var(--font-serif);font-size:2rem;margin:0;font-weight:400">' + storeName + '</h1>' +
          '<p style="font-size:0.9rem;opacity:0.9;margin:8px 0 12px 0;max-width:500px">' + description + '</p>' +
          '<div style="display:flex;gap:1.5rem;flex-wrap:wrap">' +
            '<span style="font-size:0.8rem;opacity:0.85"><i class="fa-solid fa-star" style="color:var(--accent);margin-right:4px"></i> 4.9/5.0 (250+ reviews)</span>' +
            '<span style="font-size:0.8rem;opacity:0.85"><i class="fa-solid fa-box" style="margin-right:4px"></i> ' + totalItems + ' products</span>' +
            '<span style="font-size:0.8rem;opacity:0.85"><i class="fa-solid fa-circle" style="color:#4ade80;font-size:0.5rem;margin-right:4px;vertical-align:middle"></i> Active</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-shrink:0">' +
          '<button type="button" class="btn btn-accent btn-chat-store" style="font-size:0.8rem;padding:10px 18px;border-radius:12px;font-weight:700;border:none;cursor:pointer"><i class="fa-solid fa-comments"></i> Chat</button>' +
          '<button type="button" class="btn btn-outline btn-follow-store" style="font-size:0.8rem;padding:10px 18px;border-radius:12px;font-weight:700;border:1.5px solid white;color:white;background:transparent;cursor:pointer;transition:all 0.2s"><i class="fa-solid fa-plus"></i> Follow</button>' +
        '</div>' +
      '</div>' +

      /* Products Section */
      '<div class="store-products-section">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">' +
          '<h2 style="font-family:var(--font-serif);font-size:1.5rem;margin:0;color:var(--foreground)">Products <span style="font-size:0.9rem;color:var(--text-muted);font-weight:400;font-family:var(--font-sans)">(' + totalItems + ' items)</span></h2>' +
        '</div>' +
        '<div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.5rem">' + productsHtml + '</div>' +
        paginationHtml +
      '</div>' +
    '</div>';

  // Wire follow/chat buttons
  var followBtn = container.querySelector('.btn-follow-store');
  if (followBtn) {
    followBtn.addEventListener('click', function(e) {
      var isFollowing = this.classList.toggle('following');
      if (isFollowing) {
        this.innerHTML = '<i class="fa-solid fa-check"></i> Following';
        showToast('Thank you for following ' + storeName + '!');
      } else {
        this.innerHTML = '<i class="fa-solid fa-plus"></i> Follow';
        showToast('Unfollowed ' + storeName);
      }
    });
  }
  var chatBtn = container.querySelector('.btn-chat-store');
  if (chatBtn) {
    chatBtn.addEventListener('click', function() {
      if (typeof openBuyerChatWithStore === 'function') {
        openBuyerChatWithStore(storeName);
      } else {
        showToast('Direct chat with ' + storeName + ' coming soon!');
      }
    });
  }
}

window.changeStorePage = function(storeName, page) {
  renderStoreDetail(storeName, page);
  var wrap = document.querySelector('.store-detail-wrap');
  if (wrap) wrap.scrollIntoView({ behavior: 'smooth' });
};

function renderProductDetail(product) {
  var currentUser = RefashionAuth._getUser();
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
                 '<span class="variant-label" style="font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;">Size:</span>' +
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
                 '<span class="variant-label" style="font-weight: 700; font-size: 0.85rem; color: var(--primary); display: block; margin-bottom: 0.4rem;">Color:</span>' +
                 '<div class="variant-options color-options-group" style="display: flex; gap: 6px; flex-wrap: wrap;">' +
                   uniqueColors.map(function(c) {
                     return '<button type="button" class="btn-variant-opt btn-color-opt" data-color="' + c + '">' + c + '</button>';
                   }).join('') +
                 '</div>' +
               '</div>';
  }

  var stockHtml = '<div class="variant-stock-info" style="margin: 0.5rem 0 0.75rem 0; font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">' +
                    'Stock: <span id="detail-stock-value" style="font-weight:700; color:var(--foreground);">' + (product.stock || 0) + '</span> items available' +
                  '</div>';

  var shopCardHtml = '<div class="shop-info-card" style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; margin: 1rem 0; gap: 0.75rem; flex-wrap: wrap;">' +
                       '<div style="display: flex; align-items: center; gap: 10px;">' +
                         '<img src="' + (product.storeLogo || '../images/store_logo.png') + '" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border);" onerror="this.onerror=null;this.src=\'../images/store_logo.png\'" />' +
                         '<div>' +
                           '<h4 style="font-weight: 800; font-size: 0.9rem; color: var(--primary); margin: 0;">' + (product.store || 'Eco Wear') + '</h4>' +
                           '<p style="font-size: 0.7rem; color: var(--text-muted); margin: 2px 0 0 0;"><i class="fa-solid fa-star" style="color: var(--accent); margin-right: 4px;"></i>4.9/5.0 (250+ reviews)</p>' +
                         '</div>' +
                       '</div>' +
                       '<a href="javascript:void(0)" onclick="goToShop(\'' + (product.store || 'Eco Wear').replace(/'/g, "\\'") + '\')" class="btn btn-outline" style="font-size: 0.7rem; padding: 5px 10px; border-radius: 8px; border-color: var(--primary); color: var(--primary); font-weight: 600;">Visit Store</a>' +
                     '</div>';

  var priceNum = product.priceNum || parseInt((product.price || '0').replace(/[^0-9]/g, ''), 10);

  // Store product globally for safe VTON button access
  window._currentDetailProduct = product;

  // Get base URL by stripping suffix
  var mainImgUrl = product.image;
  var baseImgUrl = mainImgUrl;
  var hasSuffix = false;
  var suffixes = ['_1_front.jpg', '_2_side.jpg', '_3_back.jpg', '_4_full.jpg', '_6_flat.jpg', '_7_additional.jpg'];
  for (var sIdx = 0; sIdx < suffixes.length; sIdx++) {
    if (mainImgUrl.indexOf(suffixes[sIdx]) !== -1) {
      baseImgUrl = mainImgUrl.substring(0, mainImgUrl.indexOf(suffixes[sIdx]));
      hasSuffix = true;
      break;
    }
  }

  var galleryHtml = '';
  if (hasSuffix) {
    galleryHtml = '<div class="detail-image-gallery">';
    var possibleAngles = [
      { suffix: '_1_front.jpg', label: 'Front' },
      { suffix: '_2_side.jpg', label: 'Side' },
      { suffix: '_3_back.jpg', label: 'Back' },
      { suffix: '_4_full.jpg', label: 'Full Body' },
      { suffix: '_6_flat.jpg', label: 'Flat' },
      { suffix: '_7_additional.jpg', label: 'Detail' }
    ];
    for (var aIdx = 0; aIdx < possibleAngles.length; aIdx++) {
      var angle = possibleAngles[aIdx];
      var imgPath = baseImgUrl + angle.suffix;
      var isActive = (imgPath === mainImgUrl);
      var activeClass = isActive ? ' active' : '';
      
      galleryHtml += 
        '<div class="gallery-thumb-wrapper' + activeClass + '" ' +
             'onclick="window.changeDetailImage(this, \'' + imgPath + '\')">' +
          '<img src="' + imgPath + '" onerror="var p=this.parentElement;if(p)p.style.display=\'none\';" />' +
        '</div>';
    }
    galleryHtml += '</div>';
  }

  // Define dynamic changeDetailImage function if not already defined
  if (!window.changeDetailImage) {
    window.changeDetailImage = function(element, imgUrl) {
      var mainImg = document.getElementById('main-detail-img');
      if (mainImg) {
        mainImg.src = imgUrl;
      }
      var wrappers = document.querySelectorAll('.gallery-thumb-wrapper');
      for (var i = 0; i < wrappers.length; i++) {
        wrappers[i].classList.remove('active');
      }
      element.classList.add('active');
    };
  }


  // Image column: main image + angle gallery
  var imageColHtml =
    '<div class="detail-image" style="display:flex;flex-direction:column;gap:14px;border:none;box-shadow:none;background:transparent;aspect-ratio:auto;overflow:visible">' +
      '<div style="position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--border);box-shadow:0 10px 30px var(--shadow);background-color:var(--card);aspect-ratio:1/1.2">' +
        '<img id="main-detail-img" src="' + product.image + '" alt="' + product.name + '" style="width:100%;height:100%;object-fit:cover" onerror="this.onerror=null;this.src=\'' + (product.storeLogo || '../images/store_logo.png') + '\'" />' +
      '</div>' +
      galleryHtml +
    '</div>';


  var vtonBtnHtml = product.clothFile
    ? '<button class="btn btn-primary" id="btn-open-vton" style="margin-top:10px;width:100%;border-radius:12px;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#3d6b4f,#3b7a57);font-size:1rem;padding:14px" onclick="openVtonStudio(window._currentDetailProduct)"><i class="fa-solid fa-wand-magic-sparkles"></i>' + ' AI Try-On \u2013 Virtual Try-On' + '</button>'
    : '';

  container.innerHTML =
    '<div class="container">' +
      '<div class="detail-breadcrumb" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;flex-wrap:wrap;background:rgba(255,255,255,0.95);border:1px solid var(--border);padding:0.75rem 1.25rem;border-radius:14px;box-shadow:0 4px 15px rgba(0,0,0,0.03);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">' +
        '<a href="index.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'"><i class="fa-solid fa-house"></i> Home</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<a href="shop.html" style="color:var(--text-muted);text-decoration:none;transition:color 0.2s" onmouseover="this.style.color=\'var(--primary)\'" onmouseout="this.style.color=\'var(--text-muted)\'">Shop</a>' +
        '<span style="opacity:0.4"><i class="fa-solid fa-chevron-right" style="font-size:0.65rem"></i></span>' +
        '<span style="color:var(--primary);font-weight:600">' + product.name + '</span>' +
      '</div>' +
      '<div class="detail-grid">' +
        imageColHtml +
        '<div class="detail-info">' +
          '<div class="detail-badges"><span class="badge badge-accent" style="font-size:0.8rem">1% For Planet</span>' + (product.clothFile ? '<span class="badge" style="background:rgba(91,116,83,0.1);color:var(--primary);border:1px solid var(--primary);font-size:0.72rem;margin-left:6px"><i class="fa-solid fa-wand-magic-sparkles"></i> AI Try-On Supported</span>' : '') + '</div>' +
          '<h1 class="detail-name">' + product.name + '</h1>' +
          '<p class="detail-price" style="font-size: 1.75rem; font-weight: 900; color: var(--accent); margin: 0.5rem 0;">' + product.price + '</p>' +
          '<p class="detail-desc">' + product.description + '</p>' +
          '<div class="detail-impact">' +
            '<div class="impact-item"><span class="impact-label">Carbon Footprint</span><p class="impact-value">' + product.carbonFootprint + '</p></div>' +
            '<div class="impact-item accent"><span class="impact-label">Water Saved</span><p class="impact-value">' + product.waterSaved + '</p></div>' +
          '</div>' +
          sizeHtml +
          colorHtml +
          stockHtml +
          '<div class="detail-sizechart" id="detail-sizechart" style="' + (product.sizeChart ? '' : 'display:none') + '">' +
            '<button type="button" class="btn-sizeguide" onclick="document.getElementById(\'sizechart-modal\').classList.add(\'show\')">' +
              '<i class="fa-solid fa-ruler-combined"></i> Size Guide' +
            '</button>' +
          '</div>' +
          shopCardHtml +
          '<div class="detail-actions" style="margin-top: 0.75rem; display: flex; gap: 10px; flex-wrap: wrap;">' +
            '<button class="btn btn-outline btn-add-cart" style="border-color:var(--primary);color:var(--primary); display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px;"><i class="fa-solid fa-bag-shopping"></i>Add to Cart</button>' +
            '<button class="btn btn-primary btn-buy-now" style="display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: 12px;"><i class="fa-solid fa-bolt"></i>Buy Now</button>' +
          '</div>' +
          vtonBtnHtml +
          '<div style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px; width: 100%;">' +
            (getTopRecommendedIds().has(product.id) ? '<button class="xai-btn-outline" onclick="showXaiModal(\'' + product.id + '\')"><i class="fa-solid fa-wand-magic-sparkles"></i> Why am I seeing this?</button>' : '') +
            '<button class="dpp-btn-outline" onclick="showDppModal(\'' + product.id + '\')"><i class="fa-solid fa-passport"></i> View DPP</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-specs">' +
        '<div><h3 style="font-family:var(--font-serif);font-size:1.35rem;margin-bottom:1rem;color:var(--primary)">Design Details & Impact</h3><ul class="specs-list">' +
          product.details.map(function(d) { return '<li><i class="fa-solid fa-circle-check"></i><span>' + d + '</span></li>'; }).join('') +
        '</ul></div>' +
      '</div>' +
      '<div class="review-section" id="review-section">' +
        '<h3>Customer Reviews & Feedback</h3>' +
        '<div class="review-layout">' +
          '<div class="review-form-card" id="review-form-card">' +
            '<h4>Product Review</h4>' +
            (currentUser ? '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px">Reviewing as: <strong style="color:var(--primary)">' + currentUser.username + '</strong></p>' : '<p style="font-size:0.85rem;color:var(--sentiment-neg);margin-bottom:12px">Please <a href="/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search) + '" style="text-decoration:underline;font-weight:600">log in</a> to write a review.</p>') +
            '<form id="review-form">' +
              '<div class="form-group"><label>Rating</label><select id="review-rating"><option value="5">⭐⭐⭐⭐⭐ (5 stars - Excellent)</option><option value="4">⭐⭐⭐⭐ (4 stars - Good)</option><option value="3">⭐⭐⭐ (3 stars - Average)</option><option value="2">⭐⭐ (2 stars - Poor)</option><option value="1">⭐ (1 star - Terrible)</option></select></div>' +
              '<div class="form-group"><label>Review content</label><textarea id="review-text" rows="4" placeholder="Write your review here..." required></textarea></div>' +
              '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px" ' + (currentUser ? '' : 'disabled') + '>Submit Review</button>' +
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
        if (stockEl) stockEl.innerHTML = '<strong style="color:var(--sentiment-neg)">Out of stock</strong>';
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
      if (uniqueSizes.length > 0 && !selectedSize) { showToast('Please select a size!'); return; }
      if (uniqueColors.length > 0 && !selectedColor) { showToast('Please select a color!'); return; }

      var variantStr = '';
      if (selectedSize && selectedColor) variantStr = selectedSize + ' - ' + selectedColor;
      else if (selectedSize) variantStr = selectedSize;
      else if (selectedColor) variantStr = selectedColor;
      else variantStr = 'Standard';

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
      if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/shop-detail.html?id=' + product.id; return; }
      
      RefashionAuth.addToCart({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        priceStr: finalPriceStr,
        image: product.image,
        variant: variantStr
      });
      showToast('🛍️ Added "' + product.name + ' (' + variantStr + ')" to cart successfully!');
    });
  }

  var buyNowBtn = container.querySelector('.btn-buy-now');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function() {
      if (uniqueSizes.length > 0 && !selectedSize) { showToast('Please select a size!'); return; }
      if (uniqueColors.length > 0 && !selectedColor) { showToast('Please select a color!'); return; }

      var variantStr = '';
      if (selectedSize && selectedColor) variantStr = selectedSize + ' - ' + selectedColor;
      else if (selectedSize) variantStr = selectedSize;
      else if (selectedColor) variantStr = selectedColor;
      else variantStr = 'Standard';

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
      if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/shop-detail.html?id=' + product.id; return; }

      RefashionAuth.addToCart({
        productId: product.id,
        name: product.name,
        price: finalPrice,
        priceStr: finalPriceStr,
        image: product.image,
        variant: variantStr
      });
      window.location.href = '/buyer/checkout.html';
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
      var user = RefashionAuth._getUser();
      if (!user) {
        showToast('Please log in to submit a review.');
        window.location.href = '/auth/login.html?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
        return;
      }
      var name = user.username || user.email || 'Guest';
      var rating = parseInt(document.getElementById('review-rating').value);
      var text = document.getElementById('review-text').value;
      if (!text.trim()) return;
      var review = {
        id: reviews.length + 1,
        user: name,
        avatar: name.charAt(0).toUpperCase(),
        rating: rating,
        date: new Date().toLocaleDateString('en-US'),
        comment: text
      };
      reviews.unshift(review);
      renderReviews(reviews);
      document.getElementById('review-text').value = '';
      document.getElementById('review-rating').value = '5';
    });
  }
}

function loadExternalReviews(product, callback) {
  var xhr = new XMLHttpRequest();
  var base = '/datasets/reviews.json';
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

window.toggleAIInsights = function() {
  var panel = document.getElementById('ai-insights-panel');
  if (panel) {
    if (panel.style.display === 'none') {
      panel.style.display = 'flex';
    } else {
      panel.style.display = 'none';
    }
  }
}

function analyzeSentimentAndKeywords(reviews) {
  if (!reviews || reviews.length === 0) return null;
  var pos = 0, neu = 0, neg = 0;
  var keywords = {
    'beautiful': 0, 'cool': 0, 'comfortable': 0, 'durable': 0, 'eco-friendly': 0, 'fit': 0, 'fast': 0, 'great': 0,
    'tight': 0, 'large': 0, 'hot': 0, 'terrible': 0, 'wrinkled': 0, 'poorly': 0, 'disappointed': 0, 'different': 0
  };
  
  var posWords = ['beautiful', 'cool', 'comfortable', 'durable', 'eco-friendly', 'fit', 'fast', 'great'];
  var negWords = ['tight', 'large', 'hot', 'terrible', 'wrinkled', 'poorly', 'disappointed', 'different'];
  
  for (var i = 0; i < reviews.length; i++) {
    var r = reviews[i];
    if (r.rating >= 4) pos++;
    else if (r.rating === 3) neu++;
    else neg++;
    
    var text = (r.comment || '').toLowerCase();
    for (var kw in keywords) {
      if (text.indexOf(kw) !== -1) {
        keywords[kw]++;
      }
    }
  }
  
  var total = reviews.length;
  var posPct = Math.round((pos / total) * 100);
  var neuPct = Math.round((neu / total) * 100);
  var negPct = Math.round((neg / total) * 100);
  
  var topPosKws = [];
  var topNegKws = [];
  
  for (var kw in keywords) {
    if (keywords[kw] > 0) {
      if (posWords.indexOf(kw) !== -1) topPosKws.push({word: kw, count: keywords[kw]});
      if (negWords.indexOf(kw) !== -1) topNegKws.push({word: kw, count: keywords[kw]});
    }
  }
  
  topPosKws.sort(function(a,b){return b.count - a.count});
  topPosKws = topPosKws.slice(0, 4);
  topNegKws.sort(function(a,b){return b.count - a.count});
  topNegKws = topNegKws.slice(0, 3);
  
  var summaryText = '<p style="margin-bottom:1.5rem; font-size:0.95rem; line-height:1.6; color:var(--text-muted)">Based on an analysis of <strong>' + total + '</strong> customer reviews, the AI assistant summarizes the following key points:</p>';
  
  summaryText += '<div style="margin-bottom:1.25rem; background:rgba(34, 197, 94, 0.05); padding:1rem; border-radius:8px; border-left:4px solid var(--sentiment-pos);">';
  summaryText += '<h5 style="color:var(--sentiment-pos); margin-bottom:0.5rem; font-size:1rem;"><i class="fa-solid fa-thumbs-up" style="margin-right:6px;"></i> Highlights (Pros)</h5>';
  if (topPosKws.length > 0) {
    summaryText += '<p style="margin:0; font-size:0.95rem; line-height:1.5;">Customers particularly love the product for: <strong style="color:var(--text-dark)">' + topPosKws.map(function(k){return k.word}).join(', ') + '</strong>. Most are satisfied with the design and overall experience.</p>';
  } else {
    summaryText += '<p style="margin:0; font-size:0.95rem; line-height:1.5;">Not many specific positive reviews yet.</p>';
  }
  summaryText += '</div>';
  
  summaryText += '<div style="background:rgba(239, 68, 68, 0.05); padding:1rem; border-radius:8px; border-left:4px solid var(--sentiment-neg);">';
  summaryText += '<h5 style="color:var(--sentiment-neg); margin-bottom:0.5rem; font-size:1rem;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:6px;"></i> Points to Note (Cons)</h5>';
  if (topNegKws.length > 0) {
    summaryText += '<p style="margin:0; font-size:0.95rem; line-height:1.5;">However, some feedback mentions: <strong style="color:var(--text-dark)">' + topNegKws.map(function(k){return k.word}).join(', ') + '</strong>. You should consider this carefully or chat with the store for more advice.</p>';
  } else {
    summaryText += '<p style="margin:0; font-size:0.95rem; line-height:1.5;">Almost no significant complaints from customers.</p>';
  }
  summaryText += '</div>';

  return {
    total: total,
    pos: pos, neu: neu, neg: neg,
    posPct: posPct, neuPct: neuPct, negPct: negPct,
    summaryText: summaryText
  };
}

function renderReviews(reviews) {
  var container = document.getElementById('review-list');
  if (!container) return;
  var html = '';
  
  var insights = analyzeSentimentAndKeywords(reviews);
  if (insights) {
    html += '<div style="margin-bottom: 1.5rem;">' +
      '<button type="button" class="btn" style="border-radius:12px; width: 100%; border: none; background: var(--primary); color: white; padding: 12px; font-weight: 600; font-size: 0.95rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.2s ease;" onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 16px rgba(0,0,0,0.2)\'" onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.15)\'" onclick="toggleAIInsights()"><i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 8px;"></i> View AI Review Summary</button>' +
      '<div id="ai-insights-panel" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.55); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(4px);">' +
        '<div style="background:var(--background); padding:2rem; border-radius:20px; width:92%; max-width:550px; max-height:85vh; overflow-y:auto; box-shadow:0 20px 40px rgba(0,0,0,0.2); position:relative;">' +
          '<button onclick="toggleAIInsights()" style="position:absolute; top:1.25rem; right:1.25rem; background:var(--background-alt); border:none; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; cursor:pointer; color:var(--text-muted); transition:all 0.2s ease;"><i class="fa-solid fa-xmark"></i></button>' +
          
          '<h3 style="font-family: var(--font-serif); color: var(--primary); margin-bottom: 1.5rem; font-size: 1.4rem; padding-right:2rem;"><i class="fa-solid fa-wand-magic-sparkles" style="margin-right: 8px;"></i> AI Insights</h3>' +
          
          '<div style="margin-bottom: 2rem;">' +
            '<h4 style="font-size: 1.05rem; font-weight:600; margin-bottom: 1rem; color:var(--text-dark)">Sentiment Distribution</h4>' +
            '<div style="display:flex; height: 12px; border-radius: 6px; overflow: hidden; margin-bottom: 0.75rem;">' +
              '<div style="width: ' + insights.posPct + '%; background-color: var(--sentiment-pos);"></div>' +
              '<div style="width: ' + insights.neuPct + '%; background-color: #fbbf24;"></div>' +
              '<div style="width: ' + insights.negPct + '%; background-color: var(--sentiment-neg);"></div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted); font-weight: 500;">' +
              '<span style="color:var(--sentiment-pos)">Positive: ' + insights.posPct + '%</span>' +
              '<span style="color:#fbbf24">Neutral: ' + insights.neuPct + '%</span>' +
              '<span style="color:var(--sentiment-neg)">Negative: ' + insights.negPct + '%</span>' +
            '</div>' +
          '</div>' +
          
          '<div>' +
            '<h4 style="font-size: 1.05rem; font-weight:600; margin-bottom: 1rem; color:var(--text-dark)">Đánh giá tổng quan</h4>' +
            insights.summaryText +
          '</div>' +
          
        '</div>' +
      '</div>' +
    '</div>';
  }
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
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/shop-detail.html?id=' + id; return; }
  RefashionAuth.addToCart({ productId: id, name: name, price: price, priceStr: priceStr, image: image });
  showToast('✅ Added "' + name + '" to cart!');
}

function handleBuyNow(id) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/checkout.html?buyNow=' + id; return; }
  window.location.href = '/buyer/checkout.html?buyNow=' + id;
}

/* ==================== CHECKOUT PAGE ==================== */
var PROVINCES = ['TP. H\u1ed3 Ch\u00ed Minh','H\u00e0 N\u1ed9i','\u0110\u00e0 N\u1eb5ng','C\u1ea7n Th\u01a1','H\u1ea3i Ph\u00f2ng','B\u00ecnh D\u01b0\u01a1ng','\u0110\u1ed3ng Nai','Long An','B\u00e0 R\u1ecba \u2013 V\u0169ng T\u00e0u','B\u1eafc Ninh','Kh\u00e1nh H\u00f2a','L\u00e2m \u0110\u1ed3ng','Ngh\u1ec7 An','Th\u1eeba Thi\u00ean Hu\u1ebf','Qu\u1ea3ng Ninh'];

function initCheckoutPage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/checkout.html'; return; }
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
    items = [{ productId: p.id, name: p.name, price: priceNum, priceStr: p.price, image: p.image, quantity: 1, store: p.store }];
  } else {
    items = JSON.parse(JSON.stringify(cart));
  }
  if (items.length === 0) {
    container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:40vh;flex-direction:column;gap:1rem"><i class="fa-solid fa-bag-shopping" style="font-size:3rem;color:var(--text-muted);opacity:0.3"></i><p style="color:var(--text-muted);font-size:1.1rem">No products to checkout.</p><a href="shop.html" class="btn btn-primary" style="border-radius:12px">Back to Store</a></div>';
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
          '<p style="font-size:0.78rem;color:var(--text-muted);margin:2px 0 0 0">Variant: ' + (item.variant || 'Standard') + ' • x' + item.quantity + '</p>' +
        '</div>' +
        '<span style="font-weight:700;font-size:0.9rem">' + (item.price * item.quantity).toLocaleString('vi-VN') + ' đ</span>' +
      '</div>';
  }
  container.innerHTML =
    '<div class="checkout-layout" id="checkout-layout">' +
      '<div class="checkout-form-section">' +
        '<div class="checkout-card">' +
          '<h3><i class="fa-solid fa-location-dot"></i> Shipping Information</h3>' +
          '<div class="form-row">' +
            '<div><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Full Name *</label><input type="text" id="checkout-name" value="' + (user.username || '') + '" placeholder="John Doe" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;box-sizing:border-box" /></div>' +
            '<div><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Phone Number *</label><input type="tel" id="checkout-phone" value="' + (user.phone || '') + '" placeholder="0912 345 678" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;box-sizing:border-box" /></div>' +
          '</div>' +
          '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Province / City *</label><select id="checkout-province" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem"><option value="">\u2014 Select province/city \u2014</option>' + PROVINCES.map(function(p) { return '<option value="' + p + '">' + p + '</option>'; }).join('') + '</select></div>' +
          '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Detailed Address *</label><input type="text" id="checkout-address" placeholder="Street number, street name, ward, district" style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;box-sizing:border-box" /></div>' +
          '<div><label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.35rem">Note (Optional)</label><textarea id="checkout-note" rows="3" placeholder="E.g. Deliver after office hours, call 30 minutes before..." style="width:100%;padding:0.75rem 1rem;border-radius:12px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.95rem;resize:vertical;box-sizing:border-box"></textarea></div>' +
        '</div>' +
        '<div class="checkout-card">' +
          '<h3><i class="fa-solid fa-credit-card"></i> Payment Method</h3>' +
          '<div style="display:flex;flex-direction:column;gap:0.75rem">' +
            '<div class="payment-option selected" id="payment-cod" onclick="selectPayment(\'cod\')">' +
              '<div class="payment-radio"></div>' +
              '<div><p style="font-weight:700;font-size:0.95rem"><i class="fa-solid fa-money-bill-wave" style="margin-right:0.35rem;color:var(--sentiment-pos)"></i> Cash on Delivery (COD)</p><p style="font-size:0.8rem;color:var(--text-muted)">Pay with cash upon delivery</p></div>' +
            '</div>' +
            '<div class="payment-option" id="payment-momo" onclick="selectPayment(\'momo\')">' +
              '<div class="payment-radio" style="border-color:var(--border)"></div>' +
              '<div><p style="font-weight:700;font-size:0.95rem"><i class="fa-solid fa-wallet" style="margin-right:0.35rem;color:#a50064"></i> MoMo Wallet <span class="badge" style="margin-left:0.5rem;background-color:#fef0f8;color:#a50064;font-size:0.6rem;border:1px solid #a50064">Sandbox</span></p><p style="font-size:0.8rem;color:var(--text-muted)">Pay via MoMo e-wallet (test environment)</p></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="checkout-card">' +
          '<h3><i class="fa-solid fa-truck-fast"></i> Shipping Method</h3>' +
          '<div style="display:flex;flex-direction:column;gap:0.75rem">' +
            '<div class="payment-option selected" id="shipping-standard" onclick="selectShipping(\'standard\')">' +
              '<div class="payment-radio" style="width:20px;height:20px;border-radius:50%;flex-shrink:0;border:6px solid var(--primary)"></div>' +
              '<div style="flex:1">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
                  '<div><p style="font-weight:700;font-size:0.95rem">' + getDeliveryRange() + '</p><p style="font-size:0.8rem;color:var(--text-muted)">Standard Delivery</p></div>' +
                  '<span style="font-weight:700;color:var(--sentiment-pos)">Free <i class="fa-solid fa-ticket"></i></span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="payment-option" id="shipping-locker" onclick="selectShipping(\'locker\')">' +
              '<div class="payment-radio" style="width:20px;height:20px;border-radius:50%;flex-shrink:0;border:2px solid var(--border)"></div>' +
              '<div style="flex:1">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
                  '<div>' +
                    '<p style="font-weight:700;font-size:0.95rem">Smart Locker \u2022 ' + getDeliveryRange() + '</p>' +
                    '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:2px"><i class="fa-solid fa-gift" style="color:var(--accent);margin-right:4px"></i>Get +50 GreenCoins for self-pickup</p>' +
                    '<p style="font-size:0.8rem;color:var(--primary);margin-top:6px;cursor:pointer">Select Locker Location <i class="fa-solid fa-chevron-right" style="font-size:0.7rem"></i></p>' +
                  '</div>' +
                  '<span style="font-weight:700;color:var(--sentiment-pos)">Free <i class="fa-solid fa-ticket"></i></span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div style="position:sticky;top:90px" id="checkout-summary">' +
        '<div class="checkout-card">' +
        '<h3>Order Summary</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">' + itemsHtml + '</div>' +
          '<hr style="border:0;border-top:1px solid var(--border);margin-bottom:1.25rem" />' +
          '<div style="margin-bottom:1.25rem">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">' +
              '<div>' +
                '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.15rem"><i class="fa-solid fa-leaf" style="color:var(--primary-green);margin-right:0.35rem"></i>Use GreenCoins</label>' +
                '<span style="font-size:0.75rem;color:var(--text-muted)">Balance: <span id="gc-balance">' + (parseInt(localStorage.getItem('refashion_greencoins')||0)).toLocaleString('vi-VN') + '</span> Coins</span>' +
              '</div>' +
              '<label class="switch"><input type="checkbox" id="greencoin-toggle" onchange="updateCheckoutTotal(window._lastDiscountPercent || 0)"><span class="slider round"></span></label>' +
            '</div>' +
            '<label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:0.5rem"><i class="fa-solid fa-ticket" style="margin-right:0.35rem;color:var(--accent)"></i> Shop Voucher</label>' +
            '<div id="sv-trigger-row" style="margin-bottom:0.75rem; border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="openShopeeVoucherModal()">' +
              '<span style="font-size:0.85rem; color:var(--text-muted);" id="sv-trigger-text">Select or enter voucher...</span>' +
              '<i class="fa-solid fa-chevron-right" style="color:var(--text-muted);font-size:0.8rem;"></i>' +
            '</div>' +
            '<input type="hidden" id="voucher-input" />' +
            '<div id="voucher-applied" style="display:none"></div>' +
            '<p id="voucher-error" style="font-size:0.72rem;color:#ef4444;margin-top:0.25rem;display:none"></p>' +
          '</div>' +
          '<hr style="border:0;border-top:1px solid var(--border);margin-bottom:1.25rem" />' +
          '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1.25rem">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Subtotal</span><span style="font-weight:600" id="checkout-subtotal">' + subtotal.toLocaleString('vi-VN') + ' \u0111</span></div>' +
            '<div id="checkout-discount-row" style="display:none"><div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--sentiment-pos)">Voucher Discount</span><span style="font-weight:600;color:var(--sentiment-pos)" id="checkout-discount-amount">0 \u0111</span></div></div>' +
            '<div id="checkout-gc-row" style="display:none"><div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--sentiment-pos)">GreenCoins Applied</span><span style="font-weight:600;color:var(--sentiment-pos)" id="checkout-gc-amount">0 \u0111</span></div></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Shipping</span><span style="font-weight:600;color:var(--sentiment-pos)">Free</span></div>' +
          '</div>' +
          '<hr style="border:0;border-top:2px solid var(--primary);margin-bottom:1.25rem" />' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:1rem"><span style="font-size:1.15rem;font-weight:700">Total</span><span style="font-size:1.5rem;font-weight:900;color:var(--accent)" id="checkout-total">' + subtotal.toLocaleString('vi-VN') + ' \u0111</span></div>' +
          '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:0.75rem 1rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;font-size:0.85rem;font-weight:600;color:var(--sentiment-pos)" id="checkout-greencoin-estimate"><i class="fa-solid fa-leaf"></i> Earn +' + (Math.floor(subtotal / 100000) * 5) + ' GreenCoin after ordering!</div>' +
          '<button onclick="placeOrder()" class="btn btn-primary" style="width:100%;padding:1rem;border-radius:14px;font-size:1.05rem;font-weight:700;display:block;text-align:center;margin-top:1.25rem;" id="place-order-btn"><i class="fa-solid fa-lock" style="margin-right:0.35rem"></i>Confirm Order (COD)</button>' +
'<p style="text-align:center;font-size:0.75rem;color:var(--text-muted);margin-top:1rem"><i class="fa-solid fa-shield-halved" style="margin-right:0.25rem"></i>Secure & encrypted payment</p>' +
        '</div>' +
      '</div>' +
    '</div>';
}

var checkoutPaymentMethod = 'cod';
var checkoutShippingMethod = 'standard';

window.selectShipping = function(method) {
  checkoutShippingMethod = method;
  var std = document.getElementById('shipping-standard');
  var lck = document.getElementById('shipping-locker');
  if (std) {
    std.className = method === 'standard' ? 'payment-option selected' : 'payment-option';
    std.querySelector('.payment-radio').style.cssText = method === 'standard' ? 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:6px solid var(--primary)' : 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:2px solid var(--border)';
  }
  if (lck) {
    lck.className = method === 'locker' ? 'payment-option selected' : 'payment-option';
    lck.querySelector('.payment-radio').style.cssText = method === 'locker' ? 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:6px solid var(--primary)' : 'width:20px;height:20px;border-radius:50%;flex-shrink:0;border:2px solid var(--border)';
  }
  updateCheckoutTotal();
}

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
      btn.innerHTML = '<i class="fa-solid fa-wallet" style="margin-right:0.35rem"></i> Pay via MoMo';
      btn.style.background = 'linear-gradient(135deg, #a50064, #d82d8b)';
    } else {
      btn.innerHTML = '<i class="fa-solid fa-lock" style="margin-right:0.35rem"></i> Confirm Order (COD)';
      btn.style.background = '';
    }
  }
}

function openShopeeVoucherModal() {
  var overlay = document.createElement('div');
  overlay.className = 'shopee-voucher-overlay';
  overlay.id = 'shopee-voucher-overlay';
  
  var modal = document.createElement('div');
  modal.className = 'shopee-voucher-modal';
  
  var header = document.createElement('div');
  header.className = 'shopee-voucher-header';
  var firstItem = (window._checkoutData && window._checkoutData.items && window._checkoutData.items.length > 0) ? window._checkoutData.items[0] : null;
  var storeName = firstItem ? (firstItem.store || firstItem.shop || 'ReFashion') : 'ReFashion';
  if (storeName === 'undefined') storeName = 'ReFashion';
  header.innerHTML = storeName + ' Voucher<button class="shopee-voucher-close" onclick="document.body.removeChild(document.getElementById(\'shopee-voucher-overlay\'))"><i class="fa-solid fa-xmark"></i></button>';
  
  var inputArea = document.createElement('div');
  inputArea.className = 'shopee-voucher-input-area';
  inputArea.innerHTML = '<input type="text" id="modal-voucher-input" placeholder="Enter Shop Voucher code" /><button onclick="confirmShopeeVoucher()">Apply</button>';
  
  var list = document.createElement('div');
  list.className = 'shopee-voucher-list';
  
  var claimed = JSON.parse(localStorage.getItem('refashion_claimed_vouchers') || '{}');
  var options = '';
  
  for (var k in claimed) {
    // Construct store logo path, e.g. "Eco Wear" -> "../images/store_eco_wear.png"
    var storeStr = claimed[k].store ? claimed[k].store.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') : 'default';
    var itemImg = '../images/store_' + storeStr + '.png';
    
    options += '<div class="shopee-voucher-item" onclick="selectShopeeVoucher(this, \''+claimed[k].code+'\', '+claimed[k].amount+')">' +
        '<div class="sv-logo"><img src="' + itemImg + '" onerror="this.src=\'../images/app-logo.png\'" alt="logo" style="width:48px;height:48px;object-fit:cover;border-radius:50%;"/><span class="sv-mall">Mall</span></div>' +
        '<div class="sv-content"><div class="sv-title">' + (claimed[k].amount/1000) + 'kđ OFF</div><div class="sv-cond">Min. order ' + ((claimed[k].amount*2)/1000) + 'kđ</div><div class="sv-expiry">Exp: 31.08.2026 <a href="#" style="color:var(--primary);text-decoration:none;">T&C</a></div></div>' +
        '<div class="sv-radio"><span class="sv-radio-btn" data-code="'+claimed[k].code+'"></span></div>' +
      '</div>';
  }
  if (options === '') {
    options = '<p style="text-align:center;color:var(--text-muted);margin-top:24px;">No vouchers claimed yet.</p>';
  }
  list.innerHTML = options;
  
  var footer = document.createElement('div');
  footer.className = 'shopee-voucher-footer';
  footer.innerHTML = '<div class="sv-discount" id="modal-discount-text">Discount: <span>0đ</span></div><button class="sv-confirm-btn" onclick="confirmShopeeVoucher()">Apply</button>';
  
  modal.appendChild(header);
  modal.appendChild(inputArea);
  modal.appendChild(list);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

function selectShopeeVoucher(el, code, amount) {
  var btns = document.querySelectorAll('.sv-radio-btn');
  btns.forEach(b => b.classList.remove('selected'));
  var btn = el.querySelector('.sv-radio-btn');
  if (btn) btn.classList.add('selected');
  
  document.getElementById('modal-voucher-input').value = code;
  document.getElementById('modal-discount-text').innerHTML = 'Discount: <span>-' + amount.toLocaleString('vi-VN') + 'đ</span>';
}

function applyModalVoucher() {
  // Deprecated, use confirmShopeeVoucher instead for direct application
}

function confirmShopeeVoucher() {
  var code = document.getElementById('modal-voucher-input').value.trim();
  if (code) {
    var input = document.getElementById('voucher-input');
    if (input) input.value = code;
    
    var triggerText = document.getElementById('sv-trigger-text');
    if (triggerText) {
        triggerText.textContent = code;
        triggerText.style.color = 'var(--primary)';
        triggerText.style.fontWeight = '600';
    }
    
    var triggerRow = document.getElementById('sv-trigger-row');
    if (triggerRow) triggerRow.style.display = 'none';
    
    applyVoucherCode();
  }
  var overlay = document.getElementById('shopee-voucher-overlay');
  if (overlay) document.body.removeChild(overlay);
}

function applyVoucherCode() {
  var input = document.getElementById('voucher-input');
  var code = input ? input.value.trim().toUpperCase() : '';
  var errorEl = document.getElementById('voucher-error');
  if (!code) { if (errorEl) { errorEl.textContent = 'Please enter a voucher code.'; errorEl.style.display = 'block'; } return; }
  
  var claimed = JSON.parse(localStorage.getItem('refashion_claimed_vouchers') || '{}');
  var voucher = null;
  for (var k in claimed) {
    if (claimed[k].code === code) {
      voucher = { code: claimed[k].code, discount: 0, fixedAmount: claimed[k].amount, description: 'Shop Voucher: ' + claimed[k].amount.toLocaleString('vi-VN') + 'đ OFF', store: claimed[k].store };
      break;
    }
  }
  
  if (!voucher) {
    voucher = RefashionAuth.applyVoucher(code); // Fallback to system vouchers (percentage)
  }
  
  if (voucher) {
    var section = document.getElementById('voucher-section');
    var applied = document.getElementById('voucher-applied');
    if (section) section.style.display = 'none';
    if (applied) {
      applied.style.display = 'block';
      var textInfo = voucher.fixedAmount ? (voucher.fixedAmount.toLocaleString('vi-VN') + 'đ OFF') : (voucher.discount + '% OFF');
      applied.innerHTML =
        '<div class="voucher-applied" data-code="' + voucher.code + '" data-discount="' + voucher.discount + '" data-fixed="' + (voucher.fixedAmount||0) + '" data-store="' + (voucher.store||'') + '">' +
          '<div><p style="font-weight:700;font-size:0.85rem;color:var(--sentiment-pos)"><i class="fa-solid fa-check-circle" style="margin-right:0.25rem"></i>' + voucher.code + ' \u2014 ' + textInfo + '</p><p style="font-size:0.75rem;color:var(--text-muted)">' + voucher.description + '</p></div>' +
          '<button onclick="removeVoucher()" style="background:transparent;border:none;cursor:pointer;color:var(--sentiment-neg);font-size:0.85rem"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>';
    }
    if (errorEl) errorEl.style.display = 'none';
    updateCheckoutTotal(voucher.discount, voucher.fixedAmount);
  } else {
    if (errorEl) { errorEl.textContent = 'Invalid voucher code, expired or already used.'; errorEl.style.display = 'block'; }
  }
}

function removeVoucher() {
  var triggerRow = document.getElementById('sv-trigger-row');
  var applied = document.getElementById('voucher-applied');
  var input = document.getElementById('voucher-input');
  var triggerText = document.getElementById('sv-trigger-text');
  
  if (triggerRow) triggerRow.style.display = 'flex';
  if (applied) { applied.style.display = 'none'; applied.innerHTML = ''; }
  if (input) input.value = '';
  if (triggerText) {
      triggerText.textContent = 'Select or enter voucher...';
      triggerText.style.color = 'var(--text-muted)';
      triggerText.style.fontWeight = 'normal';
  }
  updateCheckoutTotal(0, 0);
}

function updateCheckoutTotal(discountPercent, fixedAmount) {
  var data = window._checkoutData;
  if (!data) return;
  
  var applied = document.querySelector('.voucher-applied');
  if (applied) {
    if (discountPercent === undefined) discountPercent = parseInt(applied.getAttribute('data-discount') || 0);
    if (fixedAmount === undefined) fixedAmount = parseInt(applied.getAttribute('data-fixed') || 0);
  } else {
    discountPercent = discountPercent || 0;
    fixedAmount = fixedAmount || 0;
  }
  
  window._lastDiscountPercent = discountPercent;
  window._lastFixedAmount = fixedAmount;

  var discountAmount = fixedAmount > 0 ? fixedAmount : Math.floor(data.subtotal * discountPercent / 100);
  
  var gcToggle = document.getElementById('greencoin-toggle');
  var gcAmount = 0;
  var availableGc = parseInt(localStorage.getItem('refashion_greencoins') || 0);
  
  var tempTotal = data.subtotal - discountAmount;
  if (tempTotal < 0) tempTotal = 0;
  
  if (gcToggle && gcToggle.checked) {
    gcAmount = Math.min(availableGc, tempTotal); // Can't use more GC than the total price
  }
  
  var total = tempTotal - gcAmount;
  if (total < 0) total = 0;
  
  var gcEst = Math.floor(total / 100000) * 5;
  if (checkoutShippingMethod === 'locker') {
    gcEst += 50;
  }
  
  var subtotalEl = document.getElementById('checkout-discount-amount');
  var totalEl = document.getElementById('checkout-total');
  var gcEl = document.getElementById('checkout-greencoin-estimate');
  var discountRow = document.getElementById('checkout-discount-row');
  
  var gcRowEl = document.getElementById('checkout-gc-amount');
  var gcRow = document.getElementById('checkout-gc-row');
  
  if (discountAmount > 0) {
    if (discountRow) discountRow.style.display = 'block';
    if (subtotalEl) subtotalEl.textContent = '-' + discountAmount.toLocaleString('vi-VN') + ' \u0111';
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }
  
  if (gcAmount > 0) {
    if (gcRow) gcRow.style.display = 'block';
    if (gcRowEl) gcRowEl.textContent = '-' + gcAmount.toLocaleString('vi-VN') + ' \u0111';
  } else {
    if (gcRow) gcRow.style.display = 'none';
  }
  
  if (totalEl) totalEl.textContent = total.toLocaleString('vi-VN') + ' \u0111';
  if (gcEl) gcEl.innerHTML = '<i class="fa-solid fa-leaf"></i> Earn +' + gcEst + ' GreenCoin after ordering!';
  
  data.finalTotal = total;
  data.gcAmount = gcAmount;
  data.voucherStore = applied ? applied.getAttribute('data-store') : null;
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
  if (!name) errs.push('Full name');
  if (!phone || phone.length < 9) errs.push('Phone number');
  if (!province) errs.push('Province/City');
  if (!address) errs.push('Detailed address');
  if (errs.length > 0) { showToast('Please fill in: ' + errs.join(', ')); return; }
  var discountPercent = 0;
  var voucherCode = null;
  var applied = document.querySelector('.voucher-applied');
  if (applied) {
    discountPercent = parseInt(applied.getAttribute('data-discount') || 0);
    voucherCode = applied.getAttribute('data-code');
  }
  if (checkoutPaymentMethod === 'momo') {
    showToast('Redirecting to MoMo Payment Gateway...');
    var btn = document.getElementById('place-order-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right:0.35rem"></i> Redirecting...'; }
    var order = RefashionAuth.placeOrderWithDetails({ items: data.items, discountPercent: discountPercent, voucherCode: voucherCode, phone: phone, address: address + ', ' + province, note: note, gcAmount: data.gcAmount });
    if (!order) {
      showToast('Error placing order.');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-wallet" style="margin-right:0.35rem"></i> Pay via MoMo'; }
      return;
    }
    processGreenCoinAndVoucher(data.gcAmount, data.voucherStore, data.finalTotal);
    window.location.href = 'momo-gateway.html?orderId=' + order.id + '&amount=' + order.total;
    return;
  }
  var order = RefashionAuth.placeOrderWithDetails({ items: data.items, discountPercent: discountPercent, voucherCode: voucherCode, phone: phone, address: address + ', ' + province, note: note, gcAmount: data.gcAmount });
  if (order) {
    processGreenCoinAndVoucher(data.gcAmount, data.voucherStore, data.finalTotal);
    showSuccessView(order.id, order.total, data.gcAmount);
  }
}

function processGreenCoinAndVoucher(gcAmount, voucherStore, finalTotal) {
  if (gcAmount > 0) {
    var currentGc = parseInt(localStorage.getItem('refashion_greencoins') || 0);
    localStorage.setItem('refashion_greencoins', Math.max(0, currentGc - gcAmount).toString());
  }
  
  if (voucherStore) {
    var claimed = JSON.parse(localStorage.getItem('refashion_claimed_vouchers') || '{}');
    delete claimed[voucherStore];
    localStorage.setItem('refashion_claimed_vouchers', JSON.stringify(claimed));
  }
  
  var gcEst = Math.floor(finalTotal / 100000) * 5;
  if (checkoutShippingMethod === 'locker') {
    gcEst += 50;
  }
  var currentGc = parseInt(localStorage.getItem('refashion_greencoins') || 0);
  localStorage.setItem('refashion_greencoins', (currentGc + gcEst).toString());
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
        '<div class="success-icon animate-success" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
        '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">Order Placed Successfully! \ud83c\udf89</h2>' +
        '<p style="color:var(--text-muted);margin-bottom:0.5rem">Order code: <strong style="color:var(--primary)">#' + orderId + '</strong></p>' +
        '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;text-align:left">' +
          '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;font-weight:700;color:var(--primary)"><i class="fa-solid fa-truck-fast"></i> Estimated Delivery Time</div>' +
          '<p style="font-size:1.1rem;font-weight:800;color:var(--foreground)">\ud83d\udce6 ' + deliveryRange + '</p>' +
        '</div>' +
        '<div style="background-color:var(--sentiment-pos-light);border-radius:12px;padding:1rem;margin-bottom:2rem;display:inline-flex;align-items:center;gap:0.5rem;color:var(--sentiment-pos);font-weight:700;font-size:1rem"><i class="fa-solid fa-leaf"></i> You earned +' + (gcEst) + ' GreenCoin!</div>' +
        '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="/buyer/orders.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">View Order</a><a href="/buyer/order-tracking.html?order=' + orderId + '" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Track</a><a href="/buyer/shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Continue Shopping</a></div>' +
      '</div>' +
    '</div>';
}

/* ==================== PROFILE PAGE ==================== */
function initProfilePage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/profile.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderProfile();
}

function renderProfile() {
  var user = RefashionAuth._getUser();
  var container = document.getElementById('profile-content');
  if (!user || !container) return;

  var dobVal = '';
  if (user.birthYear) {
    var strVal = String(user.birthYear).trim();
    if (strVal.length === 4) {
      dobVal = strVal + '-01-01';
    } else {
      dobVal = strVal;
    }
  }

  container.innerHTML =
    '<div class="profile-hero" style="margin-bottom: 2rem;">' +
      '<div class="profile-hero-bg"><i class="fa-solid fa-leaf"></i></div>' +
      '<div class="profile-hero-content">' +
        '<div class="profile-avatar">' + user.username.charAt(0).toUpperCase() + '</div>' +
        '<div class="profile-info">' +
          '<h1>' + user.username + '</h1>' +
          '<div class="profile-meta">' +
            '<span><i class="fa-solid fa-envelope" style="width:16px;margin-right:0.4rem;color:#EEE8DB"></i>Email: ' + user.email + '</span>' +
            '<span><i class="fa-solid fa-calendar" style="width:16px;margin-right:0.4rem;color:#EEE8DB"></i>Joined: ' + user.joinDate + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    
    '<div style="display:grid; grid-template-columns: 1fr; gap:2rem; margin-top:2rem;">' +
      '<div style="background:var(--card); border:1px solid var(--border); border-radius:24px; padding:2.5rem; box-shadow:0 8px 30px var(--shadow);">' +
        '<h3 style="font-family:var(--font-serif); font-size:1.75rem; color:var(--primary); margin-bottom:1.5rem; display:flex; align-items:center; gap:0.5rem;">' +
          '<i class="fa-solid fa-user-gear"></i> Personal Information' +
        '</h3>' +
        '<form id="profile-edit-form" class="profile-edit-form" onsubmit="submitEditProfile(event)" style="display:flex; flex-direction:column; gap:1.25rem;">' +
          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Username</label>' +
            '<input type="text" id="edit-username" value="' + user.username + '" required style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
          '</div>' +
          
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Gender</label>' +
              '<select id="edit-gender" style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;">' +
                '<option value="men" ' + (user.gender === 'men' ? 'selected' : '') + '>Male</option>' +
                '<option value="women" ' + (user.gender === 'women' ? 'selected' : '') + '>Female</option>' +
                '<option value="unisex" ' + (user.gender === 'unisex' ? 'selected' : '') + '>Unisex / Other</option>' +
              '</select>' +
            '</div>' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Date of Birth</label>' +
              '<input type="date" id="edit-birthYear" value="' + dobVal + '" style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
            '</div>' +
          '</div>' +

          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Phone Number</label>' +
            '<input type="tel" id="edit-phone" value="' + (user.phone || '') + '" placeholder="Enter phone number..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
          '</div>' +

          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Address</label>' +
            '<div style="display:flex; gap:0.5rem;">' +
              '<input type="text" id="edit-address" value="' + (user.address || '') + '" placeholder="Enter address..." style="flex:1; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
              '<button type="button" class="btn" onclick="openMapPicker()" style="padding:0.75rem 1rem; background:var(--accent); color:white; font-weight:700; border-radius:12px; border:none; cursor:pointer; display:flex; align-items:center; gap:0.35rem; transition:all 0.25s ease;" onmouseover="this.style.opacity=\'0.85\';" onmouseout="this.style.opacity=\'1\';">' +
                '<i class="fa-solid fa-map-location-dot"></i> Bản đồ' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<hr style="border:0; border-top:1px solid var(--border); margin:1rem 0;" />' +
          
          '<h3 style="font-family:var(--font-serif); font-size:1.5rem; color:var(--primary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">' +
            '<i class="fa-solid fa-shield-halved"></i> Change Password (Optional)' +
          '</h3>' +
          '<p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Leave password fields blank if you do not want to change it.</p>' +

          '<div class="profile-edit-form-group">' +
            '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Current Password</label>' +
            '<input type="password" id="edit-curr-password" placeholder="Enter current password..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
          '</div>' +

          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">New Password</label>' +
              '<input type="password" id="edit-new-password" placeholder="New password..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
            '</div>' +
            '<div class="profile-edit-form-group">' +
              '<label style="font-weight:600; font-size:0.85rem; margin-bottom:0.5rem; display:block;">Confirm New Password</label>' +
              '<input type="password" id="edit-confirm-password" placeholder="Confirm new password..." style="width:100%; padding:0.75rem 1rem; border-radius:12px; border:1px solid var(--border); background-color:var(--background); color:var(--foreground); font-size:0.9rem;" />' +
            '</div>' +
          '</div>' +

          '<div style="margin-top:1.5rem; display:flex; justify-content:flex-end;">' +
            '<button type="submit" class="btn btn-primary" style="border-radius:12px; padding:0.85rem 2rem; font-weight:700;">Save Changes</button>' +
          '</div>' +
        '</form>' +
      '</div>' +
      '</div>' +
    '</div>';

  // Inject or prepare map picker overlay element directly to body if not already there
  var mapOverlay = document.getElementById('map-picker-overlay');
  if (!mapOverlay) {
    mapOverlay = document.createElement('div');
    mapOverlay.id = 'map-picker-overlay';
    mapOverlay.className = 'map-picker-overlay';
    mapOverlay.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">' +
        '<h4 style="margin:0; font-size:1.1rem; color:white; font-family:var(--font-serif);"><i class="fa-solid fa-map-location-dot" style="color:var(--accent)"></i> Chọn vị trí trên Bản đồ</h4>' +
        '<button type="button" onclick="closeMapPicker()" style="background:none; border:none; color:white; font-size:1.25rem; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div style="display:flex; gap:0.5rem; margin-bottom:0.75rem;">' +
        '<input type="text" id="map-search-input" placeholder="Nhập địa chỉ cần tìm (mặc định ở VN)..." onkeydown="if(event.key===\'Enter\'){event.preventDefault();searchAddressOnMap();}" />' +
        '<button type="button" onclick="searchAddressOnMap()" class="btn" style="padding:0.6rem 1rem; border-radius:10px; border:none; cursor:pointer; background:var(--accent); color:white; font-weight:700;">Tìm</button>' +
      '</div>' +
      '<div id="map-picker-canvas"></div>' +
      '<div style="margin-bottom:0.75rem; color:white; font-size:0.85rem; line-height:1.4;">' +
        '<span style="font-weight:700;">Vị trí đã chọn:</span> <span id="map-selected-address-text">Not selected</span>' +
      '</div>' +
      '<div style="display:flex; justify-content:flex-end; gap:0.5rem;">' +
        '<button type="button" class="btn btn-outline" onclick="closeMapPicker()" style="border-radius:10px; padding:0.5rem 1rem; color:white; border-color:white; background:transparent;">Hủy</button>' +
        '<button type="button" class="btn btn-primary" onclick="confirmMapSelection()" style="border-radius:10px; padding:0.5rem 1rem; background:var(--accent); border-color:var(--accent); color:white; font-weight:700;">Xác nhận</button>' +
      '</div>';
    document.body.appendChild(mapOverlay);
  }
}

function openEditProfileModal() {
  var user = RefashionAuth._getUser();
  if (!user) return;
  document.getElementById('edit-username').value = user.username || '';
  document.getElementById('edit-gender').value = user.gender || 'unisex';
  document.getElementById('edit-birthYear').value = user.birthYear || '';
  document.getElementById('edit-address').value = user.address || '';
  document.getElementById('edit-phone').value = user.phone || '';
  document.getElementById('edit-curr-password').value = '';
  document.getElementById('edit-new-password').value = '';
  document.getElementById('edit-confirm-password').value = '';
  var modal = document.getElementById('profile-edit-modal');
  if (modal) modal.classList.add('show');
}

function closeEditProfileModal() {
  var modal = document.getElementById('profile-edit-modal');
  if (modal) modal.classList.remove('show');
}

function submitEditProfile(event) {
  event.preventDefault();
  var user = RefashionAuth._getUser();
  if (!user) return;

  var username = document.getElementById('edit-username').value.trim();
  var gender = document.getElementById('edit-gender').value;
  var birthYear = document.getElementById('edit-birthYear').value.trim();
  var address = document.getElementById('edit-address').value.trim();
  var phone = document.getElementById('edit-phone').value.trim();
  var currPassword = document.getElementById('edit-curr-password').value;
  var newPassword = document.getElementById('edit-new-password').value;
  var confirmPassword = document.getElementById('edit-confirm-password').value;

  if (newPassword || confirmPassword || currPassword) {
    if (!currPassword) {
      showToast('❌ Please enter your current password to change it.');
      return;
    }
    var realPass = RefashionAuth.getUserPassword(user.email);
    if (currPassword !== realPass) {
      showToast('❌ Current password is incorrect.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('❌ New password and confirmation password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('❌ New password must be at least 6 characters.');
      return;
    }
  }

  var payload = {
    username: username,
    gender: gender,
    birthYear: birthYear || '',
    address: address,
    phone: phone,
    password: newPassword || ''
  };

  var res = RefashionAuth.updateUserProfile(payload);
  if (res.success) {
    showToast('✅ Profile updated successfully!');
    closeEditProfileModal();
    renderProfile();
  } else {
    showToast('❌ ' + res.message);
  }
}

/* ==================== COMMUNITY PAGE ==================== */
var REWARDS_DB = [
  { id: 1, name: 'Plant 1 Green Tree', cost: 50, image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300', description: 'ReFashion will plant a tree on your behalf in the Can Gio mangrove forest.', category: 'action' },
  { id: 2, name: '20% Discount Voucher', cost: 100, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=300', description: '20% off discount code applicable to your next green order at ReFashion.', category: 'discount' },
  { id: 3, name: 'Stainless Steel Eco Bottle', cost: 200, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300', description: 'Premium insulated stainless steel thermal bottle.', category: 'gift' },
  { id: 4, name: 'Natural Jute Tote Bag', cost: 80, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300', description: 'Durable tote bag woven from natural jute fibers.', category: 'gift' }
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

  // Initialize mock redemptions if empty
  if (isLoggedIn && !localStorage.getItem('refashion_redemptions')) {
    var mockRedemptions = [
      { id: 'R-mock1', itemName: '20% Discount Voucher', cost: 100, date: '02/07/2026', code: 'RF20-MOCK99' },
      { id: 'R-mock2', itemName: 'Plant 1 Green Tree', cost: 50, date: '25/06/2026', code: null }
    ];
    localStorage.setItem('refashion_redemptions', JSON.stringify(mockRedemptions));
  }

  var walletHtml = isLoggedIn
    ? '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">' + balance + ' <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2>'
    : '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">\u2014 <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2><p style="font-size:0.85rem;opacity:0.85"><a href="../auth/login.html?redirect=community.html" style="color:var(--accent);font-weight:700;text-decoration:underline">Login</a> to view your GreenCoin balance</p>';
  
  var rewardsHtml = '';
  for (var i = 0; i < REWARDS_DB.length; i++) {
    var item = REWARDS_DB[i];
    var canRedeem = isLoggedIn && balance >= item.cost;
    rewardsHtml +=
      '<div class="reward-card">' +
        '<div class="reward-img"><img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'../images/sh_denim_shirt.png\'" /></div>' +
        '<div class="reward-body">' +
          '<h4 style="font-weight:700;font-size:0.95rem;margin-bottom:0.5rem">' + item.name + '</h4>' +
          '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.4;flex-grow:1">' + item.description + '</p>' +
          '<div class="reward-footer">' +
            '<span style="font-size:1.1rem;font-weight:800;color:var(--primary);display:flex;align-items:center;gap:0.25rem">' + item.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.9rem;color:var(--accent)"></i></span>' +
            '<button onclick="handleRedeem(' + item.id + ')" class="btn btn-outline" style="padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:8px;background-color:' + (canRedeem ? 'var(--primary-light)' : 'transparent') + ';color:' + (canRedeem ? 'var(--primary)' : 'var(--foreground)') + ';border-color:' + (canRedeem ? 'var(--primary)' : 'var(--border)') + '">' + (isLoggedIn ? 'Redeem' : 'Login') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var redemptions = [];
  if (isLoggedIn) {
    try { redemptions = JSON.parse(localStorage.getItem('refashion_redemptions')) || []; } catch(e) {}
  }
  
  var redemptionsHtml = '';
  if (isLoggedIn) {
    if (redemptions.length > 0) {
      redemptionsHtml += 
        '<div style="margin-top:4rem; border-top:1px solid var(--border); padding-top:3rem;">' +
          '<div style="text-align:center;margin-bottom:2.5rem">' +
            '<h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Lịch sử đổi quà & điểm</h3>' +
            '<p style="color:var(--text-muted);font-size:1rem">Xem danh sách các phần quà và hoạt động bạn đã đổi bằng GreenCoin.</p>' +
          '</div>' +
          '<div style="background-color:var(--card); border-radius:24px; border:1px solid var(--border); padding:2rem; box-shadow:0 10px 30px var(--shadow); overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem; min-width:600px;">' +
              '<thead>' +
                '<tr style="border-bottom:2px solid var(--border); color:var(--primary); font-weight:700;">' +
                  '<th style="padding:1rem;">Mã giao dịch</th>' +
                  '<th style="padding:1rem;">Phần quà / Hoạt động</th>' +
                  '<th style="padding:1rem;">Mã Voucher (nếu có)</th>' +
                  '<th style="padding:1rem;">Ngày đổi</th>' +
                  '<th style="padding:1rem; text-align:right;">GreenCoin đã tiêu</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>';
      for (var k = 0; k < redemptions.length; k++) {
        var r = redemptions[k];
        var codeDisplay = r.code ? '<code style="background-color:var(--primary-light); color:var(--primary); padding:0.25rem 0.5rem; border-radius:6px; font-weight:700; font-family:var(--font-sans);">' + r.code + '</code>' : '<span style="color:var(--text-muted);">—</span>';
        redemptionsHtml +=
          '<tr style="border-bottom:1px solid var(--border); transition:all 0.2s;" onmouseover="this.style.backgroundColor=\'var(--background)\';" onmouseout="this.style.backgroundColor=\'transparent\';">' +
            '<td style="padding:1rem; font-weight:600; color:var(--primary);">' + r.id + '</td>' +
            '<td style="padding:1rem; display:flex; align-items:center; gap:0.5rem;"><i class="fa-solid ' + (r.code ? 'fa-ticket' : 'fa-seedling') + '" style="color:' + (r.code ? 'var(--accent)' : 'var(--primary)') + ';"></i>' + r.itemName + '</td>' +
            '<td style="padding:1rem;">' + codeDisplay + '</td>' +
            '<td style="padding:1rem; color:var(--text-muted);">' + r.date + '</td>' +
            '<td style="padding:1rem; text-align:right; font-weight:800; color:var(--sentiment-neg); font-size:1.05rem;">-' + r.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.8rem;color:var(--accent);"></i></td>' +
          '</tr>';
      }
      redemptionsHtml +=
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>';
    } else {
      redemptionsHtml +=
        '<div style="margin-top:4rem; border-top:1px solid var(--border); padding-top:3rem; text-align:center; color:var(--text-muted);">' +
          '<h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Lịch sử đổi quà & điểm</h3>' +
          '<p style="margin-bottom:1.5rem;">Bạn chưa thực hiện giao dịch đổi quà nào.</p>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<div class="community-section"><div class="container">' +
      '<div class="community-header"><span class="badge badge-accent" style="margin-bottom:1rem">Green Planet Community</span><h1>A Greener Earth Every Day</h1><p style="color:var(--text-muted);font-size:1.1rem">Donate old clothes to earn GreenCoin rewards and join hands to sponsor ecological restoration projects.</p></div>' +
      '<div class="top-panel">' +
        '<div class="wallet-card animate-pulse-soft"><div class="wallet-card-bg"><i class="fa-solid fa-leaf"></i></div><div><span style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:var(--accent)">Your GreenCoin Wallet</span>' + walletHtml + '</div><div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:1.5rem"><p style="font-size:0.85rem;opacity:0.85;line-height:1.5">\ud83c\udf40 How to earn GreenCoin:<br />\u2022 Shop at ReFashion (+5 coin/100k)\u2022 Daily check-in (+10 coin)</p><button onclick="dailyCheckin()" class="btn btn-outline" style="margin-top:1rem;width:100%;border-radius:12px;padding:0.7rem;font-size:0.85rem;font-weight:700;background-color:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25);color:#fff" id="checkin-btn"><i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> Check In & Earn 10 Coin</button></div></div>' +
        '<div style="background-color:var(--card);border-radius:24px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow)"><h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:1.25rem">Ongoing Environmental Campaigns</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1.25rem">' +
            '<div style="display:flex;gap:1rem;border-bottom:1px solid var(--border);padding-bottom:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-primary" style="font-size:0.65rem;margin-bottom:0.25rem">June Campaign</span><h4 style="font-weight:700;font-size:0.95rem">Beach Cleanup & Waste Collection Festival — Vung Tau</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Join 200+ volunteers collecting plastic waste to protect our oceans.</p><a href="https://tnmtvungtau.vn" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> View Details</a></div></div>' +
            '<div style="display:flex;gap:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-accent" style="font-size:0.65rem;margin-bottom:0.25rem">Forest Restoration</span><h4 style="font-weight:700;font-size:0.95rem">Reforest 10 Hectares of Mangrove Forest</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Partner to plant mangroves for flood protection. Redeem 50 GreenCoin to replace one sapling.</p><a href="https://www.thiennhien.net" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> View Details</a></div></div>' +
          '</div></div>' +
      '</div>' +
      '<div class="rewards-section">' +
        '<div style="text-align:center;margin-bottom:2.5rem"><h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Green Rewards Store</h3><p style="color:var(--text-muted);font-size:1rem">Redeem your accumulated GreenCoin points for products or contribute to the Earth.</p></div>' +
        '<div class="rewards-grid">' + rewardsHtml + '</div>' +
      '</div>' +
      redemptionsHtml +
    '</div></div>';
}
function dailyCheckin() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/community.html'; return; }
  var today = new Date().toLocaleDateString('vi-VN');
  var lastCheckin = user.lastCheckin || '';
  if (lastCheckin === today) {
    showToast('\u274c You\'ve already checked in today! Come back tomorrow.');
    return;
  }
  var bonus = 10;
  user.greenCoin = (user.greenCoin || 0) + bonus;
  user.lastCheckin = today;
  RefashionAuth._saveUser(user);
  showToast('\ud83c\udf40 Check-in successful! You received +' + bonus + ' GreenCoin.');
  document.getElementById('checkin-btn').disabled = true;
  document.getElementById('checkin-btn').innerHTML = '<i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> Checked In';
  document.getElementById('checkin-btn').style.opacity = '0.6';
  document.getElementById('checkin-btn').style.cursor = 'not-allowed';
  renderCommunity();
}



function handleRedeem(itemId) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/community.html'; return; }
  var item = null;
  for (var i = 0; i < REWARDS_DB.length; i++) {
    if (REWARDS_DB[i].id === itemId) { item = REWARDS_DB[i]; break; }
  }
  if (!item) return;
  var voucher = null;
  if (item.category === 'discount') {
    var match = item.name.match(/(\d+)%/);
    var discount = match ? parseInt(match[1]) : 20;
    voucher = RefashionAuth.redeemVoucher(item.cost, discount, item.name);
    if (!voucher) { showToast('\u274c Not enough GreenCoin. You need ' + (item.cost - (user.greenCoin || 0)) + ' more GreenCoin.'); return; }
    showToast('\ud83c\udf9f\ufe0f Voucher redeemed! Your code: ' + voucher.code + ' (' + discount + '% OFF, Exp: ' + voucher.expiresAt + ').');
  } else {
    var success = RefashionAuth.spendGreenCoin(item.cost);
    if (!success) { showToast('\u274c Not enough GreenCoin. You need ' + (item.cost - (user.greenCoin || 0)) + ' more GreenCoin.'); return; }
    showToast('\ud83c\udf89 Reward redeemed! You received: "' + item.name + '".');
  }
  
  // Save to redemption history
  var redemption = {
    id: 'R-' + Date.now().toString(36).toUpperCase(),
    itemName: item.name,
    cost: item.cost,
    date: new Date().toLocaleDateString('vi-VN'),
    code: voucher ? voucher.code : null
  };
  var redemptions = [];
  try { redemptions = JSON.parse(localStorage.getItem('refashion_redemptions')) || []; } catch(e) {}
  redemptions.unshift(redemption);
  localStorage.setItem('refashion_redemptions', JSON.stringify(redemptions));

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
  renderFooter('footer-container');
  var container = document.getElementById('momo-return-content');
  if (!container) return;
  if (resultCode === '0') {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon animate-success" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">Payment Successful! \ud83c\udf89</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:1rem">Order <strong style="color:var(--primary)">#' + (orderId || '') + '</strong> has been paid via MoMo.</p>' +
          '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;text-align:left">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:0.5rem"><span style="color:var(--text-muted)">MoMo Transaction ID</span><span style="font-weight:700;color:var(--primary)">' + (transId || '') + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Amount</span><span style="font-weight:700;color:var(--accent)">' + (amount ? Number(amount).toLocaleString('vi-VN') : '') + ' \u0111</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem"><a href="/buyer/orders.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">View Order</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Continue Shopping</a></div>' +
          '<div style="margin-top:2rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-wallet" style="color:#a50064"></i> Paid via MoMo Wallet</div>' +
        '</div>' +
      '</div>';
  } else {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon animate-error" style="background-color:#fef2f2"><i class="fa-solid fa-xmark" style="font-size:2.5rem;color:#ef4444"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:#ef4444;margin-bottom:0.75rem">Payment Failed</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:2rem">' + (message || 'Transaction unsuccessful. Please try again.') + '</p>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="checkout.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Try Again</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Go Back</a></div>' +
        '</div>' +
      '</div>';
  }
}

/* ==================== COMMUNITY PAGE ==================== */
var REWARDS_DB = [
  { id: 1, name: 'Plant 1 Green Tree', cost: 50, image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300', description: 'ReFashion will plant a tree on your behalf in the Can Gio mangrove forest.', category: 'action' },
  { id: 2, name: '20% Discount Voucher', cost: 100, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=300', description: '20% off discount code applicable to your next green order at ReFashion.', category: 'discount' },
  { id: 3, name: 'Stainless Steel Eco Bottle', cost: 200, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300', description: 'Premium insulated stainless steel thermal bottle.', category: 'gift' },
  { id: 4, name: 'Natural Jute Tote Bag', cost: 80, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=300', description: 'Durable tote bag woven from natural jute fibers.', category: 'gift' }
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

  // Initialize mock redemptions if empty
  if (isLoggedIn && !localStorage.getItem('refashion_redemptions')) {
    var mockRedemptions = [
      { id: 'R-mock1', itemName: '20% Discount Voucher', cost: 100, date: '02/07/2026', code: 'RF20-MOCK99' },
      { id: 'R-mock2', itemName: 'Plant 1 Green Tree', cost: 50, date: '25/06/2026', code: null }
    ];
    localStorage.setItem('refashion_redemptions', JSON.stringify(mockRedemptions));
  }

  var walletHtml = isLoggedIn
    ? '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">' + balance + ' <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2>'
    : '<h2 style="font-size:3.5rem;font-weight:900;margin:0.5rem 0;display:flex;align-items:center;gap:0.5rem">\u2014 <i class="fa-solid fa-leaf" style="font-size:2.5rem;color:var(--accent)"></i></h2><p style="font-size:0.85rem;opacity:0.85"><a href="../auth/login.html?redirect=community.html" style="color:var(--accent);font-weight:700;text-decoration:underline">Login</a> to view your GreenCoin balance</p>';
  
  var rewardsHtml = '';
  for (var i = 0; i < REWARDS_DB.length; i++) {
    var item = REWARDS_DB[i];
    var canRedeem = isLoggedIn && balance >= item.cost;
    rewardsHtml +=
      '<div class="reward-card">' +
        '<div class="reward-img"><img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'../images/sh_denim_shirt.png\'" /></div>' +
        '<div class="reward-body">' +
          '<h4 style="font-weight:700;font-size:0.95rem;margin-bottom:0.5rem">' + item.name + '</h4>' +
          '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;line-height:1.4;flex-grow:1">' + item.description + '</p>' +
          '<div class="reward-footer">' +
            '<span style="font-size:1.1rem;font-weight:800;color:var(--primary);display:flex;align-items:center;gap:0.25rem">' + item.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.9rem;color:var(--accent)"></i></span>' +
            '<button onclick="handleRedeem(' + item.id + ')" class="btn btn-outline" style="padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:8px;background-color:' + (canRedeem ? 'var(--primary-light)' : 'transparent') + ';color:' + (canRedeem ? 'var(--primary)' : 'var(--foreground)') + ';border-color:' + (canRedeem ? 'var(--primary)' : 'var(--border)') + '">' + (isLoggedIn ? 'Redeem' : 'Login') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var redemptions = [];
  if (isLoggedIn) {
    try { redemptions = JSON.parse(localStorage.getItem('refashion_redemptions')) || []; } catch(e) {}
  }
  
  var redemptionsHtml = '';
  if (isLoggedIn) {
    if (redemptions.length > 0) {
      redemptionsHtml += 
        '<div style="margin-top:4rem; border-top:1px solid var(--border); padding-top:3rem;">' +
          '<div style="text-align:center;margin-bottom:2.5rem">' +
            '<h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Lịch sử đổi quà & điểm</h3>' +
            '<p style="color:var(--text-muted);font-size:1rem">Xem danh sách các phần quà và hoạt động bạn đã đổi bằng GreenCoin.</p>' +
          '</div>' +
          '<div style="background-color:var(--card); border-radius:24px; border:1px solid var(--border); padding:2rem; box-shadow:0 10px 30px var(--shadow); overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.9rem; min-width:600px;">' +
              '<thead>' +
                '<tr style="border-bottom:2px solid var(--border); color:var(--primary); font-weight:700;">' +
                  '<th style="padding:1rem;">Mã giao dịch</th>' +
                  '<th style="padding:1rem;">Phần quà / Hoạt động</th>' +
                  '<th style="padding:1rem;">Mã Voucher (nếu có)</th>' +
                  '<th style="padding:1rem;">Ngày đổi</th>' +
                  '<th style="padding:1rem; text-align:right;">GreenCoin đã tiêu</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>';
      for (var k = 0; k < redemptions.length; k++) {
        var r = redemptions[k];
        var codeDisplay = r.code ? '<code style="background-color:var(--primary-light); color:var(--primary); padding:0.25rem 0.5rem; border-radius:6px; font-weight:700; font-family:var(--font-sans);">' + r.code + '</code>' : '<span style="color:var(--text-muted);">—</span>';
        redemptionsHtml +=
          '<tr style="border-bottom:1px solid var(--border); transition:all 0.2s;" onmouseover="this.style.backgroundColor=\'var(--background)\';" onmouseout="this.style.backgroundColor=\'transparent\';">' +
            '<td style="padding:1rem; font-weight:600; color:var(--primary);">' + r.id + '</td>' +
            '<td style="padding:1rem; display:flex; align-items:center; gap:0.5rem;"><i class="fa-solid ' + (r.code ? 'fa-ticket' : 'fa-seedling') + '" style="color:' + (r.code ? 'var(--accent)' : 'var(--primary)') + ';"></i>' + r.itemName + '</td>' +
            '<td style="padding:1rem;">' + codeDisplay + '</td>' +
            '<td style="padding:1rem; color:var(--text-muted);">' + r.date + '</td>' +
            '<td style="padding:1rem; text-align:right; font-weight:800; color:var(--sentiment-neg); font-size:1.05rem;">-' + r.cost + ' <i class="fa-solid fa-leaf" style="font-size:0.8rem;color:var(--accent);"></i></td>' +
          '</tr>';
      }
      redemptionsHtml +=
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>';
    } else {
      redemptionsHtml +=
        '<div style="margin-top:4rem; border-top:1px solid var(--border); padding-top:3rem; text-align:center; color:var(--text-muted);">' +
          '<h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Lịch sử đổi quà & điểm</h3>' +
          '<p style="margin-bottom:1.5rem;">Bạn chưa thực hiện giao dịch đổi quà nào.</p>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<div class="community-section"><div class="container">' +
      '<div class="community-header"><span class="badge badge-accent" style="margin-bottom:1rem">Green Planet Community</span><h1>A Greener Earth Every Day</h1><p style="color:var(--text-muted);font-size:1.1rem">Donate old clothes to earn GreenCoin rewards and join hands to sponsor ecological restoration projects.</p></div>' +
      '<div class="top-panel">' +
        '<div class="wallet-card animate-pulse-soft"><div class="wallet-card-bg"><i class="fa-solid fa-leaf"></i></div><div><span style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;color:var(--accent)">Your GreenCoin Wallet</span>' + walletHtml + '</div><div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:1.5rem"><p style="font-size:0.85rem;opacity:0.85;line-height:1.5">\ud83c\udf40 How to earn GreenCoin:<br />\u2022 Shop at ReFashion (+5 coin/100k)\u2022 Daily check-in (+10 coin)</p><button onclick="dailyCheckin()" class="btn btn-outline" style="margin-top:1rem;width:100%;border-radius:12px;padding:0.7rem;font-size:0.85rem;font-weight:700;background-color:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.25);color:#fff" id="checkin-btn"><i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> Check In & Earn 10 Coin</button></div></div>' +
        '<div style="background-color:var(--card);border-radius:24px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow)"><h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:1.25rem">Ongoing Environmental Campaigns</h3>' +
          '<div style="display:flex;flex-direction:column;gap:1.25rem">' +
            '<div style="display:flex;gap:1rem;border-bottom:1px solid var(--border);padding-bottom:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-primary" style="font-size:0.65rem;margin-bottom:0.25rem">June Campaign</span><h4 style="font-weight:700;font-size:0.95rem">Beach Cleanup & Waste Collection Festival — Vung Tau</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Join 200+ volunteers collecting plastic waste to protect our oceans.</p><a href="https://tnmtvungtau.vn" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> View Details</a></div></div>' +
            '<div style="display:flex;gap:1rem;align-items:flex-start"><div style="width:80px;height:80px;border-radius:12px;overflow:hidden;flex-shrink:0"><img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=150" style="width:100%;height:100%;object-fit:cover" /></div><div style="flex:1"><span class="badge badge-accent" style="font-size:0.65rem;margin-bottom:0.25rem">Forest Restoration</span><h4 style="font-weight:700;font-size:0.95rem">Reforest 10 Hectares of Mangrove Forest</h4><p style="font-size:0.85rem;color:var(--text-muted);margin-top:0.25rem;margin-bottom:0.5rem">Partner to plant mangroves for flood protection. Redeem 50 GreenCoin to replace one sapling.</p><a href="https://www.thiennhien.net" target="_blank" class="btn btn-outline" style="font-size:0.75rem;padding:0.3rem 0.85rem;border-radius:8px;display:inline-flex;align-items:center;gap:0.35rem"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.7rem"></i> View Details</a></div></div>' +
          '</div></div>' +
      '</div>' +
      '<div class="rewards-section">' +
        '<div style="text-align:center;margin-bottom:2.5rem"><h3 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.5rem">Green Rewards Store</h3><p style="color:var(--text-muted);font-size:1rem">Redeem your accumulated GreenCoin points for products or contribute to the Earth.</p></div>' +
        '<div class="rewards-grid">' + rewardsHtml + '</div>' +
      '</div>' +
      redemptionsHtml +
    '</div></div>';
}
function dailyCheckin() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/community.html'; return; }
  var today = new Date().toLocaleDateString('vi-VN');
  var lastCheckin = user.lastCheckin || '';
  if (lastCheckin === today) {
    showToast('\u274c You\'ve already checked in today! Come back tomorrow.');
    return;
  }
  var bonus = 10;
  user.greenCoin = (user.greenCoin || 0) + bonus;
  user.lastCheckin = today;
  RefashionAuth._saveUser(user);
  showToast('\ud83c\udf40 Check-in successful! You received +' + bonus + ' GreenCoin.');
  document.getElementById('checkin-btn').disabled = true;
  document.getElementById('checkin-btn').innerHTML = '<i class="fa-solid fa-calendar-check" style="margin-right:0.4rem"></i> Checked In';
  document.getElementById('checkin-btn').style.opacity = '0.6';
  document.getElementById('checkin-btn').style.cursor = 'not-allowed';
  renderCommunity();
}



function handleRedeem(itemId) {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/community.html'; return; }
  var item = null;
  for (var i = 0; i < REWARDS_DB.length; i++) {
    if (REWARDS_DB[i].id === itemId) { item = REWARDS_DB[i]; break; }
  }
  if (!item) return;
  var voucher = null;
  if (item.category === 'discount') {
    var match = item.name.match(/(\d+)%/);
    var discount = match ? parseInt(match[1]) : 20;
    voucher = RefashionAuth.redeemVoucher(item.cost, discount, item.name);
    if (!voucher) { showToast('\u274c Not enough GreenCoin. You need ' + (item.cost - (user.greenCoin || 0)) + ' more GreenCoin.'); return; }
    showToast('\ud83c\udf9f\ufe0f Voucher redeemed! Your code: ' + voucher.code + ' (' + discount + '% OFF, Exp: ' + voucher.expiresAt + ').');
  } else {
    var success = RefashionAuth.spendGreenCoin(item.cost);
    if (!success) { showToast('\u274c Not enough GreenCoin. You need ' + (item.cost - (user.greenCoin || 0)) + ' more GreenCoin.'); return; }
    showToast('\ud83c\udf89 Reward redeemed! You received: "' + item.name + '".');
  }
  
  // Save to redemption history
  var redemption = {
    id: 'R-' + Date.now().toString(36).toUpperCase(),
    itemName: item.name,
    cost: item.cost,
    date: new Date().toLocaleDateString('vi-VN'),
    code: voucher ? voucher.code : null
  };
  var redemptions = [];
  try { redemptions = JSON.parse(localStorage.getItem('refashion_redemptions')) || []; } catch(e) {}
  redemptions.unshift(redemption);
  localStorage.setItem('refashion_redemptions', JSON.stringify(redemptions));

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
  renderFooter('footer-container');
  var container = document.getElementById('momo-return-content');
  if (!container) return;
  if (resultCode === '0') {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon" style="background-color:var(--sentiment-pos-light)"><i class="fa-solid fa-check" style="font-size:2.5rem;color:var(--sentiment-pos)"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:var(--primary);margin-bottom:0.75rem">Payment Successful! \ud83c\udf89</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:1rem">Order <strong style="color:var(--primary)">#' + (orderId || '') + '</strong> has been paid via MoMo.</p>' +
          '<div style="background-color:var(--primary-light);border-radius:16px;padding:1.25rem;text-align:left">' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem;margin-bottom:0.5rem"><span style="color:var(--text-muted)">MoMo Transaction ID</span><span style="font-weight:700;color:var(--primary)">' + (transId || '') + '</span></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:0.9rem"><span style="color:var(--text-muted)">Amount</span><span style="font-weight:700;color:var(--accent)">' + (amount ? Number(amount).toLocaleString('vi-VN') : '') + ' \u0111</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-top:2rem"><a href="profile.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">View Order</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Continue Shopping</a></div>' +
          '<div style="margin-top:2rem;display:flex;align-items:center;justify-content:center;gap:0.5rem;font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-wallet" style="color:#a50064"></i> Paid via MoMo Wallet</div>' +
        '</div>' +
      '</div>';
  } else {
    container.innerHTML =
      '<div class="success-view">' +
        '<div class="success-card animate-fade-in-up">' +
          '<div class="success-icon" style="background-color:#fef2f2"><i class="fa-solid fa-xmark" style="font-size:2.5rem;color:#ef4444"></i></div>' +
          '<h2 style="font-family:var(--font-serif);font-size:2rem;color:#ef4444;margin-bottom:0.75rem">Payment Failed</h2>' +
          '<p style="color:var(--text-muted);margin-bottom:2rem">' + (message || 'Transaction unsuccessful. Please try again.') + '</p>' +
          '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap"><a href="checkout.html" class="btn btn-primary" style="border-radius:12px;padding:0.85rem 2rem">Try Again</a><a href="shop.html" class="btn btn-outline" style="border-radius:12px;padding:0.85rem 2rem">Go Back</a></div>' +
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
    headerBadge = '<span class="badge badge-primary" style="margin-bottom:1rem"><i class="fa-solid fa-scissors"></i> Raw Material Source</span>';
    headerTitle = 'Secondhand Marketplace for Designers';
    headerDesc = 'Where Designers source and purchase secondhand clothing from the community as recycled material for Upcycle designs.';
  } else {
    headerBadge = '<span class="badge badge-accent" style="margin-bottom:1rem"><i class="fa-solid fa-bullhorn"></i> Consign & Sell</span>';
    headerTitle = 'Consign & Sell Used Items';
    headerDesc = 'List your used clothing for sale as material for ReFashion Designers to repurpose, helping reduce fashion waste.';
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
    { id: 'all', name: 'All' },
    { id: 'shirt', name: 'T-Shirts/Shirts' },
    { id: 'pants', name: 'Jeans/Khakis' },
    { id: 'jacket', name: 'Jackets' },
    { id: 'dress', name: 'Dresses' },
    { id: 'others', name: 'Others' }
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
        '<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">No items yet</h3>' +
        '<p style="color:var(--text-muted);font-size:0.95rem">No secondhand items match your current filters.</p>' +
      '</div>';
  } else {
    for (var i = 0; i < filtered.length; i++) {
      var item = filtered[i];
      var priceText = item.price === 0 ? 'Free (0đ)' : item.price.toLocaleString('vi-VN') + ' đ';
      var conditionText = item.condition === 'new' ? 'Like New' : item.condition === 'good' ? 'Good' : 'Gently Used';
      var condColor = item.condition === 'new' ? 'var(--primary)' : 'var(--accent)';
      
      feedGridHtml +=
        '<div class="secondhand-card">' +
          '<div class="secondhand-card-img">' +
            '<span class="designer-badge-tag"><i class="fa-solid fa-scissors"></i> Upcycling Raw</span>' +
            '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'../images/sh_denim_shirt.png\'" />' +
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
              '<a href="tel:' + item.phone + '" class="btn btn-outline" style="flex:1;border-radius:10px;padding:0.5rem;font-size:0.8rem;text-align:center"><i class="fa-solid fa-phone"></i> Call</a>' +
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
            '<input type="text" placeholder="Search items..." value="' + secondhandState.searchQuery + '" style="padding:0.5rem 1rem 0.5rem 2.25rem;border-radius:30px;border:1px solid var(--border);background-color:var(--card);color:var(--foreground);font-size:0.85rem;width:100%" id="secondhand-search" />' +
            '<i class="fa-solid fa-magnifying-glass" style="position:absolute;left:0.85rem;color:var(--text-muted);font-size:0.85rem"></i>' +
          '</div>' +
        '</div>' +
        '<div class="secondhand-grid">' + feedGridHtml + '</div>' +
      '</div>' +
      
      '<div>' +
        '<div class="donation-pitch-card">' +
          '<div style="width:60px;height:60px;border-radius:50%;background-color:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem"><i class="fa-solid fa-hand-holding-heart" style="font-size:1.8rem"></i></div>' +
          '<h3>Charity Donation</h3>' +
          '<p>If you don\'t want to sell but simply donate used clothes quickly, send them to ReFashion. We\'ll clean them and pass them to ecological organizations or Designers, earning you GreenCoin for gift vouchers!</p>' +
          '<a href="community.html" class="btn btn-accent" style="width:100%;background-color:white;color:var(--primary);font-weight:700;border-radius:12px;display:block;text-align:center"><i class="fa-solid fa-heart"></i> Go to Donation Page</a>' +
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
        '<h3 style="font-size:1.25rem;font-weight:700;margin-bottom:0.5rem">Please login</h3>' +
        '<p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:1.5rem">You need to login with a Buyer account to list secondhand items or manage your listings.</p>' +
        '<a href="../auth/login.html?redirect=secondhand.html" class="btn btn-primary" style="border-radius:12px">Login Now</a>' +
      '</div>';
    return;
  }

  var items = getSecondhandItems();
  var myItems = items.filter(function(i) { return i.sellerEmail === user.email; });

  var myItemsHtml = '';
  if (myItems.length === 0) {
    myItemsHtml = '<p style="color:var(--text-muted);font-size:0.9rem;text-align:center;padding:2rem 0">You haven\'t posted any listings yet.</p>';
  } else {
    for (var i = 0; i < myItems.length; i++) {
      var item = myItems[i];
      var priceText = item.price === 0 ? 'Free' : item.price.toLocaleString('vi-VN') + ' đ';
      myItemsHtml +=
        '<div class="post-manager-item">' +
          '<div class="post-manager-info">' +
            '<img src="' + item.image + '" class="post-manager-img" />' +
            '<div class="post-manager-meta">' +
              '<h4>' + item.name + '</h4>' +
              '<p style="color:var(--accent);font-weight:700">' + priceText + '</p>' +
            '</div>' +
          '</div>' +
          '<button onclick="deleteSecondhandItem(\'' + item.id + '\')" class="btn btn-outline" style="border-color:#ef4444;color:#ef4444;padding:0.4rem 0.8rem;border-radius:8px;font-size:0.75rem"><i class="fa-solid fa-trash-can"></i> Delete</button>' +
        '</div>';
    }
  }

  container.innerHTML =
    '<div class="secondhand-post-section">' +
      '<div style="background:var(--card);border:1px solid var(--border);border-radius:24px;padding:2.5rem;box-shadow:0 8px 30px var(--shadow);">' +
      '<div class="donation-form" style="background:transparent;border:none;padding:0;box-shadow:none;">' +
        '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem">Post Used Item Listing</h3>' +
        '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem">Provide details about your used item so Designers seeking upcycle materials can find and purchase it.</p>' +
        
        '<form id="secondhand-post-form">' +
          '<div class="form-group"><label>Item Name *</label><input type="text" id="sh-post-name" placeholder="E.g.: Old jeans with slightly torn knees..." required /></div>' +
          
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">' +
            '<div class="form-group"><label>Category *</label><select id="sh-post-category"><option value="shirt">T-Shirts/Shirts</option><option value="pants">Jeans/Khakis</option><option value="jacket">Jackets</option><option value="dress">Dresses</option><option value="others">Others</option></select></div>' +
            '<div class="form-group"><label>Condition *</label><select id="sh-post-condition"><option value="new">Like New</option><option value="good">Good</option><option value="reusable">Gently Used (Still wearable)</option></select></div>' +
          '</div>' +
          
          '<div class="form-group"><label>Price (VND) - Enter 0 for Free *</label><input type="number" id="sh-post-price" min="0" placeholder="E.g.: 50000" required /></div>' +
          '<div class="form-group"><label>Pickup Location *</label><input type="text" id="sh-post-location" placeholder="E.g.: District 1, Ho Chi Minh City" required /></div>' +
          '<div class="form-group"><label>Contact Phone (Zalo) *</label><input type="tel" id="sh-post-phone" placeholder="E.g.: 0901234567" required /></div>' +
          
          '<div class="form-group">' +
            '<label>Item Image</label>' +
            '<input type="file" id="sh-post-file" accept="image/*" style="display:none" />' +
            '<div class="image-upload-preview" id="sh-post-image-placeholder" onclick="document.getElementById(\'sh-post-file\').click()">' +
              '<i class="fa-solid fa-cloud-arrow-up" style="font-size:1.8rem;color:var(--primary);margin-bottom:0.5rem"></i>' +
              '<span style="font-size:0.8rem;color:var(--text-muted)">Click to upload actual photo</span>' +
            '</div>' +
            '<div class="image-upload-preview" id="sh-post-image-preview-wrap" style="display:none" onclick="document.getElementById(\'sh-post-file\').click()">' +
              '<img src="" id="sh-post-image-preview-img" style="max-height: 150px; width: auto; object-fit: contain;" />' +
              '<span style="font-size:0.75rem;color:var(--primary);font-weight:700;margin-top:0.5rem">Click to change photo</span>' +
            '</div>' +
          '</div>' +
          
          '<div class="form-group"><label>Detailed Description *</label><textarea id="sh-post-description" rows="3" placeholder="Specify material, size, defects (if any) so designers can easily visualize..." required></textarea></div>' +
          
          '<button type="submit" class="btn btn-primary" style="width:100%;border-radius:10px;margin-top:1rem"><i class="fa-solid fa-bullhorn"></i> List Now</button>' +
        '</form>' +
      '</div>' +
      '</div>' +

      '<div class="post-manager-section">' +
        '<h3>Your Listings</h3>' +
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

      showToast('🎉 Secondhand item listed successfully!');
      secondhandState.activeTab = 'feed';
      renderSecondhandContainer();
    });
  }
}

function deleteSecondhandItem(id) {
  var items = getSecondhandItems();
  var updated = items.filter(function(i) { return i.id !== id; });
  saveSecondhandItems(updated);
  showToast('🗑️ Listing deleted.');
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
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/order-tracking.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  var params = new URLSearchParams(window.location.search);
  var orderId = params.get('order');
  if (!orderId) {
    document.getElementById('tracking-content').innerHTML = '<div style="text-align:center;padding:4rem"><h3>Order not found</h3><a href="/buyer/profile.html" class="btn btn-primary" style="border-radius:12px">Back to Profile</a></div>';
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
    container.innerHTML = '<div style="text-align:center;padding:4rem"><h3>Order not found</h3><a href="/buyer/profile.html" class="btn btn-primary" style="border-radius:12px">Back to Profile</a></div>';
    return;
  }

  // Show loading skeleton simulating API call
  container.innerHTML =
    '<div class="tracking-container" style="margin-top:2rem">' +
      '<div class="tracking-skeleton">' +
        '<div class="sk-title"></div>' +
        '<div class="sk-row"><div class="sk-box" style="width:60%"></div><div class="sk-box" style="width:20%"></div></div>' +
        '<div class="sk-row"><div class="sk-box" style="width:45%"></div><div class="sk-box" style="width:30%"></div></div>' +
        '<div class="sk-row sk-map"></div>' +
        '<div class="sk-row"><div class="sk-box" style="width:70%"></div><div class="sk-box" style="width:15%"></div></div>' +
        '<div class="sk-row" style="gap:0.5rem;flex-direction:column">' +
          '<div class="sk-box" style="width:90%;height:16px"></div>' +
          '<div class="sk-box" style="width:60%;height:16px"></div>' +
          '<div class="sk-box" style="width:75%;height:16px"></div>' +
        '</div>' +
        '<div style="text-align:center;margin-top:1rem;font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-spinner fa-spin"></i> Fetching tracking data...</div>' +
      '</div>' +
    '</div>';

  // Simulate API call delay
  setTimeout(function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/datasets/tracking.json', true);
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
  }, 1200);
}

function renderTrackingUI(container, order, trackingData) {
  var statusMap = {
    pending: { label: 'Pending Confirmation', icon: 'fa-clipboard-list', color: 'var(--sentiment-neu)' },
    confirmed: { label: 'Confirmed', icon: 'fa-check-circle', color: 'var(--primary)' },
    packed: { label: 'Packed', icon: 'fa-box', color: 'var(--primary)' },
    shipping: { label: 'Shipping', icon: 'fa-truck-fast', color: 'var(--accent)' },
    completed: { label: 'Delivered', icon: 'fa-circle-check', color: 'var(--sentiment-pos)' },
    cancelled: { label: 'Cancelled', icon: 'fa-circle-xmark', color: 'var(--danger)' }
  };
  var currentStatus = order.status;
  var isCancelled = currentStatus === 'cancelled';
  var defaultSteps = [
    { status: 'pending', label: 'Pending Confirmation', time: order.date + ' 00:00', completed: true, detail: '' },
    { status: 'confirmed', label: 'Confirmed', time: null, completed: false, detail: '' },
    { status: 'packed', label: 'Packed', time: null, completed: false, detail: '' },
    { status: 'shipping', label: 'Shipping', time: null, completed: false, detail: '' },
    { status: 'completed', label: 'Delivered', time: null, completed: false, detail: '' }
  ];
  var steps = trackingData ? trackingData.steps : defaultSteps;
  var route = trackingData ? trackingData.route : [];
  var courier = trackingData ? trackingData.courier : 'Awaiting processing';
  var estimatedDelivery = trackingData ? trackingData.estimatedDelivery : 'Updating';
  var currentStepIdx = trackingData ? trackingData.currentStep : 0;
  var driver = trackingData ? trackingData.driver : null;
  var currentLocation = trackingData ? trackingData.currentLocation : null;
  var progressPercent = trackingData ? trackingData.progressPercent : (currentStepIdx >= 0 ? Math.round((currentStepIdx) / 4 * 100) : 0);
  var cancelledReason = trackingData ? trackingData.cancelledReason : null;
  if (isCancelled) currentStepIdx = -1;

  // Products HTML
  var itemsHtml = '';
  for (var i = 0; i < order.items.length; i++) {
    var item = order.items[i];
    itemsHtml +=
      '<div class="tracking-item-row">' +
        '<img src="' + item.image + '" alt="' + item.name + '" onerror="this.onerror=null;this.src=\'../images/sh_denim_shirt.png\'" />' +
        '<div><p class="tracking-item-name">' + item.name + '</p><p class="tracking-item-meta">' + (item.variant || '') + ' x' + item.quantity + '</p></div>' +
        '<span class="tracking-item-price">' + item.priceStr + '</span>' +
      '</div>';
  }

  // Timeline with micro-steps support
  var stepsHtml = '';
  for (var i = 0; i < steps.length; i++) {
    var s = steps[i];
    var isActive = i <= currentStepIdx;
    var isCurrent = i === currentStepIdx;
    var stepIcon = statusMap[s.status] ? statusMap[s.status].icon : 'fa-circle';
    var microStepsHtml = '';
    if (s.microSteps && (isActive || isCurrent)) {
      microStepsHtml += '<div class="tracking-micro-steps">';
      for (var m = 0; m < s.microSteps.length; m++) {
        var ms = s.microSteps[m];
        var msActive = ms.completed;
        var msCurrent = m === s.microSteps.length - 1 && isCurrent && !ms.completed;
        microStepsHtml +=
          '<div class="tracking-micro-step' + (msActive ? ' completed' : '') + (msCurrent ? ' current' : '') + '">' +
            '<div class="micro-step-dot"><i class="fa-solid ' + (msActive ? 'fa-check' : (msCurrent ? 'fa-truck' : 'fa-circle')) + '"></i></div>' +
            '<div class="micro-step-body">' +
              '<p class="micro-step-label">' + ms.label + '</p>' +
              '<span class="micro-step-time">' + (ms.time || '\u2014') + '</span>' +
              (ms.location ? '<span class="micro-step-location"><i class="fa-solid fa-location-dot"></i> ' + ms.location + '</span>' : '') +
            '</div>' +
          '</div>';
      }
      microStepsHtml += '</div>';
    }
    stepsHtml +=
      '<div class="tracking-step' + (isActive ? ' active' : '') + (isCurrent ? ' current' : '') + '">' +
        '<div class="tracking-step-dot"><i class="fa-solid ' + stepIcon + '"></i></div>' +
        '<div class="tracking-step-body">' +
          '<p class="tracking-step-label">' + s.label + '</p>' +
          '<p class="tracking-step-time">' + (isActive && s.time ? s.time : '\u2014') + '</p>' +
          (isActive && s.detail ? '<p class="tracking-step-detail">' + s.detail + '</p>' : '') +
          microStepsHtml +
        '</div>' +
      '</div>';
  }
  if (isCancelled) {
    stepsHtml +=
      '<div class="tracking-step active cancelled">' +
        '<div class="tracking-step-dot"><i class="fa-solid fa-circle-xmark"></i></div>' +
        '<div class="tracking-step-body">' +
          '<p class="tracking-step-label">Cancelled</p>' +
          '<p class="tracking-step-time">' + order.date + '</p>' +
          (cancelledReason ? '<p class="tracking-step-detail" style="color:var(--danger)">Reason: ' + cancelledReason + '</p>' : '') +
        '</div>' +
      '</div>';
  }

  // Progress bar (for active orders)
  var progressHtml = '';
  if (!isCancelled && currentStepIdx >= 0 && currentStepIdx < 4) {
    progressHtml =
      '<div class="tracking-card">' +
        '<h4 style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem"><span><i class="fa-solid fa-gauge-high" style="margin-right:0.5rem;color:var(--accent)"></i> Delivery Progress</span><span class="tracking-live-badge"><span class="live-dot"></span> Live</span></h4>' +
        '<div class="tracking-progress-bar"><div class="tracking-progress-fill" style="width:' + progressPercent + '%"></div></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:0.4rem">' +
          '<span>Warehouse</span>' +
          '<span>' + progressPercent + '% complete</span>' +
          '<span>Destination</span>' +
        '</div>' +
      '</div>';
  }

  // Courier driver card (for shipping orders)
  var driverHtml = '';
  if (driver && currentStepIdx >= 2) {
    driverHtml =
      '<div class="tracking-card tracking-driver-card">' +
        '<h4><i class="fa-solid fa-user" style="margin-right:0.5rem;color:var(--accent)"></i> Your Delivery Driver</h4>' +
        '<div class="driver-info">' +
          '<div class="driver-avatar"><i class="fa-solid fa-user"></i></div>' +
          '<div class="driver-details">' +
            '<p class="driver-name">' + driver.name + '</p>' +
            '<p class="driver-meta"><i class="fa-solid fa-phone"></i> ' + driver.phone + '</p>' +
            '<p class="driver-meta"><i class="fa-solid fa-truck"></i> ' + driver.plate + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  // Current location card
  var locationHtml = '';
  if (currentLocation && currentStepIdx >= 2 && currentStepIdx < 4) {
    locationHtml =
      '<div class="tracking-card">' +
        '<h4><i class="fa-solid fa-location-dot" style="margin-right:0.5rem;color:var(--accent)"></i> Current Location</h4>' +
        '<p class="current-location-label">' + currentLocation.label + '</p>' +
        '<p class="current-location-time"><i class="fa-solid fa-clock"></i> Last updated: ' + currentLocation.lastUpdated + '</p>' +
      '</div>';
  }

  var mapId = 'tracking-map-' + Date.now();
  var showMap = route.length > 1 && currentStepIdx >= 2;
  container.innerHTML =
    '<div class="tracking-container">' +
      '<a href="/buyer/profile.html" class="tracking-back"><i class="fa-solid fa-arrow-left"></i> Back to Profile</a>' +
      '<div class="tracking-header">' +
        '<div>' +
          '<span class="tracking-badge">' + (isCancelled ? 'Cancelled' : (statusMap[currentStatus] ? statusMap[currentStatus].label : currentStatus)) + '</span>' +
          '<h1>Order Tracking</h1>' +
          '<p class="tracking-id">Order ID: <strong>' + order.id + '</strong> &middot; Placed on ' + order.date + '</p>' +
        '</div>' +
        '<div class="tracking-total">' + order.totalStr + '</div>' +
      '</div>' +
      '<div class="tracking-body">' +
        '<div class="tracking-main">' +
          '<div class="tracking-card">' +
            '<h3><i class="fa-solid fa-clock-rotate-left" style="margin-right:0.5rem"></i> Order Timeline</h3>' +
            '<div class="tracking-steps">' + stepsHtml + '</div>' +
          '</div>' +
          (showMap ? '<div class="tracking-card"><h3 style="display:flex;align-items:center;justify-content:space-between"><span><i class="fa-solid fa-map" style="margin-right:0.5rem"></i> Live Map</span><span style="font-size:0.7rem;font-weight:400;color:var(--text-muted);display:flex;align-items:center;gap:0.3rem"><span class="live-dot"></span> Updating every 5s</span></h3><div id="' + mapId + '" class="tracking-map"></div></div>' : '') +
          '<div class="tracking-card">' +
            '<h3><i class="fa-solid fa-bag-shopping" style="margin-right:0.5rem"></i> Products in Order</h3>' +
            '<div class="tracking-items">' + itemsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tracking-sidebar">' +
          progressHtml +
          '<div class="tracking-card">' +
            '<h4><i class="fa-solid fa-truck-fast" style="margin-right:0.5rem"></i> Shipping Information</h4>' +
            '<div class="tracking-info-row"><span class="tracking-info-label">Carrier</span><span>' + courier + '</span></div>' +
            '<div class="tracking-info-row"><span class="tracking-info-label">Est. Delivery</span><span>' + estimatedDelivery + '</span></div>' +
            '<div class="tracking-info-row"><span class="tracking-info-label">Delivery Address</span><span style="font-size:0.85rem">' + (order.address || 'Updating') + '</span></div>' +
            (order.note ? '<div class="tracking-info-row"><span class="tracking-info-label">Note</span><span>' + order.note + '</span></div>' : '') +
          '</div>' +
          driverHtml +
          locationHtml +
          '<div class="tracking-card">' +
            '<h4><i class="fa-solid fa-leaf" style="margin-right:0.5rem"></i> Green Impact</h4>' +
            '<p class="tracking-greencoin"><i class="fa-solid fa-leaf" style="color:var(--accent)"></i> +' + order.greenCoinEarned + ' GreenCoin</p>' +
            '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">These coins have been added to your GreenCoin wallet.</p>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  if (showMap) {
    setTimeout(function() { initTrackingMap(mapId, route, steps, progressPercent, currentStepIdx); }, 200);
  }
}

function initTrackingMap(mapId, route, steps, progressPercent, currentStepIdx) {
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

  // Route polyline
  var polyline = L.polyline(latlngs, { color: '#2a9d8f', weight: 4, opacity: 0.7 }).addTo(map);

  // Completed portion of the route (for shipping progress visualization)
  if (currentStepIdx === 3 && progressPercent > 0 && progressPercent < 100) {
    var completedCount = Math.max(1, Math.floor(latlngs.length * progressPercent / 100));
    var completedLatLngs = latlngs.slice(0, completedCount);
    var lastP = latlngs[completedCount - 1] || latlngs[0];
    completedLatLngs.push(lastP);
    L.polyline(completedLatLngs, { color: '#e76f51', weight: 5, opacity: 0.9, dashArray: '8, 6' }).addTo(map);
  }

  // Markers for each route point
  for (var i = 0; i < route.length; i++) {
    var isStart = i === 0;
    var isEnd = i === route.length - 1;
    var iconColor = isStart ? '#e76f51' : isEnd ? '#2a9d8f' : '#f4a261';
    var iconSize = isStart || isEnd ? 34 : 28;
    var iconFa = isStart ? 'fa-store' : isEnd ? 'fa-location-dot' : 'fa-warehouse';
    var markerHtml = '<div style="background:' + iconColor + ';width:' + iconSize + 'px;height:' + iconSize + 'px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:' + (iconSize * 0.44) + 'px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><i class="fa-solid ' + iconFa + '"></i></div>';
    var marker = L.marker(latlngs[i], {
      icon: L.divIcon({ html: markerHtml, className: '', iconSize: [iconSize, iconSize], iconAnchor: [iconSize / 2, iconSize / 2] })
    }).addTo(map);
    marker.bindPopup('<strong>' + route[i].label + '</strong><br>' + route[i].address);
  }

  // Pulsing destination marker ring
  var destEl = document.createElement('div');
  destEl.className = 'tracking-pulse-ring';
  var destLatLng = latlngs[latlngs.length - 1];
  L.marker(destLatLng, {
    icon: L.divIcon({ html: '<div class="pulse-ring"></div>', className: '', iconSize: [50, 50], iconAnchor: [25, 25] }),
    interactive: false
  }).addTo(map);

  // Animated vehicle marker (only during shipping step)
  var vehicleMarker = null;
  if (currentStepIdx === 3 && progressPercent > 0 && progressPercent < 100) {
    var vehicleHtml = '<div class="tracking-vehicle"><i class="fa-solid fa-truck-fast"></i></div>';
    var initialPos = getPositionAlongRoute(latlngs, progressPercent);
    vehicleMarker = L.marker(initialPos, {
      icon: L.divIcon({ html: vehicleHtml, className: 'tracking-vehicle-divicon', iconSize: [36, 36], iconAnchor: [18, 18] }),
      zIndexOffset: 1000
    }).addTo(map);

    // Start animation - move vehicle along route
    var currentProgress = progressPercent;
    var animInterval = setInterval(function() {
      currentProgress += 0.5;
      if (currentProgress > 98) {
        currentProgress = 98;
        clearInterval(animInterval);
        return;
      }
      var newPos = getPositionAlongRoute(latlngs, currentProgress);
      vehicleMarker.setLatLng(newPos);

      // Rotate vehicle towards next point
      var nextIdx = Math.min(Math.floor(currentProgress / 100 * (latlngs.length - 1)) + 1, latlngs.length - 1);
      var currIdx = Math.max(0, nextIdx - 1);
      var angle = Math.atan2(
        latlngs[nextIdx][0] - latlngs[currIdx][0],
        latlngs[nextIdx][1] - latlngs[currIdx][1]
      ) * 180 / Math.PI;
      var vEl = vehicleMarker.getElement();
      if (vEl) {
        var iconEl = vEl.querySelector('.tracking-vehicle');
        if (iconEl) iconEl.style.transform = 'rotate(' + angle + 'deg)';
      }
    }, 2000);
  }

  // Fit bounds
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  setTimeout(function() { map.invalidateSize(); }, 200);

  // Helper to interpolate position along route
  function getPositionAlongRoute(latlngs, pct) {
    if (pct <= 0) return latlngs[0];
    if (pct >= 100) return latlngs[latlngs.length - 1];
    var totalDist = 0;
    var segDists = [];
    for (var i = 0; i < latlngs.length - 1; i++) {
      var d = map.distance(L.latLng(latlngs[i]), L.latLng(latlngs[i + 1]));
      segDists.push(d);
      totalDist += d;
    }
    var targetDist = totalDist * pct / 100;
    var accumulated = 0;
    for (var i = 0; i < segDists.length; i++) {
      if (accumulated + segDists[i] >= targetDist) {
        var ratio = (targetDist - accumulated) / segDists[i];
        return [
          latlngs[i][0] + (latlngs[i + 1][0] - latlngs[i][0]) * ratio,
          latlngs[i][1] + (latlngs[i + 1][1] - latlngs[i][1]) * ratio
        ];
      }
      accumulated += segDists[i];
    }
    return latlngs[latlngs.length - 1];
  }
}

/* ==================== INIT DISPATCH ==================== */
document.addEventListener('DOMContentLoaded', function() {
  var session = RefashionAuth._getUser();
  if (session && (session.role === 'Seller' || session.role === 'Admin')) {
    window.location.href = session.role === 'Seller' ? '/seller/seller_dashboard.html' : '/admin/index.html';
    return;
  }

  var path = window.location.pathname.toLowerCase();
  var isBuyerSection = path === '/' || path.indexOf('/buyer') === 0;
  if (!isBuyerSection) return;

  var page = path.split('/').filter(function(s) { return s !== ''; }).pop() || 'index.html';
  var pageName = page.replace('.html', '');
  switch (pageName) {
    case 'index':
    case 'buyer':
      initBuyerPage();
      break;
    case 'shop':
      initShopPage();
      break;
    case 'shop-detail':
      initDetailPage();
      break;
    case 'store-detail':
      initStorePage();
      break;
    case 'cart':
      initCartPage();
      break;
    case 'checkout':
      initCheckoutPage();
      break;
    case 'momo-return':
      initMoMoReturnPage();
      break;
    case 'orders':
      initOrdersPage();
      break;
    case 'profile':
      initProfilePage();
      break;
    case 'community':
      initCommunityPage();
      break;
    case 'secondhand':
      initSecondhandPage();
      break;
    case 'order-tracking':
      initTrackingPage();
      break;
    case 'about':
      initAboutPage();
      break;
    default:
      initBuyerPage();
      break;
  }
  initBuyerChatWidget();
});

/* ==================== Explainable AI (XAI) & Digital Product Passport (DPP) Core Engine ==================== */
function getDppData(productId, title, category) {
  if (!productId) {
    productId = "UNKNOWN";
  }
  
  // Resolve title and category from PRODUCTS_DB if not passed
  if ((!title || !category) && typeof PRODUCTS_DB !== 'undefined' && PRODUCTS_DB[productId]) {
    var p = PRODUCTS_DB[productId];
    title = title || p.name || "Sản phẩm ReFashion";
    category = category || p.category || "Chung";
  } else {
    title = title || "Sản phẩm ReFashion";
    category = category || "Chung";
  }

  // Hash seed calculation
  var hash = 0;
  var idStr = productId.toString();
  for (var i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  var seed = Math.abs(hash);

  var dppId = 'RF-2026-' + (category.substring(0, 3).toUpperCase()) + '-' + (seed % 1000);
  
  // Deterministic block hash
  var blockHashChars = '0123456789abcdef';
  var blockHashStr = '0x';
  for (var k = 0; k < 40; k++) {
    blockHashStr += blockHashChars[Math.floor(Math.abs(Math.sin(seed + k)) * 16 + 16) % 16];
  }
  var blockHash = blockHashStr;

  // Deterministic random helper based on the product seed
  var pseudoRandom = function(offset, min, max, isInt) {
    var val = Math.abs(Math.sin(seed + offset)) * 1000;
    var rand = val - Math.floor(val);
    var res = min + rand * (max - min);
    return isInt ? Math.round(res) : res;
  };

  // Define input parameters based on category
  var l_ij, l_jm, l_im, xi, e_m, g_m, t_c, e_r, E_new_production;
  var collected_mass, reused_mass, scrap_mass, output_mass, estimated_waste, actual_waste;
  
  e_r = 2.68; // CO2 per liter fuel (kg CO2/L) - standard chemical constant

  var materials = [];
  var waterSaved = 0;
  var tier4Name = "";
  var tier4Loc = "";
  var tier4Cert = "";
  var tier4Desc = "";
  var materialOrigin = "";

  var catLower = (category || "").toLowerCase();
  if (catLower.indexOf("áo khoác") !== -1 || catLower.indexOf("khoác") !== -1 || catLower.indexOf("jacket") !== -1) {
    var pct1 = pseudoRandom(1, 75, 85, true);
    materials = [
      { name: "Repurposed Denim scrap", pct: pct1 },
      { name: "Recycled Polyester lining", pct: 100 - pct1 }
    ];
    waterSaved = pseudoRandom(2, 3100, 3800, true);
    l_ij = pseudoRandom(3, 35, 55, true);
    l_jm = pseudoRandom(4, 100, 140, true);
    l_im = pseudoRandom(5, 60, 100, true);
    xi = pseudoRandom(6, 0.84, 0.92);
    e_m = pseudoRandom(7, 1.0, 1.4);
    g_m = pseudoRandom(8, 0.13, 0.17);
    t_c = 200;
    E_new_production = pseudoRandom(9, 19.0, 25.0);
    collected_mass = pseudoRandom(10, 90, 110, true);
    reused_mass = Math.round(collected_mass * pseudoRandom(11, 0.81, 0.87));
    scrap_mass = Math.round(collected_mass * pseudoRandom(12, 0.09, 0.13));
    output_mass = reused_mass + Math.round(scrap_mass * 0.4);
    estimated_waste = Math.round(collected_mass * pseudoRandom(13, 0.45, 0.55));
    actual_waste = scrap_mass;
    tier4Name = "Texas Post-Consumer Salvage Depot";
    tier4Loc = "Lubbock, Texas, USA";
    tier4Cert = "GOTS, USDA Organic Verified";
    tier4Desc = "High-grade discarded denim clothing collected from post-consumer collection hubs in the USA.";
    materialOrigin = "Được thu gom và xử lý từ 2 chiếc quần Jeans cũ rách gối cùng với 1 chiếc áo khoác thô cũ bị hỏng khóa kéo tại khu vực Đà Nẵng.";
  } else if (catLower.indexOf("áo thun") !== -1 || catLower.indexOf("thun") !== -1 || catLower.indexOf("tshirt") !== -1) {
    var pct1 = pseudoRandom(1, 85, 95, true);
    materials = [
      { name: "Organic Cotton fibers", pct: pct1 },
      { name: "Recycled Spandex", pct: 100 - pct1 }
    ];
    waterSaved = pseudoRandom(2, 1900, 2400, true);
    l_ij = pseudoRandom(3, 20, 40, true);
    l_jm = pseudoRandom(4, 80, 120, true);
    l_im = pseudoRandom(5, 45, 75, true);
    xi = pseudoRandom(6, 0.88, 0.95);
    e_m = pseudoRandom(7, 0.3, 0.6);
    g_m = pseudoRandom(8, 0.10, 0.14);
    t_c = 300;
    E_new_production = pseudoRandom(9, 7.0, 10.0);
    collected_mass = pseudoRandom(10, 90, 110, true);
    reused_mass = Math.round(collected_mass * pseudoRandom(11, 0.88, 0.94));
    scrap_mass = Math.round(collected_mass * pseudoRandom(12, 0.04, 0.08));
    output_mass = reused_mass + Math.round(scrap_mass * 0.5);
    estimated_waste = Math.round(collected_mass * pseudoRandom(13, 0.25, 0.35));
    actual_waste = scrap_mass;
    tier4Name = "Aegean Rain-Fed Cotton Farms";
    tier4Loc = "Izmir, Turkey";
    tier4Cert = "GOTS Certified, Fair Trade";
    tier4Desc = "100% organic cotton grown using purely natural rain irrigation without synthetic agricultural chemical sprays.";
    materialOrigin = "Tái sinh từ 3 chiếc áo thun 100% cotton cũ gặp lỗi ố màu hoặc sờn rách vai thu gom từ các hộ gia đình.";
  } else if (catLower.indexOf("quần") !== -1 || catLower.indexOf("pants") !== -1) {
    var pct1 = pseudoRandom(1, 80, 90, true);
    materials = [
      { name: "Recycled Cotton Denim yarn", pct: pct1 },
      { name: "Eco-Elastane stretch", pct: 100 - pct1 }
    ];
    waterSaved = pseudoRandom(2, 2600, 3200, true);
    l_ij = pseudoRandom(3, 30, 50, true);
    l_jm = pseudoRandom(4, 90, 130, true);
    l_im = pseudoRandom(5, 55, 85, true);
    xi = pseudoRandom(6, 0.85, 0.93);
    e_m = pseudoRandom(7, 0.6, 1.0);
    g_m = pseudoRandom(8, 0.12, 0.16);
    t_c = 250;
    E_new_production = pseudoRandom(9, 13.0, 17.0);
    collected_mass = pseudoRandom(10, 90, 110, true);
    reused_mass = Math.round(collected_mass * pseudoRandom(11, 0.84, 0.90));
    scrap_mass = Math.round(collected_mass * pseudoRandom(12, 0.07, 0.11));
    output_mass = reused_mass + Math.round(scrap_mass * 0.4);
    estimated_waste = Math.round(collected_mass * pseudoRandom(13, 0.35, 0.45));
    actual_waste = scrap_mass;
    tier4Name = "Binh Duong Deadstock Textile Salvage";
    tier4Loc = "Binh Duong, Vietnam";
    tier4Cert = "GRS (Global Recycled Standard)";
    tier4Desc = "Unused leftovers and cutting waste gathered from standard clothing manufacturing factories in Southern Vietnam.";
    materialOrigin = "Chế tác kết hợp từ vải thừa tồn kho của các xưởng may gia công lớn và 1 chiếc quần kaki cũ bị hỏng cạp.";
  } else if (catLower.indexOf("giày") !== -1 || catLower.indexOf("shoes") !== -1) {
    var pct1 = pseudoRandom(1, 65, 75, true);
    materials = [
      { name: "Piñatex Pineapple fiber", pct: pct1 },
      { name: "Recycled Rubber sole", pct: 100 - pct1 }
    ];
    waterSaved = pseudoRandom(2, 1500, 2000, true);
    l_ij = pseudoRandom(3, 45, 65, true);
    l_jm = pseudoRandom(4, 130, 170, true);
    l_im = pseudoRandom(5, 75, 105, true);
    xi = pseudoRandom(6, 0.80, 0.89);
    e_m = pseudoRandom(7, 1.5, 2.1);
    g_m = pseudoRandom(8, 0.14, 0.18);
    t_c = 150;
    E_new_production = pseudoRandom(9, 16.0, 20.0);
    collected_mass = pseudoRandom(10, 90, 110, true);
    reused_mass = Math.round(collected_mass * pseudoRandom(11, 0.78, 0.84));
    scrap_mass = Math.round(collected_mass * pseudoRandom(12, 0.11, 0.16));
    output_mass = reused_mass + Math.round(scrap_mass * 0.3);
    estimated_waste = Math.round(collected_mass * pseudoRandom(13, 0.55, 0.65));
    actual_waste = scrap_mass;
    tier4Name = "Ananas Anam Agrarian Hub";
    tier4Loc = "Manila, Philippines";
    tier4Cert = "Certified B-Corp, Cradle to Cradle";
    tier4Desc = "Extracted from useless pineapple leaves after harvest, creating supplementary circular income for local farming families.";
    materialOrigin = "Đế giày làm từ cao su lốp xe phế thải băm nhỏ đúc nhiệt; thân giày dệt từ sợi dứa tự nhiên Piñatex kết hợp da vụn bọc sofa cũ hỏng.";
  } else {
    // Balo & Túi / Default
    var pct1 = pseudoRandom(1, 70, 80, true);
    materials = [
      { name: "Upcycled Cotton Canvas", pct: pct1 },
      { name: "Ocean-Bound PET Plastic", pct: 100 - pct1 }
    ];
    waterSaved = pseudoRandom(2, 2300, 2900, true);
    l_ij = pseudoRandom(3, 40, 60, true);
    l_jm = pseudoRandom(4, 110, 150, true);
    l_im = pseudoRandom(5, 70, 100, true);
    xi = pseudoRandom(6, 0.83, 0.91);
    e_m = pseudoRandom(7, 0.8, 1.2);
    g_m = pseudoRandom(8, 0.13, 0.17);
    t_c = 180;
    E_new_production = pseudoRandom(9, 12.0, 16.5);
    collected_mass = pseudoRandom(10, 90, 110, true);
    reused_mass = Math.round(collected_mass * pseudoRandom(11, 0.80, 0.86));
    scrap_mass = Math.round(collected_mass * pseudoRandom(12, 0.10, 0.14));
    output_mass = reused_mass + Math.round(scrap_mass * 0.4);
    estimated_waste = Math.round(collected_mass * pseudoRandom(13, 0.40, 0.50));
    actual_waste = scrap_mass;
    tier4Name = "Phu Quoc Marine Plastic Cleanup Project";
    tier4Loc = "Phu Quoc, Vietnam";
    tier4Cert = "GRS, Higg Index Verified";
    tier4Desc = "Discarded nylon fishing nets and ocean-bound plastic bottles recovered directly from sea waters and beaches.";
    materialOrigin = "Tái sinh từ 1 tấm bạt xe tải cũ chịu lực cực cao bị rách nhẹ mép và vải lót từ các áo phao gió hỏng khóa kéo.";
  }

  // Calculate E_refashion
  var d = 1;
  var E_refashion = e_r * g_m * ( (l_ij / t_c) + (l_im / t_c) + (d * xi * l_jm) / t_c ) + d * e_m;
  var netCarbonSaved = E_new_production - E_refashion;
  var co2ReductionPct = (netCarbonSaved / E_new_production) * 100;

  // Calculate Material Circularity Indicators:
  var materialRecoveryRate = ((reused_mass / collected_mass) * 100).toFixed(1);
  var scrapToOutput = ((scrap_mass / output_mass) * 100).toFixed(1);
  var wasteReductionRatio = (100 - (actual_waste / estimated_waste) * 100).toFixed(1);
  var landfillSaved = (estimated_waste - actual_waste).toFixed(2);

  return {
    seed: seed,
    dppId: dppId,
    blockHash: blockHash,
    title: title,
    category: category,
    materials: materials,
    waterSaved: waterSaved,
    co2Emitted: E_refashion,
    co2Saved: netCarbonSaved,
    co2ReductionPct: co2ReductionPct,
    materialRecoveryRate: materialRecoveryRate,
    scrapToOutput: scrapToOutput,
    wasteReductionRatio: wasteReductionRatio,
    landfillSaved: landfillSaved,
    transportDistance: l_ij + l_jm + l_im,
    materialOrigin: materialOrigin,
    tier4Name: tier4Name,
    tier4Loc: tier4Loc,
    tier4Cert: tier4Cert,
    tier4Desc: tier4Desc,
    tier3Name: "Chung Shing Eco-Spinning Mill",
    tier3Loc: "Ho Chi Minh City, Vietnam",
    tier3Cert: "Oeko-Tex Standard 100, bluesign",
    tier3Desc: "Processes materials using high-efficiency closed-loop systems, filtering and recycling 98% of processing water.",
    tier2Name: "ReFashion Upcycling Creative Studio",
    tier2Loc: "Da Nang, Vietnam",
    tier2Cert: "ISO 14001, GRS Certified Workshop",
    tier2Desc: "Sorts, washes, cleans, and manually reconstructs post-consumer textile wastes using handcraft techniques.",
    tier1Name: "ReFashion Da Nang Assembly Workshop",
    tier1Loc: "Da Nang, Vietnam",
    tier1Cert: "Fair Labor Association, SA8000",
    tier1Desc: "Final sewing, branding, packaging, and sorting for direct-to-consumer distribution and logistics tracking."
  };
}

function getLocalizedDpp(dpp, lang) {
  var isEn = lang === 'en';
  
  var materialTranslations = {
    "Repurposed Denim scrap": { vi: "Mảnh denim tái định hình", en: "Repurposed Denim scrap" },
    "Recycled Polyester lining": { vi: "Lót polyester tái chế", en: "Recycled Polyester lining" },
    "Organic Cotton fibers": { vi: "Sợi bông hữu cơ", en: "Organic Cotton fibers" },
    "Recycled Spandex": { vi: "Chất co giãn tái chế", en: "Recycled Spandex" },
    "Recycled Cotton Denim yarn": { vi: "Sợi cotton denim tái chế", en: "Recycled Cotton Denim yarn" },
    "Eco-Elastane stretch": { vi: "Eco-Elastane co giãn", en: "Eco-Elastane stretch" },
    "Piñatex Pineapple fiber": { vi: "Sợi dứa tự nhiên Piñatex", en: "Piñatex Pineapple fiber" },
    "Recycled Rubber sole": { vi: "Đế cao su tái chế", en: "Recycled Rubber sole" },
    "Upcycled Cotton Canvas": { vi: "Vải bạt cotton tái tạo", en: "Upcycled Cotton Canvas" },
    "Ocean-Bound PET Plastic": { vi: "Nhựa PET cứu hộ đại dương", en: "Ocean-Bound PET Plastic" }
  };

  var localizedMaterials = dpp.materials.map(function(m) {
    return {
      pct: m.pct,
      name: materialTranslations[m.name] ? (isEn ? materialTranslations[m.name].en : materialTranslations[m.name].vi) : m.name
    };
  });

  var originTranslations = {
    jacket: {
      vi: "Được thu gom và xử lý từ 2 chiếc quần Jeans cũ rách gối cùng với 1 chiếc áo khoác thô cũ bị hỏng khóa kéo tại khu vực Đà Nẵng.",
      en: "Collected and processed from 2 old knee-torn Jeans and 1 old canvas jacket with a broken zipper in the Da Nang area."
    },
    tshirt: {
      vi: "Tái sinh từ 3 chiếc áo thun 100% cotton cũ gặp lỗi ố màu hoặc sờn rách vai thu gom từ các hộ gia đình.",
      en: "Reborn from 3 old 100% cotton t-shirts with stains or worn shoulders collected from households."
    },
    pants: {
      vi: "Chế tác kết hợp từ vải thừa tồn kho của các xưởng may gia công lớn và 1 chiếc quần kaki cũ bị hỏng cạp.",
      en: "Crafted from surplus inventory of large garment factories and 1 old khaki pants with a damaged waistband."
    },
    shoes: {
      vi: "Đế giày làm từ cao su lốp xe phế thải băm nhỏ đúc nhiệt; thân giày dệt từ sợi dứa tự nhiên Piñatex kết hợp da vụn bọc sofa cũ hỏng.",
      en: "Shoe soles made from shredded waste tires heat-molded; shoe body woven from Piñatex natural pineapple fiber combined with scrap leather from old sofas."
    },
    default: {
      vi: "Tái sinh từ 1 tấm bạt xe tải cũ chịu lực cực cao bị rách nhẹ mép và vải lót từ các áo phao gió hỏng khóa kéo.",
      en: "Reborn from 1 old heavy-duty truck tarp with a slightly torn edge and lining fabric from damaged windbreaker life jackets."
    }
  };

  var originKey = "default";
  var catLower = (dpp.category || "").toLowerCase();
  if (catLower.indexOf("áo khoác") !== -1 || catLower.indexOf("khoác") !== -1 || catLower.indexOf("jacket") !== -1) originKey = "jacket";
  else if (catLower.indexOf("áo thun") !== -1 || catLower.indexOf("thun") !== -1 || catLower.indexOf("tshirt") !== -1) originKey = "tshirt";
  else if (catLower.indexOf("quần") !== -1 || catLower.indexOf("pants") !== -1) originKey = "pants";
  else if (catLower.indexOf("giày") !== -1 || catLower.indexOf("shoes") !== -1) originKey = "shoes";

  var localizedOrigin = isEn ? originTranslations[originKey].en : originTranslations[originKey].vi;

  var certifications = {
    jacket: {
      tier3: "bluesign, Global Recycled Standard",
      tier2: "ISO 14001, GRS Certified Denim Workshop",
      tier1: "Fair Labor Association, SA8000"
    },
    tshirt: {
      tier3: "GOTS Certified, OEKO-TEX Standard 100",
      tier2: "GRS Standard, Clean Clothes Campaign",
      tier1: "WRAP Certified, SA8000"
    },
    pants: {
      tier3: "Higg Index Verified, Oeko-Tex",
      tier2: "GRS Certified, ISO 9001",
      tier1: "Bag/Pants SA8000, Fair Wear Foundation"
    },
    shoes: {
      tier3: "Cradle to Cradle, FSC Certified Rubber",
      tier2: "B-Corp Standard, ISO 14001",
      tier1: "SA8000, Fair Labor Certified"
    },
    default: {
      tier3: "GRS Standard, Ocean Bound Plastic Certified",
      tier2: "ISO 14001, GRS Certified Canvas Workshop",
      tier1: "SA8000, Fair Labor Association"
    }
  };

  var tier3Translations = {
    jacket: {
      name: { vi: "Nhà máy dệt kéo sợi Denim Đồng Nai", en: "Dong Nai Denim-Spinning Factory" },
      loc: { vi: "Đồng Nai, Việt Nam", en: "Dong Nai, Vietnam" },
      desc: { vi: "Tái chế và kéo sợi từ các mảnh vụn denim chất lượng cao thu hồi.", en: "Recycles and spins threads from recovered high-quality denim scraps." }
    },
    tshirt: {
      name: { vi: "Nhà máy kéo sợi bông hữu cơ Phong Phú", en: "Phong Phu Organic Cotton Spinning Mill" },
      loc: { vi: "TP. Hồ Chí Minh, Việt Nam", en: "Ho Chi Minh City, Vietnam" },
      desc: { vi: "Kéo sợi bông hữu cơ tái sinh bằng máy dệt tự động tiêu tụ điện năng thấp.", en: "Spins regenerated organic cotton yarns using low-energy automated machinery." }
    },
    pants: {
      name: { vi: "Xưởng kéo sợi cotton tái chế Hà Nội", en: "Hanoi Recycled Cotton Spinning Mill" },
      loc: { vi: "Hà Nội, Việt Nam", en: "Hanoi, Vietnam" },
      desc: { vi: "Xử lý phế phẩm may mặc công nghiệp thành các cuộn sợi cotton dệt quần bền chắc.", en: "Processes industrial garments waste into durable cotton spools for pants." }
    },
    shoes: {
      name: { vi: "Nhà máy tinh luyện cao su phế liệu Bình Dương", en: "Binh Duong Tire Rubber Refining Plant" },
      loc: { vi: "Bình Dương, Việt Nam", en: "Binh Duong, Vietnam" },
      desc: { vi: "Tái chế cao su từ lốp xe cũ hỏng kết hợp tinh chế sợi dứa tự nhiên để chế tác đế và lót.", en: "Recycles scrap tire rubber and refines natural pineapple fibers for shoe soles and linings." }
    },
    default: {
      name: { vi: "Nhà máy tái sinh nhựa biển Long An", en: "Long An Ocean Plastic Pellet Factory" },
      loc: { vi: "Long An, Việt Nam", en: "Long An, Vietnam" },
      desc: { vi: "Tái chế chai nhựa thu hồi từ đại dương thành hạt nhựa và sợi PET chịu lực cao làm vải bạt.", en: "Recycles ocean plastic bottles into high-tenacity PET fibers for heavy-duty bag canvas." }
    }
  };

  var tier2Translations = {
    jacket: {
      name: { vi: "Xưởng tái chế áo khoác Sông Hồng", en: "Song Hong Jacket Upcycling Atelier" },
      loc: { vi: "Nam Định, Việt Nam", en: "Nam Dinh, Vietnam" },
      desc: { vi: "May tái cấu trúc, thiết kế các mảnh denim ghép nối và lót gió của áo cũ.", en: "Deconstructs, patches denim panels, and stitches inner windbreaker linings." }
    },
    tshirt: {
      name: { vi: "Xưởng may sinh thái Huế Eco-Knitwear", en: "Hue Eco-Knitwear Creative Studio" },
      loc: { vi: "Thừa Thiên Huế, Việt Nam", en: "Thua Thien Hue, Vietnam" },
      desc: { vi: "Xử lý làm sạch, phân loại sợi và may tái tạo các phông cotton mềm mại.", en: "Cleanses, sorts fabric scraps, and reconstructs soft cotton t-shirts." }
    },
    pants: {
      name: { vi: "Xưởng thiết kế quần tuần hoàn Đà Nẵng", en: "Da Nang Circular Trousers Atelier" },
      loc: { vi: "Đà Nẵng, Việt Nam", en: "Da Nang, Vietnam" },
      desc: { vi: "Cắt ghép, tạo mẫu và may quần kaki/denim thiết kế thời trang từ phế liệu sạch.", en: "Patterns, cuts, and assembles fashionable kaki/denim pants from clean scraps." }
    },
    shoes: {
      name: { vi: "Xưởng đóng giày tuần hoàn Đồng Nai", en: "Dong Nai Footwear Craft Studio" },
      loc: { vi: "Đồng Nai, Việt Nam", en: "Dong Nai, Vietnam" },
      desc: { vi: "Tạo khuôn đế cao su lốp xe đúc nhiệt, ép keo sinh học dính thân sợi dứa tự nhiên.", en: "Heat-molds tire rubber soles and binds them with natural pineapple fiber bodies using bio-glues." }
    },
    default: {
      name: { vi: "Xưởng thiết kế túi bạt ReFashion Sài Gòn", en: "ReFashion Saigon Canvas & Bag Studio" },
      loc: { vi: "TP. Hồ Chí Minh, Việt Nam", en: "Ho Chi Minh City, Vietnam" },
      desc: { vi: "May thủ công túi xách, balo chịu lực từ bạt xe tải phế thải và lưới nylon.", en: "Handcrafts heavy-duty bags and backpacks from discarded truck tarps and nylon nets." }
    }
  };

  var tier1Translations = {
    jacket: {
      name: { vi: "Xưởng hoàn thiện áo khoác ReFashion Đà Nẵng", en: "ReFashion Da Nang Jacket Finisher" },
      loc: { vi: "Đà Nẵng, Việt Nam", en: "Da Nang, Vietnam" },
      desc: { vi: "Khâu cúc gỗ dừa, đính nhãn QR, ủi hơi nước và đóng gói hộp giấy Kraft tự hủy.", en: "Attaches coconut buttons, stamps QR passport, steam-irons, and packs in Kraft boxes." }
    },
    tshirt: {
      name: { vi: "Trung tâm đóng gói & Giao nhận ReFashion Miền Trung", en: "ReFashion Central Finish & Pack Center" },
      loc: { vi: "Thừa Thiên Huế, Việt Nam", en: "Thua Thien Hue, Vietnam" },
      desc: { vi: "Ủi phẳng, gắn nhãn sinh học thông minh, kiểm tra chất lượng và xếp hộp carton tái chế.", en: "Presses, attaches smart bio-tags, inspects stitching quality, and packs in recycled cartons." }
    },
    pants: {
      name: { vi: "Xưởng may hoàn thiện quần ReFashion Đà Nẵng", en: "ReFashion Da Nang Pants Assembly Hub" },
      loc: { vi: "Đà Nẵng, Việt Nam", en: "Da Nang, Vietnam" },
      desc: { vi: "Lắp khóa zip đồng tái chế, đính nhãn truy vết, kiểm thử độ co giãn và đóng gói.", en: "Attaches recycled copper zippers, prints passport tags, tests elasticity, and ships." }
    },
    shoes: {
      name: { vi: "Xưởng hoàn thiện giày ReFashion Nam Sài Gòn", en: "ReFashion Saigon Footwear Finish Workshop" },
      loc: { vi: "TP. Hồ Chí Minh, Việt Nam", en: "Ho Chi Minh City, Vietnam" },
      desc: { vi: "Luồn dây giày dệt bông, đánh sáp bảo vệ tự nhiên, kiểm tra mối dán đế và xếp hộp gỗ tái sinh.", en: "Laces shoes, applies protective natural wax, tests sole adhesion, and packs in reclaimed wood boxes." }
    },
    default: {
      name: { vi: "Trung tâm hoàn thiện & Logistics ReFashion Phía Nam", en: "ReFashion Southern Logistics & Finish Hub" },
      loc: { vi: "TP. Hồ Chí Minh, Việt Nam", en: "Ho Chi Minh City, Vietnam" },
      desc: { vi: "Đính khóa cài kim loại tái chế, kiểm tra chống nước bạt phủ, gắn QR passport và phân phối.", en: "Attaches recycled metal hardware, verifies tarp waterproof coating, mounts QR tag, and distributes." }
    }
  };

  var journeyTranslations = {
    jacket: {
      repair: {
        vi: "Gia cố đường may sờn vai, gia cố bọc cùi chỏ và thay khuy đồng đóng đinh bọc đồng bền chắc.",
        en: "Reinforces worn shoulder seams, elbows, and replaces durable copper-clad buttons."
      },
      refurbish: {
        vi: "Hấp khử trùng Ozone diệt khuẩn, phun phủ nano chống thấm nước nhẹ cho lớp denim mặt ngoài.",
        en: "Ozone sanitizes to kill bacteria, applies water-resistant nano coating on denim exterior."
      },
      redesign: {
        vi: "Phối ghép mảnh lót gió tái chế và túi hộp tiện lợi từ quần jeans cũ.",
        en: "Upcycles recycled windbreaker linings and utility cargo pockets from old jeans."
      }
    },
    tshirt: {
      repair: {
        vi: "Khâu mạng lại các lỗ sờn nhỏ bằng kỹ thuật thêu chìm chắp vá Sashiko nghệ thuật.",
        en: "Mends small worn spots using subtle Sashiko art-darning techniques."
      },
      refurbish: {
        vi: "Giặt xả enzym sinh học làm mềm sợi bông hữu cơ thô, loại bỏ các xơ vải thừa bề mặt.",
        en: "Bio-enzyme washes to soften raw organic cotton fibers and eliminates surface lint."
      },
      redesign: {
        vi: "Nhuộm màu tự nhiên từ lá trà/củ nâu cũ và tạo điểm nhấn chỉ thêu màu tương phản.",
        en: "Naturally dyes using tea leaves/brown tubers and adds contrast stitch highlights."
      }
    },
    pants: {
      repair: {
        vi: "Thay dây kéo khóa đồng tái chế mới, gia cố cạp lưng quần bằng vải lót gia cường.",
        en: "Installs new recycled copper zippers, reinforces trouser waistband with lining fabrics."
      },
      refurbish: {
        vi: "Sấy khử trùng Ozone y tế và xả làm mềm vải thô giúp mặc thoáng mát dễ chịu.",
        en: "Ozone sanitizes and applies eco-softener to make canvas fabric breathable and soft."
      },
      redesign: {
        vi: "Cắt ngắn thành quần ngố hoặc may thêm túi hộp bên hông thời trang tiện lợi.",
        en: "Crops to shorter lengths or stitches stylish utility cargo pockets on the side."
      }
    },
    shoes: {
      repair: {
        vi: "Gia khâu viền đế bằng chỉ sáp dù, dán ép lại keo sinh học chịu lực lực nén cao.",
        en: "Stitches sole borders with waxed nylon thread, binds with high-tensile bio-glues."
      },
      refurbish: {
        vi: "Khử mùi sâu bằng buồng ion âm, đánh sáp ong tự nhiên bảo vệ mặt da dứa Piñatex.",
        en: "Deep deodorizes via negative-ion chambers, applies natural beeswax on Piñatex leather."
      },
      redesign: {
        vi: "Thay lót giày bằng xốp EVA tái chế đàn hồi tốt và đổi dây giày dệt từ sợi dứa dẻo dai.",
        en: "Upgrades insoles with recycled EVA foam and laces shoes with tough pineapple fibers."
      }
    },
    default: {
      repair: {
        vi: "Gia cố góc túi chịu lực nặng, đính lại đinh tán kim loại và tay xách bằng bạt xe tải.",
        en: "Reinforces high-stress bag corners, rivets metal studs, and strengthens truck-tarp straps."
      },
      refurbish: {
        vi: "Vệ sinh sâu chống thấm nước bằng dung dịch sáp tự nhiên thân thiện môi trường.",
        en: "Deep cleanses and applies eco-friendly natural wax for enhanced waterproof protection."
      },
      redesign: {
        vi: "Gia công túi phụ tiện lợi từ phế liệu lót dù và dây đai an toàn ô tô cũ thu hồi.",
        en: "Stitches inner utility pockets from surplus parachute lining and reclaimed car seatbelts."
      }
    }
  };

  var tier4Translations = {
    "Texas Post-Consumer Salvage Depot": { vi: "Tổng kho thu hồi phế liệu dệt may Texas", en: "Texas Post-Consumer Salvage Depot" },
    "Aegean Rain-Fed Cotton Farms": { vi: "Nông trang bông tự nhiên vùng Aegean", en: "Aegean Rain-Fed Cotton Farms" },
    "Binh Duong Deadstock Textile Salvage": { vi: "Điểm thu hồi vải thừa tồn kho Bình Dương", en: "Binh Duong Deadstock Textile Salvage" },
    "Ananas Anam Agrarian Hub": { vi: "Trung tâm nông nghiệp Ananas Anam", en: "Ananas Anam Agrarian Hub" },
    "Phu Quoc Marine Plastic Cleanup Project": { vi: "Dự án làm sạch rác thải nhựa biển Phú Quốc", en: "Phu Quoc Marine Plastic Cleanup Project" }
  };

  var tier4LocTranslations = {
    "Lubbock, Texas, USA": { vi: "Lubbock, Texas, Mỹ", en: "Lubbock, Texas, USA" },
    "Izmir, Turkey": { vi: "Izmir, Thổ Nhĩ Kỳ", en: "Izmir, Turkey" },
    "Binh Duong, Vietnam": { vi: "Bình Dương, Việt Nam", en: "Binh Duong, Vietnam" },
    "Manila, Philippines": { vi: "Manila, Philippines", en: "Manila, Philippines" },
    "Phu Quoc, Vietnam": { vi: "Phú Quốc, Việt Nam", en: "Phu Quoc, Vietnam" }
  };

  var tier4DescTranslations = {
    "High-grade discarded denim clothing collected from post-consumer collection hubs in the USA.": {
      vi: "Quần áo denim cũ bỏ đi chất lượng cao được thu gom từ các trung tâm cứu hộ quần áo cũ của Mỹ.",
      en: "High-grade discarded denim clothing collected from post-consumer collection hubs in the USA."
    },
    "100% organic cotton grown using purely natural rain irrigation without synthetic agricultural chemical sprays.": {
      vi: "100% bông hữu cơ được trồng thuần tự nhiên bằng nước mưa, không phun thuốc hóa học nông nghiệp.",
      en: "100% organic cotton grown using purely natural rain irrigation without synthetic agricultural chemical sprays."
    },
    "Unused leftovers and cutting waste gathered from standard clothing manufacturing factories in Southern Vietnam.": {
      vi: "Các góc vải thừa tồn kho và phế phẩm từ các xưởng sản xuất may mặc lớn tại miền Nam Việt Nam.",
      en: "Unused leftovers and cutting waste gathered from standard clothing manufacturing factories in Southern Vietnam."
    },
    "Extracted from useless pineapple leaves after harvest, creating supplementary circular income for local farming families.": {
      vi: "Sợi được chiết xuất từ lá dứa phế phẩm sau thu hoạch, giúp người dân có thêm thu nhập tuần hoàn.",
      en: "Extracted from useless pineapple leaves after harvest, creating supplementary circular income for local farming families."
    },
    "Discarded nylon fishing nets and ocean-bound plastic bottles recovered directly from sea waters and beaches.": {
      vi: "Lưới đánh cá cũ bị bỏ đi và chai nhựa được gom trực tiếp từ đại dương và bờ biển Phú Quốc.",
      en: "Discarded nylon fishing nets and ocean-bound plastic bottles recovered directly from sea waters and beaches."
    }
  };

  var t3 = tier3Translations[originKey] || tier3Translations.default;
  var t2 = tier2Translations[originKey] || tier2Translations.default;
  var t1 = tier1Translations[originKey] || tier1Translations.default;
  var certs = certifications[originKey] || certifications.default;
  var journey = journeyTranslations[originKey] || journeyTranslations.default;

  return Object.assign({}, dpp, {
    title: isEn && dpp.title === "Sản phẩm ReFashion" ? "ReFashion Product" : dpp.title,
    category: isEn && dpp.category === "Chung" ? "General" : dpp.category,
    materials: localizedMaterials,
    materialOrigin: localizedOrigin,
    tier4Name: tier4Translations[dpp.tier4Name] ? (isEn ? tier4Translations[dpp.tier4Name].en : tier4Translations[dpp.tier4Name].vi) : dpp.tier4Name,
    tier4Loc: tier4LocTranslations[dpp.tier4Loc] ? (isEn ? tier4LocTranslations[dpp.tier4Loc].en : tier4LocTranslations[dpp.tier4Loc].vi) : dpp.tier4Loc,
    tier4Cert: dpp.tier4Cert,
    tier4Desc: tier4DescTranslations[dpp.tier4Desc] ? (isEn ? tier4DescTranslations[dpp.tier4Desc].en : tier4DescTranslations[dpp.tier4Desc].vi) : dpp.tier4Desc,
    tier3Name: isEn ? t3.name.en : t3.name.vi,
    tier3Loc: isEn ? t3.loc.en : t3.loc.vi,
    tier3Cert: certs.tier3,
    tier3Desc: isEn ? t3.desc.en : t3.desc.vi,
    tier2Name: isEn ? t2.name.en : t2.name.vi,
    tier2Loc: isEn ? t2.loc.en : t2.loc.vi,
    tier2Cert: certs.tier2,
    tier2Desc: isEn ? t2.desc.en : t2.desc.vi,
    tier1Name: isEn ? t1.name.en : t1.name.vi,
    tier1Loc: isEn ? t1.loc.en : t1.loc.vi,
    tier1Cert: certs.tier1,
    tier1Desc: isEn ? t1.desc.en : t1.desc.vi,
    journeyRepair: isEn ? journey.repair.en : journey.repair.vi,
    journeyRefurbish: isEn ? journey.refurbish.en : journey.refurbish.vi,
    journeyRedesign: isEn ? journey.redesign.en : journey.redesign.vi
  });
}

function renderDppBadges(sdg, esg) {
  var html = '<div class="dpp-badges-row">';
  if (sdg) {
    html += '<span class="dpp-badge dpp-badge-sdg"><i class="fa-solid fa-seedling"></i> ' + sdg + '</span>';
  }
  if (esg) {
    html += '<span class="dpp-badge dpp-badge-esg"><i class="fa-solid fa-leaf"></i> ' + esg + '</span>';
  }
  html += '</div>';
  return html;
}

function showDppModal(productId) {
  var dppRaw = getDppData(productId);
  if (!dppRaw) return;

  var lang = 'en'; // Set to English
  var isEn = lang === 'en';
  var dpp = getLocalizedDpp(dppRaw, lang);

  var overlay = document.createElement('div');
  overlay.id = 'dpp-modal';
  overlay.className = 'dpp-modal-overlay';
  overlay.innerHTML = 
    '<div class="dpp-passport-container">' +
      '<div class="dpp-passport-header">' +
        '<div class="dpp-passport-title">' +
          '<i class="fa-solid fa-passport" style="font-size: 1.8rem; color: var(--primary);"></i>' +
          '<div>' +
            '<h3>' + (isEn ? 'Digital Product Passport (DPP)' : 'Hộ Chiếu Sản Phẩm Kỹ Thuật Số (DPP)') + '</h3>' +
            '<p>' + (isEn ? 'Product' : 'Sản phẩm') + ': <strong>' + dpp.title + '</strong> | ID: ' + dpp.dppId + '</p>' +
          '</div>' +
        '</div>' +
        '<button class="dpp-passport-close" onclick="closeDppModal()"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      
      '<div class="dpp-passport-body">' +
        
        '<!-- Left Column: Identity, LCA, Origin & Composition -->' +
        '<div class="dpp-passport-col">' +
          
          '<!-- Identity Card -->' +
          '<div class="dpp-passport-card">' +
            '<div class="dpp-prod-id">PRODUCT ID: ' + dpp.dppId + '</div>' +
          '</div>' +

          '<!-- Environmental LCA Impact Dashboard -->' +
          '<div class="dpp-passport-card">' +
            renderDppBadges(isEn ? "SDG 13: Climate Action" : "SDG 13: Hành động Khí hậu", isEn ? "ESG: Environmental - Carbon & Water Footprint" : "ESG: Môi trường - Dấu chân Carbon & Nước") +
            '<h4 class="card-section-title"><i class="fa-solid fa-leaf" style="color:var(--primary)"></i> ' + (isEn ? 'Environmental Impact & LCA' : 'Chỉ Số Tác Động Môi Trường & LCA') + '</h4>' +
            
            '<div style="background: rgba(91, 116, 83, 0.05); border: 1px solid rgba(91, 116, 83, 0.15); border-radius: 8px; padding: 12px; font-size: 0.78rem; text-align: left; margin-bottom: 14px; color: var(--foreground); line-height: 1.4;">' +
              '<i class="fa-solid fa-circle-info"></i> ' + (isEn 
                ? 'ReFashion process emits <strong>' + dpp.co2Emitted.toFixed(2) + ' kg CO₂</strong> during transport & refurbishment, saving <strong>' + dpp.co2Saved.toFixed(2) + ' kg CO₂</strong> (<strong>' + dpp.co2ReductionPct.toFixed(0) + '%</strong> reduction) compared to producing a new product of the same type.'
                : 'Quy trình Refashion phát sinh <strong>' + dpp.co2Emitted.toFixed(2) + ' kg CO₂</strong> trong quá trình vận chuyển & làm mới, tiết kiệm <strong>' + dpp.co2Saved.toFixed(2) + ' kg CO₂</strong> (giảm <strong>' + dpp.co2ReductionPct.toFixed(0) + '%</strong>) so với sản xuất sản phẩm mới cùng loại.') +
            '</div>' +

            '<!-- Material Flow / Workshop Efficiency -->' +
            '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px;">' +
              '<div class="dpp-material-card">' +
                '<div class="dpp-material-pct">' + dpp.materialRecoveryRate + '%</div>' +
                '<div class="dpp-material-lbl">' + (isEn ? 'Material recovery' : 'Thu hồi vật liệu') + '</div>' +
              '</div>' +
              '<div class="dpp-material-card">' +
                '<div class="dpp-material-pct">' + dpp.scrapToOutput + '%</div>' +
                '<div class="dpp-material-lbl">' + (isEn ? 'Scrap to output rate' : 'Tỷ lệ phế liệu') + '</div>' +
              '</div>' +
              '<div class="dpp-material-card">' +
                '<div class="dpp-material-pct">' + dpp.wasteReductionRatio + '%</div>' +
                '<div class="dpp-material-lbl">' + (isEn ? 'Waste reduction' : 'Giảm thiểu rác') + '</div>' +
              '</div>' +
            '</div>' +
            
            '<p style="font-size: 0.65rem; color: var(--text-muted); margin-top: 10px; line-height: 1.3; text-align: left;">' +
              (isEn ? '* Calculations apply a 65% displacement rate based on standard LCA studies.' : '* Tính toán áp dụng hệ số thay thế 65% theo nghiên cứu LCA tiêu chuẩn.') +
            '</p>' +
          '</div>' +

          '<!-- Material Origin Card -->' +
          '<div class="dpp-passport-card">' +
            renderDppBadges(isEn ? "SDG 12: Responsible Consumption" : "SDG 12: Tiêu dùng Trách nhiệm", isEn ? "ESG: Environmental - Material Stewardship" : "ESG: Môi trường - Quản trị Nguyên liệu") +
            '<h4 class="card-section-title"><i class="fa-solid fa-circle-nodes" style="color:var(--primary)"></i> ' + (isEn ? 'Material Origin' : 'Nguồn Gốc Nguyên Vật Liệu') + '</h4>' +
            '<div style="font-size: 0.78rem; line-height: 1.45; text-align: left; color: var(--foreground); background: rgba(91, 116, 83, 0.05); border: 1px solid rgba(91, 116, 83, 0.15); border-radius: 8px; padding: 12px; display: flex; align-items: flex-start; gap: 10px;">' +
              '<i class="fa-solid fa-leaf" style="color:var(--primary); margin-top: 3px; font-size: 0.95rem;"></i>' +
              '<div>' +
                '<strong>' + (isEn ? 'Collection details:' : 'Chi tiết nguồn thu gom:') + '</strong><br>' +
                dpp.materialOrigin +
              '</div>' +
            '</div>' +
          '</div>' +

          '<!-- Material Composition -->' +
          '<div class="dpp-passport-card">' +
            renderDppBadges(isEn ? "SDG 12: Responsible Consumption" : "SDG 12: Tiêu dùng Trách nhiệm", isEn ? "ESG: Environmental - Material Origin" : "ESG: Môi trường - Nguồn gốc Nguyên liệu") +
            '<h4 class="card-section-title"><i class="fa-solid fa-dna" style="color:var(--primary)"></i> ' + (isEn ? 'Material Composition' : 'Thành Phần Chất Liệu') + '</h4>' +
            '<div class="dpp-material-grid">' +
              '<div class="dpp-material-card">' +
                '<div class="dpp-material-pct">' + dpp.materials[0].pct + '%</div>' +
                '<div class="dpp-material-lbl">' + dpp.materials[0].name + '</div>' +
              '</div>' +
              '<div class="dpp-material-card">' +
                '<div class="dpp-material-pct">' + dpp.materials[1].pct + '%</div>' +
                '<div class="dpp-material-lbl">' + dpp.materials[1].name + '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +

        '</div>' +

        '<!-- Right Column: Process, QC, Social & Supply Chain -->' +
        '<div class="dpp-passport-col">' +

          '<!-- 3R Renew Journey -->' +
          '<div class="dpp-passport-card">' +
            renderDppBadges(isEn ? "SDG 12: Responsible Consumption" : "SDG 12: Tiêu dùng Trách nhiệm", isEn ? "ESG: Environmental - Circular Economy" : "ESG: Môi trường - Kinh tế Tuần hoàn") +
            '<h4 class="card-section-title"><i class="fa-solid fa-recycle" style="color:var(--primary)"></i> ' + (isEn ? 'Refurbishment Journey (3R)' : 'Hành Trình Làm Mới (3R)') + '</h4>' +
            '<div style="display: flex; flex-direction: column; gap: 10px; text-align: left; font-size: 0.78rem;">' +
              '<div>' +
                '<strong>' + (isEn ? '🔧 Repair:' : '🔧 Repair (Sửa chữa):') + '</strong> ' + dpp.journeyRepair +
              '</div>' +
              '<div>' +
                '<strong>' + (isEn ? '✨ Refurbish:' : '✨ Refurbish (Làm mới):') + '</strong> ' + dpp.journeyRefurbish +
              '</div>' +
              '<div>' +
                '<strong>' + (isEn ? '✂️ Remaking/Redesign:' : '✂️ Remaking/Redesign (Thiết kế lại):') + '</strong> ' + dpp.journeyRedesign +
              '</div>' +
            '</div>' +
          '</div>' +

          '<!-- Supply Chain Provenance & Transit -->' +
          '<div class="dpp-passport-card">' +
            renderDppBadges(isEn ? "SDG 9: Industry & Infrastructure" : "SDG 9: Công nghiệp & Hạ tầng", isEn ? "ESG: Environmental - Scope 3 Transport" : "ESG: Môi trường - Vận tải Phạm vi 3") +
            '<h4 class="card-section-title"><i class="fa-solid fa-map-location-dot" style="color:var(--primary)"></i> ' + (isEn ? 'Supply Chain & Transit Transparency' : 'Chuỗi Cung Ứng & Minh Bạch Vận Tải') + '</h4>' +
            '<div style="font-size: 0.75rem; text-align: left; margin-bottom: 12px; color: var(--text-muted);">' +
              '<i class="fa-solid fa-truck-fast"></i> ' + (isEn 
                ? 'Total supply chain transport distance: <strong>' + dpp.transportDistance + ' km</strong>.'
                : 'Tổng quãng đường vận chuyển chuỗi cung ứng: <strong>' + dpp.transportDistance + ' km</strong>.') +
            '</div>' +
            '<div class="dpp-timeline">' +
              
              '<!-- Tier 1 -->' +
              '<div class="dpp-timeline-node active expanded" id="dpp-node-1">' +
                '<div class="dpp-node-indicator"></div>' +
                '<div class="dpp-node-summary" onclick="toggleDppNode(1)">' +
                  '<div>' +
                    '<span class="dpp-node-tier">' + (isEn ? 'Tier 1: Assembly & Distribution' : 'Tier 1: Hoàn thiện & Phân Phối') + '</span>' +
                    '<div class="dpp-node-title">' + dpp.tier1Name + '</div>' +
                  '</div>' +
                  '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
                '</div>' +
                '<div class="dpp-node-details">' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier1Loc + '</p>' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier1Cert + '</span></p>' +
                  '<p>' + dpp.tier1Desc + '</p>' +
                '</div>' +
              '</div>' +

              '<!-- Tier 2 -->' +
              '<div class="dpp-timeline-node" id="dpp-node-2">' +
                '<div class="dpp-node-indicator"></div>' +
                '<div class="dpp-node-summary" onclick="toggleDppNode(2)">' +
                  '<div>' +
                    '<span class="dpp-node-tier">' + (isEn ? 'Tier 2: Upcycling Creative Studio' : 'Tier 2: Xưởng Tái Tạo Thiết Kế') + '</span>' +
                    '<div class="dpp-node-title">' + dpp.tier2Name + '</div>' +
                  '</div>' +
                  '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
                '</div>' +
                '<div class="dpp-node-details">' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier2Loc + '</p>' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier2Cert + '</span></p>' +
                  '<p>' + dpp.tier2Desc + '</p>' +
                '</div>' +
              '</div>' +

              '<!-- Tier 3 -->' +
              '<div class="dpp-timeline-node" id="dpp-node-3">' +
                '<div class="dpp-node-indicator"></div>' +
                '<div class="dpp-node-summary" onclick="toggleDppNode(3)">' +
                  '<div>' +
                    '<span class="dpp-node-tier">' + (isEn ? 'Tier 3: Fiber Processing & Spin-Opening' : 'Tier 3: Trạm Xử Lý Vải Mộc') + '</span>' +
                    '<div class="dpp-node-title">' + dpp.tier3Name + '</div>' +
                  '</div>' +
                  '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
                '</div>' +
                '<div class="dpp-node-details">' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier3Loc + '</p>' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier3Cert + '</span></p>' +
                  '<p>' + dpp.tier3Desc + '</p>' +
                '</div>' +
              '</div>' +

              '<!-- Tier 4 -->' +
              '<div class="dpp-timeline-node" id="dpp-node-4">' +
                '<div class="dpp-node-indicator"></div>' +
                '<div class="dpp-node-summary" onclick="toggleDppNode(4)">' +
                  '<div>' +
                    '<span class="dpp-node-tier">' + (isEn ? 'Tier 4: Material Sourcing & Collection' : 'Tier 4: Nguồn Vật Liệu Thu Gom') + '</span>' +
                    '<div class="dpp-node-title">' + dpp.tier4Name + '</div>' +
                  '</div>' +
                  '<i class="fa-solid fa-chevron-right dpp-node-chevron"></i>' +
                '</div>' +
                '<div class="dpp-node-details">' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Location' : 'Địa điểm') + ':</strong> ' + dpp.tier4Loc + '</p>' +
                  '<p style="margin-bottom:3px;"><strong>' + (isEn ? 'Certification' : 'Chứng nhận') + ':</strong> <span style="color:var(--primary)">' + dpp.tier4Cert + '</span></p>' +
                  '<p>' + dpp.tier4Desc + '</p>' +
                '</div>' +
              '</div>' +

            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);
}

function closeDppModal() {
  var modal = document.getElementById('dpp-modal');
  if (modal) {
    modal.parentNode.removeChild(modal);
  }
}

function toggleDppNode(nodeId) {
  var node = document.getElementById('dpp-node-' + nodeId);
  if (!node) return;

  var isExpanded = node.classList.contains('expanded');
  
  // Collapse all other nodes
  for (var i = 1; i <= 4; i++) {
    var otherNode = document.getElementById('dpp-node-' + i);
    if (otherNode) {
      otherNode.classList.remove('expanded');
      otherNode.classList.remove('active');
    }
  }

  // Toggle clicked node
  if (!isExpanded) {
    node.classList.add('expanded');
    node.classList.add('active');
  }
}

function showXaiModal(productId) {
  // Close any existing XAI modal
  closeXaiModal();

  var product = null;
  if (typeof SHOP_PRODUCTS !== 'undefined') {
    for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
      if (String(SHOP_PRODUCTS[i].id) === String(productId)) {
        product = SHOP_PRODUCTS[i];
        break;
      }
    }
  }
  // Also try PRODUCTS_DB for static/mapped product IDs
  if (!product && typeof PRODUCTS_DB !== 'undefined' && PRODUCTS_DB[productId]) {
    product = PRODUCTS_DB[productId];
    // Enrich with attributes from SHOP_PRODUCTS for fuller XAI explanation
    if (typeof SHOP_PRODUCTS !== 'undefined') {
      for (var ei = 0; ei < SHOP_PRODUCTS.length; ei++) {
        var sp = SHOP_PRODUCTS[ei];
        if (sp.store === product.store && (sp.fabric || sp.colorPattern || sp.shape)) {
          if (!product.fabric) product.fabric = sp.fabric;
          if (!product.colorPattern) product.colorPattern = sp.colorPattern;
          if (!product.shape) product.shape = sp.shape;
          break;
        }
      }
    }
  }
  if (!product) return;

  var overlay = document.createElement('div');
  overlay.id = 'xai-modal';
  overlay.className = 'xai-modal-overlay';
  
  // Set inline styles for backdrop and modal to ensure glassmorphism and responsiveness
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  overlay.style.backdropFilter = 'blur(6px)';
  overlay.style.webKitBackdropFilter = 'blur(6px)';
  overlay.style.zIndex = '10000';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.25s ease';
  
  // Close modal when clicking backdrop
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) {
      closeXaiModal();
    }
  });

  var containerHtml = 
    '<div class="xai-modal-container" style="background:#F8F6F1; border: 1px solid rgba(91, 116, 83, 0.25); border-radius: 16px; width: 90%; max-width: 500px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); position: relative; transform: scale(0.9); transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); max-height: 85vh; overflow-y: auto;">' +
      '<button onclick="closeXaiModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-muted); hover: color: var(--text-dark);"><i class="fa-solid fa-xmark"></i></button>' +
      '<div style="display:flex; align-items:center; gap:8px; margin-bottom: 16px;">' +
        '<i class="fa-solid fa-wand-magic-sparkles" style="font-size: 1.4rem; color: var(--primary);"></i>' +
        '<h3 style="margin:0; font-family:\'Outfit\', sans-serif; font-weight:600; color:var(--primary); font-size:1.15rem;">Stylist AI Explains</h3>' +
      '</div>' +
      '<div id="xai-modal-loading" style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding: 20px 0;">' +
        '<i class="fa-solid fa-circle-notch fa-spin" style="margin-right:6px;"></i> Analyzing Shapley feature contributions...' +
      '</div>' +
      '<div id="xai-modal-content" style="display:none;"></div>' +
    '</div>';

  overlay.innerHTML = containerHtml;
  document.body.appendChild(overlay);

  // Trigger animations
  setTimeout(function() {
    overlay.style.opacity = '1';
    var container = overlay.querySelector('.xai-modal-container');
    if (container) container.style.transform = 'scale(1)';
  }, 10);

  // Fetch explanation
  if (typeof AI_REC_SYSTEM !== 'undefined') {
    AI_REC_SYSTEM.explainProduct(product).then(function(nlgText) {
      var loadingEl = document.getElementById('xai-modal-loading');
      var contentEl = document.getElementById('xai-modal-content');
      if (loadingEl && contentEl) {
        loadingEl.style.display = 'none';
        contentEl.innerHTML = nlgText;
        contentEl.style.display = 'block';
      }
    }).catch(function(err) {
      console.error('[XAI Modal] Error:', err);
      var loadingEl = document.getElementById('xai-modal-loading');
      var contentEl = document.getElementById('xai-modal-content');
      if (loadingEl && contentEl) {
        loadingEl.style.display = 'none';
        contentEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-dark);">' + getXaiExplanation(product) + '</div>';
        contentEl.style.display = 'block';
      }
    });
  } else {
    var loadingEl = document.getElementById('xai-modal-loading');
    var contentEl = document.getElementById('xai-modal-content');
    if (loadingEl && contentEl) {
      loadingEl.style.display = 'none';
      contentEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-dark);">' + getXaiExplanation(product) + '</div>';
      contentEl.style.display = 'block';
    }
  }
}

function closeXaiModal() {
  var modal = document.getElementById('xai-modal');
  if (modal) {
    modal.style.opacity = '0';
    var container = modal.querySelector('.xai-modal-container');
    if (container) container.style.transform = 'scale(0.9)';
    setTimeout(function() {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 250);
  }
}

function getXaiExplanation(p) {
  var name = p.name || "";
  var store = p.store || "";
  
  if (name.indexOf("Áo Khoác") !== -1 || name.indexOf("Jacket") !== -1) {
    return "This product is recommended because it\u2019s a signature circular wind jacket from " + store + ", saving significant energy and reducing carbon emissions. It perfectly complements your outdoor wardrobe while supporting a sustainable lifestyle.";
  } else if (name.indexOf("Balo") !== -1 || name.indexOf("Túi") !== -1) {
    return "We recommend this backpack based on its optimal storage capacity for outdoor activities. Crafted from ultra-durable old tarps and parachute fabric, it represents smart design that extends material lifespan.";
  } else if (name.indexOf("Áo Thun") !== -1 || name.indexOf("T-shirt") !== -1) {
    return "This unisex cotton T-shirt is recommended for its high versatility in a minimalist wardrobe. With 100% regenerated natural fibers and rustic coconut shell buttons, it delivers natural coolness and skin-friendly comfort.";
  } else if (name.indexOf("Quần") !== -1 || name.indexOf("Pants") !== -1) {
    return "Recommended for its classic straight-cut khaki design that\u2019s easy to style. The high-quality recycling process from old pants preserves the characteristic raw texture while minimizing textile waste released into the environment.";
  } else if (name.indexOf("Giày") !== -1 || name.indexOf("Shoes") !== -1 || name.indexOf("Dép") !== -1) {
    return "These eco-friendly shoes/sandals use recycled rubber and durable Pi\u00f1atex pineapple fiber. Perfect for those who love gentle, comfortable movement and support the circular economy while protecting the environment.";
  }
  return "This product is recommended based on its high compatibility with sustainable fashion trends. High-quality reclaimed materials and skilled finishing processes deliver a modern, durable fit.";
}

// Make them available on window scope for inline onclick events
window.showDppModal = showDppModal;
window.closeDppModal = closeDppModal;
window.toggleDppNode = toggleDppNode;
window.showXaiModal = showXaiModal;
window.closeXaiModal = closeXaiModal;
window.getXaiExplanation = getXaiExplanation;

/* ==================== VTON STUDIO ==================== */

var vtonState = {
  selectedModelId: null,
  userUploadedImage: null,
  selectedGarmentId: null,
  currentProductClothFile: null,
  currentProductGarmentType: 'upper',
  currentProductName: '',
  currentProductPrice: 0,
  currentProductPriceStr: '',
  currentProductImage: '',
  resultImageUrl: null,
  simulateMode: true
};

var VTON_PRESET_MODELS = [
  { id: 'model_m1', file: 'MEN-Denim-id_00000080-01_7_additional.jpg', name: 'Male Fair Skin', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000080-01_7_additional.jpg' },
  { id: 'model_m2', file: 'MEN-Denim-id_00000089-02_7_additional.jpg', name: 'Male 2', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000089-02_7_additional.jpg' },
  { id: 'model_m3', file: 'MEN-Denim-id_00000089-26_7_additional.jpg', name: 'Male 3', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000089-26_7_additional.jpg' },
  { id: 'model_m4', file: 'MEN-Denim-id_00000182-01_7_additional.jpg', name: 'Male 4', gender: 'male',
    url: '/images/products/MEN-Denim-id_00000182-01_7_additional.jpg' },
  { id: 'model_f1', file: 'WOMEN-Blouses_Shirts-id_00000183-01_1_front.jpg', name: 'Female 1', gender: 'female',
    url: '/images/products/WOMEN-Blouses_Shirts-id_00000183-01_1_front.jpg' },
  { id: 'model_f2', file: 'WOMEN-Blouses_Shirts-id_00000001-02_1_front.jpg', name: 'Female 2', gender: 'female',
    url: '/images/products/WOMEN-Blouses_Shirts-id_00000001-02_1_front.jpg' },
  { id: 'model_f3', file: 'WOMEN-Sweaters-id_00005890-05_1_front.jpg', name: 'Female 3', gender: 'female',
    url: '/images/products/WOMEN-Sweaters-id_00005890-05_1_front.jpg' }
];

function getActiveModelImageUrl() {
  if (vtonState.userUploadedImage) return vtonState.userUploadedImage;
  var m = VTON_PRESET_MODELS.find(function(x) { return x.id === vtonState.selectedModelId; });
  return m ? m.url : VTON_PRESET_MODELS[0].url;
}

function getGarmentImageUrl() {
  return vtonState.currentProductClothFile || '';
}

function getGarmentType() {
  var t = (vtonState.currentProductGarmentType || 'upper').toLowerCase();
  if (t === 'lower') return 'lower';
  if (t === 'overall') return 'overall';
  return 'upper';
}

function openVtonStudio(product) {
  if (!product || !product.clothFile) { showToast('This product does not support AI Try-On yet.'); return; }
  vtonState.currentProductClothFile = product.clothFile;
  vtonState.currentProductGarmentType = product.garmentType || product.category || 'upper';
  vtonState.currentProductName = product.name || '';
  vtonState.currentProductPrice = product.price || 0;
  vtonState.currentProductPriceStr = product.priceStr || product.price || '';
  vtonState.currentProductImage = product.image || '';
  vtonState.resultImageUrl = null;

  var modal = document.getElementById('vton-modal');
  if (modal) modal.classList.add('show');

  renderVtonModels();
  renderVtonGarment();
  resetVtonResult();

  // Auto-select first model
  if (!vtonState.selectedModelId) {
    selectVtonModel(VTON_PRESET_MODELS[0].id);
  } else {
    selectVtonModel(vtonState.selectedModelId);
  }

  // Load Hugging Face token from local .env if available
  loadHfTokenFromEnv();
}

function closeVtonStudio() {
  var modal = document.getElementById('vton-modal');
  if (modal) modal.classList.remove('show');
}

async function loadHfTokenFromEnv() {
  try {
    var response = await fetch('/.env');
    if (!response.ok) return;
    var text = await response.text();
    var match = text.match(/HF_TOKEN\s*=\s*([^\r\n]+)/);
    if (match && match[1]) {
      var token = match[1].trim();
      var input = document.getElementById('vton-api-token');
      if (input) {
        input.value = token;
      }
      // If we got a valid token, automatically disable simulation mode
      var simCheck = document.getElementById('vton-simulate-check');
      if (simCheck) {
        simCheck.checked = false;
        vtonState.simulateMode = false;
      }
    }
  } catch (e) {
    console.warn('Failed to load token from .env:', e);
  }
}

function renderVtonModels() {
  var list = document.getElementById('vton-models-list');
  if (!list) return;
  var html = '';
  VTON_PRESET_MODELS.forEach(function(m) {
    var active = m.id === vtonState.selectedModelId ? ' active' : '';
    html += '<div class="vton-model-card' + active + '" onclick="selectVtonModel(\'' + m.id + '\')" title="' + m.name + '">' +
              '<img class="vton-model-thumb" src="' + m.url + '" alt="' + m.name + '" onerror="this.onerror=null;this.src=\'../images/store_logo.png\'" />' +
            '</div>';
  });
  list.innerHTML = html;
}

function renderVtonGarment() {
  var src = vtonState.currentProductClothFile || '';
  // Update workspace garment panel
  var wsGarment = document.getElementById('vton-ws-garment-img');
  if (wsGarment) wsGarment.src = src;

  var list = document.getElementById('vton-garments-list');
  if (list) {
    list.innerHTML = '<div class="vton-garment-thumb active">' +
      '<img src="' + src + '" alt="' + vtonState.currentProductName + '" onerror="this.src=\'../images/store_logo.png\'" />' +
      '<span>' + vtonState.currentProductName + '</span>' +
      '</div>';
  }
}

function selectVtonModel(modelId) {
  vtonState.selectedModelId = modelId;
  vtonState.userUploadedImage = null;
  renderVtonModels();
  var wsModel = document.getElementById('vton-ws-model-img');
  if (wsModel) wsModel.src = getActiveModelImageUrl();
}

function handleVtonUserUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    vtonState.userUploadedImage = e.target.result;
    vtonState.selectedModelId = null;
    renderVtonModels();
    var wsModel = document.getElementById('vton-ws-model-img');
    if (wsModel) wsModel.src = e.target.result;
    showToast('✅ Your photo uploaded!');
  };
  reader.readAsDataURL(file);
}

function toggleSimulateMode(checkbox) {
  vtonState.simulateMode = checkbox ? checkbox.checked : true;
}

function resetVtonResult() {
  setVtonState('empty');
  vtonState.resultImageUrl = null;
}

function setVtonState(state) {
  var empty = document.getElementById('vton-state-empty');
  var loading = document.getElementById('vton-state-loading');
  var success = document.getElementById('vton-state-success');
  if (empty) empty.style.display = state === 'empty' ? '' : 'none';
  if (loading) loading.style.display = state === 'loading' ? '' : 'none';
  if (success) success.style.display = state === 'success' ? '' : 'none';
}

function logVton(msg) {
  // console logging removed for end-user clarity
}


function setVtonProgress(pct, text) {
  var fill = document.getElementById('vton-progress-fill');
  var label = document.getElementById('vton-progress-text');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = text || pct + '%';
}

function startVtonInference() {
  var modelUrl = getActiveModelImageUrl();
  var garmentUrl = getGarmentImageUrl();
  if (!modelUrl) { showToast('Please select a model!'); return; }
  if (!garmentUrl) { showToast('Garment image not found.'); return; }

  setVtonState('loading');
  setVtonProgress(0, '0%');
  runRealVtonAPI(modelUrl, garmentUrl);
}

function runSimulationMode(modelUrl, garmentUrl) {
  logVton('Starting Simulation Engine...');
  setVtonProgress(10, '10%');
  setTimeout(function() { logVton('Analyzing model body shape...'); setVtonProgress(30, '30%'); }, 400);
  setTimeout(function() { logVton('Mapping garment points to body...'); setVtonProgress(55, '55%'); }, 900);
  setTimeout(function() { logVton('Generating final image...'); setVtonProgress(80, '80%'); }, 1500);
  setTimeout(function() {
    logVton('Complete! Displaying result...');
    setVtonProgress(100, '100%');
    // Simulate overlay: show garment on model using CSS blending/actual product image
    showVtonSuccess(modelUrl, vtonState.currentProductImage || garmentUrl);
  }, 2200);
}

async function runRealVtonAPI(modelUrl, garmentUrl) {
  logVton('Connecting to Hugging Face Space (IDM-VTON)...');
  setVtonProgress(5, '5%');
  try {
    var hfToken = '';
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.hfToken) {
      hfToken = AI_REC_SYSTEM.hfToken;
    } else {
      try {
        var res = await fetch('/.env');
        var text = await res.text();
        var match = text.match(/HF_TOKEN\s*=\s*([^\s]+)/);
        if (match && match[1]) {
          hfToken = match[1].trim();
        }
      } catch(e) {}
    }
    var hfSpace = 'Gain1109/IDM-VTON';

    logVton('Loading Gradio Client module...');
    var { client, upload_files } = await import('https://cdn.jsdelivr.net/npm/@gradio/client@0.15.1/+esm');

    logVton('Connecting to Space: ' + hfSpace);
    setVtonProgress(15, '15%');
    var connectOpts = hfToken ? { hf_token: hfToken } : {};
    var clientInstance = await client(hfSpace, connectOpts);

    logVton('Loading and preparing images...');
    setVtonProgress(30, '30%');
    var modelBlob = await getBlobFromUrl(modelUrl);
    var garmentBlob = await getBlobFromUrl(garmentUrl);

    // Convert Blobs to Files so they have filenames and extensions for the Python backend
    var modelFile = new File([modelBlob], 'model.jpg', { type: modelBlob.type || 'image/jpeg' });
    var garmentFile = new File([garmentBlob], 'garment.jpg', { type: garmentBlob.type || 'image/jpeg' });

    logVton('Uploading model and garment images to Gradio server...');
    setVtonProgress(40, '40%');
    var uploadResult = await upload_files(clientInstance.config.root, [modelFile, garmentFile], hfToken);
    if (!uploadResult || !uploadResult.files || uploadResult.files.length < 2) {
      throw new Error('Failed to upload images to Gradio server');
    }
    var modelUploadedPath = uploadResult.files[0];
    var garmentUploadedPath = uploadResult.files[1];

    logVton('Sending inference request...');
    setVtonProgress(60, '60%');

    var result = await clientInstance.predict('/tryon', [
      { background: { path: modelUploadedPath, orig_name: 'model.jpg' }, layers: [], composite: null },
      { path: garmentUploadedPath, orig_name: 'garment.jpg' },
      vtonState.currentProductName || 'sustainable fashion item',
      true,
      false,
      30,
      42
    ]);

    logVton('Receiving results from API...');
    setVtonProgress(90, '90%');

    var resultData = result && result.data;
    var resultImg = null;
    if (resultData && resultData[0]) {
      if (typeof resultData[0] === 'string') {
        resultImg = resultData[0];
      } else if (resultData[0] && resultData[0].url) {
        resultImg = resultData[0].url;
      }
    }

    if (!resultImg) throw new Error('API did not return a result image');

    setVtonProgress(100, '100%');
    logVton('AI Try-On complete!');
    showVtonSuccess(modelUrl, resultImg);

  } catch (err) {
    logVton('Error: ' + (err.message || String(err)));
    setVtonProgress(0, '0%');
    showToast('❌ API Error: ' + (err.message || 'Connection failed').substring(0, 80));
    setVtonState('empty');
  }
}

async function getBlobFromUrl(url) {
  if (url.startsWith('data:')) {
    var parts = url.split(',');
    var mime = parts[0].split(':')[1].split(';')[0];
    var bytes = Uint8Array.from(atob(parts[1]), function(c) { return c.charCodeAt(0); });
    return new Blob([bytes], { type: mime });
  }
  var response = await fetch(url);
  return response.blob();
}

function showVtonSuccess(beforeUrl, afterUrl) {
  vtonState.resultImageUrl = afterUrl;
  var beforeImg = document.getElementById('vton-result-before-img');
  var afterImg = document.getElementById('vton-result-after-img');
  if (beforeImg) beforeImg.src = beforeUrl;
  if (afterImg) afterImg.src = afterUrl;
  setVtonState('success');
  initCompareSlider();
}

function initCompareSlider() {
  var container = document.querySelector('.compare-slider-container');
  var slider = document.getElementById('vton-compare-slider-bar');
  var afterDiv = document.querySelector('.compare-image-after');
  if (!container || !slider || !afterDiv) return;

  // Make sure the after container takes full width so clip-path works across the entire width
  afterDiv.style.width = '100%';
  slider.style.left = '50%';
  afterDiv.style.clipPath = 'inset(0 50% 0 0)';

  var dragging = false;

  function startDrag(e) {
    dragging = true;
    if (e.cancelable) e.preventDefault();
  }

  function stopDrag() {
    dragging = false;
  }

  function drag(e) {
    if (!dragging) return;
    var rect = container.getBoundingClientRect();
    var clientX = e.clientX;
    
    // Support touch events
    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
    }
    
    var x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    var pct = (x / rect.width) * 100;
    slider.style.left = pct + '%';
    afterDiv.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
  }

  // Mouse events
  slider.addEventListener('mousedown', startDrag);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('mousemove', drag);

  // Touch events
  slider.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchend', stopDrag);
  document.addEventListener('touchmove', drag, { passive: false });
}

function downloadVtonResult() {
  if (!vtonState.resultImageUrl) { showToast('No result image to save.'); return; }
  var a = document.createElement('a');
  a.href = vtonState.resultImageUrl;
  a.download = 'refashion-tryon-result.jpg';
  a.click();
}

function addVtonProductToCart() {
  var user = RefashionAuth._getUser();
  if (!user) { showToast('Please login to add to cart!'); return; }
  RefashionAuth.addToCart({
    productId: 'z_' + Date.now(),
    name: vtonState.currentProductName,
    price: vtonState.currentProductPrice,
    priceStr: vtonState.currentProductPriceStr,
    image: vtonState.currentProductImage,
    variant: 'M - Default'
  });
  showToast('🛍️ Added "' + vtonState.currentProductName + '" to cart!');
  closeVtonStudio();
}

// Expose VTON functions globally
window.openVtonStudio = openVtonStudio;
window.closeVtonStudio = closeVtonStudio;
window.selectVtonModel = selectVtonModel;
window.handleVtonUserUpload = handleVtonUserUpload;
window.toggleSimulateMode = toggleSimulateMode;
window.startVtonInference = startVtonInference;
window.downloadVtonResult = downloadVtonResult;
window.addVtonProductToCart = addVtonProductToCart;

// Map Picker Functionality
var mapPickerObj = null;
var mapPickerMarker = null;

function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = function() {
    callback();
  };
  document.head.appendChild(script);
}

function openMapPicker() {
  var overlay = document.getElementById('map-picker-overlay');
  if (overlay) overlay.classList.add('show');
  
  loadLeaflet(function() {
    // Default Vietnam coordinates (Da Nang center)
    var defaultLat = 16.047079;
    var defaultLng = 108.206230;
    var defaultZoom = 5;
    
    // Check current address input value
    var currentAddress = document.getElementById('edit-address').value.trim();
    document.getElementById('map-selected-address-text').textContent = currentAddress || 'Not selected';
    document.getElementById('map-search-input').value = currentAddress;

    if (!mapPickerObj) {
      mapPickerObj = L.map('map-picker-canvas').setView([defaultLat, defaultLng], defaultZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapPickerObj);
      
      mapPickerMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapPickerObj);
      
      // Handle map click
      mapPickerObj.on('click', function(e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        updateMapMarker(lat, lng);
      });
      
      // Handle marker drag
      mapPickerMarker.on('dragend', function() {
        var pos = mapPickerMarker.getLatLng();
        updateMapMarker(pos.lat, pos.lng);
      });
    } else {
      mapPickerObj.invalidateSize();
    }

    // Try to geocode current address if it exists, otherwise default to VN center
    if (currentAddress) {
      searchAddressOnMap(currentAddress);
    } else {
      mapPickerObj.setView([defaultLat, defaultLng], defaultZoom);
      mapPickerMarker.setLatLng([defaultLat, defaultLng]);
    }
  });
}

function closeMapPicker() {
  var overlay = document.getElementById('map-picker-overlay');
  if (overlay) overlay.classList.remove('show');
}

function updateMapMarker(lat, lng) {
  if (mapPickerMarker) {
    mapPickerMarker.setLatLng([lat, lng]);
  }
  
  document.getElementById('map-selected-address-text').textContent = 'Determining address...';
  
  var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=vi';
  
  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.display_name) {
        document.getElementById('map-selected-address-text').textContent = data.display_name;
      } else {
        document.getElementById('map-selected-address-text').textContent = lat.toFixed(5) + ', ' + lng.toFixed(5);
      }
    })
    .catch(function() {
      document.getElementById('map-selected-address-text').textContent = lat.toFixed(5) + ', ' + lng.toFixed(5);
    });
}

function searchAddressOnMap(queryOverride) {
  var query = queryOverride || document.getElementById('map-search-input').value.trim();
  if (!query) return;
  
  var searchUrl = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&countrycodes=vn&limit=1&accept-language=vi';
  
  document.getElementById('map-selected-address-text').textContent = 'Searching...';
  
  fetch(searchUrl)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data && data.length > 0) {
        var first = data[0];
        var lat = parseFloat(first.lat);
        var lng = parseFloat(first.lon);
        
        if (mapPickerObj && mapPickerMarker) {
          mapPickerObj.setView([lat, lng], 16);
          mapPickerMarker.setLatLng([lat, lng]);
        }
        document.getElementById('map-selected-address-text').textContent = first.display_name;
      } else {
        if (queryOverride) {
          var defaultLat = 16.047079;
          var defaultLng = 108.206230;
          if (mapPickerObj && mapPickerMarker) {
            mapPickerObj.setView([defaultLat, defaultLng], 5);
            mapPickerMarker.setLatLng([defaultLat, defaultLng]);
          }
          document.getElementById('map-selected-address-text').textContent = queryOverride;
        } else {
          document.getElementById('map-selected-address-text').textContent = 'No address found in Vietnam.';
        }
      }
    })
    .catch(function() {
      document.getElementById('map-selected-address-text').textContent = 'Connection error during search.';
    });
}

function confirmMapSelection() {
  var address = document.getElementById('map-selected-address-text').textContent;
  if (address && address !== 'Not selected' && address !== 'Searching...' && address !== 'Determining address...' && address !== 'No address found in Vietnam.' && address !== 'Connection error during search.') {
    document.getElementById('edit-address').value = address;
  }
  closeMapPicker();
}

// Expose map functions globally
window.openMapPicker = openMapPicker;
window.closeMapPicker = closeMapPicker;
window.searchAddressOnMap = searchAddressOnMap;
window.confirmMapSelection = confirmMapSelection;

/* ==================== ADVANCED SEARCH & VOICE SEARCH LOGIC ==================== */
function initAdvancedSearch() {
  var searchInput = document.getElementById('filter-search');
  var voiceBtn = document.getElementById('voice-search-btn');
  var dropdown = document.getElementById('search-suggestions-dropdown');
  if (!searchInput) return;

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

  function showSuggestions() {
    if (!dropdown) return;

    var history = [];
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.profile && AI_REC_SYSTEM.profile.history) {
      history = AI_REC_SYSTEM.profile.history;
    }

    var html = '';

    var keywords = [];
    if (typeof AI_REC_SYSTEM !== 'undefined' && AI_REC_SYSTEM.profile && AI_REC_SYSTEM.profile.keywords) {
      for (var kw in AI_REC_SYSTEM.profile.keywords) {
        if (AI_REC_SYSTEM.profile.keywords[kw] > 0) {
          keywords.push({ kw: kw, weight: AI_REC_SYSTEM.profile.keywords[kw] });
        }
      }
      keywords.sort(function(a, b) { return b.weight - a.weight; });
    }

    if (history.length > 0) {
      html += '<div class="suggestion-group-title">Based on your recent clicks</div>';

      var seenProds = {};
      var count = 0;
      for (var i = 0; i < history.length && count < 4; i++) {
        var hItem = history[i];
        if (seenProds[hItem.productId]) continue;
        seenProds[hItem.productId] = true;
        count++;

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

    if (keywords.length > 0) {
      html += '<div class="suggestion-group-title">Suggested Searches</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;padding:0.4rem 1rem 0.6rem 1rem">';
      var maxKeywords = Math.min(6, keywords.length);
      for (var i = 0; i < maxKeywords; i++) {
        html += '<span class="suggestion-tag" data-val="' + keywords[i].kw + '">' + keywords[i].kw + '</span>';
      }
      html += '</div>';
    }

    if (!html) {
      html += '<div style="padding:1rem;text-align:center;font-size:0.85rem;color:var(--text-muted)">Type to search or browse categories below</div>';
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    var prodItems = dropdown.querySelectorAll('.product-suggestion');
    prodItems.forEach(function(el) {
      el.addEventListener('click', function() {
        var pId = this.getAttribute('data-id');
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
        if (typeof AI_REC_SYSTEM !== 'undefined') {
          AI_REC_SYSTEM.trackSearch(val);
        }
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


/* ==================== ORDER HISTORY PAGE ==================== */
function initOrdersPage() {
  var user = RefashionAuth._getUser();
  if (!user) { window.location.href = '/auth/login.html?redirect=/buyer/orders.html'; return; }
  renderNavbar('navbar-container');
  renderFooter('footer-container');
  renderOrders('all');
}

function renderOrders(activeTab) {
  activeTab = activeTab || 'all';
  window.buyerActiveTab = activeTab;
  var user = RefashionAuth._getUser();
  var container = document.getElementById('orders-content');
  if (!user || !container) return;

  var orders = RefashionAuth._getOrders();
  
  // Calculate counts for badges
  var allCount = orders.length;
  var pendingCount = orders.filter(function(o) { return o.status === 'pending'; }).length;
  var packedCount = orders.filter(function(o) { return o.status === 'confirmed' || o.status === 'packed'; }).length;
  var shippingCount = orders.filter(function(o) { return o.status === 'shipping'; }).length;
  var completedCount = orders.filter(function(o) { return o.status === 'completed' || o.status === 'delivered'; }).length;
  var cancelledCount = orders.filter(function(o) { return o.status === 'cancelled'; }).length;

  // Filter orders based on activeTab
  var filteredOrders = [];
  if (activeTab === 'all') {
    filteredOrders = orders;
  } else if (activeTab === 'pending') {
    filteredOrders = orders.filter(function(o) { return o.status === 'pending'; });
  } else if (activeTab === 'packed') {
    filteredOrders = orders.filter(function(o) { return o.status === 'confirmed' || o.status === 'packed'; });
  } else if (activeTab === 'shipping') {
    filteredOrders = orders.filter(function(o) { return o.status === 'shipping'; });
  } else if (activeTab === 'completed') {
    filteredOrders = orders.filter(function(o) { return o.status === 'completed' || o.status === 'delivered'; });
  } else if (activeTab === 'cancelled') {
    filteredOrders = orders.filter(function(o) { return o.status === 'cancelled'; });
  }

  var tabsHtml = 
    '<div class="orders-tabs">' +
      '<div class="order-tab ' + (activeTab === 'all' ? 'active' : '') + '" onclick="changeOrderTab(\'all\')">' +
        'All <span class="tab-badge">' + allCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'pending' ? 'active' : '') + '" onclick="changeOrderTab(\'pending\')">' +
        'Pending <span class="tab-badge">' + pendingCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'packed' ? 'active' : '') + '" onclick="changeOrderTab(\'packed\')">' +
        'Awaiting Pickup <span class="tab-badge">' + packedCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'shipping' ? 'active' : '') + '" onclick="changeOrderTab(\'shipping\')">' +
        'Shipping <span class="tab-badge">' + shippingCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'completed' ? 'active' : '') + '" onclick="changeOrderTab(\'completed\')">' +
        'Delivered <span class="tab-badge">' + completedCount + '</span>' +
      '</div>' +
      '<div class="order-tab ' + (activeTab === 'cancelled' ? 'active' : '') + '" onclick="changeOrderTab(\'cancelled\')">' +
        'Cancelled <span class="tab-badge">' + cancelledCount + '</span>' +
      '</div>' +
    '</div>';

  var ordersHtml = '';
  if (filteredOrders.length > 0) {
    for (var i = 0; i < filteredOrders.length; i++) {
      var o = filteredOrders[i];
      var profStatusMap = {
        pending: { badge: 'var(--sentiment-neu-light)', color: 'var(--sentiment-neu)', text: 'Pending', icon: 'fa-clock' },
        confirmed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: 'Confirmed', icon: 'fa-circle-check' },
        packed: { badge: 'var(--primary-light)', color: 'var(--primary)', text: 'Awaiting Pickup', icon: 'fa-box' },
        shipping: { badge: 'var(--accent-light)', color: 'var(--accent)', text: 'Shipping', icon: 'fa-truck-fast' },
        completed: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: 'Completed', icon: 'fa-circle-check' },
        delivered: { badge: 'var(--sentiment-pos-light)', color: 'var(--sentiment-pos)', text: 'Delivered', icon: 'fa-circle-check' },
        cancelled: { badge: 'var(--danger-light)', color: 'var(--danger)', text: 'Cancelled', icon: 'fa-circle-xmark' },
        return_pending: { badge: 'rgba(217, 119, 6, 0.1)', color: '#d97706', text: 'Return Requested', icon: 'fa-triangle-exclamation' },
        disputed: { badge: 'rgba(198, 40, 40, 0.1)', color: '#c62828', text: 'Disputed (Admin Review)', icon: 'fa-circle-exclamation' },
        refunded: { badge: 'rgba(85, 122, 70, 0.1)', color: '#557A46', text: 'Refunded', icon: 'fa-arrow-rotate-left' }
      };
      var ps = profStatusMap[o.status] || profStatusMap.pending;
      var statusBadge = ps.badge;
      var statusColor = ps.color;
      var statusText = ps.text;
      var statusIcon = ps.icon;
      var firstItemId = (o.items && o.items.length > 0) ? o.items[0].id : '1';
      var itemsHtml = '';
      if (o.items) {
        for (var j = 0; j < o.items.length; j++) {
          var item = o.items[j];
          var iImage = item.image || '../images/placeholder.png';
          var iName = item.name || ('Sản phẩm ' + (item.productId || item.id || 'N/A'));
          var iQty = item.quantity || 1;
          var iPriceStr = item.priceStr || (item.price ? item.price.toLocaleString('vi-VN') + ' đ' : '0 đ');
          itemsHtml +=
            '<div onclick="goToDetail(\'' + (item.productId || item.id) + '\')" style="cursor:pointer;display:flex;align-items:center;gap:0.75rem;background-color:var(--card);padding:0.6rem 1rem;border-radius:12px;border:1px solid var(--border);transition:all 0.25s ease;" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.transform=\'translateY(-2px)\';" onmouseout="this.style.borderColor=\'var(--border)\';this.style.transform=\'none\';">' +
              '<img src="' + iImage + '" style="width:40px;height:40px;border-radius:8px;object-fit:cover" />' +
              '<div><p style="font-size:0.8rem;font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + iName + '</p><p style="font-size:0.72rem;color:var(--text-muted)">x' + iQty + ' \u2022 ' + iPriceStr + '</p></div>' +
            '</div>';
        }
      }

      var returnInfoHtml = '';
      if (o.status === 'return_pending' || o.status === 'disputed' || o.status === 'refunded') {
        returnInfoHtml = 
          '<div style="margin-top:0.75rem;padding:0.75rem 1rem;background:rgba(217,119,6,0.05);border-radius:12px;border:1px solid rgba(217,119,6,0.15);font-size:0.8rem;color:var(--text-muted);">' +
            '<div style="font-weight:700;color:#d97706;margin-bottom:0.25rem;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:0.35rem"></i>Return Request Details</div>' +
            '<div><strong>Reason:</strong> ' + (o.returnReason || 'N/A') + '</div>' +
            (o.returnDescription ? '<div><strong>Details:</strong> ' + o.returnDescription + '</div>' : '') +
          '</div>';
      }

      var actionButtonsHtml = '<button class="btn btn-outline" onclick="window.location.href=\'/buyer/order-tracking.html?order=' + o.id + '\'" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;border-color:var(--primary);color:var(--primary);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\';"><i class="fa-solid fa-truck" style="margin-right:0.3rem"></i>Track</button>';
      
      if (o.status === 'completed' || o.status === 'delivered') {
        actionButtonsHtml += '<button class="btn btn-outline" onclick="openReturnModal(\'' + o.id + '\')" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;border-color:#b91c1c;color:#b91c1c;margin-left:0.5rem;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background=\'#fef2f2\'" onmouseout="this.style.background=\'none\'"><i class="fa-solid fa-arrow-rotate-left" style="margin-right:0.3rem"></i>Return/Refund</button>';
      }
      
      actionButtonsHtml += '<button class="btn btn-primary" onclick="goToDetail(\'' + firstItemId + '\')" style="border-radius:8px;font-size:0.75rem;padding:6px 14px;height:auto;font-weight:700;background-color:var(--accent);border-color:var(--accent);color:var(--foreground);margin-left:0.5rem;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.opacity=\'0.85\'" onmouseout="this.style.opacity=\'1\';">Buy Again</button>';

      var safeDate = o.date || new Date(o.createdAt || Date.now()).toLocaleDateString('en-US');
      var safeTotalStr = o.totalStr || (o.total ? o.total.toLocaleString('vi-VN') + ' đ' : '0 đ');
      var safeGC = o.greenCoinEarned || 0;

      ordersHtml +=
        '<div style="background-color:var(--card); border-radius:20px; border:1px solid var(--border); padding:1.5rem; margin-bottom:1.25rem; box-shadow:0 4px 15px var(--shadow);">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem">' +
            '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap"><span style="font-weight:800;font-size:0.95rem;color:var(--primary)">#' + o.id + '</span><span style="font-size:0.8rem;color:var(--text-muted)"><i class="fa-solid fa-calendar" style="margin-right:0.3rem"></i>' + safeDate + '</span></div>' +
            '<div style="display:flex;gap:0.75rem;align-items:center"><span class="badge" style="background-color:' + statusBadge + ';color:' + statusColor + ';text-transform:none;font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;"><i class="fa-solid ' + statusIcon + '"></i>' + statusText + '</span><span style="font-weight:800;font-size:1.05rem;color:var(--accent)">' + safeTotalStr + '</span></div>' +
          '</div>' +
          '<div style="display:flex;gap:1rem;flex-wrap:wrap">' + itemsHtml + '</div>' +
          returnInfoHtml +
          '<div style="margin-top:1.25rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;border-top:1px dashed var(--border);padding-top:1rem">' +
            '<div style="display:flex;align-items:center;gap:0.35rem;font-size:0.8rem;color:var(--sentiment-pos)"><i class="fa-solid fa-leaf"></i><span>+' + safeGC + ' GreenCoin earned from this order</span></div>' +
            '<div style="display:flex;gap:0.5rem">' +
              actionButtonsHtml +
            '</div>' +
          '</div>' +
        '</div>';
    }
  } else {
    ordersHtml =
      '<div style="text-align:center;padding:4rem 2rem;color:var(--text-muted);background:var(--card);border-radius:20px;border:1px solid var(--border);">' +
        '<i class="fa-solid fa-receipt" style="font-size:3rem;margin-bottom:1rem;opacity:0.3"></i>' +
        '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">No orders yet</h3>' +
        '<p style="font-size:0.9rem;margin-bottom:1.5rem">You have no orders in this status.</p>' +
        '<a href="shop.html" class="btn btn-primary" style="border-radius:12px">Explore Shop</a>' +
      '</div>';
  }

  container.innerHTML =
    '<div class="orders-section-container" style="margin-top:2rem;">' +
      '<div class="section-header" style="margin-bottom:1.5rem;">' +
        '<div>' +
          '<span class="badge badge-primary" style="margin-bottom:0.5rem">Order History</span>' +
          '<h2 style="font-family:var(--font-serif);font-size:1.75rem;color:var(--primary)">My Orders</h2>' +
        '</div>' +
      '</div>' +
      tabsHtml +
      '<div style="display:flex;flex-direction:column;gap:0.75rem">' + ordersHtml + '</div>' +
    '</div>';
}

window.changeOrderTab = function(tabName) {
  renderOrders(tabName);
};

window.openReturnModal = function(orderId) {
  var modalId = 'return-refund-modal';
  var modal = document.getElementById(modalId);
  if (!modal) {
    modal = document.createElement('div');
    modal.id = modalId;
    modal.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 0.3s ease;';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = 
    '<div class="eco-card" style="width:100%;max-width:500px;background:var(--card);border-radius:28px;border:1px solid var(--border);padding:2rem;box-shadow:0 10px 30px var(--shadow);transform:scale(0.9);transition:transform 0.3s ease;position:relative;">' +
      '<button onclick="closeReturnModal()" style="position:absolute;top:1.25rem;right:1.25rem;background:none;border:none;color:var(--text-muted);font-size:1.25rem;cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>' +
      '<h3 style="font-family:var(--font-serif);font-size:1.5rem;color:var(--primary);margin-bottom:0.5rem">Yêu cầu Trả hàng / Hoàn tiền</h3>' +
      '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1.5rem">Đơn hàng: <strong>#' + orderId + '</strong>. Vui lòng điền thông tin khiếu nại của bạn.</p>' +
      
      '<div style="margin-bottom:1rem">' +
        '<label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Lý do trả hàng <span style="color:var(--danger)">*</span></label>' +
        '<select id="return-reason" class="input-editorial" style="width:100%;height:40px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--foreground);padding:0 0.75rem;font-size:0.85rem;">' +
          '<option value="Hàng lỗi/Hỏng do vận chuyển">Hàng lỗi / Hỏng do vận chuyển</option>' +
          '<option value="Sản phẩm sai kích thước/màu sắc">Sản phẩm sai kích thước / màu sắc</option>' +
          '<option value="Sản phẩm không đúng mô tả">Sản phẩm không đúng mô tả</option>' +
          '<option value="Hàng giả/nhái hoặc thiếu hàng">Hàng giả/nhái hoặc thiếu hàng</option>' +
          '<option value="Khác">Lý do khác</option>' +
        '</select>' +
      '</div>' +
      
      '<div style="margin-bottom:1rem">' +
        '<label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Mô tả chi tiết <span style="color:var(--danger)">*</span></label>' +
        '<textarea id="return-description" class="input-editorial" style="width:100%;height:100px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--foreground);padding:0.5rem 0.75rem;font-size:0.85rem;resize:none;" placeholder="Vui lòng mô tả rõ tình trạng sản phẩm..."></textarea>' +
      '</div>' +
      
      '<div style="margin-bottom:1.5rem">' +
        '<label style="display:block;font-size:0.8rem;font-weight:700;margin-bottom:0.5rem;color:var(--foreground)">Hình ảnh minh chứng (Mockup)</label>' +
        '<div style="border:2px dashed var(--border);border-radius:12px;padding:1.5rem;text-align:center;cursor:pointer;background:rgba(85,122,70,0.02);transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--primary)\';" onmouseout="this.style.borderColor=\'var(--border)\';" onclick="document.getElementById(\'return-file\').click()">' +
          '<i class="fa-regular fa-image" style="font-size:1.75rem;color:var(--primary);margin-bottom:0.5rem"></i>' +
          '<p style="font-size:0.75rem;color:var(--text-muted);margin:0">Nhấp để tải ảnh hoặc video minh chứng</p>' +
          '<input type="file" id="return-file" style="display:none" onchange="handleReturnFileSelect(event)" />' +
          '<div id="return-file-preview" style="margin-top:0.75rem;font-size:0.75rem;color:var(--primary);font-weight:700;display:none"></div>' +
        '</div>' +
      '</div>' +
      
      '<div style="display:flex;justify-content:flex-end;gap:0.75rem">' +
        '<button onclick="closeReturnModal()" class="btn btn-outline" style="border-radius:8px;font-size:0.75rem;padding:8px 16px;height:auto;">Hủy bỏ</button>' +
        '<button onclick="submitReturnRequest(\'' + orderId + '\')" class="btn btn-primary" style="border-radius:8px;font-size:0.75rem;padding:8px 16px;height:auto;background:var(--primary);border-color:var(--primary);color:#fff;">Gửi yêu cầu</button>' +
      '</div>' +
    '</div>';
    
  setTimeout(function() {
    modal.style.opacity = '1';
    modal.children[0].style.transform = 'scale(1)';
  }, 50);
};

window.closeReturnModal = function() {
  var modal = document.getElementById('return-refund-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.children[0].style.transform = 'scale(0.9)';
    setTimeout(function() {
      modal.remove();
    }, 300);
  }
};

window.handleReturnFileSelect = function(e) {
  var file = e.target.files[0];
  var preview = document.getElementById('return-file-preview');
  if (file && preview) {
    preview.innerText = '✓ Đã chọn file: ' + file.name;
    preview.style.display = 'block';
  }
};

window.submitReturnRequest = function(orderId) {
  var reason = document.getElementById('return-reason').value;
  var description = document.getElementById('return-description').value.trim();
  if (!description) {
    alert('Vui lòng nhập mô tả chi tiết lý do trả hàng.');
    return;
  }
  
  var allOrders = JSON.parse(localStorage.getItem('refashion_shared_orders') || '[]');
  var orderFound = false;
  for (var i = 0; i < allOrders.length; i++) {
    if (allOrders[i].id === orderId) {
      allOrders[i].status = 'return_pending';
      allOrders[i].returnReason = reason;
      allOrders[i].returnDescription = description;
      allOrders[i].returnEvidence = '/images/sh_denim_shirt.png';
      orderFound = true;
      break;
    }
  }
  
  if (orderFound) {
    localStorage.setItem('refashion_shared_orders', JSON.stringify(allOrders));
    alert('Yêu cầu Trả hàng / Hoàn tiền đã được gửi đi thành công!');
    closeReturnModal();
    renderOrders('all');
  } else {
    alert('Không tìm thấy đơn hàng #' + orderId);
  }
};

// Start polling for shared orders updates
(function() {
  var lastOrdersState = localStorage.getItem('refashion_shared_orders');
  setInterval(function() {
    var currentOrdersState = localStorage.getItem('refashion_shared_orders');
    if (currentOrdersState !== lastOrdersState) {
      lastOrdersState = currentOrdersState;
      if (typeof renderOrders === 'function') {
        renderOrders(window.buyerActiveTab || 'all');
      }
    }
  }, 3000);
})();


/* ==================== BUYER FLOATING CHAT WIDGET ==================== */
function initBuyerChatWidget() {
  // 1. Add Styles
  var style = document.createElement('style');
  style.innerHTML = `
    .buyer-chat-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      cursor: pointer;
      z-index: 99999;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .buyer-chat-trigger:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
    }
    .buyer-chat-trigger:active {
      transform: scale(0.95);
    }
    .buyer-chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 500px;
      max-height: calc(100vh - 120px);
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .buyer-chat-header {
      padding: 14px 16px;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .buyer-chat-header .header-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .buyer-chat-header img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: white;
    }
    .buyer-chat-header .title-wrap {
      display: flex;
      flex-direction: column;
    }
    .buyer-chat-header .store-name {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .buyer-chat-header .store-status {
      font-size: 0.75rem;
      opacity: 0.85;
    }
    .buyer-chat-header .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .buyer-chat-header .close-btn:hover {
      opacity: 1;
    }
    .buyer-chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #f8fafc;
    }
    .buyer-chat-store-list {
      padding: 8px 0;
    }
    .buyer-chat-store-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .buyer-chat-store-item:hover {
      background: #f1f5f9;
    }
    .buyer-chat-store-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    .buyer-chat-store-item .store-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .buyer-chat-store-item .store-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .buyer-chat-store-item .store-item-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .buyer-chat-store-item .store-item-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .buyer-chat-store-item .store-item-msg {
      font-size: 0.8rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .buyer-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .buyer-chat-msg {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.4;
      word-break: break-word;
    }
    .buyer-chat-msg.incoming {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .buyer-chat-msg.outgoing {
      align-self: flex-end;
      background: #16a34a;
      color: white;
      border-bottom-right-radius: 2px;
    }
    .buyer-chat-msg-time {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 4px;
      text-align: right;
    }
    .buyer-chat-msg.outgoing .buyer-chat-msg-time {
      color: rgba(255,255,255,0.7);
    }
    .buyer-chat-footer {
      padding: 12px 16px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .buyer-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .buyer-chat-input:focus {
      border-color: #16a34a;
    }
    .buyer-chat-send-btn {
      background: #16a34a;
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .buyer-chat-send-btn:hover {
      transform: scale(1.05);
      background: #15803d;
    }
    .buyer-chat-send-btn:active {
      transform: scale(0.95);
    }
    .buyer-chat-login-notice {
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }
    .buyer-chat-login-notice p {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .buyer-chat-login-notice a {
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .buyer-chat-login-notice a:hover {
      background: #15803d;
    }
  `;
  document.body.appendChild(style);

  // 2. Add DOM elements
  var trigger = document.createElement('div');
  trigger.className = 'buyer-chat-trigger';
  trigger.innerHTML = '<i class="fa-solid fa-comments"></i>';
  document.body.appendChild(trigger);

  var panel = document.createElement('div');
  panel.className = 'buyer-chat-panel';
  panel.id = 'buyer-chat-panel';
  document.body.appendChild(panel);

  var activeStoreName = null;

  function renderPanelContent() {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">ReFashion Chat</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-login-notice">
            <p>Vui lòng đăng nhập tài khoản Buyer để bắt đầu trò chuyện với các Cửa hàng trên ReFashion.</p>
            <a href="/auth/login.html">Đăng nhập ngay</a>
          </div>
        </div>
      `;
      return;
    }

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var buyerName = user.name || "Nguyễn Văn A";

    if (activeStoreName) {
      var conv = conversations.find(function(c) {
        return c.store === activeStoreName && c.buyer.name === buyerName;
      });

      if (!conv) {
        var storeLogo = '../images/store_eco_wear.png';
        if (activeStoreName === 'Denim Craft') storeLogo = '../images/store_denim_craft.png';
        else if (activeStoreName === 'Hemp & Bamboo') storeLogo = '../images/store_hemp_bamboo.png';
        else if (activeStoreName === 'Retro Chic') storeLogo = '../images/store_retro_chic.png';
        else if (activeStoreName === 'Green Thread') storeLogo = '../images/store_green_thread.png';
        else if (activeStoreName === 'Zero Waste') storeLogo = '../images/store_zero_waste.png';

        conv = {
          id: 'conv_' + Date.now(),
          buyer: { name: buyerName, avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(buyerName) + '&background=0F172A&color=fff' },
          store: activeStoreName,
          storeLogo: storeLogo,
          lastMessage: '',
          lastTime: new Date().toISOString(),
          unread: 0,
          status: 'active',
          messages: []
        };
        conversations.push(conv);
        localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      }

      conv.unread = 0;

      var messagesHtml = conv.messages.map(function(m) {
        var cls = m.sender === 'buyer' ? 'outgoing' : 'incoming';
        var timeStr = '';
        try {
          var d = new Date(m.time);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-msg ${cls}">
            <div>${escHtml(m.text)}</div>
            <div class="buyer-chat-msg-time">${timeStr}</div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info" onclick="window.backToStoreList()">
            <i class="fa-solid fa-chevron-left" style="margin-right: 4px; font-size: 0.85rem;"></i>
            <img src="${conv.storeLogo}" alt="Logo">
            <div class="title-wrap">
              <span class="store-name">${conv.store}</span>
              <span class="store-status">Đang hoạt động</span>
            </div>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body" id="buyer-chat-messages-container">
          <div class="buyer-chat-messages">
            ${messagesHtml || '<div style="text-align:center;padding:24px;color:#94a3b8;font-size:0.8rem;">Bắt đầu cuộc trò chuyện của bạn!</div>'}
          </div>
        </div>
        <div class="buyer-chat-footer">
          <input type="text" class="buyer-chat-input" id="buyer-chat-input-field" placeholder="Nhập tin nhắn..." onkeydown="handleBuyerChatKeyDown(event)">
          <button class="buyer-chat-send-btn" onclick="submitBuyerChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      `;

      var msgBody = document.getElementById('buyer-chat-messages-container');
      if (msgBody) {
        msgBody.scrollTop = msgBody.scrollHeight;
      }

      var inputField = document.getElementById('buyer-chat-input-field');
      if (inputField) inputField.focus();

    } else {
      var myConvs = conversations.filter(function(c) {
        return c.buyer.name === buyerName;
      });

      var storesHtml = myConvs.map(function(c) {
        var timeStr = '';
        try {
          var d = new Date(c.lastTime);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-store-item" onclick="window.openBuyerChatWithStore('${c.store}')">
            <img src="${c.storeLogo}" alt="Logo">
            <div class="store-item-info">
              <div class="store-item-header">
                <span class="store-item-name">${c.store}</span>
                <span class="store-item-time">${timeStr}</span>
              </div>
              <div class="store-item-msg">${escHtml(c.lastMessage || 'Chưa có tin nhắn')}</div>
            </div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">Tin nhắn Cửa hàng</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-store-list">
            ${storesHtml || '<div style="text-align:center;padding:48px 24px;color:#94a3b8;font-size:0.85rem;">Bạn chưa có cuộc hội thoại nào. Hãy ghé thăm các Cửa hàng để bắt đầu chat nhé!</div>'}
          </div>
        </div>
      `;
    }
  }

  window.toggleBuyerChatPanel = function() {
    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'flex';
      renderPanelContent();
    }
  };

  window.openBuyerChatWithStore = function(storeName) {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.style.display = 'flex';
      renderPanelContent();
      return;
    }
    activeStoreName = storeName;
    panel.style.display = 'flex';
    renderPanelContent();
  };

  window.backToStoreList = function() {
    activeStoreName = null;
    renderPanelContent();
  };

  window.submitBuyerChatMessage = function() {
    var input = document.getElementById('buyer-chat-input-field');
    if (!input || !input.value.trim() || !activeStoreName) return;
    var text = input.value.trim();
    input.value = '';

    var user = RefashionAuth._getUser();
    var buyerName = user ? user.name : "Nguyễn Văn A";

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var conv = conversations.find(function(c) {
      return c.store === activeStoreName && c.buyer.name === buyerName;
    });

    if (conv) {
      var nowStr = new Date().toISOString();
      conv.messages.push({ sender: 'buyer', text: text, time: nowStr });
      conv.lastMessage = text;
      conv.lastTime = nowStr;
      
      localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      renderPanelContent();
    }
  };

  window.handleBuyerChatKeyDown = function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitBuyerChatMessage();
    }
  };

  trigger.addEventListener('click', toggleBuyerChatPanel);

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var lastChatState = localStorage.getItem('refashion_shared_chats');
  setInterval(function() {
    var currentChatState = localStorage.getItem('refashion_shared_chats');
    if (currentChatState !== lastChatState) {
      lastChatState = currentChatState;
      if (panel.style.display === 'flex') {
        var activeInput = document.activeElement;
        var hadFocus = activeInput && activeInput.id === 'buyer-chat-input-field';
        var textVal = hadFocus ? activeInput.value : '';

        renderPanelContent();

        if (hadFocus) {
          var newInput = document.getElementById('buyer-chat-input-field');
          if (newInput) {
            newInput.value = textVal;
            newInput.focus();
          }
        }
      }
    }
  }, 3000);
}


/* ==================== BUYER FLOATING CHAT WIDGET ==================== */
function initBuyerChatWidget() {
  // 1. Add Styles
  var style = document.createElement('style');
  style.innerHTML = `
    .buyer-chat-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      cursor: pointer;
      z-index: 99999;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .buyer-chat-trigger:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.4);
    }
    .buyer-chat-trigger:active {
      transform: scale(0.95);
    }
    .buyer-chat-panel {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 500px;
      max-height: calc(100vh - 120px);
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .buyer-chat-header {
      padding: 14px 16px;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .buyer-chat-header .header-info {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .buyer-chat-header img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: white;
    }
    .buyer-chat-header .title-wrap {
      display: flex;
      flex-direction: column;
    }
    .buyer-chat-header .store-name {
      font-weight: 700;
      font-size: 0.95rem;
    }
    .buyer-chat-header .store-status {
      font-size: 0.75rem;
      opacity: 0.85;
    }
    .buyer-chat-header .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .buyer-chat-header .close-btn:hover {
      opacity: 1;
    }
    .buyer-chat-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #f8fafc;
    }
    .buyer-chat-store-list {
      padding: 8px 0;
    }
    .buyer-chat-store-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid #f1f5f9;
    }
    .buyer-chat-store-item:hover {
      background: #f1f5f9;
    }
    .buyer-chat-store-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    .buyer-chat-store-item .store-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .buyer-chat-store-item .store-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .buyer-chat-store-item .store-item-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }
    .buyer-chat-store-item .store-item-time {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .buyer-chat-store-item .store-item-msg {
      font-size: 0.8rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .buyer-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .buyer-chat-msg {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.85rem;
      line-height: 1.4;
      word-break: break-word;
    }
    .buyer-chat-msg.incoming {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .buyer-chat-msg.outgoing {
      align-self: flex-end;
      background: #16a34a;
      color: white;
      border-bottom-right-radius: 2px;
    }
    .buyer-chat-msg-time {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 4px;
      text-align: right;
    }
    .buyer-chat-msg.outgoing .buyer-chat-msg-time {
      color: rgba(255,255,255,0.7);
    }
    .buyer-chat-footer {
      padding: 12px 16px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .buyer-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 8px 16px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .buyer-chat-input:focus {
      border-color: #16a34a;
    }
    .buyer-chat-send-btn {
      background: #16a34a;
      color: white;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .buyer-chat-send-btn:hover {
      transform: scale(1.05);
      background: #15803d;
    }
    .buyer-chat-send-btn:active {
      transform: scale(0.95);
    }
    .buyer-chat-login-notice {
      padding: 32px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }
    .buyer-chat-login-notice p {
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }
    .buyer-chat-login-notice a {
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
    }
    .buyer-chat-login-notice a:hover {
      background: #15803d;
    }
  `;
  document.body.appendChild(style);

  // 2. Add DOM elements
  var trigger = document.createElement('div');
  trigger.className = 'buyer-chat-trigger';
  trigger.innerHTML = '<i class="fa-solid fa-comments"></i>';
  document.body.appendChild(trigger);

  var panel = document.createElement('div');
  panel.className = 'buyer-chat-panel';
  panel.id = 'buyer-chat-panel';
  document.body.appendChild(panel);

  var activeStoreName = null;

  function renderPanelContent() {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">ReFashion Chat</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-login-notice">
            <p>Vui lòng đăng nhập tài khoản Buyer để bắt đầu trò chuyện với các Cửa hàng trên ReFashion.</p>
            <a href="/auth/login.html">Đăng nhập ngay</a>
          </div>
        </div>
      `;
      return;
    }

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var buyerName = user.name || "Nguyễn Văn A";

    if (activeStoreName) {
      var conv = conversations.find(function(c) {
        return c.store === activeStoreName && c.buyer.name === buyerName;
      });

      if (!conv) {
        var storeLogo = '../images/store_eco_wear.png';
        if (activeStoreName === 'Denim Craft') storeLogo = '../images/store_denim_craft.png';
        else if (activeStoreName === 'Hemp & Bamboo') storeLogo = '../images/store_hemp_bamboo.png';
        else if (activeStoreName === 'Retro Chic') storeLogo = '../images/store_retro_chic.png';
        else if (activeStoreName === 'Green Thread') storeLogo = '../images/store_green_thread.png';
        else if (activeStoreName === 'Zero Waste') storeLogo = '../images/store_zero_waste.png';

        conv = {
          id: 'conv_' + Date.now(),
          buyer: { name: buyerName, avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(buyerName) + '&background=0F172A&color=fff' },
          store: activeStoreName,
          storeLogo: storeLogo,
          lastMessage: '',
          lastTime: new Date().toISOString(),
          unread: 0,
          status: 'active',
          messages: []
        };
        conversations.push(conv);
        localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      }

      conv.unread = 0;

      var messagesHtml = conv.messages.map(function(m) {
        var cls = m.sender === 'buyer' ? 'outgoing' : 'incoming';
        var timeStr = '';
        try {
          var d = new Date(m.time);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-msg ${cls}">
            <div>${escHtml(m.text)}</div>
            <div class="buyer-chat-msg-time">${timeStr}</div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info" onclick="window.backToStoreList()">
            <i class="fa-solid fa-chevron-left" style="margin-right: 4px; font-size: 0.85rem;"></i>
            <img src="${conv.storeLogo}" alt="Logo">
            <div class="title-wrap">
              <span class="store-name">${conv.store}</span>
              <span class="store-status">Đang hoạt động</span>
            </div>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body" id="buyer-chat-messages-container">
          <div class="buyer-chat-messages">
            ${messagesHtml || '<div style="text-align:center;padding:24px;color:#94a3b8;font-size:0.8rem;">Bắt đầu cuộc trò chuyện của bạn!</div>'}
          </div>
        </div>
        <div class="buyer-chat-footer">
          <input type="text" class="buyer-chat-input" id="buyer-chat-input-field" placeholder="Nhập tin nhắn..." onkeydown="handleBuyerChatKeyDown(event)">
          <button class="buyer-chat-send-btn" onclick="submitBuyerChatMessage()"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      `;

      var msgBody = document.getElementById('buyer-chat-messages-container');
      if (msgBody) {
        msgBody.scrollTop = msgBody.scrollHeight;
      }

      var inputField = document.getElementById('buyer-chat-input-field');
      if (inputField) inputField.focus();

    } else {
      var myConvs = conversations.filter(function(c) {
        return c.buyer.name === buyerName;
      });

      var storesHtml = myConvs.map(function(c) {
        var timeStr = '';
        try {
          var d = new Date(c.lastTime);
          timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
        } catch(e) {}
        return `
          <div class="buyer-chat-store-item" onclick="window.openBuyerChatWithStore('${c.store}')">
            <img src="${c.storeLogo}" alt="Logo">
            <div class="store-item-info">
              <div class="store-item-header">
                <span class="store-item-name">${c.store}</span>
                <span class="store-item-time">${timeStr}</span>
              </div>
              <div class="store-item-msg">${escHtml(c.lastMessage || 'Chưa có tin nhắn')}</div>
            </div>
          </div>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="buyer-chat-header">
          <div class="header-info">
            <span class="store-name">Tin nhắn Cửa hàng</span>
          </div>
          <button class="close-btn" onclick="toggleBuyerChatPanel()">&times;</button>
        </div>
        <div class="buyer-chat-body">
          <div class="buyer-chat-store-list">
            ${storesHtml || '<div style="text-align:center;padding:48px 24px;color:#94a3b8;font-size:0.85rem;">Bạn chưa có cuộc hội thoại nào. Hãy ghé thăm các Cửa hàng để bắt đầu chat nhé!</div>'}
          </div>
        </div>
      `;
    }
  }

  window.toggleBuyerChatPanel = function() {
    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'flex';
      renderPanelContent();
    }
  };

  window.openBuyerChatWithStore = function(storeName) {
    var user = RefashionAuth._getUser();
    if (!user) {
      panel.style.display = 'flex';
      renderPanelContent();
      return;
    }
    activeStoreName = storeName;
    panel.style.display = 'flex';
    renderPanelContent();
  };

  window.backToStoreList = function() {
    activeStoreName = null;
    renderPanelContent();
  };

  window.submitBuyerChatMessage = function() {
    var input = document.getElementById('buyer-chat-input-field');
    if (!input || !input.value.trim() || !activeStoreName) return;
    var text = input.value.trim();
    input.value = '';

    var user = RefashionAuth._getUser();
    var buyerName = user ? user.name : "Nguyễn Văn A";

    var local = localStorage.getItem('refashion_shared_chats');
    var conversations = [];
    try { conversations = JSON.parse(local) || []; } catch(e) {}

    var conv = conversations.find(function(c) {
      return c.store === activeStoreName && c.buyer.name === buyerName;
    });

    if (conv) {
      var nowStr = new Date().toISOString();
      conv.messages.push({ sender: 'buyer', text: text, time: nowStr });
      conv.lastMessage = text;
      conv.lastTime = nowStr;
      
      localStorage.setItem('refashion_shared_chats', JSON.stringify(conversations));
      renderPanelContent();
    }
  };

  window.handleBuyerChatKeyDown = function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitBuyerChatMessage();
    }
  };

  trigger.addEventListener('click', toggleBuyerChatPanel);

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var lastChatState = localStorage.getItem('refashion_shared_chats');
  setInterval(function() {
    var currentChatState = localStorage.getItem('refashion_shared_chats');
    if (currentChatState !== lastChatState) {
      lastChatState = currentChatState;
      if (panel.style.display === 'flex') {
        var activeInput = document.activeElement;
        var hadFocus = activeInput && activeInput.id === 'buyer-chat-input-field';
        var textVal = hadFocus ? activeInput.value : '';

        renderPanelContent();

        if (hadFocus) {
          var newInput = document.getElementById('buyer-chat-input-field');
          if (newInput) {
            newInput.value = textVal;
            newInput.focus();
          }
        }
      }
    }
  }, 3000);
}
