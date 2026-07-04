var MOCK_ACCOUNTS = [];

var _basePath = (function() {
  var path = window.location.pathname;
  var depth = (path.match(/\//g) || []).length - 1;
  return depth === 0 ? './' : '../'.repeat(depth);
})();

function ajaxGetJSON(url, onSuccess, onError) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== XMLHttpRequest.DONE) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      try { onSuccess(JSON.parse(xhr.responseText)); }
      catch (e) { onError(e); }
    } else {
      onError(new Error('AJAX Error ' + xhr.status + ': ' + url));
    }
  };
  xhr.onerror = function () { onError(new Error('Network error loading: ' + url)); };
  xhr.send();
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('sessionUser')); }
  catch(e) { return null; }
}
function setSession(email, role) {
  localStorage.setItem('sessionUser', JSON.stringify({ email: email, role: role }));
}
function clearSession() {
  localStorage.removeItem('sessionUser');
}

var RefashionAuth = {
  _getUser: function() {
    try { return JSON.parse(localStorage.getItem('refashion_current_user')); }
    catch(e) { return null; }
  },
  _saveUser: function(user) {
    localStorage.setItem('refashion_current_user', JSON.stringify(user));
  },
  _removeUser: function() {
    localStorage.removeItem('refashion_current_user');
  },
  _getCart: function() {
    try { return JSON.parse(localStorage.getItem('refashion_cart')) || []; }
    catch(e) { return []; }
  },
  _saveCart: function(cart) {
    localStorage.setItem('refashion_cart', JSON.stringify(cart));
  },
  _getOrders: function() {
    try { return JSON.parse(localStorage.getItem('refashion_orders')) || []; }
    catch(e) { return []; }
  },
  _saveOrders: function(orders) {
    localStorage.setItem('refashion_orders', JSON.stringify(orders));
  },
  _getDonations: function() {
    try { return JSON.parse(localStorage.getItem('refashion_donations')) || []; }
    catch(e) { return []; }
  },
  _saveDonations: function(d) {
    localStorage.setItem('refashion_donations', JSON.stringify(d));
  },
  _getVouchers: function() {
    try { return JSON.parse(localStorage.getItem('refashion_vouchers')) || []; }
    catch(e) { return []; }
  },
  _saveVouchers: function(v) {
    localStorage.setItem('refashion_vouchers', JSON.stringify(v));
  },
  _getUsers: function() {
    try { return JSON.parse(localStorage.getItem('refashion_users')) || []; }
    catch(e) { return []; }
  },
  _saveUsers: function(u) {
    localStorage.setItem('refashion_users', JSON.stringify(u));
  },

  get user() { return this._getUser(); },
  get isLoggedIn() { return !!this._getUser(); },
  get cart() { return this._getCart(); },
  get orders() { return this._getOrders(); },
  get donations() { return this._getDonations(); },
  get vouchers() { return this._getVouchers(); },

  login: function(email, password) {
    var account = null;
    for (var i = 0; i < MOCK_ACCOUNTS.length; i++) {
      if (MOCK_ACCOUNTS[i].email.toLowerCase() === email.toLowerCase().trim() && MOCK_ACCOUNTS[i].password === password) {
        account = MOCK_ACCOUNTS[i];
        break;
      }
    }
    if (account) {
      var userData = {
        username: account.name || account.email.split('@')[0],
        email: account.email,
        phone: '',
        joinDate: new Date().toLocaleDateString('vi-VN'),
        greenCoin: 100,
        role: account.role,
        redirect: account.redirect,
        store: account.store || '',
        storeLogo: account.storeLogo || ''
      };
      this._saveUser(userData);
      setSession(account.email, account.role);
      return userData;
    }
    if (email === 'refashion@gmail.com' && password === '1234567890@Abc') {
      var demoUser = {
        username: 'ReFashion Demo',
        email: 'refashion@gmail.com',
        phone: '0912 345 678',
        joinDate: '01/01/2026',
        greenCoin: 500,
        role: 'Buyer'
      };
      this._saveUser(demoUser);
      setSession(demoUser.email, demoUser.role);
      return demoUser;
    }
    var users = this._getUsers();
    for (var j = 0; j < users.length; j++) {
      if (users[j].email === email && users[j].password === password) {
        var regUser = {
          username: users[j].username,
          email: users[j].email,
          phone: users[j].phone || '',
          joinDate: users[j].joinDate || new Date().toLocaleDateString('vi-VN'),
          greenCoin: users[j].greenCoin || 100,
          role: 'Buyer'
        };
        this._saveUser(regUser);
        setSession(regUser.email, regUser.role);
        return regUser;
      }
    }
    return null;
  },

  logout: function() {
    localStorage.removeItem('refashion_current_user');
    clearSession();
    window.location.href = '/auth/login.html';
  },

  getCartCount: function() {
    var cart = this._getCart();
    return cart.reduce(function(sum, c) { return sum + c.quantity; }, 0);
  },

  getCartTotal: function() {
    var cart = this._getCart();
    return cart.reduce(function(sum, c) { return sum + c.price * c.quantity; }, 0);
  },

  addToCart: function(item) {
    var cart = this._getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === item.productId && cart[i].variant === item.variant) {
        existing = cart[i];
        break;
      }
    }
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId: item.productId, name: item.name, price: item.price, priceStr: item.priceStr, image: item.image, variant: item.variant || 'Tiêu chuẩn', quantity: 1 });
    }
    this._saveCart(cart);
    return cart;
  },

  removeFromCart: function(productId, variant) {
    var cart = this._getCart();
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
      if (!(cart[i].productId === productId && cart[i].variant === (variant || 'Tiêu chuẩn'))) {
        newCart.push(cart[i]);
      }
    }
    this._saveCart(newCart);
    return newCart;
  },

  updateCartQuantity: function(productId, variant, quantity) {
    var cart = this._getCart();
    if (quantity <= 0) {
      return this.removeFromCart(productId, variant);
    }
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].productId === productId && cart[i].variant === (variant || 'Tiêu chuẩn')) {
        cart[i].quantity = quantity;
        break;
      }
    }
    this._saveCart(cart);
    return cart;
  },

  clearCart: function() {
    this._saveCart([]);
  },

  placeOrderWithDetails: function(params) {
    var user = this._getUser();
    if (params.items.length === 0 || !user) return null;
    var subtotal = params.items.reduce(function(sum, c) { return sum + c.price * c.quantity; }, 0);
    var discountAmount = Math.floor(subtotal * (params.discountPercent || 0) / 100);
    var total = subtotal - discountAmount;
    var greenCoinEarned = Math.floor(total / 100000) * 5;
    var orderId = 'RF-' + Date.now().toString(36).toUpperCase();
    var order = {
      id: orderId,
      items: JSON.parse(JSON.stringify(params.items)),
      total: total,
      totalStr: total.toLocaleString('vi-VN') + ' \u0111',
      greenCoinEarned: greenCoinEarned,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'pending',
      phone: params.phone || '',
      address: params.address || '',
      note: params.note || ''
    };
    var orders = this._getOrders();
    orders.unshift(order);
    this._saveOrders(orders);
    user.greenCoin = (user.greenCoin || 0) + greenCoinEarned;
    this._saveUser(user);
    if (params.voucherCode) {
      var vouchers = this._getVouchers();
      for (var i = 0; i < vouchers.length; i++) {
        if (vouchers[i].code === params.voucherCode) {
          vouchers[i].isUsed = true;
          break;
        }
      }
      this._saveVouchers(vouchers);
    }
    var cart = this._getCart();
    var orderedIds = {};
    for (var i = 0; i < params.items.length; i++) orderedIds[params.items[i].productId] = true;
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
      if (!orderedIds[cart[i].productId]) newCart.push(cart[i]);
    }
    this._saveCart(newCart);
    return order;
  },

  addDonation: function(donation) {
    var coinEarned = donation.quantity * 15;
    var record = {
      id: 'DON-' + Date.now().toString(36).toUpperCase(),
      clothingType: donation.clothingType,
      quantity: donation.quantity,
      condition: donation.condition,
      address: donation.address,
      coinEarned: coinEarned,
      date: new Date().toLocaleDateString('vi-VN')
    };
    var donations = this._getDonations();
    donations.unshift(record);
    this._saveDonations(donations);
    var user = this._getUser();
    if (user) {
      user.greenCoin = (user.greenCoin || 0) + coinEarned;
      this._saveUser(user);
    }
    return coinEarned;
  },

  spendGreenCoin: function(amount) {
    var user = this._getUser();
    if (!user || (user.greenCoin || 0) < amount) return false;
    user.greenCoin -= amount;
    this._saveUser(user);
    return true;
  },

  redeemVoucher: function(cost, discount, description) {
    var user = this._getUser();
    if (!user || (user.greenCoin || 0) < cost) return null;
    var code = 'RF' + discount + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    var expires = new Date();
    expires.setDate(expires.getDate() + 30);
    var voucher = {
      id: 'V-' + Date.now().toString(36).toUpperCase(),
      code: code,
      discount: discount,
      description: description,
      expiresAt: expires.toLocaleDateString('vi-VN'),
      isUsed: false
    };
    var vouchers = this._getVouchers();
    vouchers.unshift(voucher);
    this._saveVouchers(vouchers);
    user.greenCoin -= cost;
    this._saveUser(user);
    return voucher;
  },

  applyVoucher: function(code) {
    var vouchers = this._getVouchers();
    for (var i = 0; i < vouchers.length; i++) {
      if (vouchers[i].code.toUpperCase() === code.toUpperCase() && !vouchers[i].isUsed) {
        return vouchers[i];
      }
    }
    return null;
  },

  markVoucherUsed: function(code) {
    var vouchers = this._getVouchers();
    for (var i = 0; i < vouchers.length; i++) {
      if (vouchers[i].code.toUpperCase() === code.toUpperCase()) {
        vouchers[i].isUsed = true;
        break;
      }
    }
    this._saveVouchers(vouchers);
  }
};

var SHOP_PRODUCTS = [
  { id: '1', name: 'Áo Khoác Gió Tái Chế', category: 'jacket', price: 1250000, priceStr: '1,250,000 đ', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600', sentimentScore: 73, ratingCount: 12, store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
  { id: '2', name: 'Balo Tái Chế 30L', category: 'backpack', price: 1890000, priceStr: '1,890,000 đ', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600', sentimentScore: 88, ratingCount: 12, store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
  { id: '3', name: 'Áo Thun Từ Vải Thừa', category: 'tshirt', price: 450000, priceStr: '450,000 đ', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600', sentimentScore: 90, ratingCount: 12, store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
  { id: '4', name: 'Quần Kaki Từ Quần Cũ Tái Chế', category: 'pants', price: 890000, priceStr: '890,000 đ', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600', sentimentScore: 93, ratingCount: 12, store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
  { id: '5', name: 'Túi Đeo Vai Canvas Tái Sinh', category: 'backpack', price: 180000, priceStr: '180,000 đ', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600', sentimentScore: 87, ratingCount: 12, store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
  { id: '6', name: 'Giày Thể Thao Từ Vải Tái Chế', category: 'shoes', price: 1450000, priceStr: '1,450,000 đ', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600', sentimentScore: 83, ratingCount: 12, store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
  { id: '7', name: 'Quần Jeans Denim Tái Bản', category: 'pants', price: 950000, priceStr: '950,000 đ', image: '../images/sh_denim_jeans.png', sentimentScore: 73, ratingCount: 12, store: 'Denim Craft', storeLogo: '../images/store_denim_craft.png' },
  { id: '8', name: 'Áo Sơ Mi Denim Upcycled', category: 'tshirt', price: 650000, priceStr: '650,000 đ', image: '../images/sh_denim_shirt.png', sentimentScore: 87, ratingCount: 12, store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
  { id: '9', name: 'Đầm Tái Chế Từ Áo Cũ', category: 'tshirt', price: 780000, priceStr: '780,000 đ', image: '../images/sh_linen_dress.png', sentimentScore: 85, ratingCount: 12, store: 'Retro Chic', storeLogo: '../images/store_retro_chic.png' },
  { id: '10', name: 'Túi Patchwork Vải Mộc', category: 'backpack', price: 320000, priceStr: '320,000 đ', image: '../images/sh_patchwork_bag.png', sentimentScore: 82, ratingCount: 11, store: 'Denim Craft', storeLogo: '../images/store_denim_craft.png' },
  { id: '11', name: 'Khăn Lụa Từ Vải Thừa Cao Cấp', category: 'others', price: 290000, priceStr: '290,000 đ', image: '../images/sh_silk_scarf.png', sentimentScore: 82, ratingCount: 11, store: 'Retro Chic', storeLogo: '../images/store_retro_chic.png' },
  { id: '12', name: 'Áo Khoác Dạ Len Tái Chế', category: 'jacket', price: 1650000, priceStr: '1,650,000 đ', image: '../images/sh_wool_jacket.png', sentimentScore: 76, ratingCount: 11, store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
  { id: '13', name: 'Giày Sneaker Từ Vải Jeans Cũ', category: 'shoes', price: 850000, priceStr: '850,000 đ', image: '../images/shoes.jpg', sentimentScore: 78, ratingCount: 11, store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
  { id: '14', name: 'Áo Sơ Mi Thêu Hoa Đậu Biếc Organic', category: 'tshirt', price: 520000, priceStr: '520,000 đ', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600', sentimentScore: 89, ratingCount: 11, store: 'Green Thread', storeLogo: '../images/store_green_thread.png' },
  { id: '15', name: 'Chân Váy Đũi Thêu Tay Eco-Flora', category: 'pants', price: 680000, priceStr: '680,000 đ', image: 'https://images.unsplash.com/photo-1583496661160-fb48862c4a4e?q=80&w=600', sentimentScore: 87, ratingCount: 11, store: 'Green Thread', storeLogo: '../images/store_green_thread.png' },
  { id: '16', name: 'Áo Cardigan Dệt Kim Hữu Cơ Cúc Gỗ', category: 'jacket', price: 950000, priceStr: '950,000 đ', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600', sentimentScore: 85, ratingCount: 11, store: 'Zero Waste', storeLogo: '../images/store_zero_waste.png' },
  { id: '17', name: 'Túi Tote Canvas Zero-Waste Khâu Tay', category: 'backpack', price: 220000, priceStr: '220,000 đ', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600', sentimentScore: 82, ratingCount: 11, store: 'Zero Waste', storeLogo: '../images/store_zero_waste.png' }
];

function loginUser(email, password) {
  var user = RefashionAuth.login(email, password);
  if (user) {
    var params = new URLSearchParams(window.location.search);
    var redirectTarget = params.get('redirect');
    if (redirectTarget) {
      window.location.href = redirectTarget;
    } else if (user.redirect) {
      window.location.href = user.redirect;
    } else {
      window.location.href = '/buyer/index.html';
    }
    return true;
  } else {
    alert('Sai email ho\u1eb7c m\u1eadt kh\u1ea9u!\n\nDemo Accounts:\n- buyer@refashion.vn / buyer123\n- seller@refashion.vn / seller123\n- admin@refashion.vn / admin123');
    return false;
  }
}

function runRoleGuard() {
  var session = getSession();
  var currentPath = window.location.pathname.toLowerCase();
  if (currentPath.indexOf('/admin/') !== -1) {
    if (!session || session.role !== 'Admin') {
      alert('Access Denied: Requires Admin Role.');
      window.location.href = '/auth/login.html';
      return;
    }
  }
  if (currentPath.indexOf('/seller/') !== -1) {
    if (!session || session.role !== 'Seller') {
      alert('Access Denied: Requires Seller Role.');
      window.location.href = '/auth/login.html';
      return;
    }
  }
  if (currentPath.indexOf('/buyer/') !== -1 && session) {
    if (session.role === 'Seller') {
      window.location.href = '/seller/seller_dashboard.html';
      return;
    }
    if (session.role === 'Admin') {
      window.location.href = '/admin/index.html';
      return;
    }
  }
}

function initApp() {
  ajaxGetJSON(
    '/datasets/accounts.json',
    function(data) { MOCK_ACCOUNTS = data.accounts || []; runRoleGuard(); },
    function(err) {
      console.warn('[mainjs] Falling back to inline accounts:', err.message);
      MOCK_ACCOUNTS = [
        { email: 'buyer@refashion.vn', password: 'buyer123', role: 'Buyer', name: 'Người Mua Demo', redirect: '/buyer/index.html' },
        { email: 'seller@refashion.vn', password: 'seller123', role: 'Seller', name: 'Eco Wear Store', redirect: '/seller/seller_dashboard.html', store: 'Eco Wear', storeLogo: '../images/store_eco_wear.png' },
        { email: 'seller_hemp@refashion.vn', password: 'seller123', role: 'Seller', name: 'Hemp & Bamboo Store', redirect: '/seller/seller_dashboard.html', store: 'Hemp & Bamboo', storeLogo: '../images/store_hemp_bamboo.png' },
        { email: 'seller_retro@refashion.vn', password: 'seller123', role: 'Seller', name: 'Retro Chic Store', redirect: '/seller/seller_dashboard.html', store: 'Retro Chic', storeLogo: '../images/store_retro_chic.png' },
        { email: 'seller_denim@refashion.vn', password: 'seller123', role: 'Seller', name: 'Denim Craft Store', redirect: '/seller/seller_dashboard.html', store: 'Denim Craft', storeLogo: '../images/store_denim_craft.png' },
        { email: 'seller_greenthread@refashion.vn', password: 'seller123', role: 'Seller', name: 'Green Thread Store', redirect: '/seller/seller_dashboard.html', store: 'Green Thread', storeLogo: '../images/store_green_thread.png' },
        { email: 'seller_zerowaste@refashion.vn', password: 'seller123', role: 'Seller', name: 'Zero Waste Store', redirect: '/seller/seller_dashboard.html', store: 'Zero Waste', storeLogo: '../images/store_zero_waste.png' },
        { email: 'admin@refashion.vn', password: 'admin123', role: 'Admin', name: 'Admin ReFashion', redirect: '/admin/index.html' }
      ];
      runRoleGuard();
    }
  );
}

function renderNavbar(containerId, prefix) {
  prefix = prefix || '';
  var container = document.getElementById(containerId);
  if (!container) return;
  var user = RefashionAuth._getUser();
  var isLoggedIn = !!user;
  var cartCount = RefashionAuth.getCartCount();
  var loginLink = '/auth/login.html';
  var registerLink = '/auth/register.html';

  container.innerHTML =
    '<header class="navbar-header glass">' +
      '<div class="container" style="display:flex;justify-content:space-between;align-items:center;height:70px">' +
        '<a href="/buyer/index.html" class="logo-brand">ReFashion<span>Eco</span></a>' +
        '<nav><ul class="nav-links-list">' +
          '<li><a href="/buyer/index.html" class="nav-link-item" id="nav-home">Trang Ch\u1ee7</a></li>' +
          '<li><a href="/buyer/shop.html" class="nav-link-item" id="nav-shop">C\u1eeda H\u00e0ng</a></li>' +
          '<li><a href="/buyer/community.html" class="nav-link-item" id="nav-community">GreenCoin & \u0110\u1ed5i Qu\u00e0</a></li>' +
          '<li><a href="/buyer/secondhand.html" class="nav-link-item" id="nav-secondhand">Ch\u1ee3 Secondhand</a></li>' +
          '<li><a href="/buyer/about.html" class="nav-link-item" id="nav-about">V\u1ec1 ReFashion</a></li>' +
        '</ul></nav>' +
        '<div class="nav-actions-div">' +
          '<div style="position:relative;display:flex;align-items:center">' +
            '<input type="text" placeholder="T\u00ecm ki\u1ebfm s\u1ea3n ph\u1ea9m xanh..." style="padding:0.5rem 1rem 0.5rem 2.25rem;border-radius:30px;border:1px solid var(--border);background-color:var(--background);color:var(--foreground);font-size:0.85rem;width:200px" id="nav-search" />' +
            '<i class="fa-solid fa-magnifying-glass" style="position:absolute;left:0.85rem;color:var(--text-muted);font-size:0.85rem"></i>' +
          '</div>' +
          '<a href="/buyer/cart.html" style="position:relative;padding:0.5rem;cursor:pointer" id="nav-cart-link">' +
            '<i class="fa-solid fa-bag-shopping" style="font-size:1.2rem;color:var(--foreground)"></i>' +
            (cartCount > 0 ? '<span style="position:absolute;top:0;right:0;background-color:var(--accent);color:white;font-size:0.65rem;font-weight:700;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center">' + cartCount + '</span>' : '') +
          '</a>' +
          (isLoggedIn && user ? (
            '<div style="position:relative" id="profile-dropdown-wrap">' +
              '<button id="profile-avatar-btn" style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--accent));color:white;border:2px solid transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;padding:0;overflow:hidden">' +
                user.username.charAt(0).toUpperCase() +
              '</button>' +
            '</div>'
          ) : (
            '<div style="display:flex;gap:0.5rem">' +
              '<a href="' + loginLink + '" class="btn btn-outline" style="padding:0.5rem 1.2rem;font-size:0.85rem">\u0110\u0103ng Nh\u1eadp</a>' +
              '<a href="' + registerLink + '" class="btn btn-primary" style="padding:0.5rem 1.2rem;font-size:0.85rem">\u0110\u0103ng K\u00fd</a>' +
            '</div>'
          )) +
        '</div>' +
      '</div>' +
    '</header>';

  if (isLoggedIn && user) {
    var avatarBtn = document.getElementById('profile-avatar-btn');
    if (avatarBtn) {
      avatarBtn.addEventListener('click', function() {
        var existing = document.getElementById('profile-dropdown');
        if (existing) { existing.remove(); return; }
        var dd = document.createElement('div');
        dd.id = 'profile-dropdown';
        dd.className = 'profile-dropdown animate-fade-in-up';
        dd.style.cssText = 'position:absolute;top:calc(100% + 12px);right:0;width:320px;background-color:var(--card);border:1px solid var(--border);border-radius:20px;box-shadow:0 20px 50px var(--shadow-lg);z-index:1000;overflow:hidden';
        dd.innerHTML =
          '<div style="padding:1.5rem;background:linear-gradient(135deg,var(--primary),hsl(142,55%,30%));color:white">' +
            '<div style="display:flex;align-items:center;gap:1rem">' +
              '<div style="width:48px;height:48px;border-radius:50%;background-color:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.25rem;flex-shrink:0">' + user.username.charAt(0).toUpperCase() + '</div>' +
              '<div><h4 style="font-weight:700;font-size:1rem;margin-bottom:0.15rem">' + user.username + '</h4><p style="font-size:0.8rem;opacity:0.85">' + user.email + '</p></div>' +
            '</div>' +
            '<div style="margin-top:1rem;background-color:rgba(255,255,255,0.15);border-radius:12px;padding:0.6rem 1rem;display:flex;align-items:center;justify-content:space-between">' +
              '<span style="font-size:0.8rem;font-weight:600"><i class="fa-solid fa-leaf" style="margin-right:0.35rem"></i>GreenCoin</span>' +
              '<span style="font-size:1.15rem;font-weight:900">' + (user.greenCoin || 0) + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="padding:0.5rem">' +
            '<a href="/buyer/profile.html" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--foreground)"><i class="fa-solid fa-user" style="width:20px;text-align:center;color:var(--primary)"></i>H\u1ed3 s\u01a1 c\u00e1 nh\u00e2n</a>' +
            '<a href="/buyer/profile.html#orders" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--foreground)"><i class="fa-solid fa-clock-rotate-left" style="width:20px;text-align:center;color:var(--accent)"></i>L\u1ecbch s\u1eed \u0111\u01a1n h\u00e0ng</a>' +
            '<a href="/buyer/community.html" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--foreground)"><i class="fa-solid fa-leaf" style="width:20px;text-align:center;color:var(--sentiment-pos)"></i>GreenCoin & \u0110\u1ed5i qu\u00e0</a>' +
            '<hr style="border:0;border-top:1px solid var(--border);margin:0.35rem 0.5rem" />' +
            '<button onclick="RefashionAuth.logout()" class="dropdown-link" style="display:flex;align-items:center;gap:0.75rem;padding:0.85rem 1rem;border-radius:12px;font-size:0.9rem;font-weight:500;color:var(--sentiment-neg);width:100%;background:transparent;border:none;cursor:pointer;text-align:left;font-family:var(--font-sans)"><i class="fa-solid fa-right-from-bracket" style="width:20px;text-align:center"></i>\u0110\u0103ng xu\u1ea5t</button>' +
          '</div>';
        avatarBtn.parentElement.appendChild(dd);
        document.addEventListener('mousedown', function closeDD(e) {
          if (dd && !dd.parentElement.contains(e.target)) { dd.remove(); document.removeEventListener('mousedown', closeDD); }
        });
      });
    }
  }

  setActiveNav();
}

function renderFooter(containerId, prefix) {
  prefix = prefix || '';
  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML =
    '<footer class="footer-main">' +
      '<div class="container">' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:3rem;margin-bottom:3rem">' +
          '<div><h3 style="font-family:var(--font-serif);font-size:1.5rem;margin-bottom:1rem;color:white">ReFashion <span style="font-family:var(--font-sans);font-size:0.8rem;color:var(--accent)">ECO</span></h3>' +
            '<p style="font-size:0.9rem;line-height:1.6;color:hsl(30,10%,75%);margin-bottom:1.5rem">Ch\u00fang t\u00f4i kh\u00f4ng ch\u1ec9 b\u00e1n qu\u1ea7n \u00e1o xanh. Ch\u00fang t\u00f4i \u0111\u1ed3ng h\u00e0nh c\u00f9ng b\u1ea1n tr\u00ean con \u0111\u01b0\u1eddng gi\u1ea3m thi\u1ec3u r\u00e1c th\u1ea3i th\u1eddi trang, th\u00fac \u0111\u1ea9y t\u00e1i ch\u1ebf v\u00e0 b\u1ea3o v\u1ec7 m\u00e0u xanh c\u1ee7a Tr\u00e1i \u0110\u1ea5t.</p>' +
            '<div style="display:flex;gap:1rem;font-size:1.2rem"><a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook"></i></a><a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a><a href="#" aria-label="Youtube"><i class="fa-brands fa-youtube"></i></a></div>' +
          '</div>' +
          '<div><h4 style="color:white;font-size:1rem;margin-bottom:1.2rem;text-transform:uppercase;letter-spacing:0.05em">Mua S\u1eafm & T\u00e1i Ch\u1ebf</h4>' +
            '<ul style="list-style:none;display:flex;flex-direction:column;gap:0.75rem;font-size:0.9rem">' +
              '<li><a href="/buyer/shop.html">T\u1ea5t c\u1ea3 s\u1ea3n ph\u1ea9m xanh</a></li>' +
              '<li><a href="/buyer/shop.html?eco=organic">V\u1ea3i h\u1eefu c\u01a1 (Organic)</a></li>' +
              '<li><a href="/buyer/shop.html?eco=recycled">V\u1eadt li\u1ec7u t\u00e1i ch\u1ebf</a></li>' +
              '<li><a href="/buyer/community.html">Quy\u00ean g\u00f3p qu\u1ea7n \u00e1o c\u0169</a></li>' +
              '<li><a href="/buyer/community.html">Quy tr\u00ecnh x\u1eed l\u00fd r\u00e1c th\u1ea3i</a></li>' +
            '</ul>' +
          '</div>' +
          '<div><h4 style="color:white;font-size:1rem;margin-bottom:1.2rem;text-transform:uppercase;letter-spacing:0.05em">Chi\u1ebfn D\u1ecbch H\u00e0nh Tinh</h4>' +
            '<ul style="list-style:none;display:flex;flex-direction:column;gap:0.75rem;font-size:0.9rem">' +
              '<li><a href="#">Tuy\u00ean ng\u00f4n 1% cho Tr\u00e1i \u0110\u1ea5t</a></li>' +
              '<li><a href="#">Ho\u1ea1t \u0111\u1ed9ng l\u00e0m s\u1ea1ch b\u1edd bi\u1ec3n</a></li>' +
              '<li><a href="#">K\u1ebft n\u1ed1i c\u00e1c t\u1ed5 ch\u1ee9c phi l\u1ee3i nhu\u1eadn</a></li>' +
              '<li><a href="#">Theo d\u00f5i d\u1ea5u ch\u00e2n carbon c\u1ee7a b\u1ea1n</a></li>' +
            '</ul>' +
          '</div>' +
          '<div><h4 style="color:white;font-size:1rem;margin-bottom:1.2rem;text-transform:uppercase;letter-spacing:0.05em">\u0110\u0103ng k\u00fd B\u1ea3n tin Xanh</h4>' +
            '<p style="font-size:0.85rem;color:hsl(30,10%,75%);margin-bottom:1rem;line-height:1.5">Nh\u1eadn th\u00f4ng tin v\u1ec1 c\u00e1c s\u1ea3n ph\u1ea9m th\u00e2n thi\u1ec7n v\u1edbi m\u00f4i tr\u01b0\u1eddng m\u1edbi nh\u1ea5t v\u00e0 c\u00e1c ho\u1ea1t \u0111\u1ed9ng b\u1ea3o v\u1ec7 m\u00f4i tr\u01b0\u1eddng c\u1ee7a ch\u00fang t\u00f4i.</p>' +
            '<form onsubmit="event.preventDefault();alert(\u0027C\u1ea3m \u01a1n b\u1ea1n \u0111\u00e3 \u0111\u0103ng k\u00fd!\u0027)" style="display:flex;gap:0.5rem">' +
              '<input type="email" placeholder="Email c\u1ee7a b\u1ea1n..." required style="padding:0.6rem 1rem;border-radius:30px;border:1px solid hsl(210,15%,25%);background-color:hsl(210,15%,16%);color:white;font-size:0.85rem;flex-grow:1" />' +
              '<button class="btn btn-accent" type="submit" style="padding:0.6rem 1.2rem;font-size:0.85rem">\u0110\u0103ng k\u00fd</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
        '<hr style="border:0;border-top:1px solid hsl(210,15%,20%);margin-bottom:2rem" />' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:0.8rem;color:hsl(30,10%,60%)">' +
          '<p>\u00a9 ' + new Date().getFullYear() + ' ReFashion Eco Inc. Thi\u1ebft k\u1ebf l\u1ea5y c\u1ea3m h\u1ee9ng t\u1eeb s\u1ee9 m\u1ec7nh b\u1ea3o v\u1ec7 Tr\u00e1i \u0110\u1ea5t c\u1ee7a Patagonia.</p>' +
          '<div style="display:flex;gap:1.5rem"><a href="#">Ch\u00ednh s\u00e1ch b\u1ea3o m\u1eadt</a><a href="#">\u0110i\u1ec1u kho\u1ea3n s\u1eed d\u1ee5ng</a><a href="#">Ch\u00ednh s\u00e1ch cookies</a></div>' +
        '</div>' +
      '</div>' +
    '</footer>';
}

function setActiveNav() {
  var pathParts = window.location.pathname.split('/').filter(function(s) { return s !== ''; });
  var page = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'index.html';
  var pageName = page.replace('.html', '');
  var map = {
    'index': 'nav-home',
    'buyer': 'nav-home',
    'shop': 'nav-shop',
    'shop-detail': 'nav-shop',
    'cart': 'nav-cart',
    'checkout': 'nav-cart',
    'community': 'nav-community',
    'secondhand': 'nav-secondhand',
    'about': 'nav-about',
    'profile': 'nav-home'
  };
  var id = map[pageName];
  if (id) {
    var el = document.getElementById(id);
    if (el) { el.style.color = 'var(--primary)'; el.style.fontWeight = '600'; }
  }
}

function showToast(msg) {
  var existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(function() { if (toast.parentElement) toast.remove(); }, 3000);
}

// Sync seller products from localStorage into SHOP_PRODUCTS
function syncSellerProducts() {
  try {
    for (var k = 0; k < localStorage.length; k++) {
      var key = localStorage.key(k);
      if (key && key.indexOf('refashion_seller_products_') === 0) {
        var storeName = key.replace('refashion_seller_products_', '');
        var stored = localStorage.getItem(key);
        if (!stored) continue;
        var sellerProds = JSON.parse(stored);
        
        var existingIds = {};
        for (var i = 0; i < SHOP_PRODUCTS.length; i++) {
          existingIds[String(SHOP_PRODUCTS[i].id)] = true;
        }
        
        var storeLogo = '../images/store_' + storeName.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') + '.png';
        
        for (var j = 0; j < sellerProds.length; j++) {
          var p = sellerProds[j];
          var idStr = String(p.id);
          if (existingIds[idStr]) continue;
          
          var minPrice = p.price || 0;
          if (p.variants && p.variants.length > 0) {
            var prices = p.variants.map(function(v) { return v.price || 0; });
            minPrice = Math.min.apply(null, prices);
          }
          
          var shopProd = {
            id: idStr,
            name: p.name,
            category: p.category || 'others',
            price: minPrice,
            priceStr: minPrice.toLocaleString('vi-VN') + ' đ',
            image: p.images && p.images.length > 0 ? p.images[0] : (p.image || '../images/store_logo.png'),
            sentimentScore: 98,
            ratingCount: 0,
            store: storeName,
            storeLogo: storeLogo
          };
          SHOP_PRODUCTS.push(shopProd);
        }
      }
    }
  } catch(e) {
    console.error('Error syncing seller products into SHOP_PRODUCTS:', e);
  }
}
syncSellerProducts();

document.addEventListener('DOMContentLoaded', function() {
  initApp();
});
